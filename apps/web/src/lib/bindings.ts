// This file was generated by [rspc](https://github.com/oscartbeaumont/rspc). Do not edit this file manually.

export type Procedures = {
    queries: 
        { key: "files.files", input: string | null, result: any } | 
        { key: "files.folders", input: never, result: any } | 
        { key: "files.ls", input: string, result: any } | 
        { key: "users.list", input: never, result: any } | 
        { key: "version", input: never, result: string } | 
        { key: "video.create_video_frames", input: string, result: any },
    mutations: 
        { key: "files.reveal", input: string, result: null },
    subscriptions: never
};
