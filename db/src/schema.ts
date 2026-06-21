import { integer, jsonb, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const inferenceStatusEnum = pgEnum('inference_status', ['success', 'error', 'aborted'])

export const inferenceEvents = pgTable('inference_events', {
  id: uuid().primaryKey().defaultRandom(),
  conversationId: text('conversation_id').notNull(),
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

export const messageRoleEnum = pgEnum('message_role', ['user', 'assistant', 'system'])

export const conversations = pgTable('conversations', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  title: text('title'),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow()
})

export const messages = pgTable('messages', {
  id: text('id').primaryKey(),
  conversationId: text('conversation_id')
    .notNull()
    .references(() => conversations.id, { onDelete: 'cascade' }),
  role: messageRoleEnum('role').notNull(),
  parts: jsonb('parts').notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow()
})
