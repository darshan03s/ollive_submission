import type { MetricRange } from './metrics'

export function formatCount(value: number): string {
  return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(
    value
  )
}

export function formatLatency(ms: number): string {
  if (ms >= 1000) {
    return `${(ms / 1000).toFixed(2)}s`
  }
  return `${Math.round(ms)}ms`
}

export function formatPercent(value: number): string {
  return `${value}%`
}

export function formatAxisTime(iso: string, range: MetricRange): string {
  const date = new Date(iso)
  if (range === '1h' || range === '24h') {
    return date.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })
  }
  return date.toLocaleDateString('en', { month: 'short', day: 'numeric' })
}

export function formatFullTime(iso: string): string {
  return new Date(iso).toLocaleString('en', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
