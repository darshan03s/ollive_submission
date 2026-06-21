import { sdk } from '@/sdk'
import { UIMessage, LanguageModel } from 'ai'

export async function POST(req: Request) {
  const {
    messages,
    model,
    userInput,
    conversationId
  }: { messages: UIMessage[]; model: LanguageModel; userInput: string; conversationId: string } =
    await req.json()

  const result = await sdk(model, messages, userInput, conversationId)

  return result.toUIMessageStreamResponse()
}
