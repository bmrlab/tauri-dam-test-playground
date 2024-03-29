use crate::Model;
use anyhow::{anyhow, bail};
use async_trait::async_trait;
pub use language::*;
use serde::{Deserialize, Serialize};
use std::convert::AsRef;
use std::path::{Path, PathBuf};
use std::str::FromStr;
use tracing::warn;

mod language;

pub struct Whisper {
    binary_path: PathBuf,
    resources_dir: PathBuf,
}

#[derive(Debug, Serialize, Deserialize)]
struct WhisperTranscriptionOffset {
    from: i64,
    to: i64,
}

#[derive(Debug, Serialize, Deserialize)]
struct WhisperTranscription {
    pub offsets: WhisperTranscriptionOffset,
    pub text: String,
    // TODO enable it when we need character level timestamp
    // pub tokens: serde_json::Value,
}

#[derive(Clone)]
pub enum WhisperModel {
    Small,
    Medium,
    Large,
}

impl WhisperModel {
    pub fn file_name(&self) -> String {
        match *self {
            WhisperModel::Small => "ggml-small-q5_1.bin".to_string(),
            WhisperModel::Medium => "ggml-medium-q5_0.bin".to_string(),
            WhisperModel::Large => "ggml-large-v3-q5_0.bin".to_string(),
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
struct WhisperLanguageResult {
    language: WhisperLanguage,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct WhisperResult {
    language: WhisperLanguage,
    transcription: Vec<WhisperTranscription>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct WhisperItem {
    pub start_timestamp: i64,
    pub end_timestamp: i64,
    pub text: String,
}

impl WhisperResult {
    pub fn items(&self) -> Vec<WhisperItem> {
        self.transcription
            .iter()
            .map(|item| WhisperItem {
                start_timestamp: item.offsets.from,
                end_timestamp: item.offsets.to,
                text: item.text.clone(),
            })
            .collect()
    }

    pub fn language(&self) -> WhisperLanguage {
        self.language.clone()
    }
}

#[derive(Clone)]
pub struct WhisperParams {
    pub model: WhisperModel,
    /// if translate transcript to English, not recommend
    pub enable_translate: bool,
}

impl Default for WhisperParams {
    fn default() -> Self {
        Self {
            model: WhisperModel::Small,
            enable_translate: false,
        }
    }
}

impl Whisper {
    pub async fn new(resources_dir: impl AsRef<Path>) -> anyhow::Result<Self> {
        let current_exe_path = std::env::current_exe().expect("failed to get current executable");
        let current_dir = current_exe_path
            .parent()
            .expect("failed to get parent directory");
        let binary_path = current_dir.join("whisper");

        // download metal file
        // TODO not sure if this is ok to do so
        let download = file_downloader::FileDownload::new(file_downloader::FileDownloadConfig {
            resources_dir: current_dir.to_path_buf(),
            ..Default::default()
        });
        if let Err(e) = download
            .download_to_path_if_not_exists(
                "whisper/ggml-metal.metal",
                current_dir.join("ggml-metal.metal"),
            )
            .await
        {
            warn!("failed to download `ggml-metal.metal`: {}", e);
        };
        if let Err(e) = download
            .download_to_path_if_not_exists(
                "whisper/ggml-common.h",
                current_dir.join("ggml-common.h"),
            )
            .await
        {
            warn!("failed to download `ggml-common.h`: {}", e);
        };

        Ok(Self {
            binary_path,
            resources_dir: resources_dir.as_ref().to_path_buf(),
        })
    }

    pub async fn transcribe(
        &self,
        audio_file_path: impl AsRef<Path>,
        params: Option<WhisperParams>,
    ) -> anyhow::Result<WhisperResult> {
        let params = params.unwrap_or_default();
        let output_file_path = audio_file_path.as_ref().with_file_name("transcript");

        let download = file_downloader::FileDownload::new(file_downloader::FileDownloadConfig {
            resources_dir: self.resources_dir.clone(),
            ..Default::default()
        });

        let model_path = download
            .download_if_not_exists(format!("whisper/{}", params.model.file_name()))
            .await?
            .to_str()
            .ok_or(anyhow!("invalid path"))?
            .to_string();

        let mut args_list = vec![
            "-l",
            "auto",
            "-f",
            audio_file_path.as_ref().to_str().unwrap(),
            "-m",
            &model_path,
            "-oj",
            "-of",
            output_file_path.to_str().unwrap(),
        ];

        if params.enable_translate {
            args_list.push("-tr");
        }

        match std::process::Command::new(self.binary_path.clone())
            .args(&args_list)
            .output()
        {
            Ok(output) => {
                tracing::debug!("{}", String::from_utf8_lossy(&output.stderr));
                if !output.status.success() {
                    bail!("{}", String::from_utf8_lossy(&output.stderr));
                }
            }
            Err(e) => {
                bail!("failed to run subprocess {}", e);
            }
        }

        let transcript = std::fs::read_to_string(output_file_path.with_extension("json"))?;
        let mut transcript: serde_json::Value = serde_json::from_str(&transcript)?;
        let language = transcript["result"]["language"].take();
        let language = WhisperLanguage::from_str(language.as_str().unwrap_or("en"))?;
        let transcription = transcript["transcription"].take();
        let transcription: Vec<WhisperTranscription> = serde_json::from_value(transcription)?;

        // delete json output file
        if let Err(e) = std::fs::remove_file(output_file_path.with_extension("json")) {
            warn!("failed to remove json output: {}", e);
        };

        Ok(WhisperResult {
            language,
            transcription,
        })
    }
}

#[async_trait]
impl Model for Whisper {
    type Item = (PathBuf, Option<WhisperParams>);
    type Output = WhisperResult;

    fn batch_size_limit(&self) -> usize {
        1
    }

    async fn process(
        &mut self,
        items: Vec<Self::Item>,
    ) -> anyhow::Result<Vec<anyhow::Result<Self::Output>>> {
        let mut results = Vec::with_capacity(items.len());
        for item in items {
            results.push(self.transcribe(item.0, item.1).await);
        }
        Ok(results)
    }
}

#[test_log::test(tokio::test)]
async fn test_whisper() {
    use tracing::{debug, error};

    let whisper = Whisper::new(
        "/Users/zhuo/dev/tezign/bmrlab/tauri-dam-test-playground/apps/desktop/src-tauri/resources",
    )
    .await
    .unwrap();
    match whisper
        .transcribe("/Users/zhuo/Library/Application Support/cc.musedam.local/libraries/b47c897fb11d2d07d19ab61835af1f3a3831c1729748afd7b6a311bc9cf6a79c/artifacts/1aaa451c0bee906e2d1f9cac21ebb2ef5f2f82b2f87ec928fc04b58cbceda60b/audio.wav", Some(WhisperParams {
            model: WhisperModel::Small,
            enable_translate:false

        })).await
    {
        Ok(result) => {
            for item in result.items() {
                debug!(
                    "[{}] [{}] {}",
                    item.start_timestamp, item.end_timestamp, item.text
                );
            }
        }
        Err(e) => {
            error!("failed to transcribe: {}", e);
        }
    }
}
