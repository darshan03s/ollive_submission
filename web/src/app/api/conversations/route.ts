import { conversationsRepository } from 'db/repository'
import { NextResponse } from 'next/server'

export const GET = async (req: Request) => {
  const userId = req.headers.get('X-User-Id')

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
  }

  const conversations = await conversationsRepository.getAllByUserId(userId)

  return NextResponse.json(conversations)
}
