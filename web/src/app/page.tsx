'use client'

import ChatPage from '@/components/chat-page'
import { LocalStorage } from '@/lib/local-storage'
import { useEffect } from 'react'

const Page = () => {
  useEffect(() => {
    LocalStorage.createUserId()
  }, [])

  return <ChatPage />
}

export default Page
