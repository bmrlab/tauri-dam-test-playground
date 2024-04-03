use content_library::Library;
use prisma_client_rust::QueryError;
use prisma_lib::{video_clip, video_frame, video_transcript};
use qdrant_client::qdrant::{
    points_selector::PointsSelectorOneOf, Condition, Filter, PointsSelector,
};
use vector_db::DEFAULT_COLLECTION_NAME;

pub async fn handle_delete_artifacts(
    library: &Library,
    file_hashes: Vec<String>,
) -> anyhow::Result<()> {
    let file_hashes_clone = file_hashes.clone();

    // delete in prisma
    library
        .prisma_client()
        ._transaction()
        .run(|client| async move {
            client
                .video_frame()
                .delete_many(vec![video_frame::file_identifier::in_vec(
                    file_hashes.iter().map(|v| v.to_string()).collect(),
                )])
                .exec()
                .await?;

            client
                .video_transcript()
                .delete_many(vec![video_transcript::file_identifier::in_vec(
                    file_hashes.iter().map(|v| v.to_string()).collect(),
                )])
                .exec()
                .await?;

            client
                .video_clip()
                .delete_many(vec![video_clip::file_identifier::in_vec(
                    file_hashes.iter().map(|v| v.to_string()).collect(),
                )])
                .exec()
                .await?;

            std::result::Result::Ok(())
        })
        .await
        .map_err(|e: QueryError| e)?;

    // delete in qdrant
    let qdrant = library.qdrant_client();
    for file_hash in file_hashes_clone.iter() {
        qdrant
            .delete_points(
                DEFAULT_COLLECTION_NAME,
                None,
                &PointsSelector {
                    points_selector_one_of: Some(PointsSelectorOneOf::Filter(Filter::all(vec![
                        Condition::matches("file_identifier", file_hash.to_string()),
                    ]))),
                },
                None,
            )
            .await?;
    }

    // delete artifacts on file system
    for file_hash in file_hashes_clone.iter() {
        let path = library.artifacts_dir(&file_hash);
        std::fs::remove_dir_all(path).map_err(|e| {
            tracing::error!("failed to delete artifacts: {}", e);
            e
        })?;
    }

    Ok(())
}