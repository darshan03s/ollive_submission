import { z } from 'zod'

export const InferenceCompletedEventSchema = z.object({
  conversationId: z.string(),

  provider: z.string(),
  model: z.string(),

  latencyMs: z.number(),

  inputTokens: z.number(),
  outputTokens: z.number(),

  status: z.enum(['success', 'error']),

  timestamp: z.string()
})
