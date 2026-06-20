import { sdk } from '@/sdk'
import { UIMessage, LanguageModel } from 'ai'

export async function POST(req: Request) {
  const {
    messages,
    model,
    userInput
  }: { messages: UIMessage[]; model: LanguageModel; userInput: string } = await req.json()

  const result = await sdk(model, messages, userInput)

  return result.toUIMessageStreamResponse()
}
