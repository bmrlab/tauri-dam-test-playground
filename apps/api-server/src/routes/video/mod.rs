pub mod task;

use crate::CtxWithLibrary;
use file_handler::video::VideoHandler;
use prisma_lib::asset_object;
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
        .mutation("stream", |t| {
            #[derive(Deserialize, Type, Debug)]
            #[serde(rename_all = "camelCase")]
            struct StreamRequestPayload {
                hash: String,
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

                let video_handler = VideoHandler::new(&input.hash, &library).map_err(|e| {
                    rspc::Error::new(
                        rspc::ErrorCode::InternalServerError,
                        format!("failed to get video metadata: {}", e),
                    )
                })?;

                let id = Uuid::new_v4();
                // tokio::spawn(async move {
                //     // ffmpeg pipe

                // });

                let data = video_handler
                    .process_video_to_pipe()
                    .await
                    .expect("fail to process_video_to_pipe");

                Ok(json!({
                    "id": id,
                    "data": data
                }))
            })
        })
}
