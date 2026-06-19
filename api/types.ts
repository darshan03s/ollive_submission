import { z } from 'zod'
import { InferenceCompletedEventSchema } from './src/zod-schemas/inference'

type InferenceCompletedEvent = z.infer<typeof InferenceCompletedEventSchema>
