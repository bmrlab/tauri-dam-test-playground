import classNames from 'classnames'
import { HTMLAttributes } from 'react'
import Sidebar from './Sidebar'

/**
 * <Viewport>
 *   <Viewport.Sidebar />
 *   <Viewport.Page>
 *     <Viewport.Toolbar />
 *     <Viewport.Main />
 *     <Viewport.StatusBar />
 *   </Viewport.Page>
 * </Viewport>
 */

const Viewport = ({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) => {
  return (
    <main className={classNames('flex flex-row', className)} {...props}>
      {children}
    </main>
  )
}

const Page = ({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={classNames('flex h-screen flex-1 flex-col bg-white', className)} {...props}>
      {children}
    </div>
  )
}

const Toolbar = ({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={classNames(
      'h-12 w-full border-b border-neutral-100',
      'flex items-center px-4',  // default layout
      className
    )} {...props}>
      {children}
    </div>
  )
}

const Content = ({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={classNames('flex-1 w-full overflow-y-auto overflow-x-hidden', className)} {...props}>
      {children}
    </div>
  )
}

const StatusBar = ({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={classNames(
      'h-8 w-full  border-t border-neutral-100',
      'flex items-center px-4',  // default layout
      className
    )} {...props}>
      {children}
    </div>
  )
}

Viewport.Sidebar = Sidebar
Viewport.Page = Page
Viewport.Content = Content
Viewport.Toolbar = Toolbar
Viewport.StatusBar = StatusBar

export default Viewport
