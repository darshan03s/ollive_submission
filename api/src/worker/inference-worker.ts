import { Worker } from 'bullmq'
import { inferenceEventsRepository } from 'db/repository'
import { env } from '@/env.js'

export const inferenceWorker = new Worker(
  'inference-events',
  async (job) => {
    await inferenceEventsRepository.create(job.data)
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

inferenceWorker.on('failed', (_job, err) => {
  console.error(`Job failed with error: ${err}`)
})
