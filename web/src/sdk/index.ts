import { env } from '@/env'
import { convertToModelMessages, LanguageModel, streamText, UIMessage } from 'ai'

export async function sdk(model: LanguageModel, messages: UIMessage[], userInput: string) {
  const startTimestamp = new Date()

  const logObj = {
    provider: '',
    model: '',
    inputTokens: null as number | null,
    outputTokens: null as number | null,
    totalTokens: null as number | null,
    inputPreview: userInput.trim().split(/\s+/).slice(0, 200).join(' '),
    outputPreview: '',
    startTimestamp: startTimestamp.toISOString(),
    latencyMs: 0,
    endTimestamp: '',
    status: 'success' as 'success' | 'error' | 'aborted'
  }

  function onResponseComplete(finishedObject: typeof logObj) {
    fetch(`${env.LOG_SERVICE_URL}/ingest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(finishedObject)
    })
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
      logObj.inputTokens = finishedObject.totalUsage.inputTokens ?? null
      logObj.outputTokens = finishedObject.totalUsage.outputTokens ?? null
      logObj.totalTokens = finishedObject.totalUsage.totalTokens ?? null
      logObj.outputPreview = finishedObject.text.trim().split(/\s+/).slice(0, 200).join(' ')
      onResponseComplete(logObj)
    },
    onAbort: () => {
      logObj.status = 'aborted'
      logObj.endTimestamp = new Date().toISOString()
    }
  })

  return result
}
