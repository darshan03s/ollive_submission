import { db } from './index.js'
import type {
  ConversationInsertType,
  InferenceEventInsertType,
  MessageInsertType
} from './types.js'
import { conversations, inferenceEvents, messages } from './schema.js'
import { and, asc, desc, eq } from 'drizzle-orm'

export const inferenceEventsRepository = {
  create: async (inferenceEvent: InferenceEventInsertType) => {
    return await db.insert(inferenceEvents).values(inferenceEvent).returning()
  }
}

export const conversationsRepository = {
  create: async (conversation: ConversationInsertType) => {
    return await db.insert(conversations).values(conversation).returning()
  },
  getAllByUserId: async (userId: string) => {
    return await db
      .select()
      .from(conversations)
      .where(eq(conversations.userId, userId))
      .orderBy(desc(conversations.createdAt))
  },
  updateByUserIdAndId: async (userId: string, id: string, title: string) => {
    return await db
      .update(conversations)
      .set({ title })
      .where(and(eq(conversations.userId, userId), eq(conversations.id, id)))
  },
  deleteByUserIdAndId: async (userId: string, id: string) => {
    return await db
      .delete(conversations)
      .where(and(eq(conversations.userId, userId), eq(conversations.id, id)))
  }
}

export const messagesRepository = {
  create: async (message: MessageInsertType) => {
    return await db.insert(messages).values(message).returning()
  },
  getAllByConversationId: async (conversationId: string) => {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(asc(messages.createdAt))
  }
}
