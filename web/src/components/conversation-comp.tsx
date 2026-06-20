import { UIMessage } from 'ai'
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton
} from '@/components/ai-elements/conversation'
import { Message, MessageContent, MessageResponse } from '@/components/ai-elements/message'
import { MessageSquare } from 'lucide-react'

const ConversationComp = ({ messages }: { messages: UIMessage[] }) => {
  return (
    <>
      {messages.length === 0 ? (
        <div className="flex items-center justify-center flex-1">
          <ConversationEmptyState
            icon={<MessageSquare className="size-12" />}
            title="Start a conversation"
            description="Type a message below to begin chatting"
          />
        </div>
      ) : (
        <div className="flex-1">
          <Conversation>
            <ConversationContent className="px-0 pb-12">
              {messages.map((message) => (
                <Message from={message.role} key={message.id}>
                  <MessageContent>
                    {message.parts.map((part, i) => {
                      switch (part.type) {
                        case 'text':
                          return (
                            <MessageResponse key={`${message.id}-${i}`}>
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
        </div>
      )}
    </>
  )
}

export default ConversationComp
