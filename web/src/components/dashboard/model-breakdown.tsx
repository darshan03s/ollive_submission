'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import type { ModelBreakdown } from '@/lib/metrics'
import { formatCount, formatLatency, formatPercent } from '@/lib/format'

type ModelBreakdownTableProps = {
  models: ModelBreakdown[]
}

const ModelBreakdownTable = ({ models }: ModelBreakdownTableProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>By model</CardTitle>
        <CardDescription>Per-model usage in the selected range</CardDescription>
      </CardHeader>
      <CardContent>
        {models.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No data in this range</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Model</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead className="text-right">Requests</TableHead>
                <TableHead className="text-right">Avg latency</TableHead>
                <TableHead className="text-right">Error rate</TableHead>
                <TableHead className="text-right">Tokens</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {models.map((model) => (
                <TableRow key={model.model}>
                  <TableCell className="font-medium">{model.model}</TableCell>
                  <TableCell className="capitalize text-muted-foreground">
                    {model.provider}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatCount(model.requests)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatLatency(model.avgLatency)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatPercent(model.errorRate)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatCount(model.totalTokens)}
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

export default ModelBreakdownTable
