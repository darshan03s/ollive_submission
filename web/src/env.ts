import { createEnv } from '@t3-oss/env-nextjs'
import * as z from 'zod'

export const env = createEnv({
  server: {
    APP_URL: z.string().min(1).default('http://localhost:3000')
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().min(1).default('http://localhost:3000')
  },
  runtimeEnv: process.env as Record<string, string>
})
