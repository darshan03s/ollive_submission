'use client'

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig
} from '@/components/ui/chart'
import type { MetricRange, TimeBucket } from '@/lib/metrics'
import { formatAxisTime, formatFullTime } from '@/lib/format'

type ChartProps = {
  series: TimeBucket[]
  range: MetricRange
}

const bucketLabel = (payload: readonly { payload?: TimeBucket }[] | undefined) => {
  const iso = payload?.[0]?.payload?.timestamp
  return iso ? formatFullTime(iso) : ''
}

const latencyConfig = {
  avgLatency: { label: 'Avg', color: '#3b82f6' },
  p95Latency: { label: 'P95', color: '#f59e0b' }
} satisfies ChartConfig

const throughputConfig = {
  success: { label: 'Success', color: '#22c55e' },
  error: { label: 'Error', color: '#ef4444' },
  aborted: { label: 'Aborted', color: '#f59e0b' }
} satisfies ChartConfig

const errorConfig = {
  errorRate: { label: 'Error rate', color: '#ef4444' }
} satisfies ChartConfig

const ChartCard = ({
  title,
  description,
  children
}: {
  title: string
  description: string
  children: React.ReactNode
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

export const LatencyChart = ({ series, range }: ChartProps) => {
  return (
    <ChartCard title="Latency" description="Average and p95 response time (ms)">
      <ChartContainer config={latencyConfig} className="h-[240px] w-full">
        <LineChart data={series} margin={{ left: 4, right: 12, top: 8 }}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="timestamp"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={28}
            tickFormatter={(value) => formatAxisTime(value, range)}
          />
          <YAxis tickLine={false} axisLine={false} width={44} />
          <ChartTooltip
            content={<ChartTooltipContent labelFormatter={(_, payload) => bucketLabel(payload)} />}
          />
          <ChartLegend content={<ChartLegendContent />} />
          <Line
            dataKey="avgLatency"
            type="monotone"
            stroke="var(--color-avgLatency)"
            strokeWidth={2}
            dot={false}
          />
          <Line
            dataKey="p95Latency"
            type="monotone"
            stroke="var(--color-p95Latency)"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ChartContainer>
    </ChartCard>
  )
}

export const ThroughputChart = ({ series, range }: ChartProps) => {
  return (
    <ChartCard title="Throughput" description="Requests per interval, by status">
      <ChartContainer config={throughputConfig} className="h-[240px] w-full">
        <BarChart data={series} margin={{ left: 4, right: 12, top: 8 }}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="timestamp"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={28}
            tickFormatter={(value) => formatAxisTime(value, range)}
          />
          <YAxis tickLine={false} axisLine={false} width={44} allowDecimals={false} />
          <ChartTooltip
            content={<ChartTooltipContent labelFormatter={(_, payload) => bucketLabel(payload)} />}
          />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="success" stackId="a" fill="var(--color-success)" />
          <Bar dataKey="error" stackId="a" fill="var(--color-error)" />
          <Bar dataKey="aborted" stackId="a" fill="var(--color-aborted)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ChartContainer>
    </ChartCard>
  )
}

export const ErrorsChart = ({ series, range }: ChartProps) => {
  return (
    <ChartCard title="Errors" description="Error rate over time (%)">
      <ChartContainer config={errorConfig} className="h-[240px] w-full">
        <AreaChart data={series} margin={{ left: 4, right: 12, top: 8 }}>
          <defs>
            <linearGradient id="fillErrorRate" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-errorRate)" stopOpacity={0.6} />
              <stop offset="95%" stopColor="var(--color-errorRate)" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="timestamp"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={28}
            tickFormatter={(value) => formatAxisTime(value, range)}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={44}
            domain={[0, 100]}
            tickFormatter={(value) => `${value}%`}
          />
          <ChartTooltip
            content={<ChartTooltipContent labelFormatter={(_, payload) => bucketLabel(payload)} />}
          />
          <Area
            dataKey="errorRate"
            type="monotone"
            stroke="var(--color-errorRate)"
            strokeWidth={2}
            fill="url(#fillErrorRate)"
          />
        </AreaChart>
      </ChartContainer>
    </ChartCard>
  )
}
