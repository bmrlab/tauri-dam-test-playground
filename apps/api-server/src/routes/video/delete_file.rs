use std::{path::PathBuf, time::Duration};

use tokio::{fs, time::sleep};

pub async fn delete_file_after_delay(file_path: PathBuf, delay: Duration) {
    sleep(delay).await;
    if file_path.exists() && file_path.is_file() {
        match fs::remove_file(&file_path).await {
            Ok(_) => println!("File {:?} has been deleted", file_path),
            Err(e) => eprintln!("Failed to delete file {:?}: {}", file_path, e),
        }
    }
}