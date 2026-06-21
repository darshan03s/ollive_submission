import { messagesRepository } from 'db/repository'
import { NextResponse } from 'next/server'

export const GET = async (req: Request) => {
  const { searchParams } = new URL(req.url)
  const conversationId = searchParams.get('conversationId')

  if (!conversationId) {
    return new Response('Conversation ID is required', { status: 400 })
  }

  const messages = await messagesRepository.getAllByConversationId(conversationId)

  return NextResponse.json(messages)
}
