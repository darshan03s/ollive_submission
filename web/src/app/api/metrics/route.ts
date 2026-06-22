import { inferenceEventsRepository } from 'db/repository'
import { NextResponse } from 'next/server'
import { aggregateMetrics, getRangeConfig, isMetricRange } from '@/lib/metrics'

export const dynamic = 'force-dynamic'

export const GET = async (req: Request) => {
  const { searchParams } = new URL(req.url)
  const rangeParam = searchParams.get('range')
  const range = isMetricRange(rangeParam) ? rangeParam : '24h'

  const now = Date.now()
  const from = new Date(now - getRangeConfig(range).durationMs).toISOString()
  const to = new Date(now).toISOString()

  const events = await inferenceEventsRepository.getInRange(from, to)

  return NextResponse.json(aggregateMetrics(events, range, now))
}
