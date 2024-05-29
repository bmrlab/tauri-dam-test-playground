import { ffmpegNode } from '@/hooks/useFfmpeg'
import { useCurrentLibrary } from '@/lib/library'
import { fetchFile } from '@ffmpeg/util'
import Icon from '@gendam/ui/icons'
import { useEffect, useRef, useState } from 'react'
import { useQuickViewStore, type QuickViewItem } from './store'

const Player = ({ data }: { data: QuickViewItem }) => {
  const currentLibrary = useCurrentLibrary()
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [loaded, setLoaded] = useState(false)
  const mediaSource = useRef<MediaSource | null>(null)
  const [numSegments, setNumSegments] = useState(0)
  const ffmpeg = ffmpegNode.ffmpeg

  const transcode = async () => {
    console.log('ffmpegNode.loaded', ffmpegNode.loaded)
    if (!ffmpegNode.loaded) return
    if (loaded) return
    setLoaded(true)
    const videoURL = currentLibrary.getFileSrc(data.assetObject.hash)

    console.log('Fetching video file...')
    await ffmpeg.writeFile(data.assetObject.hash, await fetchFile(videoURL))
    console.log('Transcoding video...')
    // 记录时间
    const start = performance.now()
    await ffmpeg.exec([
      '-i',
      data.assetObject.hash,
      '-g',
      '1',
      '-segment_format_options',
      'movflags=frag_keyframe+empty_moov+default_base_moof',
      '-segment_time',
      '5',
      '-f',
      'segment',
      '%d.mp4',
    ])
    const end = performance.now()
    console.log('need time: ', end - start)
    console.log('Transcoding completed.')
  }

  useEffect(() => {
    const ffmpeg = ffmpegNode.ffmpeg
    const Interval = setInterval(async () => {
      let index = 0
      while (true) {
        try {
          await ffmpeg.readFile(`${index}.mp4`)
          index++
        } catch (e) {
          break
        }
      }
      setNumSegments(index)
    }, 200)
    return () => {
      clearInterval(Interval)
    }
  }, [])

  useEffect(() => {
    transcode()
  }, [loaded, ffmpegNode.loaded])

  useEffect(() => {
    if (numSegments > 0 && videoRef.current) {
      const ffmpeg = ffmpegNode.ffmpeg
      mediaSource.current = new MediaSource()
      videoRef.current.src = URL.createObjectURL(mediaSource.current)
      mediaSource.current.addEventListener('sourceopen', () => {
        console.log('MediaSource opened.')
        const mimeCodec = 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"'
        const sourceBuffer = mediaSource.current!.addSourceBuffer(mimeCodec)
        console.log('SourceBuffer added.')

        let segmentIndex = 0

        const appendNextSegment = async () => {
          if (segmentIndex >= numSegments) {
            try {
              mediaSource.current!.endOfStream()
              console.log('All segments appended, stream ended.')
            } catch (e) {
              console.error('Error ending stream', e)
            }
            return
          }

          try {
            console.log(`Appending segment ${segmentIndex}`)
            const fileData = await ffmpeg.readFile(`${segmentIndex}.mp4`)
            const streamData = new Uint8Array(fileData as ArrayBuffer)
            if (segmentIndex > 0) {
              mediaSource.current!.duration += 5
              sourceBuffer.timestampOffset += 5
            }
            sourceBuffer.appendBuffer(streamData)
            segmentIndex++
          } catch (e) {
            console.error('Error reading segment', e)
            mediaSource.current!.endOfStream()
            return
          }
        }

        sourceBuffer.addEventListener('updateend', appendNextSegment)
        appendNextSegment()
      })
    }
  }, [numSegments, videoRef])

  return (
    <div className="flex h-full w-full items-center justify-center overflow-hidden">
      <video
        ref={videoRef}
        controls
        controlsList="nodownload"
        autoPlay
        muted
        className="h-auto max-h-full w-auto max-w-full overflow-hidden rounded-md"
      >
        {/* <source src={currentLibrary.getFileSrc(assetObject.hash)} /> */}
      </video>
    </div>
  )
}

export default function QuickView() {
  const quickViewStore = useQuickViewStore()

  // quickViewStore.show === true 的时候 quickViewStore.data 不会为空，这里只是为了下面 tsc 检查通过
  return quickViewStore.show && quickViewStore.data ? (
    <div className="fixed left-0 top-0 h-full w-full bg-black/50 px-20 py-10" onClick={() => quickViewStore.close()}>
      <div
        className="relative h-full w-full rounded-lg bg-black/50 px-8 pb-8 pt-20 shadow backdrop-blur-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute left-0 top-6 w-full overflow-hidden px-12 text-center font-medium text-white/90">
          <div className="truncate">{quickViewStore.data.name}</div>
        </div>
        <Player data={quickViewStore.data} />
        <div
          className="absolute right-0 top-0 flex h-12 w-12 items-center justify-center p-2 hover:opacity-70"
          onClick={() => quickViewStore.close()}
        >
          <Icon.Close className="h-6 w-6 text-white/50" />
        </div>
      </div>
    </div>
  ) : (
    <></>
  )
}
