mod delete_file;
pub mod task;

use std::time::Duration;

use crate::CtxWithLibrary;
use delete_file::delete_file_after_delay;
use file_handler::video::VideoHandler;
use prisma_lib::asset_object;
use rspc::{Router, RouterBuilder};
use serde::Deserialize;
use serde_json::json;
use specta::Type;

pub fn get_routes<TCtx>() -> RouterBuilder<TCtx>
where
    TCtx: CtxWithLibrary + Clone + Send + Sync + 'static,
{
    Router::new()
        .merge("tasks.", task::get_routes::<TCtx>())
        .query("get_temporary_decoder_url", |t| {
            #[derive(Deserialize, Type, Debug, Clone)]
            #[serde(rename_all = "camelCase")]
            struct TemporaryDecoderUrlPayload {
                hash: String,
            }
            t(
                |mut ctx: TCtx, input: TemporaryDecoderUrlPayload| async move {
                    let library = ctx.library()?;
                    let temp_dir = ctx.get_temp_dir();
                    let asset_object_data = library
                        .prisma_client()
                        .asset_object()
                        .find_unique(asset_object::UniqueWhereParam::HashEquals(
                            input.hash.clone(),
                        ))
                        .exec()
                        .await
                        .map_err(|error| {
                            return rspc::Error::new(
                                rspc::ErrorCode::InternalServerError,
                                format!("{}", error),
                            );
                        })?;

                    if let None = asset_object_data {
                        return Err(rspc::Error::new(
                            rspc::ErrorCode::InternalServerError,
                            format!("asset no found"),
                        ));
                    }
                    let asset_object_data = asset_object_data.unwrap();
                    let temporary_decoder_url =
                        temp_dir.join(format!("{}.mp4", asset_object_data.hash.clone()));
                    let temporary_decoder_url_clone = temporary_decoder_url.clone();
                    let temporary_decoder_url_string =
                        temporary_decoder_url_clone.to_string_lossy();
                    // 先看这个temporary_decoder_url文件有没有，有就返回这个文件， 没有就ffmpeg在线解码
                    if temporary_decoder_url.exists() && temporary_decoder_url.is_file() {
                        // 不做任何处理
                    } else {
                        // 没有这个文件
                        let video_handler = VideoHandler::new(&asset_object_data.hash, &library)
                            .map_err(|e| {
                                tracing::error!("Failed to create video handler: {e}");
                                rspc::Error::new(
                                    rspc::ErrorCode::InternalServerError,
                                    format!("failed to get video metadata: {}", e),
                                )
                            })?;
                        if let Some(mime_type) = asset_object_data.mime_type {
                            video_handler
                                .convert(mime_type, temporary_decoder_url.clone())
                                .map_err(|e| {
                                    tracing::error!("failed to convert video: {e}");
                                    rspc::Error::new(
                                        rspc::ErrorCode::InternalServerError,
                                        format!("failed to convert video: {}", e),
                                    )
                                })?;
                        };
                    };
                    // 1小时后删除这个文件
                    let delay = Duration::from_secs(3600);
                    let key = format!("delete-{}", temporary_decoder_url_string);
                    let new_handle = tokio::spawn(delete_file_after_delay(
                        temporary_decoder_url.clone(),
                        delay,
                    ));
                    ctx.add_task(key, new_handle);

                    return Ok(json!(
                        {"url": temporary_decoder_url_string}
                    ));
                },
            )
        })
}
