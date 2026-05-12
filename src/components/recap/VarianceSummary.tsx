import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import type { VarianceRow } from '@/types/workflow'
import { estimateSectionLabel } from '@/lib/section-labels'

function fmt(n: number) {
  return '$' + Math.round(n).toLocaleString('en-US')
}

interface VarianceSummaryProps {
  varianceRows: VarianceRow[]
  segmentName?: string
}

export function VarianceSummary({ varianceRows, segmentName }: VarianceSummaryProps) {
  if (varianceRows.length === 0) return null

  // Group by section
  const sections = new Map<string, VarianceRow[]>()
  for (const row of varianceRows) {
    const key = row.section
    const list = sections.get(key) || []
    list.push(row)
    sections.set(key, list)
  }

  // Totals
  const totalEstimated = varianceRows.reduce((s, r) => s + r.estimated_total, 0)
  const totalActual = varianceRows.reduce((s, r) => s + r.actual_total, 0)
  const totalVariance = totalEstimated - totalActual
  const totalVariancePct = totalEstimated > 0 ? (totalVariance / totalEstimated) * 100 : 0

  const headerClass = "text-[10px] uppercase tracking-widest text-muted-foreground font-medium py-2"

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <h3 className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
          Recap: Estimated vs Actual Cost
        </h3>
        {segmentName && (
          <span className="text-[10px] text-muted-foreground/60">— {segmentName}</span>
        )}
      </div>

      <Table>
        <TableHeader>
          <TableRow className="border-b border-border/40 bg-slate-50 dark:bg-slate-800/30 hover:bg-slate-50">
            <TableHead className={`w-[200px] ${headerClass}`}>Section</TableHead>
            <TableHead className={`text-right w-28 ${headerClass}`}>Estimated</TableHead>
            <TableHead className={`text-right w-28 ${headerClass}`}>Actual Cost</TableHead>
            <TableHead className={`text-right w-28 ${headerClass}`}>Variance</TableHead>
            <TableHead className={`text-right w-16 ${headerClass}`}>Var%</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from(sections.entries()).map(([section, rows]) => {
            const secEstimated = rows.reduce((s, r) => s + r.estimated_total, 0)
            const secActual = rows.reduce((s, r) => s + r.actual_total, 0)
            const secVariance = secEstimated - secActual
            const secVariancePct = secEstimated > 0 ? (secVariance / secEstimated) * 100 : 0
            const hasActuals = rows.some((r) => r.actual_total > 0)

            return (
              <TableRow key={section} className="border-b border-border/20 hover:bg-muted/30">
                <TableCell className="py-1.5 text-[13px] font-medium">
                  {section === 'labor' ? 'Labor' : estimateSectionLabel(section)}
                </TableCell>
                <TableCell className="py-1.5 text-[13px] text-right tabular-nums">
                  {fmt(secEstimated)}
                </TableCell>
                <TableCell className="py-1.5 text-[13px] text-right tabular-nums">
                  {hasActuals ? fmt(secActual) : <span className="text-muted-foreground/40">—</span>}
                </TableCell>
                <TableCell className="py-1.5 text-[13px] text-right tabular-nums">
                  {hasActuals ? (
                    <span className={secVariance >= 0 ? 'text-green-700 font-medium' : 'text-red-600 font-medium'}>
                      {secVariance >= 0 ? '+' : ''}{fmt(secVariance)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground/40">—</span>
                  )}
                </TableCell>
                <TableCell className="py-1.5 text-[13px] text-right tabular-nums">
                  {hasActuals ? (
                    <span className={secVariancePct >= 0 ? 'text-green-700' : 'text-red-600'}>
                      {secVariancePct >= 0 ? '+' : ''}{secVariancePct.toFixed(1)}%
                    </span>
                  ) : (
                    <span className="text-muted-foreground/40">—</span>
                  )}
                </TableCell>
              </TableRow>
            )
          })}

          {/* Grand total row */}
          <TableRow className="border-t-2 border-border/60 bg-slate-50/50 hover:bg-slate-50/50">
            <TableCell className="py-2 text-[13px] font-bold">Total</TableCell>
            <TableCell className="py-2 text-[13px] text-right tabular-nums font-bold">{fmt(totalEstimated)}</TableCell>
            <TableCell className="py-2 text-[13px] text-right tabular-nums font-bold">{fmt(totalActual)}</TableCell>
            <TableCell className="py-2 text-[13px] text-right tabular-nums font-bold">
              <span className={totalVariance >= 0 ? 'text-green-700' : 'text-red-600'}>
                {totalVariance >= 0 ? '+' : ''}{fmt(totalVariance)}
              </span>
            </TableCell>
            <TableCell className="py-2 text-[13px] text-right tabular-nums font-bold">
              <span className={totalVariancePct >= 0 ? 'text-green-700' : 'text-red-600'}>
                {totalVariancePct >= 0 ? '+' : ''}{totalVariancePct.toFixed(1)}%
              </span>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}
