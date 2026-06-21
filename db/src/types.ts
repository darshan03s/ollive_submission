import { conversations, inferenceEvents, messages } from './schema.js'

export type InferenceEventType = typeof inferenceEvents.$inferSelect

export type InferenceEventInsertType = typeof inferenceEvents.$inferInsert

export type ConversationInsertType = typeof conversations.$inferInsert

export type ConversationType = typeof conversations.$inferSelect

export type MessageInsertType = typeof messages.$inferInsert

export type MessageType = typeof messages.$inferSelect
