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

inferenceWorker.on('completed', () => {
  console.log(`Job completed`)
})

inferenceWorker.on('failed', (err) => {
  console.error(`Job failed with error: ${err}`)
})
