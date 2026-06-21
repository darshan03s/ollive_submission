import { z } from 'zod'

export const InferenceCompletedEventSchema = z.object({
  conversationId: z.string(),
  provider: z.string(),
  model: z.string(),
  inputTokens: z.number().nullable(),
  outputTokens: z.number().nullable(),
  totalTokens: z.number().nullable(),
  inputPreview: z.string(),
  outputPreview: z.string(),
  startTimestamp: z.string(),
  latencyMs: z.number(),
  endTimestamp: z.string(),
  status: z.enum(['success', 'error', 'aborted'])
})
