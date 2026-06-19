import { pgTable, uuid } from 'drizzle-orm/pg-core'

export const test = pgTable('test', {
  id: uuid().defaultRandom()
})
