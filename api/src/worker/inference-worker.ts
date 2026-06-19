import { Worker } from 'bullmq'
import { db } from '@/db/index.js'
import { inferenceEvents } from '@/db/schema.js'
import { env } from '@/env.js'

export const inferenceWorker = new Worker(
  'inference-events',
  async (job) => {
    await db.insert(inferenceEvents).values(job.data)
  },
  {
    connection: {
      host: env.REDIS_HOST,
      port: env.REDIS_PORT
    }
  }
)

inferenceWorker.on('completed', (job) => {
  console.log(`Job ${job.id} completed`)
})

inferenceWorker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed`, err)
})
