import { integer, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const inferenceStatusEnum = pgEnum('inference_status', ['success', 'error'])

export const inferenceEvents = pgTable('inference_events', {
  id: uuid().primaryKey().defaultRandom(),
  conversationId: text('conversation_id').notNull(),
  provider: text('provider').notNull(),
  model: text('model').notNull(),
  latencyMs: integer('latency_ms').notNull(),
  inputTokens: integer('input_tokens').notNull(),
  outputTokens: integer('output_tokens').notNull(),
  status: inferenceStatusEnum('status').notNull(),
  timestamp: timestamp('timestamp', { mode: 'string' }).notNull()
})
