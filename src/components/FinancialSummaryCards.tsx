import type { LaborLog, LaborEntry, EstimateLineItem } from '@/types/estimate'
import type { ScheduleEntry } from '@/types/schedule'
import type { RateCardItemsBySection } from '@/types/rate-card'
import { computeEstimateTotals } from '@/lib/estimate-totals'

function fmt(n: number): string {
  const abs = Math.abs(n)
  const sign = n < 0 ? '-' : ''
  return `${sign}$${Math.round(abs).toLocaleString('en-US')}`
}

export function FinancialSummaryCards({
  laborLogs,
  allEntriesMap,
  scheduleEntriesMap,
  lineItemsMap,
  rateCardData,
  gpThreshold,
}: {
  laborLogs: LaborLog[]
  allEntriesMap: Record<string, LaborEntry[]>
  scheduleEntriesMap: Record<string, ScheduleEntry[]>
  lineItemsMap: Record<string, EstimateLineItem[]>
  rateCardData: RateCardItemsBySection[]
  gpThreshold: number
}) {
  const totals = computeEstimateTotals(laborLogs, allEntriesMap, scheduleEntriesMap, lineItemsMap, rateCardData)

  const gpBelowThreshold = totals.grossRevenue > 0 && totals.gpPercent < gpThreshold
  const hasData = totals.grossRevenue > 0 || totals.totalCost > 0

  const cards: { label: string; value: string; accent: string; valueClass?: string }[] = [
    { label: 'Gross Revenue', value: fmt(totals.grossRevenue), accent: 'border-b-slate-400' },
    { label: 'Net Revenue',   value: fmt(totals.netRevenue),   accent: 'border-b-blue-400' },
    { label: 'Total Cost',    value: fmt(totals.totalCost),    accent: 'border-b-rose-300' },
    { label: 'Gross Profit',  value: fmt(totals.grossProfit),  accent: 'border-b-emerald-400' },
    {
      label: 'GP %',
      value: totals.grossRevenue > 0 ? `${totals.gpPercent.toFixed(1)}%` : '—',
      accent: gpBelowThreshold ? 'border-b-amber-400' : 'border-b-emerald-500',
      valueClass: gpBelowThreshold ? 'text-amber-700' : 'text-emerald-700',
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
      {cards.map((c) => (
        <div
          key={c.label}
          className={`bg-white border border-border/40 rounded-md shadow-sm px-3 py-2 border-b-2 ${c.accent}`}
        >
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground/70 font-medium leading-none mb-1">
            {c.label}
          </p>
          <p className={`text-[18px] font-semibold tabular-nums leading-tight ${c.valueClass ?? 'text-foreground'}`}>
            {hasData ? c.value : '—'}
          </p>
        </div>
      ))}
    </div>
  )
}
