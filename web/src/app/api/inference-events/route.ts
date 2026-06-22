import { inferenceEventsRepository } from 'db/repository'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const DEFAULT_LIMIT = 50
const MAX_LIMIT = 200

export const GET = async (req: Request) => {
  const { searchParams } = new URL(req.url)
  const limitParam = Number(searchParams.get('limit'))
  const limit =
    Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, MAX_LIMIT) : DEFAULT_LIMIT

  const events = await inferenceEventsRepository.getRecent(limit)

  return NextResponse.json(events)
}
