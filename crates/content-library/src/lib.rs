use prisma_lib::{new_client_with_url, PrismaClient};
use qdrant::create_qdrant_server;
pub use qdrant::{make_sure_collection_created, QdrantCollectionInfo, QdrantServerInfo};
use qdrant_client::client::QdrantClient;
use std::{
    path::{Path, PathBuf},
    sync::Arc,
};
use vector_db::QdrantServer;

mod port;
mod qdrant;
pub mod bundle;

#[derive(Clone, Debug)]
pub struct Library {
    pub id: String,
    pub dir: PathBuf,
    files_dir: PathBuf, // for content files
    artifacts_dir: PathBuf,
    // db_url: String,
    prisma_client: Arc<PrismaClient>,
    qdrant_server: Arc<QdrantServer>,
}

impl Library {
    pub fn prisma_client(&self) -> Arc<PrismaClient> {
        Arc::clone(&self.prisma_client)
    }

    pub fn qdrant_client(&self) -> Arc<QdrantClient> {
        self.qdrant_server.get_client().clone()
    }

    pub fn qdrant_server_info(&self) -> u32 {
        self.qdrant_server.get_pid()
    }

    /// Get the artifact directory for a given file hash.
    ///
    /// The artifacts directory will store all the artifacts for this file.
    /// For now, `artifacts_dir` is something like `%LIBRARY_ARTIFACTS_DIR%/%SHARD_ID%/%FILE_HASH%`,
    /// where %SHARD_ID% is derived from the file hash.
    pub fn artifacts_dir(&self, file_hash: &str) -> PathBuf {
        let artifacts_dir_with_shard = self
            .artifacts_dir
            .join(get_shard_hex(&file_hash))
            .join(file_hash);

        if !artifacts_dir_with_shard.exists() {
            std::fs::create_dir_all(&artifacts_dir_with_shard).unwrap();
        }

        artifacts_dir_with_shard
    }

    /// Get the file path in library for a given file hash
    ///
    /// For now, `file_path` is something like `%LIBRARY_FILES_DIR%/%SHARD_ID%/%FILE_HASH%`,
    /// where %SHARD_ID% is derived from the file hash.
    pub fn file_path(&self, file_hash: &str) -> PathBuf {
        let files_dir_with_shard = self.files_dir.join(get_shard_hex(file_hash));

        if !files_dir_with_shard.exists() {
            std::fs::create_dir_all(&files_dir_with_shard).unwrap();
        }

        files_dir_with_shard.join(file_hash)
    }
}

pub async fn load_library(
    local_data_root: impl AsRef<Path>,
    library_id: &str,
) -> Result<Library, ()> {
    let library_dir = local_data_root.as_ref().join("libraries").join(library_id);
    let db_dir = library_dir.join("databases");
    let artifacts_dir = library_dir.join("artifacts");
    let files_dir = library_dir.join("files");
    let qdrant_dir = library_dir.join("qdrant");

    let db_url = format!(
        // "file:{}?socket_timeout=1&connection_limit=10",
        "file:{}?socket_timeout=15&connection_limit=1",
        db_dir.join("library.db").to_str().unwrap()
    );
    let client = new_client_with_url(db_url.as_str()).await.map_err(|_e| {
        tracing::error!("failed to create prisma client");
    })?;
    client
        ._migrate_deploy()
        // ._db_push()
        // .accept_data_loss() // --accept-data-loss in CLI
        // .force_reset()      // --force-reset in CLI
        .await // apply migrations
        .map_err(|e| {
            tracing::error!("failed to push db: {}", e);
        })?;
    let prisma_client = Arc::new(client);

    let qdrant_server = create_qdrant_server(qdrant_dir).await?;

    let library = Library {
        id: library_id.to_string(),
        dir: library_dir,
        files_dir,
        artifacts_dir,
        prisma_client,
        qdrant_server: Arc::new(qdrant_server),
    };

    Ok(library)
}

pub async fn create_library(local_data_root: impl AsRef<Path>) -> PathBuf {
    let library_id = uuid::Uuid::new_v4().to_string();
    let library_dir = local_data_root.as_ref().join("libraries").join(&library_id);
    let db_dir = library_dir.join("databases");
    let qdrant_dir = library_dir.join("qdrant");
    let artifacts_dir = library_dir.join("artifacts");
    let files_dir = library_dir.join("files");
    std::fs::create_dir_all(&db_dir).unwrap();
    std::fs::create_dir_all(&qdrant_dir).unwrap();
    std::fs::create_dir_all(&artifacts_dir).unwrap();
    std::fs::create_dir_all(&files_dir).unwrap();
    library_dir
}

pub fn list_library_dirs(local_data_root: impl AsRef<Path>) -> Vec<(String, String)> {
    let libraries_dir = local_data_root.as_ref().join("libraries");
    if !libraries_dir.exists() {
        return vec![];
    }
    let entries = match libraries_dir.read_dir() {
        Ok(entries) => entries,
        Err(e) => {
            tracing::error!("Failed to read libraries dir: {}", e);
            return vec![];
        }
    };
    let mut res: Vec<(String, String)> = vec![];
    for entry in entries {
        let library_dir = match entry.as_ref() {
            Ok(entry) => {
                let path = entry.path();
                if !path.is_dir() {
                    continue;
                }
                let path_str = match path.into_os_string().into_string() {
                    Ok(path_str) => path_str,
                    Err(_e) => continue,
                };
                let file_name_str = match entry.file_name().into_string() {
                    Ok(file_name_str) => file_name_str,
                    Err(_e) => continue,
                };
                (path_str, file_name_str)
            }
            Err(e) => {
                tracing::error!("Failed to read entry: {}", e);
                continue;
            }
        };
        res.push(library_dir);
    }
    res
}

fn get_shard_hex(hash: &str) -> &str {
    &hash[0..3]
}
