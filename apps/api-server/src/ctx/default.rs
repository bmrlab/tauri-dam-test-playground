// Ctx 和 Store 的默认实现，主要给 api_server/main 用，不过目前 CtxWithLibrary 的实现也是可以给 tauri 用的，就先用着
use std::{
    boxed::Box,
    path::PathBuf,
    pin::Pin,
    sync::{Arc, Mutex},
};
use tokio::sync::broadcast;
use tokio_util::sync::CancellationToken;
use content_library::{Library, load_library};
use super::super::task_queue::{TaskPayload, init_task_pool};

use super::traits::{CtxStore, StoreError, CtxWithLibrary};

/**
 * default impl of a store for rspc Ctx
 */

pub struct Store {
    path: PathBuf,
    values: std::collections::HashMap<String, String>,
}

impl Store {
    pub fn new(path: PathBuf) -> Self {
        let values = std::collections::HashMap::new();
        Self { values, path }
    }
}

impl CtxStore for Store {
    fn load(&mut self) -> Result<(), StoreError> {
        let file = std::fs::File::open(&self.path)
            .map_err(|e| StoreError(format!("Failed to open file: {}", e)))?;
        let reader = std::io::BufReader::new(file);
        let values: std::collections::HashMap<String, String> = serde_json::from_reader(reader)
            .map_err(|e| StoreError(format!("Failed to read file: {}", e)))?;
        self.values = values;
        Ok(())
    }
    fn save(&self) -> Result<(), StoreError> {
        let file = std::fs::File::create(&self.path)
            .map_err(|e| StoreError(format!("Failed to create file: {}", e)))?;
        serde_json::to_writer(file, &self.values)
        .map_err(|e| StoreError(format!("Failed to write file: {}", e)))?;
        Ok(())
    }
    fn insert(&mut self, key: &str, value: &str) -> Result<(), StoreError> {
        self.values.insert(key.to_string(), value.to_string());
        Ok(())
    }
    fn get(&self, key: &str) -> Option<String> {
        let value = self.values.get(key);
        match value {
            Some(value) => Some(value.to_owned()),
            None => None,
        }
    }
}


/**
 * default impl of a rspc Ctx
 */

#[derive(Debug)]
pub struct Ctx<S: CtxStore> {
    local_data_root: PathBuf,
    resources_dir: PathBuf,
    store: Arc<Mutex<S>>,
    current_library: Arc<Mutex<Option<Library>>>,
    tx: Arc<Mutex<broadcast::Sender<TaskPayload>>>,
    cancel_token: Arc<Mutex<CancellationToken>>,
}

impl<S: CtxStore> Clone for Ctx<S> {
    fn clone(&self) -> Self {
        Self {
            local_data_root: self.local_data_root.clone(),
            resources_dir: self.resources_dir.clone(),
            store: Arc::clone(&self.store),
            current_library: Arc::clone(&self.current_library),
            tx: Arc::clone(&self.tx),
            cancel_token: Arc::clone(&self.cancel_token),
        }
    }
}

// pub const R: Rspc<Ctx> = Rspc::new();

impl<S: CtxStore> Ctx<S> {
    pub fn new(local_data_root: PathBuf, resources_dir: PathBuf, store: Arc<Mutex<S>>) -> Self {
        let store = store;
        let current_library = Arc::new(Mutex::new(None));
        let (tx, cancel_token) = init_task_pool();
        let tx = Arc::new(Mutex::new(tx));
        let cancel_token = Arc::new(Mutex::new(cancel_token));
        Self {
            local_data_root,
            resources_dir,
            store,
            current_library,
            tx,
            cancel_token,
        }
    }
}

impl<S: CtxStore> CtxWithLibrary for Ctx<S> {
    fn get_local_data_root(&self) -> PathBuf {
        self.local_data_root.clone()
    }

    fn get_resources_dir(&self) -> PathBuf {
        self.resources_dir.clone()
    }

    fn library(&self) -> Result<Library, rspc::Error> {
        match self.current_library.lock().unwrap().as_ref() {
            Some(library) => Ok(library.clone()),
            None => Err(rspc::Error::new(
                rspc::ErrorCode::BadRequest,
                String::from("No current library is set"),
            )),
        }
    }

    fn switch_current_library<'async_trait>(
        &'async_trait self,
        library_id: &'async_trait str,
    ) -> Pin<Box<dyn std::future::Future<Output = ()> + Send + 'async_trait>>
    where
        Self: Sync + 'async_trait,
    {
        // cancel all tasks
        self.cancel_token.lock().unwrap().cancel();
        let (tx, cancel_token) = init_task_pool();
        let mut old_tx = self.tx.lock().unwrap();
        let mut old_cancel_token = self.cancel_token.lock().unwrap();
        *old_tx = tx;
        *old_cancel_token = cancel_token;

        let mut store = self.store.lock().unwrap();
        let _ = store.insert("current-library-id", library_id);
        let _ = store.save();
        // try to load library, but this is not necessary
        let _ = store.load();
        if let Some(library_id) = store.get("current-library-id") {
            let library_id = library_id.clone();
            return Box::pin(async move {
                let library = load_library(&self.local_data_root, &library_id).await.unwrap();
                self.current_library.lock().unwrap().replace(library);
                tracing::info!("Current library switched to {}", library_id);
            });
        } else {
            // 这里实际上不可能被执行，除非 settings.json 数据有问题
            return Box::pin(async move {
                self.current_library.lock().unwrap().take();
                tracing::info!("Current library is unset");
            });
        }
    }

    fn get_task_tx(&self) -> Arc<Mutex<broadcast::Sender<TaskPayload>>> {
        self.tx.clone()
    }
}
