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

const chatTransport = new DefaultChatTransport({ api: '/api/chat' })
const PENDING_CHAT_KEY = 'pendingChat'

type PendingChat = {
  text: string
  model: Model['model']
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

    const pendingChat = JSON.parse(sessionStorage.getItem(PENDING_CHAT_KEY)!) as PendingChat

    if (!pendingChat) {
      return
    }

    const selectedModel = pendingChat.model

    if (selectedModel) {
      setModel(selectedModel as Model['model'])
    }

    handleSubmit({ text: pendingChat.text, files: [] })
    sessionStorage.removeItem(PENDING_CHAT_KEY)
  }, [conversationId, handleSubmit])

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
