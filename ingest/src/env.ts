import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(['development', 'production', 'test']),

    PORT: z.coerce.number().default(3001),

    INGEST_SERVICE_URL: z.url(),

    INGEST_SERVICE_CORS_ORIGIN: z.url(),

    DATABASE_URL: z.url(),

    REDIS_URL: z.url(),

    REDIS_HOST: z.string(),

    REDIS_PORT: z.coerce.number()
  },

  runtimeEnv: process.env,

  emptyStringAsUndefined: true,

  skipValidation: !!process.env.SKIP_ENV_VALIDATION
})
