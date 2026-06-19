type InferenceCompletedEvent = {
  conversationId: string

  provider: string
  model: string

  latencyMs: number

  inputTokens: number
  outputTokens: number

  status: 'success' | 'error'

  timestamp: string
}
