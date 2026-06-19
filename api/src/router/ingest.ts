import { Router } from 'express'
import { InferenceCompletedEventSchema } from '../zod-schemas/inference.js'
import { db } from '../db/index.js'
import { inferenceEvents } from '../db/schema.js'

export const ingestRouter: Router = Router()

ingestRouter.post('/', async (req, res) => {
  const result = InferenceCompletedEventSchema.safeParse(req.body)

  if (!result.success) {
    console.error('[ingest] Validation error:', result.error)
    res.status(400).json({ code: 'VALIDATION_ERROR' })
    return
  }

  await db.insert(inferenceEvents).values(result.data)

  console.log('[ingest] Event inserted')
  res.status(200).json({ code: 'SUCCESS' })
})
