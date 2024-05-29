import { useCurrentLibrary } from '@/lib/library'
import { rspc } from '@/lib/rspc'

export const useVideoDecoderUrl = (hash: string | undefined, mimeType: string) => {
  const currentLibrary = useCurrentLibrary()
  if (!hash) {
    return {
      data: {
        url: undefined,
        isLoading: false,
      },
    }
  }
  if (
    mimeType === 'video/x-matroska' ||
    mimeType === 'video/x-msvideo' ||
    mimeType === 'video/x-ms-wmv' ||
    mimeType === 'video/vnd.rn-realmedia' ||
    mimeType === 'video/mpeg' ||
    mimeType === 'video/vnd.rn-realmedia-vbr'
  ) {
    const { data, isLoading } = rspc.useQuery(['video.get_temporary_decoder_url', { hash }])
    return {
      data: {
        url: isLoading ? null : `asset://localhost/` + data.url,
      },
      isLoading,
    }
  } else {
    return {
      data: {
        url: currentLibrary.getFileSrc(hash, mimeType),
        isLoading: false,
      },
    }
  }
}
