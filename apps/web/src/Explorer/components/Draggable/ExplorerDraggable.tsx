import { useExplorerContext } from '@/Explorer/hooks'
import { useExplorerStore } from '@/Explorer/store'
import { ExplorerItem } from '@/Explorer/types'
import { useDraggable, UseDraggableArguments } from '@dnd-kit/core'
import { HTMLAttributes } from 'react'

export interface UseExplorerDraggableProps extends Omit<UseDraggableArguments, 'id'> {
  data: ExplorerItem
}

const ExplorerDraggable = ({
  draggable,
  children,
}: Omit<HTMLAttributes<HTMLDivElement>, 'draggable'> & {
  draggable: UseExplorerDraggableProps
}) => {
  const explorer = useExplorerContext()
  const explorerStore = useExplorerStore()

  // const itemIsBeingRenamed = useMemo<boolean>(() => {
  //   return explorer.isItemSelected(draggable.data) && explorerStore.isRenaming
  // }, [draggable.data, explorer, explorerStore.isRenaming])

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: draggable.data.id.toString(),
    data: draggable.data,
    disabled: false, // itemIsBeingRenamed,
  })

  // attributes.role 默认是 button, 浏览器自带样式 cursor: pointer
  const style: { [key: string]: string } = {
    cursor: 'default',
  }

  // if (transform) {
  //   // style.transform = `translate3d(${transform.x}px, ${transform.y}px, 0)`
  //   // style.transform = 'translate3d(0, 0, 0)'
  //   style.transform = 'None'
  // }

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {children}
    </div>
  )
}

export default ExplorerDraggable
