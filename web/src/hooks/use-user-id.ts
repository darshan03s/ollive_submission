'use client'

import { LocalStorage } from '@/lib/local-storage'
import { useSyncExternalStore } from 'react'

const subscribe = (callback: () => void) => {
  window.addEventListener('create-user-id', callback)
  window.addEventListener('storage', callback)
  return () => {
    window.removeEventListener('create-user-id', callback)
    window.removeEventListener('storage', callback)
  }
}

export const useUserId = () =>
  useSyncExternalStore(
    subscribe,
    () => LocalStorage.getUserId(),
    () => null
  )
