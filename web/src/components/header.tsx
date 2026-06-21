'use client'

import { ModeToggle } from './mode-toggle'
import Brand from './brand'
import { SidebarTrigger, useSidebar } from './ui/sidebar'
import { useIsMobile } from '@/hooks/use-mobile'
import { useUserId } from '@/hooks/use-user-id'

const Header = () => {
  const userId = useUserId()
  const { open } = useSidebar()
  const isMobile = useIsMobile()

  const showHeaderLeft = isMobile ? true : !open

  return (
    <header className="h-(--header-height) flex items-center justify-between px-4 backdrop-blur-md bg-background/60 sticky top-0 left-0 z-10">
      <div className="header-left">
        {showHeaderLeft ? (
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <Brand />
          </div>
        ) : null}
      </div>
      <div className="header-right flex items-center gap-4">
        <span>{userId}</span>
        <ModeToggle />
      </div>
    </header>
  )
}

export default Header
