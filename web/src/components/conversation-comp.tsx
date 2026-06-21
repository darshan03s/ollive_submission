'use client'

import { UIMessage } from 'ai'
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton
} from '@/components/ai-elements/conversation'
import { Message, MessageContent, MessageResponse } from '@/components/ai-elements/message'
import { MessageSquare } from 'lucide-react'

const ConversationComp = ({
  messages,
  isLoading
}: {
  messages: UIMessage[]
  isLoading: boolean
}) => {
  if (isLoading) {
    return <div className="flex items-center justify-center flex-1" />
  }

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center flex-1">
        <ConversationEmptyState
          icon={<MessageSquare className="size-12" />}
          title="Start a conversation"
          description="Type a message below to begin chatting"
        />
      </div>
    )
  }

  return (
    <Conversation className="flex-1">
      <ConversationContent className="max-w-3xl mx-auto w-full px-4 pb-12">
        {messages.map((message) => (
          <Message from={message.role} key={message.id}>
            <MessageContent>
              {message.parts.map((part, i) => {
                switch (part.type) {
                  case 'text':
                    return (
                      <MessageResponse mode="streaming" key={`${message.id}-${i}`}>
                        {part.text}
                      </MessageResponse>
                    )
                  default:
                    return null
                }
              })}
            </MessageContent>
          </Message>
        ))}
      </ConversationContent>
      <ConversationScrollButton />
    </Conversation>
  )
}

export default ConversationComp
