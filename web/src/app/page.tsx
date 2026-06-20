'use client'

import { Model, models } from '@/ai/models'
import { PromptInputMessage } from '@/components/ai-elements/prompt-input'
import Main from '@/components/main'
import PromptInputComp from '@/components/prompt-input-comp'
import { useCallback, useState } from 'react'
import { useChat } from '@ai-sdk/react'
import ConversationComp from '@/components/conversation-comp'
import { useSession } from '@clerk/nextjs'
import { toast } from 'sonner'

const Page = () => {
  const [model, setModel] = useState<Model['model']>(models[0].model)
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false)
  const { messages, sendMessage, status } = useChat()
  const { isSignedIn } = useSession()
  const selectedModelData = models.find((m) => m.model === model)!

  const handleModelSelect = useCallback((selected: Model['model']) => {
    setModel(selected)
    setModelSelectorOpen(false)
  }, [])

  const handleSubmit = (message: PromptInputMessage) => {
    if (!isSignedIn) {
      toast.error('Please sign in to continue')
      return
    }

    const hasText = Boolean(message.text)
    const hasAttachments = Boolean(message.files?.length)

    if (!(hasText || hasAttachments)) {
      return
    }

    sendMessage(
      { text: message.text },
      {
        body: {
          model: selectedModelData.model
        }
      }
    )
  }

  return (
    <Main className="flex flex-col h-[calc(100vh-var(--header-height))]">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto py-4">
          <ConversationComp messages={messages} />
        </div>
      </div>
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
