mod mock_instance;

use prisma_lib::{prisma, prisma_sync};
use sd_sync::*;
use sync_core::*;
use sync_utils::uuid_to_bytes;

use mock_instance::Instance;
use uuid::Uuid;

// 写入测试位置
async fn write_test_location(instance: &Instance) -> Result<(), Box<dyn std::error::Error>> {
    instance
        .sync
        .write_ops(&instance.db, {
            let id = Uuid::new_v4();

            let (sync_ops, db_ops): (Vec<_>, Vec<_>) = [
                sync_db_entry!("Location 0".to_string(), prisma::location::name),
                sync_db_entry!(
                    "/User/Brendan/Documents".to_string(),
                    prisma::location::path
                ),
            ]
            .into_iter()
            .unzip();

            (
                instance.sync.shared_create(
                    prisma_sync::location::SyncId {
                        pub_id: uuid_to_bytes(id),
                    },
                    sync_ops,
                ),
                instance.db.location().create(uuid_to_bytes(id), db_ops),
            )
        })
        .await?;

    Ok(())
}

// 测试写入操作和行
#[tokio::test]
async fn writes_operations_and_rows_together() -> Result<(), Box<dyn std::error::Error>> {
    // 创建一个新的实例
    let instance = Instance::new(Uuid::new_v4()).await;

    // 写入测试数据
    write_test_location(&instance).await?;

    // 找到所有的crdt操作
    let operations = instance
        .db
        .crdt_operation()
        .find_many(vec![])
        .exec()
        .await?;

    println!("operations:{:#?}", operations);

    assert_eq!(operations.len(), 3);
    assert_eq!(operations[0].model, prisma::location::NAME);

    // 找到所有的location
    let locations = instance.db.location().find_many(vec![]).exec().await?;

    println!("locations:{:#?}", locations);

    // 有1个location
    assert_eq!(locations.len(), 1);

    // 第一个location
    let location = locations.first().unwrap();

    println!("location:{:#?}", location);

    // 检查location的字段
    assert_eq!(location.name, Some("Location 0".to_string()));
    assert_eq!(location.path, Some("/User/Brendan/Documents".to_string()));

    Ok(())
}

// 测试发送和摄取操作
#[tokio::test]
async fn operations_send_and_ingest() -> Result<(), Box<dyn std::error::Error>> {
    // 创建两个实例
    let instance1 = Instance::new(Uuid::new_v4()).await;
    let instance2 = Instance::new(Uuid::new_v4()).await;

    // 配对实例1和实例2
    Instance::pair(&instance1, &instance2).await;

    // 写入测试数据 到 实例1
    write_test_location(&instance1).await?;

    // 实例2应该接收到同步消息
    assert!(matches!(
        instance2.sync_rx.resubscribe().recv().await?,
        SyncMessage::Ingested
    ));

    // 找到实例2所有的crdt操作
    let out = instance2
        .sync
        .get_ops(GetOpsArgs {
            clocks: vec![],
            count: 100,
        })
        .await?;

    // 有3个操作
    assert_eq!(out.len(), 3);

    // 清理
    instance1.teardown().await;
    instance2.teardown().await;

    Ok(())
}
