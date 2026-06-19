import { Queue } from 'bullmq'
import { env } from '@/env.js'

export const inferenceQueue = new Queue('inference-events', {
  connection: {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT
  }
})
