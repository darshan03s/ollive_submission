'use client'

import { Model, models } from '@/ai/models'
import { PromptInputMessage } from '@/components/ai-elements/prompt-input'
import Main from '@/components/main'
import PromptInputComp from '@/components/prompt-input-comp'
import { useCallback, useEffect, useState } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport, UIMessage } from 'ai'
import ConversationComp from '@/components/conversation-comp'
import { nanoid } from 'nanoid'
import { LocalStorage } from '@/lib/local-storage'
import { useRouter } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ConversationType } from 'db/types'

const chatTransport = new DefaultChatTransport({ api: '/api/chat' })
const PENDING_CHAT_KEY = 'pendingChat'

type PendingChat = {
  text: string
  model: Model['model']
}

const getPendingChat = (): PendingChat | null => {
  if (typeof window === 'undefined') {
    return null
  }

  const raw = sessionStorage.getItem(PENDING_CHAT_KEY)

  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw) as PendingChat
  } catch {
    return null
  }
}

const createConversation = async (userId: string, id: string, title: string) => {
  const res = await fetch('/api/conversations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Id': userId
    },
    body: JSON.stringify({ id, title })
  })

  if (!res.ok) {
    throw new Error('Failed to create conversation')
  }

  return res.json() as Promise<ConversationType>
}

const getMessages = async (conversationId: string): Promise<UIMessage[]> => {
  const res = await fetch(`/api/messages?conversationId=${conversationId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })
  return res.json()
}

const ChatPage = ({ conversationId }: { conversationId?: string }) => {
  const [model, setModel] = useState<Model['model']>(() => {
    const pending = getPendingChat()
    return pending?.model ?? models[0].model
  })

  const [modelSelectorOpen, setModelSelectorOpen] = useState(false)
  const queryClient = useQueryClient()
  const { messages, sendMessage, status, setMessages } = useChat({
    transport: chatTransport,
    id: conversationId
  })
  const router = useRouter()
  const { data: messagesHistory, isLoading: isMessagesLoading } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => getMessages(conversationId!),
    enabled: !!conversationId
  })

  useEffect(() => {
    if (messagesHistory && messagesHistory.length > 0) {
      setMessages(messagesHistory)
    } else {
      setMessages(messages)
    }
  }, [messagesHistory, setMessages])

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
        sessionStorage.setItem(
          PENDING_CHAT_KEY,
          JSON.stringify({ text: message.text, model: selectedModelData.model })
        )
        router.push(`/conversation/${id}`)
        return
      }

      const userId = LocalStorage.getUserId()

      if (!userId) {
        return
      }

      sendMessage(
        { text: message.text },
        {
          body: {
            model: selectedModelData.model,
            userInput: message.text,
            conversationId: id
          }
        }
      )
    },
    [conversationId, selectedModelData.model, sendMessage, router]
  )

  useEffect(() => {
    if (!conversationId) {
      return
    }

    const pendingChat = getPendingChat()

    if (!pendingChat?.text) {
      return
    }

    sessionStorage.removeItem(PENDING_CHAT_KEY)

    const userId = LocalStorage.getUserId()

    if (!userId) {
      return
    }

    const title = pendingChat.text.trim().split(/\s+/).slice(0, 10).join(' ')

    createConversation(userId, conversationId, title)
      .then((conversation) => {
        queryClient.setQueryData<ConversationType[]>(['conversations'], (old) => {
          if (!old) {
            return [conversation]
          }

          if (old.some((c) => c.id === conversation.id)) {
            return old
          }

          return [conversation, ...old]
        })

        handleSubmit({ text: pendingChat.text, files: [] })
      })
      .catch(console.error)
  }, [conversationId, handleSubmit, queryClient])

  return (
    <Main className="flex flex-col h-[calc(100vh-var(--header-height))]">
      <ConversationComp messages={messages} isLoading={isMessagesLoading} />
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
