pub mod task;

use crate::CtxWithLibrary;
use file_handler::video::VideoHandler;
use prisma_lib::{asset_object, media_data::duration};
use rspc::{Router, RouterBuilder};
use serde::Deserialize;
use serde_json::json;
use specta::Type;
use uuid::Uuid;

pub fn get_routes<TCtx>() -> RouterBuilder<TCtx>
where
    TCtx: CtxWithLibrary + Clone + Send + Sync + 'static,
{
    Router::new()
        .merge("tasks.", task::get_routes::<TCtx>())
        .mutation("get_duration", |t| {
            #[derive(Deserialize, Type, Debug)]
            #[serde(rename_all = "camelCase")]
            struct VideoRequestPayload {
                hash: String,
            }

            t(|ctx: TCtx, input: VideoRequestPayload| async move {
                let library = ctx.library()?;
                let asset_object_data = library
                    .prisma_client()
                    .asset_object()
                    .find_unique(asset_object::UniqueWhereParam::HashEquals(
                        input.hash.clone(),
                    ))
                    .exec()
                    .await
                    .map_err(|err| {
                        rspc::Error::new(rspc::ErrorCode::InternalServerError, format!("{}", err))
                    })?;

                if let None = asset_object_data {
                    return Err(rspc::Error::new(
                        rspc::ErrorCode::InternalServerError,
                        format!("asset no found"),
                    ));
                };

                let video_handler = VideoHandler::new(&input.hash, &library).map_err(|e| {
                    rspc::Error::new(
                        rspc::ErrorCode::InternalServerError,
                        format!("failed to get video metadata: {}", e),
                    )
                })?;

                match video_handler.get_video_duration().await {
                    Ok(duration) => Ok(json!({
                        "hash": input.hash,
                        "duration": duration
                    })),
                    Err(e) => Err(rspc::Error::new(
                        rspc::ErrorCode::InternalServerError,
                        format!("failed to get video metadata: {}", e),
                    )),
                }
            })
        })
        .mutation("stream", |t| {
            #[derive(Deserialize, Type, Debug)]
            #[serde(rename_all = "camelCase")]
            struct StreamRequestPayload {
                hash: String,
                start_time: f64,
            }

            t(|ctx: TCtx, input: StreamRequestPayload| async move {
                let library = ctx.library()?;
                let asset_object_data = library
                    .prisma_client()
                    .asset_object()
                    .find_unique(asset_object::UniqueWhereParam::HashEquals(
                        input.hash.clone(),
                    ))
                    .exec()
                    .await
                    .map_err(|err| {
                        rspc::Error::new(rspc::ErrorCode::InternalServerError, format!("{}", err))
                    })?;

                if let None = asset_object_data {
                    return Err(rspc::Error::new(
                        rspc::ErrorCode::InternalServerError,
                        format!("asset no found"),
                    ));
                };

                let video_handler =
                    VideoHandler::new(&input.hash.clone(), &library).map_err(|e| {
                        rspc::Error::new(
                            rspc::ErrorCode::InternalServerError,
                            format!("failed to get video metadata: {}", e),
                        )
                    })?;

                // let _ = video_handler.get_hls().await;

                let data: Vec<u8> = video_handler
                    .process_video_to_pipe(input.start_time)
                    .await
                    .expect("fail to process_video_to_pipe");

                // let artifacts_dir = library.artifacts_dir(&input.hash.clone());
                // let m3u8 = artifacts_dir.join("out").join("index.m3u8");

                Ok(json!({
                    "hash": input.hash,
                    "data": data
                }))
            })
        })
        .mutation("get_ts", |t| {
            #[derive(Deserialize, Type, Debug)]
            #[serde(rename_all = "camelCase")]
            struct TsRequestPayload {
                hash: String,
                file: String,
            }
            t(|ctx: TCtx, input: TsRequestPayload| async move {
                let library = ctx.library()?;
                let artifacts_dir = library.artifacts_dir(&input.hash.clone());
                let file = tokio::fs::read(artifacts_dir.join("out").join(input.file))
                    .await
                    .expect("fail to read");

                Ok(json!({
                    "data": file
                }))
            })
        })
}
