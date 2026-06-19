import { Router } from 'express'
import { InferenceCompletedEventSchema } from '../zod-schemas/inference.js'
import { db } from '../db/index.js'
import { inferenceEvents } from '../db/schema.js'
import { inferenceQueue } from '@/worker/queue.js'

export const ingestRouter: Router = Router()

ingestRouter.post('/', async (req, res) => {
  const result = InferenceCompletedEventSchema.safeParse(req.body)

  if (!result.success) {
    console.error('[ingest] Validation error:', result.error)
    res.status(400).json({ code: 'VALIDATION_ERROR' })
    return
  }

  await inferenceQueue.add('store-inference', result.data)

  console.log('[ingest] Event enqueued')
  res.status(200).json({ code: 'SUCCESS' })
})
