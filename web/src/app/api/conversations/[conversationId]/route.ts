import { conversationsRepository } from 'db/repository'
import { NextRequest, NextResponse } from 'next/server'

type RouteContext = {
  params: Promise<{
    conversationId: string
  }>
}

export const DELETE = async (req: NextRequest, context: RouteContext) => {
  const { conversationId } = await context.params
  const userId = req.headers.get('X-User-Id')

  if (!conversationId || !userId) {
    return NextResponse.json({ error: 'Conversation ID and user ID are required' }, { status: 400 })
  }

  await conversationsRepository.deleteByUserIdAndId(userId, conversationId)

  return NextResponse.json({ message: 'Conversation deleted' }, { status: 200 })
}
