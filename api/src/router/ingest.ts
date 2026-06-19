import { Router } from 'express'
import { InferenceCompletedEventSchema } from '../zod-schemas/inference.js'

export const ingestRouter: Router = Router()

ingestRouter.post('/', (req, res) => {
  const result = InferenceCompletedEventSchema.safeParse(req.body)

  if (!result.success) {
    console.error('[ingest] Validation error:', result.error)
    res.status(400).json({ code: 'VALIDATION_ERROR' })
    return
  }

  console.log('[ingest] Event received:', result.data)
  res.status(200).json({ code: 'SUCCESS' })
})
