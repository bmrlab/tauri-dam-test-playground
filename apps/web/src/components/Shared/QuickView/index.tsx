import { useCurrentLibrary } from '@/lib/library'
import { rspc } from '@/lib/rspc'
import Icon from '@gendam/ui/icons'
import Image from 'next/image'
import { useEffect, useRef } from 'react'
import { useQuickViewStore, type QuickViewItem } from './store'

const Player = ({ data }: { data: QuickViewItem }) => {
  const currentLibrary = useCurrentLibrary()

  const videoRef = useRef<HTMLVideoElement | null>(null)

  const { mutateAsync } = rspc.useMutation(['video.stream'])

  const init = async () => {
    const res = await mutateAsync({
      hash: data.assetObject.hash!,
    })
    const videoData: Uint8Array = new Uint8Array(res.data)
    const mediaSource = new MediaSource()
    const videoElement = videoRef.current
    videoElement!.src = URL.createObjectURL(mediaSource)
    mediaSource.addEventListener('sourceopen', () => {
      const sourceBuffer = mediaSource.addSourceBuffer('video/mp4; codecs="avc1.42E01E, mp4a.40.2"')

      const appendNext = () => {
        if (videoData.length === 0) {
          mediaSource.endOfStream()
          return
        }
        if (!sourceBuffer.updating) {
          sourceBuffer.appendBuffer(videoData)
        }
      }

      const next = () => {
        mediaSource.endOfStream()
      }

      sourceBuffer.addEventListener('updateend', next)
      appendNext()
    })
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
        >
          {/* <source src={currentLibrary.getFileSrc(assetObject.hash)} /> */}
        </video>
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
