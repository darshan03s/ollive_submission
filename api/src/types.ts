import { z } from 'zod'
import { InferenceCompletedEventSchema } from './zod-schemas/inference.js'

export type InferenceCompletedEvent = z.infer<typeof InferenceCompletedEventSchema>
