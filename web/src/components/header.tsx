'use client'

import { ModeToggle } from './mode-toggle'
import Brand from './brand'
import { SidebarTrigger, useSidebar } from './ui/sidebar'
import { useIsMobile } from '@/hooks/use-mobile'
import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'
import { Button } from './ui/button'

const Header = () => {
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
      <div className="header-right flex items-center gap-2">
        <div className="flex items-center gap-2">
          <Show when="signed-out">
            <SignInButton>
              <Button variant="outline">Sign In</Button>
            </SignInButton>
            <SignUpButton>
              <Button>Sign Up</Button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <UserButton />
          </Show>
        </div>
        <ModeToggle />
      </div>
    </header>
  )
}

export default Header
