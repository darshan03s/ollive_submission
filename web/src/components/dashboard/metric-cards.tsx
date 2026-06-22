'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { MetricsSummary } from '@/lib/metrics'
import { formatCount, formatLatency, formatPercent } from '@/lib/format'
import { Activity, AlertTriangle, Coins, Gauge, Timer } from 'lucide-react'

type MetricCardsProps = {
  summary: MetricsSummary
}

const MetricCard = ({
  title,
  value,
  hint,
  icon: Icon,
  tone = 'default'
}: {
  title: string
  value: string
  hint?: string
  icon: React.ComponentType<{ className?: string }>
  tone?: 'default' | 'destructive'
}) => {
  return (
    <Card className="gap-2 py-4">
      <CardHeader className="px-4">
        <CardTitle className="flex items-center justify-between text-sm font-medium text-muted-foreground">
          {title}
          <Icon className={tone === 'destructive' ? 'size-4 text-destructive' : 'size-4'} />
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4">
        <div
          className={
            tone === 'destructive'
              ? 'text-2xl font-semibold tabular-nums text-destructive'
              : 'text-2xl font-semibold tabular-nums'
          }
        >
          {value}
        </div>
        {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </Card>
  )
}

const MetricCards = ({ summary }: MetricCardsProps) => {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
      <MetricCard
        title="Total requests"
        value={formatCount(summary.totalRequests)}
        hint={`${formatPercent(summary.successRate)} success rate`}
        icon={Activity}
      />
      <MetricCard
        title="Avg latency"
        value={formatLatency(summary.avgLatency)}
        hint="Mean time to complete"
        icon={Timer}
      />
      <MetricCard
        title="P95 latency"
        value={formatLatency(summary.p95Latency)}
        hint="95th percentile"
        icon={Gauge}
      />
      <MetricCard
        title="Error rate"
        value={formatPercent(summary.errorRate)}
        hint="Errors + aborted"
        icon={AlertTriangle}
        tone={summary.errorRate > 0 ? 'destructive' : 'default'}
      />
      <MetricCard
        title="Total tokens"
        value={formatCount(summary.totalTokens)}
        hint="Input + output"
        icon={Coins}
      />
    </div>
  )
}

export default MetricCards
