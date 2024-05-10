// This file was generated by [rspc](https://github.com/oscartbeaumont/rspc). Do not edit this file manually.

export type Procedures = {
    queries: 
        { key: "assets.get", input: FilePathGetPayload, result: FilePath } | 
        { key: "assets.list", input: FilePathQueryPayload, result: FilePath[] } | 
        { key: "audio.find_by_hash", input: string, result: AudioResp[] } | 
        { key: "libraries.get_library_settings", input: never, result: LibrarySettings } | 
        { key: "libraries.list", input: never, result: LibrariesListResult[] } | 
        { key: "libraries.models.get_model", input: string, result: AIModelResult } | 
        { key: "libraries.models.list", input: never, result: Result[] } | 
        { key: "libraries.status", input: never, result: LibraryStatusResult } | 
        { key: "p2p.state", input: never, result: any } | 
        { key: "search.all", input: SearchRequestPayload, result: SearchResultPayload[] } | 
        { key: "tasks.get_assets_in_process", input: never, result: FilePath[] } | 
        { key: "tasks.list", input: TaskListRequestPayload, result: FileHandlerTask[] } | 
        { key: "users.get", input: never, result: Auth | null } | 
        { key: "version", input: never, result: string } | 
        { key: "video.tasks.list", input: VideoTaskListRequestPayload, result: VideoWithTasksPageResult },
    mutations: 
        { key: "assets.create_asset_object", input: AssetObjectCreatePayload, result: FilePath } | 
        { key: "assets.create_dir", input: FilePathCreatePayload, result: null } | 
        { key: "assets.delete_file_path", input: FilePathDeletePayload, result: null } | 
        { key: "assets.export_video_segment", input: VideoSegmentExportPayload, result: null } | 
        { key: "assets.move_file_path", input: FilePathMovePayload, result: null } | 
        { key: "assets.process_video_asset", input: number, result: null } | 
        { key: "assets.process_video_metadata", input: number, result: null } | 
        { key: "assets.receive_asset", input: AssetObjectReceivePayload, result: null } | 
        { key: "assets.rename_file_path", input: FilePathRenamePayload, result: null } | 
        { key: "audio.batch_export", input: ExportInput[], result: AudioType[] } | 
        { key: "audio.export", input: ExportInput, result: AudioType[] } | 
        { key: "crr.apply", input: string, result: null } | 
        { key: "crr.pull", input: string, result: string } | 
        { key: "libraries.create", input: string, result: null } | 
        { key: "libraries.load_library", input: string, result: LibraryLoadResult } | 
        { key: "libraries.models.download_model", input: DownloadModelPayload, result: null } | 
        { key: "libraries.models.set_model", input: SetModelPayload, result: null } | 
        { key: "libraries.unload_library", input: any | null, result: null } | 
        { key: "libraries.update_library_settings", input: LibrarySettings, result: null } | 
        { key: "p2p.accept_file_share", input: string, result: AcceptShareOutput } | 
        { key: "p2p.cancel_file_share", input: string, result: any } | 
        { key: "p2p.finish_file_share", input: string, result: string[] } | 
        { key: "p2p.reject_file_share", input: string, result: any } | 
        { key: "p2p.share", input: SharePayload, result: any } | 
        { key: "users.set", input: Auth, result: Auth } | 
        { key: "video.tasks.cancel", input: TaskCancelRequestPayload, result: null } | 
        { key: "video.tasks.create", input: string, result: null } | 
        { key: "video.tasks.regenerate", input: TaskRedoRequestPayload, result: null },
    subscriptions: 
        { key: "p2p.events", input: never, result: any }
};

export type SetModelPayload = { category: AIModelCategory; modelId: string }

export type LibrarySettings = { title: string; appearanceTheme: LibrarySettingsThemeEnum; explorerLayout: LibrarySettingsLayoutEnum; models: LibraryModels }

export type ModelArtifact = { url: string; checksum: string }

export type Auth = { id: string; name: string }

export type SharePayload = { fileIdList: number[]; peerId: string }

export type SearchRequestPayload = { text: string; recordType: string }

export type LibraryStatusResult = { id: string | null; loaded: boolean; isBusy: boolean }

export type VideoTaskListRequestPayload = { pagination: Pagination; filter: VideoTaskListRequestFilter }

export type FilePathGetPayload = { materializedPath: string; name: string }

export type VideoTaskListRequestFilter = "all" | "processing" | "completed" | "failed" | "canceled" | "excludeCompleted" | { exitCode: number }

export type VideoWithTasksPageResult = { data: VideoWithTasksResult[]; pagination: Pagination; maxPage: number }

export type FilePathRenamePayload = { id: number; isDir: boolean; materializedPath: string; oldName: string; newName: string }

export type AssetObjectReceivePayload = { hash: string; materializedPath: string }

export type LibrarySettingsLayoutEnum = "list" | "grid" | "media"

export type FilePathDeletePayload = { materializedPath: string; name: string }

export type SearchResultPayload = { filePath: FilePath; metadata: SearchResultMetadata }

export type FilePathCreatePayload = { materializedPath: string; name: string }

export type FilePathQueryPayload = { materializedPath: string; isDir?: boolean | null; includeSubDirs?: boolean | null }

export type VideoSegmentExportPayload = { verboseFileName: string; outputDir: string; assetObjectId: number; millisecondsFrom: number; millisecondsTo: number }

export type FilePath = { id: number; isDir: boolean; materializedPath: string; name: string; description: string | null; assetObjectId: number | null; createdAt: string; updatedAt: string }

export type AIModelCategory = "ImageEmbedding" | "MultiModalEmbedding" | "ImageCaption" | "AudioTranscript" | "TextEmbedding"

export type TaskRedoRequestPayload = { assetObjectId: number }

export type Pagination = { pageSize: number; pageIndex: number }

export type FileHandlerTask = { id: number; assetObjectId: number; taskType: string; exitCode: number | null; exitMessage: string | null; startsAt: string | null; endsAt: string | null; createdAt: string; updatedAt: string }

export type TaskListRequestFilter = { assetObjectId?: number | null; assetObjectIds?: number[] | null }

export type ModelDownloadStatus = { totalBytes: string; downloadedBytes: string }

export type LibrariesListResult = { id: string; dir: string; title: string }

export type LibraryLoadResult = { id: string; dir: string }

export type TaskCancelRequestPayload = { assetObjectId: number; taskTypes: string[] | null }

export type ConcreteModelType = "BLIP" | "CLIP" | "Moondream" | "OrtTextEmbedding" | "Whisper" | "Yolo"

export type VideoWithTasksResult = { name: string; materializedPath: string; assetObject: AssetObject; tasks: FileHandlerTask[]; mediaData: MediaData | null }

export type AssetObjectCreatePayload = { materializedPath: string; name: string; localFullPath: string }

export type FilePathRequestPayload = { id: number; isDir: boolean; materializedPath: string; name: string }

export type LibraryModels = { MultiModalEmbedding: string; TextEmbedding: string; ImageCaption: string; AudioTranscript: string }

export type AudioType = "txt" | "srt" | "json" | "vtt" | "csv" | "ale" | "docx"

export type MediaData = { id: number; width: number | null; height: number | null; duration: number | null; bitRate: number | null; hasAudio: boolean | null; assetObjectId: number; createdAt: string; updatedAt: string }

export type AudioResp = { type: AudioType; content: string }

export type Result = { category: AIModelCategory; models: AIModelResult[] }

export type SearchResultMetadata = { startTime: number; endTime: number; score: number }

export type AIModelStatus = { downloaded: boolean; downloadStatus: ModelDownloadStatus | null }

export type AcceptShareOutput = { fileList: string[] }

export type AIModelResult = { info: AIModel; status: AIModelStatus }

export type DownloadModelPayload = { modelId: string }

export type AIModel = { id: string; title: string; description: string; categories: AIModelCategory[]; artifacts_dir: string; artifacts: ModelArtifact[]; model_type: ConcreteModelType; params: any; dim: number | null }

export type FilePathMovePayload = { active: FilePathRequestPayload; target: FilePathRequestPayload | null }

export type AssetObject = { id: number; hash: string; size: number; mimeType: string | null; createdAt: string; updatedAt: string }

export type TaskListRequestPayload = { filter: TaskListRequestFilter }

export type LibrarySettingsThemeEnum = "light" | "dark"

export type ExportInput = { types: AudioType[]; hash: string; path: string; fileName?: string | null }
