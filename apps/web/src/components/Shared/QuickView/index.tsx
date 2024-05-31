import { useCurrentLibrary } from '@/lib/library'
import { rspc } from '@/lib/rspc'
import Icon from '@gendam/ui/icons'
import Image from 'next/image'
import { useEffect, useRef } from 'react'
import { useQuickViewStore, type QuickViewItem } from './store'
// @ts-ignore
import muxjs from 'mux.js'

const Player = ({ data }: { data: QuickViewItem }) => {
  const currentLibrary = useCurrentLibrary()

  const videoRef = useRef<HTMLVideoElement | null>(null)

  const { mutateAsync } = rspc.useMutation(['video.stream'])
  const { mutateAsync: getDuration } = rspc.useMutation(['video.get_duration'])
  const { mutateAsync: getTs } = rspc.useMutation(['video.get_ts'])

  const segments = [
    'index0.ts',
    'index1.ts',
    'index2.ts',
    'index3.ts',
    'index4.ts',
    'index5.ts',
    'index6.ts',
    'index7.ts',
    'index8.ts',
    'index9.ts',
    'index10.ts',
    'index11.ts',
    'index12.ts',
  ]

  const init = async () => {
    const mime = 'video/mp2t'

    let mediaSource = new MediaSource()
    let transmuxer = new muxjs.mp4.Transmuxer()

    videoRef.current!.src = URL.createObjectURL(mediaSource)

    mediaSource.addEventListener('sourceopen', () => {
      if (segments.length == 0) {
        return
      }
      URL.revokeObjectURL(videoRef.current!.src)
      const sourceBuffer = mediaSource.addSourceBuffer(mime)
      sourceBuffer.addEventListener('updateend', () => {
        transmuxer.on('data', (segment: any) => {
          console.log('appendNextSegment data', data)
          sourceBuffer.appendBuffer(new Uint8Array(segment.data))
          transmuxer.off('data')
        })

        if (segments.length == 0) {
          // notify MSE that we have no more segments to append.
          mediaSource.endOfStream()
        }

        segments.forEach((segment) => {
          // fetch the next segment from the segments array and pass it into the transmuxer.push method

          let x = segments.shift()

          if (x) {
            getTs({ hash: data.assetObject.hash, file: segment }).then((response) => {
              transmuxer.push(new Uint8Array(response.data))
              transmuxer.flush()
            })
          }
        })
      })

      transmuxer.on('data', (segment: any) => {
        console.log('data segment', segment)
        let data = new Uint8Array(segment.initSegment.byteLength + segment.data.byteLength)
        data.set(segment.initSegment, 0)
        data.set(segment.data, segment.initSegment.byteLength)
        console.log(muxjs.mp4.tools.inspect(data))
        sourceBuffer.appendBuffer(data)
        // reset the 'data' event listener to just append (moof/mdat) boxes to the Source Buffer
        transmuxer.off('data')
      })

      const segment = segments.shift()
      console.log(segment)

      if (segment) {
        getTs({ hash: data.assetObject.hash, file: segment }).then((response) => {
          console.log('res', new Uint8Array(response.data))
          transmuxer.push(new Uint8Array(response.data))
          transmuxer.flush()
        })
      }
    })

    // const { duration } = await getDuration({
    //   hash: data.assetObject.hash!,
    // })
    // console.log('duration', duration)

    // const res = await mutateAsync({
    //   hash: data.assetObject.hash!,
    //   startTime: 0,
    // })
    // console.log('res', res)
    // const videoData: Uint8Array = new Uint8Array(res.data)
    // const mediaSource = new MediaSource()
    // const videoElement = videoRef.current
    // videoElement!.src = URL.createObjectURL(mediaSource)
    // mediaSource.addEventListener('sourceopen', () => {
    //   const sourceBuffer = mediaSource.addSourceBuffer('video/mp4; codecs="avc1.42E01E, mp4a.40.2"')
    //   const appendNext = () => {
    //     if (videoData.length === 0) {
    //       mediaSource.endOfStream()
    //       return
    //     }
    //     if (!sourceBuffer.updating) {
    //       mediaSource.duration = 5
    //       sourceBuffer.appendBuffer(videoData)
    //       videoRef.current?.play()
    //     }
    //   }

    //   const next = async () => {
    //     if (mediaSource.duration >= duration) {
    //       mediaSource.endOfStream()
    //     }
    //     console.log('mediaSource.duration', mediaSource.duration)
    //     const res = await mutateAsync({
    //       hash: data.assetObject.hash!,
    //       startTime: mediaSource.duration,
    //     })
    //     console.log('res', res)
    //     const videoData: Uint8Array = new Uint8Array(res.data)
    //     sourceBuffer.appendBuffer(videoData)
    //   }
    //   sourceBuffer.addEventListener('updateend', next)
    //   appendNext()
    // })
  }

  useEffect(() => {
    if (!videoRef.current) {
      return
    }
    init()
  }, [videoRef])

  return (
    <div className="flex h-full w-full items-center justify-center overflow-hidden">
      {data.assetObject.mimeType?.includes('video/') ? (
        <video
          ref={videoRef}
          controls
          controlsList="nodownload"
          autoPlay
          muted
          className="h-auto max-h-full w-auto max-w-full overflow-hidden rounded-md"
        />
      ) : (
        <div className="relative h-full w-full">
          <Image
            src={currentLibrary.getFileSrc(data.assetObject.hash)}
            alt={data.assetObject.hash}
            fill={true}
            className="h-full w-full rounded-md object-contain object-center"
            priority
          />
        </div>
      )}
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
