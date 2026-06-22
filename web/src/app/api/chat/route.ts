import { sdk } from '@/sdk'
import { UIMessage, LanguageModel } from 'ai'
import { messagesRepository } from 'db/repository'
import { nanoid } from 'nanoid'

type ChatRequestBody = {
  messages: UIMessage[]
  model: LanguageModel
  userInput: string
  conversationId: string
}

async function saveMessages(
  conversationId: string,
  userMessage: UIMessage,
  assistantMessage: UIMessage
) {
  await messagesRepository.create({
    id: userMessage.id || nanoid(16),
    conversationId: conversationId,
    role: userMessage.role,
    parts: userMessage.parts,
    metadata: userMessage.metadata
  })

  await messagesRepository.create({
    id: assistantMessage.id || nanoid(16),
    conversationId: conversationId,
    role: assistantMessage.role,
    parts: assistantMessage.parts,
    metadata: assistantMessage.metadata
  })
}

export async function POST(req: Request) {
  const { messages, model, userInput, conversationId }: ChatRequestBody = await req.json()

  const result = await sdk(model, messages, userInput, conversationId, req.signal)

  return result.toUIMessageStreamResponse({
    onFinish: (finishedObject) => {
      const userMessage = messages.slice(-1)[0]
      const assistantMessage = finishedObject.messages.slice(-1)[0]
      saveMessages(conversationId, userMessage, assistantMessage)
    }
  })
}
