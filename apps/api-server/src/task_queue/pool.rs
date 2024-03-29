use crate::CtxWithLibrary;
use file_handler::video::VideoHandler;
use prisma_lib::{asset_object, file_handler_task, PrismaClient};
use std::fmt::Display;
use std::sync::{Arc, Mutex};
use thread_priority::{ThreadBuilder, ThreadPriority};
use tokio::sync::broadcast::{self, Sender};
use tokio_util::sync::CancellationToken;
use tracing::{error, info, warn};

pub enum VideoTaskType {
    Frame,
    FrameCaption,
    FrameContentEmbedding,
    FrameCaptionEmbedding,
    Audio,
    Transcript,
    #[allow(dead_code)]
    TranscriptEmbedding,
}

impl Display for VideoTaskType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let str = match self {
            VideoTaskType::Frame => "Frame".to_string(),
            VideoTaskType::FrameCaption => "FrameCaption".to_string(),
            VideoTaskType::FrameContentEmbedding => "FrameContentEmbedding".to_string(),
            VideoTaskType::FrameCaptionEmbedding => "FrameCaptionEmbedding".to_string(),
            VideoTaskType::Audio => "Audio".to_string(),
            VideoTaskType::Transcript => "Transcript".to_string(),
            VideoTaskType::TranscriptEmbedding => "TranscriptEmbedding".to_string(),
        };
        write!(f, "{}", str)
    }
}

#[derive(Clone)]
pub struct TaskPayload {
    pub prisma_client: Arc<PrismaClient>,
    pub asset_object_id: i32,
    pub video_handler: VideoHandler,
    pub file_path: String,
}

#[derive(Clone)]
pub struct TaskProcessor {
    payload: TaskPayload,
}

impl TaskProcessor {
    pub fn new(payload: TaskPayload) -> Self {
        Self { payload }
    }
    pub fn init_task_pool() -> (Sender<TaskPayload>, CancellationToken) {
        let (tx, mut rx) = broadcast::channel::<TaskPayload>(500);

        let cancel_token = CancellationToken::new();
        let cloned_token = cancel_token.clone();

        // try to build a thread with low priority
        // and spawn task inside it
        //
        // I think this is only guaranteed for `futures`,
        // not including something like `tokio::spawn`, which should be considered as `tasks`.
        // And `tasks` in tokio should have chances to be scheduled to another thread.
        //
        // But if we set tokio to be single thread, like following code using `new_current_thread`,
        // `tasks` should also be scheduled on the same thread.
        match ThreadBuilder::default()
            .priority(ThreadPriority::Min)
            .spawn(|result| {
                if let Err(e) = result {
                    warn!("failed to set priority: {}", e);
                }

                match tokio::runtime::Builder::new_current_thread()
                    .enable_all()
                    .build()
                {
                    Ok(rt) => {
                        rt.block_on(async move {
                            loop {
                                match rx.recv().await {
                                    Ok(task_payload) => {
                                        info!("Task received: {:?}", task_payload.file_path);

                                        tokio::select! {
                                            _ = cloned_token.cancelled() => {
                                                info!("task has been cancelled by task pool!");
                                            }
                                            _ = TaskProcessor::process_task(&task_payload) => {
                                                // ? add some log
                                            }
                                        }
                                    }
                                    Err(e) => {
                                        error!("No Task Error: {:?}", e);
                                        // task_pool will be dropped when library changed
                                        // so just break here
                                        break;
                                    }
                                }
                            }
                        });
                    }
                    Err(e) => {
                        error!("failed to build tokio runtime: {}", e);
                    }
                };
                info!("tokio task spawned");
            }) {
            Ok(thread) => {
                info!("Task pool thread created: {:?}", thread.thread().id(),);
            }
            Err(e) => {
                error!("failed to build thread: {}", e);
            }
        };

        (tx, cancel_token)
    }

    async fn save_starts_at(&self, task_type: &str) {
        self.payload
            .prisma_client
            .file_handler_task()
            .update(
                file_handler_task::asset_object_id_task_type(
                    self.payload.asset_object_id,
                    task_type.to_string(),
                ),
                vec![file_handler_task::starts_at::set(Some(
                    chrono::Utc::now().into(),
                ))],
            )
            .exec()
            .await
            .expect(&format!("failed save_starts_at {:?}", task_type));
    }

    async fn save_ends_at(&self, task_type: &str, error: Option<String>) {
        let (exit_code, exit_message) = match error {
            Some(error) => (Some(2), Some(error)),
            None => (Some(0), None),
        };
        self.payload
            .prisma_client
            .file_handler_task()
            .update(
                file_handler_task::asset_object_id_task_type(
                    self.payload.asset_object_id,
                    task_type.to_string(),
                ),
                vec![
                    file_handler_task::ends_at::set(Some(chrono::Utc::now().into())),
                    file_handler_task::exit_code::set(exit_code),
                    file_handler_task::exit_message::set(exit_message),
                ],
            )
            .exec()
            .await
            .expect(&format!("failed save_ends_at {:?}", task_type));
    }

    async fn is_exit(&self) -> bool {
        let asset_object_id = self.payload.asset_object_id;
        match self
            .payload
            .prisma_client
            .file_handler_task()
            .find_first(vec![file_handler_task::asset_object_id::equals(
                asset_object_id,
            )])
            .exec()
            .await
        {
            Ok(res) => {
                if let Some(res) = res {
                    return res.exit_code.map(|x| x == 1).unwrap_or(false);
                }
                false
            }
            Err(e) => {
                error!("Failed to find first in file handler task with asset_object_id: {asset_object_id}, error: {e:?}");
                false
            }
        }
    }

    pub async fn process_task(task_payload: &TaskPayload) {
        let processor = TaskProcessor::new(task_payload.clone());
        let vh: &VideoHandler = &processor.payload.video_handler;

        for task_type in [
            VideoTaskType::Frame,
            VideoTaskType::FrameContentEmbedding,
            VideoTaskType::FrameCaption,
            VideoTaskType::FrameCaptionEmbedding,
            VideoTaskType::Audio,
            VideoTaskType::Transcript,
            // VideoTaskType::TranscriptEmbedding,
        ] {
            // 检查任务是否已退出
            if processor.is_exit().await {
                info!(
                    "Task exit: {}, {}",
                    &task_type.to_string(),
                    &task_payload.file_path
                );
                break;
            }
            processor.save_starts_at(&task_type.to_string()).await;

            let result = match task_type {
                VideoTaskType::Frame => vh.save_frames().await,
                VideoTaskType::FrameContentEmbedding => vh.save_frame_content_embedding().await,
                VideoTaskType::FrameCaption => vh.save_frames_caption().await,
                VideoTaskType::FrameCaptionEmbedding => vh.save_frame_caption_embedding().await,
                VideoTaskType::Audio => vh.save_audio().await,
                VideoTaskType::Transcript => vh.save_transcript().await,
                // VideoTaskType::TranscriptEmbedding => vh.save_transcript_embedding().await,
                _ => Ok(()),
            };
            if let Err(e) = result {
                error!(
                    "Task failed: {}, {}, {}",
                    &task_type.to_string(),
                    &task_payload.file_path,
                    e
                );
                processor
                    .save_ends_at(&task_type.to_string(), Some(e.to_string()))
                    .await;
                // 出错了以后，先终止
                break;
            } else {
                info!(
                    "Task success: {}, {}",
                    &task_type.to_string(),
                    &task_payload.file_path
                );
                processor.save_ends_at(&task_type.to_string(), None).await;
            }
        }
    }
}

// pub async fn create_video_task<TCtx>(
//     materialized_path: &str,
//     asset_object_data: &asset_object::Data,
//     ctx: &TCtx,
//     tx: Arc<Sender<TaskPayload>>,
// ) -> Result<(), ()>
// where
//     TCtx: CtxWithLibrary + Clone + Send + Sync + 'static,
pub async fn create_video_task(
    materialized_path: &str,
    asset_object_data: &asset_object::Data,
    ctx: &impl CtxWithLibrary,
    tx: Arc<Mutex<Sender<TaskPayload>>>,
) -> Result<(), ()> {
    let library = &ctx.library().map_err(|e| {
        error!(
            "library must be set before triggering create_video_task: {}",
            e
        );
    })?;

    let local_video_file_full_path = format!(
        "{}/{}",
        library.files_dir.to_str().unwrap(),
        asset_object_data.hash
    );

    let ai_handler = ctx.get_ai_handler();

    let video_handler = match VideoHandler::new(
        local_video_file_full_path,
        &asset_object_data.hash,
        &library,
    ) {
        Ok(vh) => vh
            .with_clip(ai_handler.clip)
            .with_blip(ai_handler.blip)
            .with_whisper(ai_handler.whisper),
        Err(e) => {
            error!("failed to initialize video handler: {}", e);
            return Err(());
        }
    };

    for task_type in vec![
        VideoTaskType::Frame,
        VideoTaskType::FrameContentEmbedding,
        VideoTaskType::FrameCaptionEmbedding,
        VideoTaskType::FrameCaption,
        VideoTaskType::Audio,
        VideoTaskType::Transcript,
        // disable transcript embedding for now
        // VideoTaskType::TranscriptEmbedding,
    ] {
        let x = library
            .prisma_client()
            .file_handler_task()
            .upsert(
                file_handler_task::asset_object_id_task_type(
                    asset_object_data.id,
                    task_type.to_string(),
                ),
                file_handler_task::create(asset_object_data.id, task_type.to_string(), vec![]),
                vec![
                    file_handler_task::starts_at::set(None),
                    file_handler_task::ends_at::set(None),
                    file_handler_task::exit_code::set(None),
                    file_handler_task::exit_message::set(None),
                ],
            )
            .exec()
            .await;

        match x {
            Ok(res) => {
                info!("Task created: {:?}", res);
            }
            Err(e) => {
                error!("Failed to create task: {}", e);
            }
        }
    }

    let task_payload = TaskPayload {
        file_path: materialized_path.to_string(),
        asset_object_id: asset_object_data.id,
        prisma_client: library.prisma_client(),
        video_handler,
    };

    match tx.lock() {
        Ok(tx) => {
            match tx.send(task_payload) {
                Ok(rem) => {
                    info!(
                        "Task queued {}, remaining receivers {}",
                        materialized_path, rem
                    );
                }
                Err(e) => {
                    error!("Failed to queue task {}: {}", materialized_path, e);
                }
            };
        }
        Err(e) => {
            error!("Failed to lock mutex: {}", e);
        }
    }

    Ok(())
}

#[test_log::test(tokio::test)]
async fn test_cancel_tasks() {
    let token = CancellationToken::new();

    let (tx, _rx) = broadcast::channel::<u64>(500);

    let tx = Arc::new(tx);
    let mut rx = tx.subscribe();

    let cloned_token = token.clone();

    tokio::spawn(async move {
        loop {
            match rx.recv().await {
                Ok(t) => {
                    tokio::select! {
                        _ = cloned_token.cancelled() => {
                            info!("Task shutdown")
                        }
                        _ = tokio::time::sleep(std::time::Duration::from_secs(t)) => {
                            // Long work has completed
                            info!("Task finished {}", t);
                        }
                    }
                }
                Err(e) => {
                    error!("No Task Error: {:?}", e);
                }
            }
        }
    });

    tx.send(3).unwrap();
    tx.send(3).unwrap();
    tx.send(3).unwrap();
    tx.send(3).unwrap();

    tokio::time::sleep(std::time::Duration::from_secs(5)).await;
    token.cancel();
    tokio::time::sleep(std::time::Duration::from_secs(10)).await;
}
