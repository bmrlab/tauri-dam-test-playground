import { FFmpeg } from '@ffmpeg/ffmpeg'
import { toBlobURL } from '@ffmpeg/util'

class ffmpegClass {
  public ffmpeg
  public loaded = false
  constructor() {
    this.ffmpeg = new FFmpeg()
    this.init()
  }

  async init() {
    // const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd'
    const baseURL = 'https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/esm'
    this.ffmpeg.on('log', ({ message }) => {
      //   console.log(message)
    })
    await this.ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, 'text/javascript'),
    })
    this.loaded = true
  }
}

export const ffmpegNode = new ffmpegClass()
