import { useCurrentLibrary } from '@/lib/library'
import { rspc } from '@/lib/rspc'
import muxjs from 'mux.js'
import { MutableRefObject, useEffect, useRef } from 'react'
import videojs from 'video.js'
import type Player from 'video.js/dist/types/player'

export const useVideoPlayer = (hash: string, videoRef: MutableRefObject<HTMLVideoElement | null>) => {
  const currentLibrary = useCurrentLibrary()
  const playerRef = useRef<Player | null>(null)
  const mediaSourceRef = useRef<MediaSource>(new MediaSource())
  const sourceBufferRef = useRef<SourceBuffer | null>(null)
  const transmuxerRef = useRef<any>(null)
  const segmentsRef = useRef<number[]>([])
  const lastTimeRef = useRef<number>(0)

  const { mutateAsync: getVideoInfo } = rspc.useMutation(['video.get_video_info'])
  const { mutateAsync: getTs } = rspc.useMutation(['video.get_ts'])

  const handleUpdateend = async () => {
    transmuxerRef.current.on('data', (event: any) => {
      sourceBufferRef.current!.appendBuffer(new Uint8Array(event.data))
      transmuxerRef.current.off('data')
    })

    if (segmentsRef.current.length == 0) {
      mediaSourceRef.current.endOfStream()
    }

    let item = segmentsRef.current.shift()
    if (item) {
      const res = await getTs({
        hash: hash,
        index: item,
      })
      transmuxerRef.current.push(new Uint8Array(res.data))
      transmuxerRef.current.flush()
    }
  }

  const prepareSourceBuffer = (combined: boolean, outputType: string, bytes: Uint8Array) => {
    if (!videoRef.current) {
      return
    }
    console.log('prepareSourceBuffer', combined, outputType, bytes)
    // videoRef.current.controls = false
    // videoRef.current.volume = 1
    mediaSourceRef.current = new MediaSource()
    videoRef.current.src = URL.createObjectURL(mediaSourceRef.current)

    var codecsArray = ['avc1.64001f', 'mp4a.40.2'] // todo 请求获取

    mediaSourceRef.current.addEventListener('sourceopen', function () {
      mediaSourceRef.current.duration = 0

      sourceBufferRef.current = mediaSourceRef.current.addSourceBuffer(
        'video/mp4;codecs="' + codecsArray.join(',') + '"',
      )
      sourceBufferRef.current.addEventListener('updateend', handleUpdateend)
      sourceBufferRef.current.appendBuffer(bytes)
    })
  }

  const transferFormat = async (data: number[]) => {
    const segment = new Uint8Array(data)

    transmuxerRef.current = new muxjs.mp4.Transmuxer()

    // 注意：接收无音频ts文件，OutputType设置为'video'，并且设置combined为 'false',
    //      在监听data事件的时候，控置转换流的类型
    const combined = true
    const outputType = 'audio'

    let remuxedSegments: any[] = []
    let remuxedBytesLength = 0
    let remuxedInitSegment: any = null

    transmuxerRef.current.on('data', function (event: any) {
      console.log('data event: ', event.type, event)
      // event.type 有video和audio两种类型的数据流， 一种音频流，视频流， 不限制就只混合。
      // if (event.type === outputType) {  }
      remuxedSegments.push(event)
      remuxedBytesLength += event.data.byteLength
      remuxedInitSegment = event.initSegment
      transmuxerRef.current.off('data')
    })

    transmuxerRef.current.on('done', function () {
      console.log('done')
      let offset = 0
      let bytes = new Uint8Array(remuxedInitSegment.byteLength + remuxedBytesLength)
      bytes.set(remuxedInitSegment, offset)
      offset += remuxedInitSegment.byteLength

      for (let j = 0, i = offset; j < remuxedSegments.length; j++) {
        bytes.set(remuxedSegments[j].data, i)
        i += remuxedSegments[j].byteLength
      }
      remuxedSegments = []
      remuxedBytesLength = 0
      // 解析出转换后的mp4相关信息，与最终转换结果无关
      const vjsParsed = muxjs.mp4.tools.inspect(bytes)
      console.log('transmuxed', vjsParsed)

      // （3.准备资源数据，添加到标签的视频流中
      prepareSourceBuffer(combined, outputType, bytes)
      transmuxerRef.current.off('done')
    })
    transmuxerRef.current.push(segment)
    transmuxerRef.current.flush()
  }

  const onPlayerReady = async (mimeType: string) => {
    if (mimeType.includes('mp4')) {
      playerRef.current?.src({ type: 'video/mp4', src: currentLibrary.getFileSrc(hash) })
      return
    }
    const segment = segmentsRef.current.shift()

    const res = await getTs({
      hash: hash,
      index: segment!,
    })

    transferFormat(res.data)

    // 监听
    playerRef.current!.on('timeupdate', () => {
      if (lastTimeRef.current === playerRef.current!.currentTime() && lastTimeRef.current !== 0) {
        console.log('卡住了')
      } else {
        lastTimeRef.current = playerRef.current!.currentTime() || 0
      }
    })

    playerRef.current!.on('stalled', () => {
      console.log('stalled')
    })
  }

  const init = async () => {
    // 获取时长
    const { duration, mimeType } = await getVideoInfo({
      hash,
    })

    segmentsRef.current = Array.from(new Array(Math.ceil(duration / 10))).map((_, i) => i)
    // https://docs.videojs.com/tutorial-options.html
    const option = {
      controls: true,
      autoPlay: true,
      loop: false,
      muted: true,
      noSupportedMessage: 'This video cannot be played, please try again later',
      poster: currentLibrary.getThumbnailSrc(hash),
      controlBar: {
        fullscreenToggle: false,
        pictureInPictureToggle: false,
      },
    }

    playerRef.current = videojs(videoRef.current!, option, () => onPlayerReady(mimeType))

    // 覆盖duration
    playerRef.current.duration = function () {
      return duration
    }

    playerRef.current.play()
  }

  useEffect(() => {
    if (!videoRef.current) return
    init()
    return () => {
      if (playerRef.current) {
        playerRef.current.dispose()
      }
    }
  }, [videoRef])
}
