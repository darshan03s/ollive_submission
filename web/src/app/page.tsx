'use client'

import { Model, models } from '@/ai/models'
import { PromptInputMessage } from '@/components/ai-elements/prompt-input'
import Main from '@/components/main'
import PromptInputComp from '@/components/prompt-input-comp'
import { useCallback, useState } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import ConversationComp from '@/components/conversation-comp'

const chatTransport = new DefaultChatTransport({ api: '/api/chat' })

const Page = () => {
  const [model, setModel] = useState<Model['model']>(models[0].model)
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false)
  const { messages, sendMessage, status } = useChat({
    transport: chatTransport
  })
  const selectedModelData = models.find((m) => m.model === model)!

  const handleModelSelect = useCallback((selected: Model['model']) => {
    setModel(selected)
    setModelSelectorOpen(false)
  }, [])

  const handleSubmit = (message: PromptInputMessage) => {
    const hasText = Boolean(message.text)
    const hasAttachments = Boolean(message.files?.length)

    if (!(hasText || hasAttachments)) {
      return
    }

    sendMessage(
      { text: message.text },
      {
        body: {
          model: selectedModelData.model,
          userInput: message.text
        }
      }
    )
  }

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

export default Page
