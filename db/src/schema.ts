import { integer, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const inferenceStatusEnum = pgEnum('inference_status', ['success', 'error', 'aborted'])

export const inferenceEvents = pgTable('inference_events', {
  id: uuid().primaryKey().defaultRandom(),
  provider: text('provider').notNull(),
  model: text('model').notNull(),
  latencyMs: integer('latency_ms').notNull(),
  inputTokens: integer('input_tokens'),
  outputTokens: integer('output_tokens'),
  totalTokens: integer('total_tokens'),
  inputPreview: text('input_preview').notNull(),
  outputPreview: text('output_preview').notNull(),
  startTimestamp: timestamp('start_timestamp', { mode: 'string' }).notNull(),
  endTimestamp: timestamp('end_timestamp', { mode: 'string' }).notNull(),
  status: inferenceStatusEnum('status').notNull()
})
