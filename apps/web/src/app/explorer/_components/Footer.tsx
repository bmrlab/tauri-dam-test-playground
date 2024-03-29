'use client'
import { useExplorerContext } from '@/Explorer/hooks'
import { ExplorerItem } from '@/Explorer/types'
import Icon from '@/components/Icon'
import { Folder_Light } from '@muse/assets/images'
import Image from 'next/image'
import { useCallback, useMemo } from 'react'
import Viewport from '@/components/Viewport'
import { useRouter } from 'next/navigation'

export default function Footer() {
  const router = useRouter()
  const explorer = useExplorerContext()
  const folders = useMemo(() => {
    const list = (explorer.parentPath ?? '/').split('/').filter(Boolean)
    list.unshift('home')
    return list
  }, [explorer.parentPath])

  const theFirstSelectedItem = useMemo<ExplorerItem|null>(() => {
    let arr = Array.from(explorer.selectedItems)
    return arr[0] ?? null
  }, [explorer])

  const goToFolder = useCallback((index: number) => {
    const joined = folders.slice(1, index + 1).join('/')
    const newPath = joined === '' ? '/' : `/${joined}/`
    router.push('/explorer?dir=' + newPath)
  }, [folders, router])

  return (
    <Viewport.StatusBar>
      {folders.map((folder, index) => (
        <div key={index} className="flex items-center" onDoubleClick={() => goToFolder(index)}>
          <Image src={Folder_Light} alt="folder" priority className="mr-1 h-4 w-4"></Image>
          <div className="text-neutral-500 text-xs">{folder}</div>
          {index < folders.length - 1 && (
            <div className="mx-1 text-neutral-500">
              <Icon.arrowRight className="h-4 w-4" />
            </div>
          )}
        </div>
      ))}
      {theFirstSelectedItem && (
        <>
          <div className="mx-1 text-neutral-500">
            <Icon.arrowRight className="h-4 w-4" />
          </div>
          <div className="text-neutral-500 text-xs">{theFirstSelectedItem.name}</div>
        </>
      )}
    </Viewport.StatusBar>
  )
}
