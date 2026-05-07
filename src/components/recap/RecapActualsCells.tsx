import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { TableCell } from '@/components/ui/table'
import { Check } from 'lucide-react'
import type { RecapActual } from '@/types/workflow'
import { getActualCostTotal } from '@/lib/accounting-amounts'

const cellInput = "h-6 text-[13px] bg-transparent border-0 focus-visible:ring-0 focus-visible:bg-muted/50 rounded-sm transition-colors tabular-nums"

function fmt(n: number) {
  return '$' + Math.round(n).toLocaleString('en-US')
}

interface RecapActualsCellsProps {
  recapActual: RecapActual | null
  estimatedTotal: number
  onSave: (updates: { actual_days?: number | null; actual_total?: number | null; actual_cost_total?: number | null }) => void
  /** If provided, auto-calculates act cost = actDays × qty × rate */
  autoCalcRate?: number
  autoCalcQty?: number
}

export function RecapActualsCells({
  recapActual,
  estimatedTotal,
  onSave,
  autoCalcRate,
  autoCalcQty,
}: RecapActualsCellsProps) {
  const [actDays, setActDays] = useState(recapActual?.actual_days?.toString() ?? '')
  const [actCost, setActCost] = useState(getActualCostTotal(recapActual)?.toString() ?? '')
  const [saved, setSaved] = useState(false)

  // Sync local state when async-loaded recapActual arrives
  useEffect(() => {
    setActDays(recapActual?.actual_days?.toString() ?? '')
    setActCost(getActualCostTotal(recapActual)?.toString() ?? '')
  }, [recapActual?.id])

  const actCostNum = parseFloat(actCost) || 0
  const hasActual = actCost !== ''
  const variance = hasActual ? estimatedTotal - actCostNum : null
  const variancePct = hasActual && estimatedTotal > 0 ? (variance! / estimatedTotal) * 100 : null

  function showSaved() {
    setSaved(true)
    setTimeout(() => setSaved(false), 1200)
  }

  function handleDaysBlur() {
    const days = parseFloat(actDays) || null
    // Auto-suggest cost if rate and qty are available
    if (days && autoCalcRate && autoCalcQty && actCost === '') {
      const suggested = days * autoCalcQty * autoCalcRate
      setActCost(suggested.toString())
      onSave({ actual_days: days, actual_cost_total: suggested, actual_total: suggested })
    } else {
      onSave({ actual_days: days })
    }
    showSaved()
  }

  function handleCostBlur() {
    const cost = parseFloat(actCost) || null
    onSave({ actual_cost_total: cost, actual_total: cost })
    showSaved()
  }

  return (
    <>
      <TableCell className="text-center py-1">
        <Input
          value={actDays}
          onChange={(e) => setActDays(e.target.value)}
          onBlur={handleDaysBlur}
          placeholder="—"
          className={`${cellInput} w-10 text-center`}
        />
      </TableCell>
      <TableCell className="text-right py-1">
        <div className="relative w-[72px] ml-auto flex items-center">
          <span className="absolute left-1 top-1/2 -translate-y-1/2 text-[13px] text-muted-foreground/60 pointer-events-none">$</span>
          <Input
            value={actCost}
            onChange={(e) => setActCost(e.target.value)}
            onBlur={handleCostBlur}
            placeholder="—"
            className={`${cellInput} w-full text-right pl-4`}
          />
          {saved && <Check className="absolute -right-4 h-3 w-3 text-green-600" />}
        </div>
      </TableCell>
      <TableCell className="text-right py-1">
        {variance !== null ? (
          <span className={`text-[13px] font-medium tabular-nums ${variance >= 0 ? 'text-green-700' : 'text-red-600'}`}>
            {variance >= 0 ? '+' : ''}{fmt(variance)}
          </span>
        ) : (
          <span className="text-[13px] text-muted-foreground/40">—</span>
        )}
      </TableCell>
      <TableCell className="text-right py-1">
        {variancePct !== null ? (
          <span className={`text-[13px] tabular-nums ${variancePct >= 0 ? 'text-green-700' : 'text-red-600'}`}>
            {variancePct >= 0 ? '+' : ''}{variancePct.toFixed(1)}%
          </span>
        ) : (
          <span className="text-[13px] text-muted-foreground/40">—</span>
        )}
      </TableCell>
    </>
  )
}

/**
 * Read-only variant used for schedule-driven labor rollup rows. Values are
 * computed from schedule_day_entries.actual_hours (see computeScheduleRollup)
 * and should not be edited here — the schedule grid is the source of truth.
 */
export function RecapComputedCells({
  estimatedTotal,
  actualDays,
  actualTotal,
}: {
  estimatedTotal: number
  actualDays: number
  actualTotal: number
}) {
  const variance = estimatedTotal - actualTotal
  const variancePct = estimatedTotal > 0 ? (variance / estimatedTotal) * 100 : 0
  return (
    <>
      <TableCell className="text-center py-1">
        <span className="text-[13px] tabular-nums text-muted-foreground/80">{actualDays || '—'}</span>
      </TableCell>
      <TableCell className="text-right py-1">
        <span className="text-[13px] tabular-nums text-muted-foreground/80" title="Computed from schedule actuals">
          {fmt(actualTotal)}
        </span>
      </TableCell>
      <TableCell className="text-right py-1">
        <span className={`text-[13px] font-medium tabular-nums ${variance >= 0 ? 'text-green-700' : 'text-red-600'}`}>
          {variance >= 0 ? '+' : ''}{fmt(variance)}
        </span>
      </TableCell>
      <TableCell className="text-right py-1">
        <span className={`text-[13px] tabular-nums ${variancePct >= 0 ? 'text-green-700' : 'text-red-600'}`}>
          {variancePct >= 0 ? '+' : ''}{variancePct.toFixed(1)}%
        </span>
      </TableCell>
    </>
  )
}

/** Column headers for recap mode — append after existing headers */
export function RecapColumnHeaders() {
  const headerClass = "text-[10px] uppercase tracking-widest text-muted-foreground font-medium py-2"
  return (
    <>
      <th className={`text-center w-14 ${headerClass}`}>Act Days</th>
      <th className={`text-right w-24 ${headerClass}`}>Actual Cost</th>
      <th className={`text-right w-24 ${headerClass}`}>Variance</th>
      <th className={`text-right w-14 ${headerClass}`}>Var%</th>
    </>
  )
}
