'use client'

import { Model, models } from '@/ai/models'
import { PromptInputMessage } from '@/components/ai-elements/prompt-input'
import Main from '@/components/main'
import PromptInputComp from '@/components/prompt-input-comp'
import { useCallback, useEffect, useState } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import ConversationComp from '@/components/conversation-comp'
import { nanoid } from 'nanoid'
import { LocalStorage } from '@/lib/local-storage'
import { useRouter } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { env } from '@/env'

const chatTransport = new DefaultChatTransport({ api: '/api/chat' })
const PENDING_USER_INPUT_KEY = 'pendingUserInput'

const getMessages = async (conversationId: string) => {
  const res = await fetch(
    `${env.NEXT_PUBLIC_APP_URL}/api/messages?conversationId=${conversationId}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    }
  )
  return res.json()
}

const ChatPage = ({ conversationId }: { conversationId?: string }) => {
  const [model, setModel] = useState<Model['model']>(models[0].model)
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false)
  const queryClient = useQueryClient()
  const { messages, sendMessage, status, setMessages } = useChat({
    transport: chatTransport,
    id: conversationId,
    onFinish: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    }
  })
  const router = useRouter()
  const { data: messagesData } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => getMessages(conversationId!),
    enabled: !!conversationId
  })

  useEffect(() => {
    if (messagesData) {
      setMessages(messagesData)
    }
  }, [messagesData, setMessages])

  const selectedModelData = models.find((m) => m.model === model)!

  const handleModelSelect = useCallback((selected: Model['model']) => {
    setModel(selected)
    setModelSelectorOpen(false)
  }, [])

  const handleSubmit = useCallback(
    (message: PromptInputMessage) => {
      const hasText = Boolean(message.text)
      const hasAttachments = Boolean(message.files?.length)

      if (!(hasText || hasAttachments)) {
        return
      }

      const id = conversationId ?? nanoid()

      if (!conversationId) {
        sessionStorage.setItem(PENDING_USER_INPUT_KEY, message.text)
        router.push(`/conversation/${id}`)
        return
      }

      const userId = LocalStorage.getUserId()

      const title = message.text.trim().split(/\s+/).slice(0, 10).join(' ')

      sendMessage(
        { text: message.text },
        {
          body: {
            model: selectedModelData.model,
            userInput: message.text,
            conversationId: id,
            userId,
            title
          }
        }
      )
    },
    [conversationId, selectedModelData.model, sendMessage]
  )

  useEffect(() => {
    if (!conversationId) {
      return
    }

    const pendingUserInput = sessionStorage.getItem(PENDING_USER_INPUT_KEY)

    if (!pendingUserInput) {
      return
    }

    sessionStorage.removeItem(PENDING_USER_INPUT_KEY)
    handleSubmit({ text: pendingUserInput, files: [] })
  }, [conversationId, handleSubmit])

  return (
    <Main className="flex flex-col h-[calc(100vh-var(--header-height))]">
      <ConversationComp messages={messages} className="flex-1" />
      <div className="max-w-3xl w-full mx-auto px-4 pb-4 bg-background">
        <PromptInputComp
          handleSubmit={handleSubmit}
          handleModelSelect={handleModelSelect}
          model={model}
          modelSelectorOpen={modelSelectorOpen}
          selectedModelData={selectedModelData}
          status={status}
          setModelSelectorOpen={setModelSelectorOpen}
        />
      </div>
    </Main>
  )
}
export default ChatPage
