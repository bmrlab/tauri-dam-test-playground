use std::future::Future;

use prisma_lib::{
    prisma::{
        asset_object, crdt_operation, file_path, location, media_data, PrismaClient, SortOrder,
    },
    prisma_sync,
};
use sd_sync::{option_sync_entry, OperationFactory};
use sync_utils::chain_optional_iter;

use crate::crdt_op_unchecked_db;

/// Takes all the syncable data in the database and generates CRDTOperations for it.
/// This is a requirement before the library can sync.
pub async fn backfill_operations(db: &PrismaClient, sync: &crate::Manager, instance_id: i32) {
    // todo unwrap
    db._transaction()
        .with_timeout(9999999999)
        .run(|db| async move {
            println!("backfill started");

            // 删除所有的操作
            db.crdt_operation()
                .delete_many(vec![crdt_operation::instance_id::equals(instance_id)])
                .exec()
                .await?;

            // location
            paginate(
                |cursor| {
                    db.location()
                        .find_many(vec![location::id::gt(cursor)])
                        .order_by(location::id::order(SortOrder::Asc))
                        .take(1000)
                        .exec()
                },
                |location| location.id,
                |locations| {
                    db.crdt_operation()
                        .create_many(
                            locations
                                .into_iter()
                                .flat_map(|l| {
                                    use location::*;

                                    sync.shared_create(
                                        prisma_sync::location::SyncId { pub_id: l.pub_id },
                                        chain_optional_iter(
                                            [],
                                            [
                                                option_sync_entry!(l.name, name),
                                                option_sync_entry!(l.path, path),
                                                option_sync_entry!(
                                                    l.total_capacity,
                                                    total_capacity
                                                ),
                                                option_sync_entry!(
                                                    l.available_capacity,
                                                    available_capacity
                                                ),
                                                option_sync_entry!(l.size_in_bytes, size_in_bytes),
                                                option_sync_entry!(l.is_archived, is_archived),
                                                option_sync_entry!(
                                                    l.generate_preview_media,
                                                    generate_preview_media
                                                ),
                                                option_sync_entry!(
                                                    l.sync_preview_media,
                                                    sync_preview_media
                                                ),
                                                option_sync_entry!(l.hidden, hidden),
                                                option_sync_entry!(l.date_created, date_created),
                                            ],
                                        ),
                                    )
                                })
                                .map(|o| crdt_op_unchecked_db(&o, instance_id))
                                .collect(),
                        )
                        .exec()
                },
            )
            .await?;

            // asset_object
            paginate(
                |cursor| {
                    db.asset_object()
                        .find_many(vec![asset_object::id::gt(cursor)])
                        .order_by(asset_object::id::order(SortOrder::Asc))
                        .take(1000)
                        .exec()
                },
                |asset_object| asset_object.id,
                |asset_objects| {
                    db.crdt_operation()
                        .create_many(
                            asset_objects
                                .into_iter()
                                .flat_map(|a| {
                                    use asset_object::*;

                                    sync.shared_create(
                                        prisma_sync::asset_object::SyncId { pub_id: a.pub_id },
                                        chain_optional_iter(
                                            [],
                                            [
                                                option_sync_entry!(a.note, note),
                                                // todo date_created  date_accessed 还需要元数据的创建和被访问时间
                                            ],
                                        ),
                                    )
                                })
                                .map(|o| crdt_op_unchecked_db(&o, instance_id))
                                .collect(),
                        )
                        .exec()
                },
            )
            .await?;

            // media_data
            paginate(
                |cursor| {
                    db.media_data()
                        .find_many(vec![media_data::id::gt(cursor)])
                        .order_by(media_data::id::order(SortOrder::Asc))
                        .take(1000)
                        .include(media_data::include!({
                            asset_object: select { pub_id }
                        }))
                        .exec()
                },
                |o| o.id,
                |media_datas| {
                    db.crdt_operation()
                        .create_many(
                            media_datas
                                .into_iter()
                                .flat_map(|md| {
                                    use media_data::*;

                                    sync.shared_create(
                                        prisma_sync::media_data::SyncId {
                                            asset_object: prisma_sync::asset_object::SyncId {
                                                pub_id: md.asset_object.pub_id,
                                            },
                                        },
                                        chain_optional_iter(
                                            [],
                                            [
                                                option_sync_entry!(md.width, width),
                                                option_sync_entry!(md.height, height),
                                                option_sync_entry!(md.duration, duration),
                                                option_sync_entry!(md.bit_rate, bit_rate),
                                                option_sync_entry!(md.size, size),
                                                option_sync_entry!(md.mime_type, mime_type),
                                                option_sync_entry!(md.description, description),
                                            ],
                                        ),
                                    )
                                })
                                .map(|o| crdt_op_unchecked_db(&o, instance_id))
                                .collect(),
                        )
                        .exec()
                },
            )
            .await?;

            // file_path
            let res = paginate(
                |cursor| {
                    db.file_path()
                        .find_many(vec![file_path::id::gt(cursor)])
                        .order_by(file_path::id::order(SortOrder::Asc))
                        .include(file_path::include!({
                            location: select { pub_id }
                            asset_object: select { pub_id }
                        }))
                        .exec()
                },
                |o| o.id,
                |file_paths| {
                    db.crdt_operation()
                        .create_many(
                            file_paths
                                .into_iter()
                                .flat_map(|fp| {
                                    use file_path::*;

                                    sync.shared_create(
                                        prisma_sync::file_path::SyncId { pub_id: fp.pub_id },
                                        chain_optional_iter(
                                            [],
                                            [
                                                option_sync_entry!(fp.is_dir, is_dir),
                                                option_sync_entry!(
                                                    fp.location.map(|l| {
                                                        prisma_sync::location::SyncId {
                                                            pub_id: l.pub_id,
                                                        }
                                                    }),
                                                    location
                                                ),
                                                option_sync_entry!(
                                                    fp.asset_object.map(|o| {
                                                        prisma_sync::asset_object::SyncId {
                                                            pub_id: o.pub_id,
                                                        }
                                                    }),
                                                    asset_object
                                                ),
                                                option_sync_entry!(
                                                    fp.materialized_path,
                                                    materialized_path
                                                ),
                                                option_sync_entry!(fp.name, name),
                                            ],
                                        ),
                                    )
                                })
                                .map(|o| crdt_op_unchecked_db(&o, instance_id))
                                .collect(),
                        )
                        .exec()
                },
            )
            .await;

            println!("backfill ended");

            res
        })
        .await
        .unwrap();
}

async fn paginate<
    T,
    E: std::fmt::Debug,
    TGetter: Future<Output = Result<Vec<T>, E>>,
    TOperations: Future<Output = Result<i64, E>>,
>(
    getter: impl Fn(i32) -> TGetter,
    id: impl Fn(&T) -> i32,
    operations: impl Fn(Vec<T>) -> TOperations,
) -> Result<(), E> {
    let mut next_cursor = Some(-1);
    loop {
        let Some(cursor) = next_cursor else {
            break;
        };

        let items = getter(cursor).await?;
        next_cursor = items.last().map(&id);
        operations(items).await?;
    }

    Ok(())
}

// 给关系用的
#[allow(dead_code)]
async fn paginate_relation<
    T,
    E: std::fmt::Debug,
    TGetter: Future<Output = Result<Vec<T>, E>>,
    TOperations: Future<Output = Result<i64, E>>,
>(
    getter: impl Fn(i32, i32) -> TGetter,
    id: impl Fn(&T) -> (i32, i32),
    operations: impl Fn(Vec<T>) -> TOperations,
) -> Result<(), E> {
    let mut next_cursor = Some((-1, -1));
    loop {
        let Some(cursor) = next_cursor else {
            break;
        };

        let items = getter(cursor.0, cursor.1).await?;
        next_cursor = items.last().map(&id);
        operations(items).await?;
    }

    Ok(())
}
