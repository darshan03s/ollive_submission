'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import type { InferenceEventType } from 'db/types'
import { formatFullTime, formatLatency } from '@/lib/format'

type LogsTableProps = {
  events: InferenceEventType[]
}

const STATUS_VARIANT: Record<
  InferenceEventType['status'],
  'secondary' | 'destructive' | 'outline'
> = {
  success: 'secondary',
  error: 'destructive',
  aborted: 'outline'
}

const LogsTable = ({ events }: LogsTableProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent inference logs</CardTitle>
        <CardDescription>Latest {events.length} events from the ingestion pipeline</CardDescription>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No inference logs yet</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead className="text-right">Latency</TableHead>
                <TableHead className="text-right">Tokens</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="max-w-xs">Input</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {formatFullTime(event.startTimestamp)}
                  </TableCell>
                  <TableCell className="font-medium">{event.model}</TableCell>
                  <TableCell className="capitalize text-muted-foreground">
                    {event.provider}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatLatency(event.latencyMs)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {event.totalTokens ?? '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[event.status]} className="capitalize">
                      {event.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-muted-foreground">
                    {event.inputPreview}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

export default LogsTable
