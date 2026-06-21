import { env } from '@/env.js'
import { Redis } from 'ioredis'

const connection = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null
})

export default connection
