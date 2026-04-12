import type { LaborLog, LaborEntry, EstimateLineItem } from '../types/estimate'
import type { ScheduleEntry } from '../types/schedule'
import type { RateCardItemsBySection } from '../types/rate-card'
import { computeScheduleRollup } from './schedule-service'

export const SUMMARY_SECTIONS = [
  { name: 'Planning & Administration Labor', type: 'labor', lineItemKey: null, passThrough: false },
  { name: 'Onsite Event Labor',              type: 'labor', lineItemKey: null, passThrough: false },
  { name: 'Travel Expenses',                 type: 'line_item', lineItemKey: 'travel',     passThrough: true },
  { name: 'Creative Costs',                  type: 'line_item', lineItemKey: 'creative',   passThrough: false },
  { name: 'Production Expenses',             type: 'line_item', lineItemKey: 'production', passThrough: true },
  { name: 'Logistics Expenses',              type: 'line_item', lineItemKey: 'access',     passThrough: false },
  { name: 'Misc',                            type: 'line_item', lineItemKey: 'misc',       passThrough: false },
  { name: 'Fees & Markups',                  type: 'line_item', lineItemKey: 'fees',       passThrough: false },
] as const

export interface EstimateTotals {
  /** GR — gross revenue across all sections */
  grossRevenue: number
  /** NR — gross revenue minus pass-through revenue */
  netRevenue: number
  /** Total cost across all sections */
  totalCost: number
  /** Cost minus pass-through cost */
  netCost: number
  /** GP = GR - totalCost */
  grossProfit: number
  /** GP / GR × 100 (0 when GR is 0) */
  gpPercent: number
}

/**
 * Compute totals for the Estimate Builder cards and the Summary P&L.
 * Iterates the same sections SummaryTab renders so both views agree.
 *
 * Pass-throughs (Travel, Production) are billed at client-specific markup but
 * excluded from NR so the headline number reflects margin-producing revenue.
 */
export function computeEstimateTotals(
  laborLogs: LaborLog[],
  allEntriesMap: Record<string, LaborEntry[]>,
  scheduleEntriesMap: Record<string, ScheduleEntry[]>,
  lineItemsMap: Record<string, EstimateLineItem[]>,
  rateCardData: RateCardItemsBySection[]
): EstimateTotals {
  const itemSectionMap = new Map<string, string>()
  for (const { section, items } of rateCardData) {
    for (const item of items) itemSectionMap.set(item.id, section.name)
  }

  function laborSectionFor(entry: LaborEntry): string {
    if (entry.rate_card_item_id) {
      const sec = itemSectionMap.get(entry.rate_card_item_id)
      if (sec) return sec
    }
    return 'Onsite Event Labor'
  }

  function scheduleRoleSection(roleName: string, schedEntries: ScheduleEntry[]): string {
    const entry = schedEntries.find((e) => e.role_name === roleName)
    if (entry?.rate_card_item_id) {
      const sec = itemSectionMap.get(entry.rate_card_item_id)
      if (sec) return sec
    }
    return 'Onsite Event Labor'
  }

  const sectionTotals: { name: string; revenue: number; cost: number; passThrough: boolean }[] = []

  for (const sec of SUMMARY_SECTIONS) {
    let totalRevenue = 0
    let totalCost = 0

    if (sec.type === 'labor') {
      for (const log of laborLogs) {
        const schedEntries = scheduleEntriesMap[log.id] ?? []
        if (schedEntries.length > 0) {
          // Unplanned rollup rows already have revenue_total=0 (planned hours=0
          // on every day_entry), but filter defensively so a future rollup
          // tweak can't leak them into approved-budget numbers.
          const rollup = computeScheduleRollup(schedEntries).filter((r) => !r.is_unplanned)
          for (const r of rollup) {
            if (scheduleRoleSection(r.role_name, schedEntries) !== sec.name) continue
            totalRevenue += r.revenue_total
            totalCost += r.cost_total
          }
        } else {
          // Manual labor — unplanned entries contribute 0 to approved budget.
          const entries = (allEntriesMap[log.id] ?? []).filter((e) => laborSectionFor(e) === sec.name && !e.is_unplanned)
          for (const e of entries) {
            const rate = e.override_rate ?? e.unit_rate
            totalRevenue += e.quantity * e.days * rate
            totalCost += e.quantity * e.days * (e.cost_rate ?? 0)
          }
        }
      }
    } else {
      // Fee-basis lines (e.g. agency fee) are computed as a % of the prior
      // sections' revenue, so they must be iterated in SUMMARY_SECTIONS order.
      const priorRevenue = sec.lineItemKey === 'fees'
        ? sectionTotals.reduce((s, b) => s + b.revenue, 0)
        : 0

      for (const log of laborLogs) {
        // Unplanned items are excluded from the approved-budget rollup — they
        // represent overruns added during recap, not part of the locked estimate.
        const items = (lineItemsMap[log.id] ?? []).filter((i) => i.section === sec.lineItemKey && !i.is_unplanned)
        for (const i of items) {
          if (i.fee_basis === 'total_estimate') {
            totalRevenue += priorRevenue * (i.markup_pct / 100)
          } else {
            const cost = i.quantity * i.unit_cost
            totalRevenue += cost * (1 + i.markup_pct / 100)
            totalCost += cost
          }
        }
      }
    }

    sectionTotals.push({ name: sec.name, revenue: totalRevenue, cost: totalCost, passThrough: sec.passThrough })
  }

  const grossRevenue = sectionTotals.reduce((s, b) => s + b.revenue, 0)
  const totalCost    = sectionTotals.reduce((s, b) => s + b.cost, 0)
  const ptRevenue    = sectionTotals.filter((b) => b.passThrough).reduce((s, b) => s + b.revenue, 0)
  const ptCost       = sectionTotals.filter((b) => b.passThrough).reduce((s, b) => s + b.cost, 0)
  const grossProfit  = grossRevenue - totalCost
  const gpPercent    = grossRevenue > 0 ? (grossProfit / grossRevenue) * 100 : 0

  return {
    grossRevenue,
    netRevenue: grossRevenue - ptRevenue,
    totalCost,
    netCost: totalCost - ptCost,
    grossProfit,
    gpPercent,
  }
}
