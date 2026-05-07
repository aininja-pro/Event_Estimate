import type { RecapActual } from '../types/workflow'

type RecapActualAmounts = Pick<
  RecapActual,
  'actual_total' | 'actual_cost_total' | 'actual_billable_total' | 'actual_days'
>

type ManualLaborBillableSource = {
  quantity: number
  days: number
  unit_rate: number
}

type LineItemBillableSource = {
  quantity: number
  unit_cost: number
  markup_pct: number
  fee_basis?: string | null
}

export type ActualBillableSource =
  | { sourceType: 'manual_labor'; source: ManualLaborBillableSource }
  | { sourceType: 'line_item'; source: LineItemBillableSource }

function finiteNumber(value: unknown): number | null {
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

export function getActualCostTotal(recapActual: Pick<RecapActual, 'actual_cost_total' | 'actual_total'> | null | undefined): number | null {
  if (!recapActual) return null
  return finiteNumber(recapActual.actual_cost_total) ?? finiteNumber(recapActual.actual_total)
}

export function usesLegacyActualCost(recapActual: Pick<RecapActual, 'actual_cost_total' | 'actual_total'> | null | undefined): boolean {
  if (!recapActual) return false
  return recapActual.actual_cost_total == null && recapActual.actual_total != null
}

export function getActualBillableTotal(
  input: ActualBillableSource,
  recapActual: RecapActualAmounts | null | undefined
): number | null {
  const explicit = finiteNumber(recapActual?.actual_billable_total)
  if (explicit != null) return explicit

  if (input.sourceType === 'manual_labor') {
    const qty = finiteNumber(input.source.quantity)
    const days = finiteNumber(recapActual?.actual_days) ?? (!recapActual ? finiteNumber(input.source.days) : null)
    const rate = finiteNumber(input.source.unit_rate)
    if (qty != null && days != null && rate != null && qty > 0 && days > 0 && rate > 0) {
      return qty * days * rate
    }
    return null
  }

  if (input.source.fee_basis === 'total_estimate') return null

  const markup = finiteNumber(input.source.markup_pct)
  if (markup == null) return null

  const actualCost = getActualCostTotal(recapActual)
  if (actualCost != null && actualCost > 0) {
    return actualCost * (1 + markup / 100)
  }

  if (!recapActual) {
    const qty = finiteNumber(input.source.quantity)
    const unitCost = finiteNumber(input.source.unit_cost)
    if (qty != null && unitCost != null && qty > 0 && unitCost > 0) {
      return qty * unitCost * (1 + markup / 100)
    }
  }

  return null
}

export function canDeriveActualBillableTotal(
  input: ActualBillableSource,
  recapActual: RecapActualAmounts | null | undefined
): boolean {
  return getActualBillableTotal(input, recapActual) != null
}
