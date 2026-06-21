import 'dotenv/config'
import { drizzle } from 'drizzle-orm/node-postgres'
import * as schema from './schema.js'
import { env } from './env.js'

export const db = drizzle(env.DATABASE_URL, {
  schema: schema
})
