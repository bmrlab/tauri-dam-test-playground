'use client'
import { MuseStatus, MuseTaskBadge } from '@/app/video-tasks/_components/Badge'
import TaskDropdownMenu, { DropdownMenuOptions } from '@/app/video-tasks/_components/TaskDropdownMenu'
import Icon from '@/components/Icon'
import type { VideoWithTasksResult } from '@/lib/bindings'
import { useCurrentLibrary } from '@/lib/library'
import { rspc } from '@/lib/rspc'
import { formatBytes, formatDuration } from '@/lib/utils'
import Image from 'next/image'
import { HTMLAttributes, useCallback, useMemo } from 'react'
import { VIDEO_DIMENSION, getTaskStatus, isNotDone } from './utils'
import classNames from 'classnames'

export type VideoTaskItemProps = {
  videoFile: VideoWithTasksResult
  isSelect?: boolean
  handleClick: () => void
} & HTMLAttributes<HTMLDivElement>

export default function VideoTaskItem({
  videoFile: { name, assetObject, materializedPath, tasks, mediaData },
  isSelect,
  handleClick,
  ...props
}: VideoTaskItemProps) {
  const currentLibrary = useCurrentLibrary()

  const { mutateAsync } = rspc.useMutation('video.tasks.cancel')

  const showTask = useMemo(() => {
    const tasksWithIndex = tasks
      .map((task) => {
        const [taskName, index, showOnComplete] = VIDEO_DIMENSION[task.taskType] ?? []
        const status = getTaskStatus(task)
        return { task, taskName, index, showOnComplete, status }
      })
      .filter(({ task, taskName, index, showOnComplete, status }) => {
        if (status === MuseStatus.Processing || status === MuseStatus.Failed) {
          return true
        }
        if (status === MuseStatus.Done && showOnComplete) {
          return true
        }
        return false
      })
    return tasksWithIndex.sort((a, b) => a.index - b.index)
  }, [tasks])

  const _isNotDone = useMemo(() => isNotDone(tasks), [tasks])
  const _hasAudio = useMemo(() => mediaData?.hasAudio ?? false, [mediaData?.hasAudio])

  const moreActionOptions = useCallback(() => {
    const processItem = _isNotDone
      ? [
          {
            label: (
              <div className="flex items-center gap-1.5">
                <Icon.cancel />
                <span>取消任务</span>
              </div>
            ),
            handleClick: () => {
              console.log('cancel task', assetObject.id)
              mutateAsync({ assetObjectId: assetObject.id })
            },
          },
          'Separator',
        ]
      : []
    return [
      ...processItem,
      {
        label: (
          <div className="flex items-center gap-1.5">
            <Icon.trash />
            <span>删除任务</span>
          </div>
        ),
        handleClick: () => {},
      },
    ] as DropdownMenuOptions[]
  }, [assetObject.id, _isNotDone, mutateAsync])

  return (
    <div
      {...props}
      className={classNames(
        'flex w-full items-center justify-start gap-2 border-b border-app-line px-4 py-3',
        isSelect ? 'bg-accent/10' : null,
      )}
    >
      <div
        className="relative flex size-9 cursor-pointer bg-app-overlay"
        onClick={(e) => {
          handleClick()
          e.stopPropagation()
        }}
      >
        {/* <video controls={false} autoPlay={false} muted loop className="size-full object-contain">
          <source src={currentLibrary.getFileSrc(assetObject.hash)} />
        </video> */}
        <Image
          src={currentLibrary.getThumbnailSrc(assetObject.hash)}
          alt={assetObject.hash}
          fill={true}
          className="object-cover"
          priority
        ></Image>
      </div>
      <div className="grid flex-1">
        {materializedPath ? (
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium leading-4 text-ink">{name}</span>
            <span className="truncate text-xs font-normal leading-4 text-ink/50">{materializedPath}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="truncate text-xs font-normal leading-4 text-ink/50">已删除</span>
          </div>
        )}
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center text-xs font-normal leading-4 text-ink/50">
            <span>{formatDuration(mediaData?.duration ?? 0)}</span>
            <div className="mx-2">·</div>
            <span>{formatBytes(mediaData?.size ?? 0)}</span>
            <div className="mx-2">·</div>
            <span>{`${mediaData?.width ?? 0} x ${mediaData?.height ?? 0}`}</span>
            {_hasAudio ? null : (
              <>
                <div className="mx-2">·</div>
                <NoAudio />
              </>
            )}
            {/*<div className="mx-2">·</div>*/}
            {/*<span>已取消</span>*/}
          </div>
          <div className="flex flex-wrap items-end gap-1.5">
            {showTask.map(({ taskName, index, status }) => (
              <MuseTaskBadge key={index} name={taskName} status={status} />
            ))}
            <TaskDropdownMenu
              triggerIcon={<Icon.moreVertical className="size-6 cursor-pointer text-ink" />}
              options={moreActionOptions()}
              contentClassName="w-48"
            >
              <div
                className={classNames(
                  'inline-flex items-center justify-center size-6 rounded border border-app-line',
                  'cursor-default data-[state=open]:bg-app-hover'
                )}
              >
                <span className="sr-only">Open menu</span>
                <Icon.moreVertical className="size-6 cursor-pointer" />
              </div>
            </TaskDropdownMenu>
            {/* <Icon.circleX className="size-[25px] cursor-pointer text-[#676C77]" /> */}
          </div>
        </div>
      </div>
    </div>
  )
}

const NoAudio = () => {
  return (
    <div className="flex items-center gap-1 text-ink/50">
      <Icon.audio />
      <span className="text-xs font-normal leading-4">无音轨</span>
    </div>
  )
}
