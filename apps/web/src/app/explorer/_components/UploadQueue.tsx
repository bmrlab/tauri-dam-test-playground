'use client'
import Icon from '@/components/Icon'
import { FileItem, useUploadQueueStore } from '@/store/uploadQueue'
import { Document_Light } from '@muse/assets/images'
import Image from 'next/image'
import { PropsWithChildren, useMemo, useState } from 'react'

// import { twx } from '@/lib/utils'
// const UploadingItem = twx.div`flex items-center justify-start pl-2 pr-4 py-2`

const UploadingItem = ({ file, children }: PropsWithChildren<{ file: FileItem }>) => {
  const splits = file.localFullPath.split('/')
  const fileName = splits.length > 0 ? splits[splits.length - 1] : file.localFullPath
  return (
    <div className="flex items-center justify-start py-1 pl-2 pr-4">
      <Image src={Document_Light} alt="document" width={20} height={20} priority></Image>
      <div className="mx-1 truncate text-xs">{fileName}</div>
      <div className="ml-auto">{children}</div>
    </div>
  )
}

export default function UploadQueue() {
  const uploadQueueStore = useUploadQueueStore()
  const [collapsed, setCollapsed] = useState(false)

  const [uploadingCounts, completedCounts] = useMemo(() => {
    const uploadingCounts = uploadQueueStore.queue.length + (uploadQueueStore.uploading ? 1 : 0)
    const completedCounts = uploadQueueStore.completed.length + uploadQueueStore.failed.length
    return [uploadingCounts, completedCounts]
  }, [uploadQueueStore])

  if (!uploadingCounts && !completedCounts) {
    return <div></div>
  }

  if (!collapsed) {
    return (
      <div className="fixed bottom-4 right-4 overflow-hidden rounded-md border border-neutral-100 bg-white shadow-md">
        <div className="flex justify-center hover:bg-neutral-100" onClick={() => setCollapsed(true)}>
          <Icon.arrowDown className="size-4 text-neutral-500"></Icon.arrowDown>
        </div>
        <div className="h-80 w-80 overflow-y-auto overflow-x-hidden py-2">
          {uploadQueueStore.uploading ? (
            <UploadingItem file={uploadQueueStore.uploading}>
              <Icon.loading className="size-4 animate-spin text-orange-600"></Icon.loading>
            </UploadingItem>
          ) : null}
          {uploadQueueStore.queue.map((file, index) => (
            <UploadingItem key={index} file={file}>
              {/*  */}
            </UploadingItem>
          ))}
          {uploadQueueStore.failed.map((file, index) => (
            <UploadingItem key={index} file={file}>
              <Icon.error className="size-4 text-red-600"></Icon.error>
            </UploadingItem>
          ))}
          {uploadQueueStore.completed.map((file, index) => (
            <UploadingItem key={index} file={file}>
              <Icon.check className="size-4 text-green-600"></Icon.check>
            </UploadingItem>
          ))}
        </div>
      </div>
    )
  } else {
    return (
      <div className="fixed bottom-4 right-4 overflow-hidden rounded-lg border border-neutral-100 bg-white shadow-md">
        <div
          className="flex w-80 items-center justify-between px-4 py-2 hover:bg-neutral-100"
          onClick={() => setCollapsed(false)}
        >
          {uploadingCounts > 0 ? (
            <Icon.loading className="size-5 animate-spin text-orange-600"></Icon.loading>
          ) : (
            <Icon.check className="size-5 text-green-600"></Icon.check>
          )}
          <div className="text-xs text-neutral-600">
            {completedCounts} / {uploadingCounts + completedCounts} 个文件已上传
          </div>
        </div>
      </div>
    )
  }
}
