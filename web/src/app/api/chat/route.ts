import { streamText, UIMessage, convertToModelMessages, LanguageModel } from 'ai'

export async function POST(req: Request) {
  const { messages, model }: { messages: UIMessage[]; model: LanguageModel } = await req.json()

  const result = streamText({
    model,
    messages: await convertToModelMessages(messages)
  })

  return result.toUIMessageStreamResponse()
}
