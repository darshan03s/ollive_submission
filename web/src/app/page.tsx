'use client'

import ChatPage from '@/components/chat-page'
import { env } from '@/env'
import { LocalStorage } from '@/lib/local-storage'
import { useEffect } from 'react'

const Page = () => {
  useEffect(() => {
    LocalStorage.createUserId()
  }, [])

  useEffect(() => {
    fetch(`${env.NEXT_PUBLIC_INGEST_SERVICE_URL}/health`).then((res) => {
      console.log('Ingest status:', res.status)
    })
  }, [])

  return <ChatPage />
}

export default Page
