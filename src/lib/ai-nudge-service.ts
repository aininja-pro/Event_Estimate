import { supabase } from './supabase'
import type { NudgeResponse } from '@/types/nudge'
import { getEstimate, getLaborLogs, getLaborEntries, getLineItemsByLocation } from './estimate-service'
import { getScheduleEntries, getScheduleDayTypes } from './schedule-service'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

/**
 * Query Supabase directly for the complete estimate state in the shape
 * the FastAPI nudge endpoint expects. Bypasses React state entirely
 * so the data is always fresh at the moment of the call.
 */
export async function fetchFreshEstimateState(estimateId: string): Promise<Record<string, unknown> | null> {
  try {
    const estimate = await getEstimate(estimateId)
    if (!estimate) return null

    const laborLogs = await getLaborLogs(estimateId)

    // Fetch all segment data in parallel
    const segmentData = await Promise.all(
      laborLogs.map(async (log) => {
        const [laborEntries, lineItems, scheduleEntries, dayTypes] = await Promise.all([
          getLaborEntries(log.id),
          getLineItemsByLocation(log.id),
          getScheduleEntries(log.id),
          getScheduleDayTypes(log.id),
        ])
        return { log, laborEntries, lineItems, scheduleEntries, dayTypes }
      })
    )

    // Compute summary totals (same math as EstimateBuilderPage useMemo)
    let totalRevenue = 0
    let totalCost = 0
    for (const { laborEntries, lineItems } of segmentData) {
      for (const entry of laborEntries) {
        totalRevenue += entry.quantity * entry.days * entry.unit_rate
        totalCost += entry.quantity * entry.days * (entry.cost_rate || 0)
      }
      for (const item of lineItems) {
        const rev = item.quantity * item.unit_cost * (1 + item.markup_pct / 100)
        totalRevenue += rev
        totalCost += item.quantity * item.unit_cost
      }
    }
    const grossProfit = totalRevenue - totalCost
    const gpPercent = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0

    return {
      client_name: estimate.clients?.name || null,
      event_type: estimate.event_type,
      event_name: estimate.event_name,
      location: estimate.location,
      start_date: estimate.start_date,
      end_date: estimate.end_date,
      cost_structure: estimate.cost_structure,
      attendance: estimate.expected_attendance ? parseInt(estimate.expected_attendance) || null : null,
      segments: segmentData.map(({ log, laborEntries, scheduleEntries, dayTypes, lineItems }) => ({
        name: log.location_name,
        status: log.status,
        labor_entries: laborEntries.map((e) => ({
          role_name: e.role_name,
          quantity: e.quantity,
          days: e.days,
          unit_rate: e.unit_rate,
          cost_rate: e.cost_rate,
          resource_type: e.resource_type,
          gl_code: e.gl_code,
          rate_card_item_id: e.rate_card_item_id,
        })),
        schedule_entries: scheduleEntries.map((s) => ({
          role_name: s.role_name,
          resource_type: s.resource_type,
          day_rate: s.day_rate,
          cost_rate: s.cost_rate,
          days_scheduled: s.day_entries?.length || 0,
          total_hours: s.day_entries?.reduce((sum: number, d: { hours?: number }) => sum + (d.hours || 0), 0) || 0,
        })),
        staff_count: scheduleEntries.length,
        schedule_day_types: dayTypes.map((dt) => ({
          work_date: dt.work_date,
          day_type: dt.day_type,
        })),
        line_items: lineItems.map((li) => ({
          section: li.section,
          item_name: li.item_name,
          quantity: li.quantity,
          unit_cost: li.unit_cost,
          markup_pct: li.markup_pct,
          gl_code: li.gl_code,
          rate_card_item_id: li.rate_card_item_id,
          is_auto_generated: li.is_auto_generated,
          fee_basis: li.fee_basis,
        })),
      })),
      summary: {
        total_revenue: Math.round(totalRevenue * 100) / 100,
        total_cost: Math.round(totalCost * 100) / 100,
        gross_profit: Math.round(grossProfit * 100) / 100,
        gp_percent: Math.round(gpPercent * 10) / 10,
      },
    }
  } catch {
    return null
  }
}

export async function fetchNudges(estimateId: string, estimateState: Record<string, unknown>): Promise<NudgeResponse> {
  try {
    const res = await fetch(`${API_URL}/api/ai/nudges`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estimate_id: estimateId, estimate_state: estimateState }),
    })
    if (!res.ok) {
      return { nudges: [], cached: false, generated_at: new Date().toISOString(), error: 'AI service temporarily unavailable' }
    }
    return await res.json()
  } catch {
    return { nudges: [], cached: false, generated_at: new Date().toISOString(), error: 'AI service temporarily unavailable' }
  }
}

export async function dismissNudge(estimateId: string, nudgeId: string, userId: string): Promise<void> {
  if (!supabase) return
  await supabase.from('estimate_nudge_dismissals').upsert(
    { estimate_id: estimateId, nudge_id: nudgeId, dismissed_by: userId },
    { onConflict: 'estimate_id,nudge_id' }
  )
}

export async function getDismissedNudges(estimateId: string): Promise<string[]> {
  if (!supabase) return []
  const { data } = await supabase
    .from('estimate_nudge_dismissals')
    .select('nudge_id')
    .eq('estimate_id', estimateId)
  return (data || []).map((row) => row.nudge_id)
}
