'use client'

import { ModeToggle } from './mode-toggle'
import Brand from './brand'
import { LocalStorage } from '@/lib/local-storage'
import { useEffect, useState } from 'react'

const Header = () => {
  const [userId, setUserId] = useState<string | null>(LocalStorage.getUserId())

  useEffect(() => {
    const handleCreateUserId = (event: Event) => {
      setUserId((event as CustomEvent<{ userId: string }>).detail.userId)
    }

    window.addEventListener('create-user-id', handleCreateUserId as EventListener)

    return () => {
      window.removeEventListener('create-user-id', handleCreateUserId as EventListener)
    }
  }, [])

  return (
    <header className="h-(--header-height) flex items-center justify-between px-4 backdrop-blur-md bg-background/60 sticky top-0 left-0 z-10">
      <div className="header-left">
        <Brand />
      </div>
      <div className="header-right flex items-center gap-4">
        <span>{userId}</span>
        <ModeToggle />
      </div>
    </header>
  )
}

export default Header
