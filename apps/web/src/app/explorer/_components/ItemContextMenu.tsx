import { useExplorerContext } from '@/Explorer/hooks'
import { ExplorerItem } from '@/Explorer/types'
import { useExplorerStore } from '@/Explorer/store'
import { rspc } from '@/lib/rspc'
import { ContextMenuContent, ContextMenuItem } from '@muse/ui/v1/context-menu'
import classNames from 'classnames'
import { useRouter } from 'next/navigation'
import { forwardRef, useCallback } from 'react'
import { twx } from '@/lib/utils'

type ItemContextMenuProps = {
  data: ExplorerItem
}

const _MenuItemDefault = twx(ContextMenuItem)`flex cursor-default items-center justify-start rounded-md px-2 py-2 hover:bg-neutral-200/60`

const ItemContextMenu = forwardRef<typeof ContextMenuContent, ItemContextMenuProps>(function ItemContextMenuComponent(
  { data, ...prpos },
  forwardedRef,
) {
  const router = useRouter()
  const explorer = useExplorerContext()
  const explorerStore = useExplorerStore()

  const deleteMut = rspc.useMutation(['assets.delete_file_path'])
  const metadataMut = rspc.useMutation(['assets.process_video_metadata'])

  /**
   * 这里都改成处理 selectedItems 而不只是处理当前的 item
   * ViewItem.tsx 里面的 handleContextMenuOpenChange 已经确保了当前 item 在 selectedItems 里
   */

  const handleOpen = useCallback(
    (e: Event) => {
      // e.stopPropagation()
      if (!explorer.parentPath) {
        return
      }
      explorer.resetSelectedItems()
      explorerStore.reset()
      if (data.isDir) {
        let newPath = explorer.parentPath + data.name + '/'
        router.push('/explorer?dir=' + newPath)
      } else {
        // do nothing, for the moment
      }
    },
    [data, explorer, router, explorerStore],
  )

  const handleDelete = useCallback(
    (e: Event) => {
      // e.stopPropagation()
      if (!explorer.parentPath) {
        return
      }
      for (let item of Array.from(explorer.selectedItems)) {
        deleteMut.mutate({
          path: explorer.parentPath,
          name: item.name,
        })
      }
      explorer.resetSelectedItems()
    },
    [deleteMut, explorer],
  )

  const handleRename = useCallback(
    (e: Event) => {
      // e.stopPropagation()
      if (!explorer.parentPath) {
        return
      }
      explorerStore.setIsRenaming(true)
    },
    [explorer, explorerStore],
  )

  const handleProcessMetadata = useCallback(
    (e: Event) => {
      // e.stopPropagation()
      for (let item of Array.from(explorer.selectedItems)) {
        if (!item.assetObject) {
          return
        }
        metadataMut.mutate(item.assetObject.id)
      }
    },
    [metadataMut, explorer],
  )

  return (
    <ContextMenuContent
      ref={forwardedRef as any}
      className="w-60 rounded-md border border-neutral-100 bg-white p-1 shadow-lg"
      {...prpos}
      onClick={(e) => e.stopPropagation()}
    >
      <_MenuItemDefault onSelect={handleOpen} disabled={explorer.selectedItems.size > 1 }>
        <div className="mx-1 truncate text-xs">打开</div>
      </_MenuItemDefault>
      <_MenuItemDefault onSelect={() => explorerStore.setIsFoldersDialogOpen(true)}>
        <div className="mx-1 truncate text-xs">移动</div>
      </_MenuItemDefault>
      <_MenuItemDefault onSelect={handleProcessMetadata}>
        <div className="mx-1 truncate text-xs">刷新视频信息</div>
      </_MenuItemDefault>
      <_MenuItemDefault onSelect={() => {}} disabled={explorer.selectedItems.size > 1 }>
        <div className="mx-1 truncate text-xs">预览</div>
      </_MenuItemDefault>
      <_MenuItemDefault onSelect={handleRename} disabled={explorer.selectedItems.size > 1 }>
        <div className="mx-1 truncate text-xs">重命名</div>
      </_MenuItemDefault>
      <ContextMenuItem
        className={classNames(
          'flex cursor-default items-center justify-start rounded-md px-2 py-2',
          'text-red-600 hover:bg-red-500/90 hover:text-white',
        )}
        onSelect={handleDelete}
      >
        <div className="mx-1 truncate text-xs">删除</div>
      </ContextMenuItem>
    </ContextMenuContent>
  )
})

export default ItemContextMenu
