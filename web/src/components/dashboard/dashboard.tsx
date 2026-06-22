'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { env } from '@/env'
import { RANGES, type MetricRange, type MetricsResponse } from '@/lib/metrics'
import type { InferenceEventType } from 'db/types'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { Spinner } from '@/components/kibo-ui/spinner'
import { RefreshCw } from 'lucide-react'
import MetricCards from './metric-cards'
import { ErrorsChart, LatencyChart, ThroughputChart } from './charts'
import ModelBreakdownTable from './model-breakdown'
import LogsTable from './logs-table'

const REFETCH_INTERVAL = 10_000

const getMetrics = async (range: MetricRange): Promise<MetricsResponse> => {
  const res = await fetch(`${env.NEXT_PUBLIC_APP_URL}/api/metrics?range=${range}`)
  if (!res.ok) {
    throw new Error('Failed to load metrics')
  }
  return res.json()
}

const getRecentEvents = async (): Promise<InferenceEventType[]> => {
  const res = await fetch(`${env.NEXT_PUBLIC_APP_URL}/api/inference-events?limit=50`)
  if (!res.ok) {
    throw new Error('Failed to load inference logs')
  }
  return res.json()
}

const Dashboard = () => {
  const [range, setRange] = useState<MetricRange>('24h')

  const metricsQuery = useQuery({
    queryKey: ['metrics', range],
    queryFn: () => getMetrics(range),
    refetchInterval: REFETCH_INTERVAL
  })

  const eventsQuery = useQuery({
    queryKey: ['inference-events'],
    queryFn: getRecentEvents,
    refetchInterval: REFETCH_INTERVAL
  })

  const metrics = metricsQuery.data

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Inference dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Latency, throughput and errors across all conversations
          </p>
        </div>
        <div className="flex items-center gap-3">
          {(metricsQuery.isFetching || eventsQuery.isFetching) && (
            <RefreshCw className="size-4 animate-spin text-muted-foreground" />
          )}
          <ButtonGroup>
            {RANGES.map((value) => (
              <Button
                key={value}
                variant={value === range ? 'default' : 'outline'}
                size="sm"
                onClick={() => setRange(value)}
              >
                {value}
              </Button>
            ))}
          </ButtonGroup>
        </div>
      </div>

      {metricsQuery.isPending ? (
        <div className="flex h-64 items-center justify-center">
          <Spinner variant="bars" />
        </div>
      ) : metricsQuery.isError || !metrics ? (
        <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
          Failed to load metrics
        </div>
      ) : (
        <>
          <MetricCards summary={metrics.summary} />

          <div className="grid gap-4 lg:grid-cols-2">
            <LatencyChart series={metrics.series} range={range} />
            <ThroughputChart series={metrics.series} range={range} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <ErrorsChart series={metrics.series} range={range} />
            <ModelBreakdownTable models={metrics.models} />
          </div>
        </>
      )}

      <LogsTable events={eventsQuery.data ?? []} />
    </div>
  )
}

export default Dashboard
