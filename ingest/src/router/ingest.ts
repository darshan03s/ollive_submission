import { Router } from 'express'
import { InferenceCompletedEventSchema } from '../zod-schemas/inference.js'
import { inferenceQueue } from '@/worker/queue.js'
import { redactPii } from '@/redact.js'

export const ingestRouter: Router = Router()

ingestRouter.post('/', async (req, res) => {
  const result = InferenceCompletedEventSchema.safeParse(req.body)

  if (!result.success) {
    console.error('[ingest] Validation error:', result.error)
    res.status(400).json({ code: 'VALIDATION_ERROR' })
    return
  }

  const event = {
    ...result.data,
    inputPreview: redactPii(result.data.inputPreview),
    outputPreview: redactPii(result.data.outputPreview)
  }

  await inferenceQueue.add('store-inference', event)

  console.log('[ingest] Event enqueued')
  res.status(200).json({ code: 'SUCCESS' })
})
