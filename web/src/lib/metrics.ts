import type { InferenceEventType } from 'db/types'

export type MetricRange = '1h' | '24h' | '7d' | '30d'

export const RANGES: MetricRange[] = ['1h', '24h', '7d', '30d']

export const RANGE_LABELS: Record<MetricRange, string> = {
  '1h': 'Last hour',
  '24h': 'Last 24 hours',
  '7d': 'Last 7 days',
  '30d': 'Last 30 days'
}

const RANGE_CONFIG: Record<MetricRange, { durationMs: number; bucketMs: number }> = {
  '1h': { durationMs: 60 * 60 * 1000, bucketMs: 5 * 60 * 1000 },
  '24h': { durationMs: 24 * 60 * 60 * 1000, bucketMs: 60 * 60 * 1000 },
  '7d': { durationMs: 7 * 24 * 60 * 60 * 1000, bucketMs: 6 * 60 * 60 * 1000 },
  '30d': { durationMs: 30 * 24 * 60 * 60 * 1000, bucketMs: 24 * 60 * 60 * 1000 }
}

export function isMetricRange(value: string | null): value is MetricRange {
  return value !== null && (RANGES as string[]).includes(value)
}

export function getRangeConfig(range: MetricRange) {
  return RANGE_CONFIG[range]
}

export type TimeBucket = {
  timestamp: string
  requests: number
  avgLatency: number
  p95Latency: number
  success: number
  error: number
  aborted: number
  errorRate: number
  totalTokens: number
}

export type ModelBreakdown = {
  model: string
  provider: string
  requests: number
  avgLatency: number
  errorRate: number
  totalTokens: number
}

export type MetricsSummary = {
  totalRequests: number
  avgLatency: number
  p95Latency: number
  errorRate: number
  totalTokens: number
  successRate: number
}

export type MetricsResponse = {
  range: MetricRange
  from: string
  to: string
  summary: MetricsSummary
  series: TimeBucket[]
  models: ModelBreakdown[]
}

function percentile(sortedValues: number[], p: number): number {
  if (sortedValues.length === 0) {
    return 0
  }
  const index = Math.ceil((p / 100) * sortedValues.length) - 1
  const clamped = Math.min(Math.max(index, 0), sortedValues.length - 1)
  return sortedValues[clamped]!
}

function average(values: number[]): number {
  if (values.length === 0) {
    return 0
  }
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function rate(part: number, total: number): number {
  if (total === 0) {
    return 0
  }
  return Math.round((part / total) * 1000) / 10
}

type ModelAccumulator = {
  provider: string
  latencies: number[]
  requests: number
  errors: number
  totalTokens: number
}

export function aggregateMetrics(
  events: InferenceEventType[],
  range: MetricRange,
  now: number
): MetricsResponse {
  const { durationMs, bucketMs } = getRangeConfig(range)
  const to = now
  const from = now - durationMs
  const bucketCount = Math.ceil(durationMs / bucketMs)

  const series: TimeBucket[] = []
  const bucketLatencies: number[][] = []

  for (let i = 0; i < bucketCount; i++) {
    series.push({
      timestamp: new Date(from + i * bucketMs).toISOString(),
      requests: 0,
      avgLatency: 0,
      p95Latency: 0,
      success: 0,
      error: 0,
      aborted: 0,
      errorRate: 0,
      totalTokens: 0
    })
    bucketLatencies.push([])
  }

  const allLatencies: number[] = []
  const modelMap = new Map<string, ModelAccumulator>()

  let totalRequests = 0
  let totalTokens = 0
  let successCount = 0
  let errorCount = 0

  for (const event of events) {
    const timestamp = new Date(event.startTimestamp).getTime()
    if (Number.isNaN(timestamp) || timestamp < from || timestamp > to) {
      continue
    }

    const index = Math.min(Math.floor((timestamp - from) / bucketMs), bucketCount - 1)
    const bucket = series[index]!
    const tokens = event.totalTokens ?? 0

    bucket.requests += 1
    bucket.totalTokens += tokens
    bucketLatencies[index]!.push(event.latencyMs)

    if (event.status === 'success') {
      bucket.success += 1
      successCount += 1
    } else if (event.status === 'error') {
      bucket.error += 1
      errorCount += 1
    } else {
      bucket.aborted += 1
      errorCount += 1
    }

    totalRequests += 1
    totalTokens += tokens
    allLatencies.push(event.latencyMs)

    const model = modelMap.get(event.model) ?? {
      provider: event.provider,
      latencies: [],
      requests: 0,
      errors: 0,
      totalTokens: 0
    }
    model.requests += 1
    model.latencies.push(event.latencyMs)
    model.totalTokens += tokens
    if (event.status !== 'success') {
      model.errors += 1
    }
    modelMap.set(event.model, model)
  }

  series.forEach((bucket, index) => {
    const latencies = bucketLatencies[index]!
    if (latencies.length > 0) {
      bucket.avgLatency = Math.round(average(latencies))
      bucket.p95Latency = Math.round(
        percentile(
          [...latencies].sort((a, b) => a - b),
          95
        )
      )
    }
    bucket.errorRate = rate(bucket.error + bucket.aborted, bucket.requests)
  })

  const models: ModelBreakdown[] = [...modelMap.entries()]
    .map(([model, accumulator]) => ({
      model,
      provider: accumulator.provider,
      requests: accumulator.requests,
      avgLatency: Math.round(average(accumulator.latencies)),
      errorRate: rate(accumulator.errors, accumulator.requests),
      totalTokens: accumulator.totalTokens
    }))
    .sort((a, b) => b.requests - a.requests)

  return {
    range,
    from: new Date(from).toISOString(),
    to: new Date(to).toISOString(),
    summary: {
      totalRequests,
      avgLatency: Math.round(average(allLatencies)),
      p95Latency: Math.round(
        percentile(
          [...allLatencies].sort((a, b) => a - b),
          95
        )
      ),
      errorRate: rate(errorCount, totalRequests),
      totalTokens,
      successRate: rate(successCount, totalRequests)
    },
    series,
    models
  }
}
