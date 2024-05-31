import { useCurrentLibrary } from '@/lib/library'
import { rspc } from '@/lib/rspc'
import Hls from 'hls.js'
import { memo, useEffect, useRef } from 'react'

export const Video = memo(({ hash }: { hash: string }) => {
  const currentLibrary = useCurrentLibrary()
  const videoRef = useRef<HTMLVideoElement>(null)
  const { mutateAsync } = rspc.useMutation(['video.stream'])
  const { mutateAsync: getDuration } = rspc.useMutation(['video.get_duration'])

  const init = async () => {
    console.log('1', currentLibrary.getFileSrc(hash))
    const res = await mutateAsync({
      hash: hash,
      startTime: 0,
    })

    var hls = new Hls({
      debug: true,
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90,
    })

    let u8 = new Uint8Array(res.data)
    const blob = new Blob([u8])

    const url = URL.createObjectURL(blob)
    hls.loadSource(url)
    hls.attachMedia(videoRef.current!)
    hls.on(Hls.Events.ERROR, (err) => {
      console.log(err)
    })
  }

  useEffect(() => {
    if (!videoRef.current) return
    init()
  }, [])

  return (
    <video
      ref={videoRef}
      controls
      controlsList="nodownload"
      autoPlay
      muted
      className="h-auto max-h-full w-auto max-w-full overflow-hidden rounded-md"
    />
  )
})

Video.displayName = 'Video'
