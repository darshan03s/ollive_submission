import { streamText, UIMessage, convertToModelMessages, LanguageModel } from 'ai'

export async function POST(req: Request) {
  const {
    messages,
    model,
    userInput
  }: { messages: UIMessage[]; model: LanguageModel; userInput: string } = await req.json()

  const startTimestamp = new Date()

  const logObj = {
    provider: '',
    model: '',
    inputTokens: undefined as number | undefined,
    outputTokens: undefined as number | undefined,
    totalTokens: undefined as number | undefined,
    inputPreview: userInput.trim().split(/\s+/).slice(0, 200).join(' '),
    outputPreview: '',
    startTimestamp: startTimestamp.toISOString(),
    latencyMs: 0,
    endTimestamp: '',
    status: 'success' as 'success' | 'error' | 'aborted'
  }

  function onResponseComplete(finishedObject: typeof logObj) {
    console.log(finishedObject)
  }

  const result = streamText({
    model,
    messages: await convertToModelMessages(messages),
    onChunk: () => {
      if (logObj.latencyMs === 0) {
        logObj.latencyMs = new Date().getTime() - startTimestamp.getTime()
      }
    },
    onError: (error) => {
      console.error(error)
      logObj.status = 'error'
      logObj.endTimestamp = new Date().toISOString()
    },
    onFinish: (finishedObject) => {
      logObj.endTimestamp = new Date().toISOString()
      logObj.provider = finishedObject.model.provider
      logObj.model = finishedObject.model.modelId
      logObj.inputTokens = finishedObject.totalUsage.inputTokens
      logObj.outputTokens = finishedObject.totalUsage.outputTokens
      logObj.totalTokens = finishedObject.totalUsage.totalTokens
      logObj.outputPreview = finishedObject.text.trim().split(/\s+/).slice(0, 200).join(' ')
      onResponseComplete(logObj)
    },
    onAbort: () => {
      logObj.status = 'aborted'
      logObj.endTimestamp = new Date().toISOString()
    }
  })

  return result.toUIMessageStreamResponse()
}
