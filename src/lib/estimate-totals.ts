import type { LaborLog, LaborEntry, EstimateLineItem } from '../types/estimate'
import type { ScheduleEntry } from '../types/schedule'
import type { RateCardItemsBySection } from '../types/rate-card'
import { computeScheduleRollup } from './schedule-service'
import { ESTIMATE_SECTION_LABELS } from './section-labels'

/**
 * Office labor cost = day rate × the office's payout share (a fraction, e.g. 0.75).
 * The regional office RECEIVES this share of revenue, so that share is DriveShop's cost.
 *
 * Single source of truth for the office cost formula: the add-time paths
 * (ScheduleGrid, EstimateBuilderPage) and the recompute-on-change path all call this,
 * so the corrected formula can never be copied-and-drift again.
 */
export function officeCostRate(rate: number, payoutPct: number): number {
  return rate * payoutPct
}

/**
 * Corporate-structure labor cost for a rate-card-backed row.
 *
 * Mirrors `officeCostRate` deliberately: one helper, called by every add-time
 * path and the recompute-on-toggle path, so the formula cannot be copied and
 * drift. That is the W8 lesson — the office formula lived in five places and
 * was wrong in all of them for months.
 *
 * Reads `rate_card_items.corporate_cost` using the semantics the schema has
 * documented since `migration_add_cost_columns.sql` but nothing ever
 * implemented: a percentage of the rate when `corporate_cost_is_percent`, a
 * flat dollar amount otherwise.
 *
 * Returns null when the row carries no corporate cost — a custom role, or an
 * item nobody costed. Null means "not known", and the UI keeps that cell
 * editable so a user can type the real figure. It must not collapse to 0,
 * because 0 reads as 100% margin and is indistinguishable from a real answer.
 */
export function corporateCostRate(
  rate: number,
  corporateCost: number | null | undefined,
  isPercent: boolean,
): number | null {
  if (corporateCost == null) return null
  if (!Number.isFinite(rate) || !Number.isFinite(corporateCost)) return null
  return isPercent ? rate * (corporateCost / 100) : corporateCost
}

/**
 * A line is unpriced when it carries no usable rate AND is not a pass-through
 * (pass-throughs legitimately have no rate; they bill at the client's markup
 * on actual cost).
 *
 * Single source of truth for the unpriced check — pickers, Summary banner, and
 * the estimate→in_review gate all call this (Sprint 020).
 */
export function isUnpricedRate(rate: number | null | undefined, isPassThrough: boolean): boolean {
  if (isPassThrough) return false
  return rate == null || Number(rate) === 0
}

/** Resolve pass-through via rate_card_item_id; null FK ⇒ not pass-through. */
export function isPassThroughLookup(
  rateCardItemId: string | null | undefined,
  isPassThroughById: Record<string, boolean>,
): boolean {
  if (!rateCardItemId) return false
  return isPassThroughById[rateCardItemId] === true
}

/**
 * Labels of non-exempt unpriced lines on a segment — same rules as the
 * estimate→in_review gate (B3): labor uses override_rate ?? unit_rate,
 * schedule uses day_rate, line items use unit_cost; unplanned, pass-through,
 * and fee_basis='total_estimate' are exempt.
 */
export function listUnpricedLineLabels(args: {
  laborEntries: Array<{
    role_name: string
    unit_rate: number | null | undefined
    override_rate?: number | null
    is_unplanned?: boolean
    rate_card_item_id?: string | null
  }>
  scheduleEntries: Array<{
    role_name: string
    day_rate: number | null | undefined
    is_unplanned?: boolean
    rate_card_item_id?: string | null
  }>
  lineItems: Array<{
    item_name: string
    unit_cost: number | null | undefined
    fee_basis?: string | null
    is_unplanned?: boolean
    rate_card_item_id?: string | null
  }>
  isPassThroughById: Record<string, boolean>
}): string[] {
  const labels: string[] = []
  for (const e of args.laborEntries) {
    if (e.is_unplanned) continue
    const passThrough = isPassThroughLookup(e.rate_card_item_id, args.isPassThroughById)
    const rate = e.override_rate ?? e.unit_rate
    if (isUnpricedRate(rate, passThrough)) labels.push(e.role_name)
  }
  for (const s of args.scheduleEntries) {
    if (s.is_unplanned) continue
    const passThrough = isPassThroughLookup(s.rate_card_item_id, args.isPassThroughById)
    if (isUnpricedRate(s.day_rate, passThrough)) labels.push(s.role_name)
  }
  for (const i of args.lineItems) {
    if (i.is_unplanned) continue
    if (i.fee_basis === 'total_estimate') continue
    const passThrough = isPassThroughLookup(i.rate_card_item_id, args.isPassThroughById)
    if (isUnpricedRate(i.unit_cost, passThrough)) labels.push(i.item_name)
  }
  return labels
}

export const SUMMARY_SECTIONS = [
  { name: 'Planning & Administration Labor', type: 'labor', lineItemKey: null, passThrough: false },
  { name: 'Onsite Event Labor',              type: 'labor', lineItemKey: null, passThrough: false },
  { name: ESTIMATE_SECTION_LABELS.travel,     type: 'line_item', lineItemKey: 'travel',     passThrough: true },
  { name: ESTIMATE_SECTION_LABELS.creative,   type: 'line_item', lineItemKey: 'creative',   passThrough: false },
  { name: ESTIMATE_SECTION_LABELS.production, type: 'line_item', lineItemKey: 'production', passThrough: true },
  { name: ESTIMATE_SECTION_LABELS.access,     type: 'line_item', lineItemKey: 'access',     passThrough: false },
  { name: ESTIMATE_SECTION_LABELS.misc,       type: 'line_item', lineItemKey: 'misc',       passThrough: false },
  { name: ESTIMATE_SECTION_LABELS.fees,       type: 'line_item', lineItemKey: 'fees',       passThrough: false },
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
