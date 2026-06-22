import { createEnv } from '@t3-oss/env-nextjs'
import * as z from 'zod'

export const env = createEnv({
  server: {
    APP_URL: z.url(),
    AI_GATEWAY_API_KEY: z.string(),
    INGEST_SERVICE_URL: z.url(),
    DATABASE_URL: z.url()
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.url()
  },
  runtimeEnv: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    APP_URL: process.env.APP_URL,
    AI_GATEWAY_API_KEY: process.env.AI_GATEWAY_API_KEY,
    INGEST_SERVICE_URL: process.env.INGEST_SERVICE_URL,
    DATABASE_URL: process.env.DATABASE_URL
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION
})
