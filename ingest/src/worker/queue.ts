import { Queue } from 'bullmq'
import { env } from '@/env.js'

export const inferenceQueue = new Queue('inference-events', {
  connection: {
    url: env.REDIS_URL
  }
})
