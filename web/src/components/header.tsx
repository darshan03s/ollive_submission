'use client'

import { ModeToggle } from './mode-toggle'
import Brand from './brand'
import { nanoid } from 'nanoid'
import { useEffect, useSyncExternalStore } from 'react'

const USER_ID_STORAGE_KEY = 'userId'
const USER_ID_CHANGE_EVENT = 'ollive:user-id-change'

const getServerUserIdSnapshot = () => null

const getBrowserUserIdSnapshot = () => localStorage.getItem(USER_ID_STORAGE_KEY)

const subscribeToUserId = (onStoreChange: () => void) => {
  window.addEventListener('storage', onStoreChange)
  window.addEventListener(USER_ID_CHANGE_EVENT, onStoreChange)

  return () => {
    window.removeEventListener('storage', onStoreChange)
    window.removeEventListener(USER_ID_CHANGE_EVENT, onStoreChange)
  }
}

const Header = () => {
  const userId = useSyncExternalStore(
    subscribeToUserId,
    getBrowserUserIdSnapshot,
    getServerUserIdSnapshot
  )

  useEffect(() => {
    const persistedUserId = localStorage.getItem(USER_ID_STORAGE_KEY)

    if (persistedUserId) {
      window.dispatchEvent(new Event(USER_ID_CHANGE_EVENT))
      return
    }

    localStorage.setItem(USER_ID_STORAGE_KEY, `User-${nanoid(10)}`)
    window.dispatchEvent(new Event(USER_ID_CHANGE_EVENT))
  }, [userId])

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
