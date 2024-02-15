// This file was generated by [rspc](https://github.com/oscartbeaumont/rspc). Do not edit this file manually.

export type Procedures = {
    queries: 
        { key: "files.files", input: string | null, result: any } | 
        { key: "files.folders", input: never, result: any } | 
        { key: "files.ls", input: string, result: any } | 
        { key: "users.list", input: never, result: any } | 
        { key: "version", input: never, result: string } | 
        { key: "video.list_video_tasks", input: never, result: VideoTaskResult[] },
    mutations: 
        { key: "files.reveal", input: string, result: null } | 
        { key: "video.create_video_task", input: string, result: any },
    subscriptions: never
};

export type VideoTaskResult = { id: number; videoPath: string; videoFileHash: string; taskType: string; startsAt: string | null; endsAt: string | null }
