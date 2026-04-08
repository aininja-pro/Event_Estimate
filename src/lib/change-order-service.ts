import { supabase } from './supabase'
import { getLaborEntries, getLineItemsByLocation } from './estimate-service'
import { getScheduleEntries, computeScheduleRollup } from './schedule-service'
import { createVersionSnapshot, reviewApproval } from './workflow-service'
import { transitionSegmentStatus } from './segment-status-service'
import type { ChangeOrder, DeltaSummary, DeltaItem, DeltaModifiedItem } from '../types/change-order'
import type { EstimateSnapshot } from '../types/workflow'

function requireSupabase() {
  if (!supabase) {
    throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
  }
  return supabase
}

// ---- Queries ----

export async function getChangeOrders(estimateId: string): Promise<ChangeOrder[]> {
  const db = requireSupabase()
  const { data, error } = await db
    .from('change_orders')
    .select('*')
    .eq('estimate_id', estimateId)
    .order('co_number', { ascending: true })
  if (error) throw error
  return await enrichWithProfileNames(data || [])
}

export async function getChangeOrdersForSegment(laborLogId: string): Promise<ChangeOrder[]> {
  const db = requireSupabase()
  const { data, error } = await db
    .from('change_orders')
    .select('*')
    .eq('labor_log_id', laborLogId)
    .order('co_number', { ascending: true })
  if (error) throw error
  return await enrichWithProfileNames(data || [])
}

export async function getDraftChangeOrder(laborLogId: string): Promise<ChangeOrder | null> {
  const db = requireSupabase()
  const { data, error } = await db
    .from('change_orders')
    .select('*')
    .eq('labor_log_id', laborLogId)
    .eq('status', 'draft')
    .maybeSingle()
  if (error) throw error
  return data ? mapChangeOrder(data) : null
}

export async function getSubmittedChangeOrder(laborLogId: string): Promise<ChangeOrder | null> {
  const db = requireSupabase()
  const { data, error } = await db
    .from('change_orders')
    .select('*')
    .eq('labor_log_id', laborLogId)
    .eq('status', 'submitted')
    .maybeSingle()
  if (error) throw error
  return data ? mapChangeOrder(data) : null
}

// ---- CO Number ----

async function getNextCONumber(estimateId: string, laborLogId: string): Promise<number> {
  const db = requireSupabase()
  const { data, error } = await db
    .from('change_orders')
    .select('co_number')
    .eq('estimate_id', estimateId)
    .eq('labor_log_id', laborLogId)
    .order('co_number', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return (data?.co_number ?? 0) + 1
}

// ---- Create ----

export async function createChangeOrder(input: {
  estimate_id: string
  labor_log_id: string
  description: string
  created_by: string
}): Promise<ChangeOrder> {
  const db = requireSupabase()

  const coNumber = await getNextCONumber(input.estimate_id, input.labor_log_id)

  const { data, error } = await db
    .from('change_orders')
    .insert({
      estimate_id: input.estimate_id,
      labor_log_id: input.labor_log_id,
      co_number: coNumber,
      description: input.description,
      status: 'draft',
      created_by: input.created_by,
    })
    .select()
    .single()
  if (error) throw error
  return mapChangeOrder(data)
}

export async function updateChangeOrderBaseline(
  coId: string,
  baselineVersionId: string,
  baselineTotal: number
): Promise<void> {
  const db = requireSupabase()
  const { error } = await db
    .from('change_orders')
    .update({ baseline_version_id: baselineVersionId, baseline_total: baselineTotal })
    .eq('id', coId)
  if (error) throw error
}

// ---- Delta Computation (core function) ----

export async function computeDelta(
  baselineVersionId: string,
  laborLogId: string
): Promise<{ delta: DeltaSummary; baselineTotal: number; revisedTotal: number }> {
  const db = requireSupabase()

  // 1. Fetch baseline snapshot
  const { data: version, error: vErr } = await db
    .from('estimate_versions')
    .select('snapshot_json')
    .eq('id', baselineVersionId)
    .single()
  if (vErr) throw vErr

  const snapshot = version.snapshot_json as EstimateSnapshot

  // 2. Extract baseline data for this segment
  const baselineLaborLog = snapshot.labor_logs.find(
    (ll) => (ll as Record<string, unknown>).id === laborLogId
  )
  const baselineLaborEntries = (baselineLaborLog?.entries || []) as Record<string, unknown>[]
  const baselineLineItems = (snapshot.line_items || []).filter(
    (li) => (li as Record<string, unknown>).labor_log_id === laborLogId
  ) as Record<string, unknown>[]
  const baselineScheduleEntries = (snapshot.schedule_entries || []).filter(
    (se) => (se as Record<string, unknown>).labor_log_id === laborLogId
  ) as Record<string, unknown>[]

  // 3. Fetch current data for this segment
  const currentLaborEntries = await getLaborEntries(laborLogId)
  const currentLineItems = await getLineItemsByLocation(laborLogId)
  const currentScheduleEntries = await getScheduleEntries(laborLogId)

  // 4. Determine if schedule-driven: has schedule entries in either baseline or current
  const isScheduleDriven = baselineScheduleEntries.length > 0 || currentScheduleEntries.length > 0


  const added: DeltaItem[] = []
  const removed: DeltaItem[] = []
  const modified: DeltaModifiedItem[] = []

  let baselineTotal = 0
  let revisedTotal = 0

  if (isScheduleDriven) {
    // Compare individual schedule entries by ID for precise tracking
    const baselineDayEntries = snapshot.schedule_day_entries || []
    compareScheduleEntries(baselineScheduleEntries, currentScheduleEntries, baselineDayEntries, added, removed, modified)

    // Compute totals from rollups
    const baseRollup = computeScheduleRollupFromSnapshot(baselineScheduleEntries, snapshot)
    const currentRollup = computeScheduleRollup(currentScheduleEntries)
    for (const r of baseRollup) baselineTotal += r.revenue_total
    for (const r of currentRollup) revisedTotal += r.revenue_total

    // Also compare custom labor entries (added via modal on schedule-driven segments)
    compareLaborEntries(baselineLaborEntries, currentLaborEntries, added, removed, modified)
    baselineTotal += sumLaborRevenue(baselineLaborEntries)
    revisedTotal += sumLaborRevenue(currentLaborEntries.map((e) => e as unknown as Record<string, unknown>))
  } else {
    // Compare manual labor entries
    compareLaborEntries(baselineLaborEntries, currentLaborEntries, added, removed, modified)
    baselineTotal += sumLaborRevenue(baselineLaborEntries)
    revisedTotal += sumLaborRevenue(currentLaborEntries.map((e) => e as unknown as Record<string, unknown>))
  }

  // Compare line items (applies to both schedule-driven and manual segments)
  compareLineItems(baselineLineItems, currentLineItems, added, removed, modified)
  baselineTotal += sumLineItemRevenue(baselineLineItems)
  revisedTotal += sumLineItemRevenue(currentLineItems.map((i) => i as unknown as Record<string, unknown>))

  const netDelta = Math.round((revisedTotal - baselineTotal) * 100) / 100

  return {
    delta: { added, removed, modified, net_delta: netDelta },
    baselineTotal: Math.round(baselineTotal * 100) / 100,
    revisedTotal: Math.round(revisedTotal * 100) / 100,
  }
}

// ---- Comparison helpers ----

function compareLaborEntries(
  baseline: Record<string, unknown>[],
  current: { id: string; rate_card_item_id: string | null; role_name: string; quantity: number; days: number; unit_rate: number }[],
  added: DeltaItem[],
  removed: DeltaItem[],
  modified: DeltaModifiedItem[]
) {
  const matched = new Set<string>()

  for (const curr of current) {
    const base = findMatch(baseline, curr.rate_card_item_id, curr.role_name)
    if (!base) {
      added.push({
        type: 'labor',
        item_name: curr.role_name,
        quantity: curr.quantity,
        days: curr.days,
        unit_rate: curr.unit_rate,
        total: curr.quantity * curr.days * curr.unit_rate,
      })
    } else {
      matched.add(base.id as string)
      const baseTotal = num(base.quantity) * num(base.days) * num(base.unit_rate)
      const currTotal = curr.quantity * curr.days * curr.unit_rate
      if (Math.abs(baseTotal - currTotal) > 0.01) {
        if (num(base.quantity) !== curr.quantity) {
          modified.push({ type: 'labor', item_name: curr.role_name, field: 'quantity', from: num(base.quantity), to: curr.quantity, delta: currTotal - baseTotal })
        } else if (num(base.days) !== curr.days) {
          modified.push({ type: 'labor', item_name: curr.role_name, field: 'days', from: num(base.days), to: curr.days, delta: currTotal - baseTotal })
        } else if (num(base.unit_rate) !== curr.unit_rate) {
          modified.push({ type: 'labor', item_name: curr.role_name, field: 'unit_rate', from: num(base.unit_rate), to: curr.unit_rate, delta: currTotal - baseTotal })
        } else {
          modified.push({ type: 'labor', item_name: curr.role_name, field: 'total', from: baseTotal, to: currTotal, delta: currTotal - baseTotal })
        }
      }
    }
  }

  for (const base of baseline) {
    if (!matched.has(base.id as string)) {
      removed.push({
        type: 'labor',
        item_name: str(base.role_name),
        quantity: num(base.quantity),
        days: num(base.days),
        unit_rate: num(base.unit_rate),
        total: num(base.quantity) * num(base.days) * num(base.unit_rate),
      })
    }
  }
}

function compareLineItems(
  baseline: Record<string, unknown>[],
  current: { id: string; rate_card_item_id: string | null; item_name: string; section: string; quantity: number; unit_cost: number; markup_pct: number }[],
  added: DeltaItem[],
  removed: DeltaItem[],
  modified: DeltaModifiedItem[]
) {
  const matched = new Set<string>()

  for (const curr of current) {
    const base = findLineItemMatch(baseline, curr.rate_card_item_id, curr.item_name, curr.section)
    if (!base) {
      const total = curr.quantity * curr.unit_cost * (1 + curr.markup_pct / 100)
      added.push({
        type: 'line_item',
        item_name: curr.item_name,
        section: curr.section,
        quantity: curr.quantity,
        unit_rate: curr.unit_cost,
        total,
      })
    } else {
      matched.add(base.id as string)
      const baseTotal = num(base.quantity) * num(base.unit_cost) * (1 + num(base.markup_pct) / 100)
      const currTotal = curr.quantity * curr.unit_cost * (1 + curr.markup_pct / 100)
      if (Math.abs(baseTotal - currTotal) > 0.01) {
        if (num(base.quantity) !== curr.quantity) {
          modified.push({ type: 'line_item', item_name: curr.item_name, section: curr.section, field: 'quantity', from: num(base.quantity), to: curr.quantity, delta: currTotal - baseTotal })
        } else if (num(base.unit_cost) !== curr.unit_cost) {
          modified.push({ type: 'line_item', item_name: curr.item_name, section: curr.section, field: 'unit_cost', from: num(base.unit_cost), to: curr.unit_cost, delta: currTotal - baseTotal })
        } else if (num(base.markup_pct) !== curr.markup_pct) {
          modified.push({ type: 'line_item', item_name: curr.item_name, section: curr.section, field: 'markup_pct', from: num(base.markup_pct), to: curr.markup_pct, delta: currTotal - baseTotal })
        } else {
          modified.push({ type: 'line_item', item_name: curr.item_name, section: curr.section, field: 'total', from: baseTotal, to: currTotal, delta: currTotal - baseTotal })
        }
      }
    }
  }

  for (const base of baseline) {
    if (!matched.has(base.id as string)) {
      const total = num(base.quantity) * num(base.unit_cost) * (1 + num(base.markup_pct) / 100)
      removed.push({
        type: 'line_item',
        item_name: str(base.item_name),
        section: str(base.section),
        quantity: num(base.quantity),
        unit_rate: num(base.unit_cost),
        total,
      })
    }
  }
}

// ---- Matching helpers ----

function compareScheduleEntries(
  baseline: Record<string, unknown>[],
  current: { id: string; role_name: string; person_name: string | null; day_rate: number; cost_rate: number; day_entries?: { hours: number }[] }[],
  baselineDayEntries: Record<string, unknown>[],
  added: DeltaItem[],
  removed: DeltaItem[],
  modified: DeltaModifiedItem[]
) {
  const matched = new Set<string>()

  // Build baseline day entries lookup
  const baseDayEntriesByEntry = new Map<string, Record<string, unknown>[]>()
  for (const de of baselineDayEntries) {
    const seId = (de as Record<string, unknown>).schedule_entry_id as string
    const list = baseDayEntriesByEntry.get(seId) || []
    list.push(de as Record<string, unknown>)
    baseDayEntriesByEntry.set(seId, list)
  }

  // Compute revenue for a single baseline schedule entry
  function baseEntryRevenue(se: Record<string, unknown>): { totalHours: number; revenue: number; workedDays: number } {
    const dayRate = num(se.day_rate)
    const des = baseDayEntriesByEntry.get(se.id as string) || []
    let revenue = 0
    let totalHours = 0
    let workedDays = 0
    for (const de of des) {
      const hours = num(de.hours)
      if (hours <= 0) continue
      workedDays++
      totalHours += hours
      const otHours = Math.max(hours - 10, 0)
      revenue += dayRate + (otHours * (dayRate / 10))
    }
    return { totalHours, revenue, workedDays }
  }

  // Compute revenue for a current schedule entry
  function currEntryRevenue(se: { day_rate: number; day_entries?: { hours: number }[] }): { totalHours: number; revenue: number; workedDays: number } {
    const des = se.day_entries || []
    let revenue = 0
    let totalHours = 0
    let workedDays = 0
    for (const de of des) {
      if (de.hours <= 0) continue
      workedDays++
      totalHours += de.hours
      const otHours = Math.max(de.hours - 10, 0)
      revenue += se.day_rate + (otHours * (se.day_rate / 10))
    }
    return { totalHours, revenue, workedDays }
  }

  // Match current entries to baseline by ID
  for (const curr of current) {
    const base = baseline.find((b) => (b as Record<string, unknown>).id === curr.id)
    if (!base) {
      // New entry — added
      const { revenue, workedDays } = currEntryRevenue(curr)
      const label = curr.person_name ? `${curr.role_name} (${curr.person_name})` : curr.role_name
      added.push({
        type: 'schedule',
        item_name: label,
        days: workedDays,
        unit_rate: curr.day_rate,
        total: revenue,
      })
    } else {
      matched.add(base.id as string)
      const baseRev = baseEntryRevenue(base)
      const currRev = currEntryRevenue(curr)
      const label = curr.person_name ? `${curr.role_name} (${curr.person_name})` : curr.role_name

      if (Math.abs(baseRev.revenue - currRev.revenue) > 0.01) {
        // Report all changes for this entry
        if (baseRev.totalHours !== currRev.totalHours) {
          modified.push({
            type: 'schedule', item_name: label, field: 'hours',
            from: baseRev.totalHours, to: currRev.totalHours, delta: currRev.revenue - baseRev.revenue,
          })
        } else if (baseRev.workedDays !== currRev.workedDays) {
          modified.push({
            type: 'schedule', item_name: label, field: 'days',
            from: baseRev.workedDays, to: currRev.workedDays, delta: currRev.revenue - baseRev.revenue,
          })
        } else if (num(base.day_rate) !== curr.day_rate) {
          modified.push({
            type: 'schedule', item_name: label, field: 'day_rate',
            from: num(base.day_rate), to: curr.day_rate, delta: currRev.revenue - baseRev.revenue,
          })
        } else {
          modified.push({
            type: 'schedule', item_name: label, field: 'total',
            from: baseRev.revenue, to: currRev.revenue, delta: currRev.revenue - baseRev.revenue,
          })
        }
      }
    }
  }

  // Entries in baseline but not in current — removed
  for (const base of baseline) {
    if (!matched.has(base.id as string)) {
      const { revenue, workedDays } = baseEntryRevenue(base)
      const personName = str(base.person_name)
      const roleName = str(base.role_name)
      const label = personName ? `${roleName} (${personName})` : roleName
      removed.push({
        type: 'schedule',
        item_name: label,
        days: workedDays,
        unit_rate: num(base.day_rate),
        total: revenue,
      })
    }
  }
}

function findMatch(
  entries: Record<string, unknown>[],
  rateCardItemId: string | null,
  roleName: string
): Record<string, unknown> | undefined {
  if (rateCardItemId) {
    const byRci = entries.find((e) => e.rate_card_item_id === rateCardItemId)
    if (byRci) return byRci
  }
  return entries.find((e) => str(e.role_name) === roleName)
}

function findLineItemMatch(
  items: Record<string, unknown>[],
  rateCardItemId: string | null,
  itemName: string,
  section: string
): Record<string, unknown> | undefined {
  if (rateCardItemId) {
    const byRci = items.find((i) => i.rate_card_item_id === rateCardItemId)
    if (byRci) return byRci
  }
  return items.find((i) => str(i.item_name) === itemName && str(i.section) === section)
}

// ---- Revenue helpers ----

function sumLaborRevenue(entries: Record<string, unknown>[]): number {
  return entries.reduce((sum, e) => sum + num(e.quantity) * num(e.days) * num(e.unit_rate), 0)
}

function sumLineItemRevenue(items: Record<string, unknown>[]): number {
  return items.reduce((sum, i) => {
    return sum + num(i.quantity) * num(i.unit_cost) * (1 + num(i.markup_pct) / 100)
  }, 0)
}

function computeScheduleRollupFromSnapshot(
  scheduleEntries: Record<string, unknown>[],
  snapshot: EstimateSnapshot
): { role_name: string; quantity: number; total_days: number; day_rate: number; revenue_total: number }[] {
  // Build day entries map from snapshot
  const dayEntriesByEntry = new Map<string, Record<string, unknown>[]>()
  for (const de of (snapshot.schedule_day_entries || [])) {
    const seId = (de as Record<string, unknown>).schedule_entry_id as string
    const list = dayEntriesByEntry.get(seId) || []
    list.push(de as Record<string, unknown>)
    dayEntriesByEntry.set(seId, list)
  }

  // Group by role_name + day_rate
  const groups = new Map<string, { role_name: string; quantity: number; total_days: number; day_rate: number; revenue_total: number }>()
  for (const se of scheduleEntries) {
    const roleName = str(se.role_name)
    const dayRate = num(se.day_rate)
    const key = `${roleName}|${dayRate}`
    const dayEntries = dayEntriesByEntry.get(se.id as string) || []
    const workedDays = dayEntries.filter((de) => num(de.hours) > 0).length
    let revenue = 0
    for (const de of dayEntries) {
      const hours = num(de.hours)
      if (hours <= 0) continue
      const otHours = Math.max(hours - 10, 0)
      revenue += dayRate + (otHours * (dayRate / 10))
    }

    const existing = groups.get(key)
    if (existing) {
      existing.quantity += 1
      existing.total_days = Math.max(existing.total_days, workedDays)
      existing.revenue_total += revenue
    } else {
      groups.set(key, { role_name: roleName, quantity: 1, total_days: workedDays, day_rate: dayRate, revenue_total: revenue })
    }
  }

  return Array.from(groups.values())
}

// ---- Primitive helpers ----

function num(v: unknown): number { return Number(v) || 0 }
function str(v: unknown): string { return String(v ?? '') }

/** Strip id, created_at, updated_at (and optional extra keys) from a record for re-insert */
function stripSysCols(row: Record<string, unknown> | unknown, extraKeys: string[] = []): Record<string, unknown> {
  const r = row as Record<string, unknown>
  const exclude = new Set(['id', 'created_at', 'updated_at', ...extraKeys])
  const result: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(r)) {
    if (!exclude.has(k)) result[k] = v
  }
  return result
}

// ---- Map DB row to typed ChangeOrder ----

function mapChangeOrder(row: Record<string, unknown>): ChangeOrder {
  return {
    id: row.id as string,
    estimate_id: row.estimate_id as string,
    labor_log_id: row.labor_log_id as string,
    co_number: row.co_number as number,
    description: row.description as string,
    baseline_version_id: (row.baseline_version_id as string) || null,
    revised_version_id: (row.revised_version_id as string) || null,
    delta_summary: (row.delta_summary as DeltaSummary) || { added: [], removed: [], modified: [], net_delta: 0 },
    baseline_total: row.baseline_total != null ? Number(row.baseline_total) : null,
    revised_total: row.revised_total != null ? Number(row.revised_total) : null,
    delta_amount: row.delta_amount != null ? Number(row.delta_amount) : null,
    status: row.status as ChangeOrder['status'],
    created_by: (row.created_by as string) || null,
    created_at: row.created_at as string,
    approved_by: (row.approved_by as string) || null,
    approved_at: (row.approved_at as string) || null,
  }
}

async function enrichWithProfileNames(rows: Record<string, unknown>[]): Promise<ChangeOrder[]> {
  const cos = rows.map(mapChangeOrder)
  if (cos.length === 0) return cos

  // Collect unique profile IDs
  const profileIds = new Set<string>()
  for (const co of cos) {
    if (co.created_by) profileIds.add(co.created_by)
    if (co.approved_by) profileIds.add(co.approved_by)
  }
  if (profileIds.size === 0) return cos

  // Fetch display names
  const db = requireSupabase()
  const { data: profiles } = await db
    .from('profiles')
    .select('id, full_name')
    .in('id', Array.from(profileIds))
  const nameMap = new Map((profiles || []).map((p: { id: string; full_name: string }) => [p.id, p.full_name]))

  // Enrich
  for (const co of cos) {
    if (co.created_by) co.created_by_name = nameMap.get(co.created_by)
    if (co.approved_by) co.approved_by_name = nameMap.get(co.approved_by)
  }
  return cos
}

// ---- Submit Change Order ----

export async function submitChangeOrder(
  coId: string,
  estimateId: string,
  laborLogId: string,
  userId: string
): Promise<{ changeOrder: ChangeOrder; error?: string }> {
  const db = requireSupabase()

  try {
    // 1. Get the CO to find baseline_version_id
    const { data: co, error: coErr } = await db
      .from('change_orders')
      .select('*')
      .eq('id', coId)
      .single()
    if (coErr) throw coErr

    if (!co.baseline_version_id) {
      throw new Error('Change order has no baseline version')
    }

    // 2. Compute delta
    const { delta, baselineTotal, revisedTotal } = await computeDelta(co.baseline_version_id, laborLogId)

    // 3. Create revised version snapshot
    const coLabel = `CO-${String(co.co_number).padStart(3, '0')}`
    const { versionId: revisedVersionId, error: snapErr } = await createVersionSnapshot(
      estimateId, userId, `${coLabel} submitted: ${co.description}`
    )
    if (snapErr) throw new Error(snapErr)

    // 4. Update CO record
    const { data: updated, error: updateErr } = await db
      .from('change_orders')
      .update({
        delta_summary: delta,
        baseline_total: baselineTotal,
        revised_total: revisedTotal,
        delta_amount: delta.net_delta,
        revised_version_id: revisedVersionId,
        status: 'submitted',
      })
      .eq('id', coId)
      .select()
      .single()
    if (updateErr) throw updateErr

    return { changeOrder: mapChangeOrder(updated) }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to submit change order'
    return { changeOrder: {} as ChangeOrder, error: message }
  }
}

// ---- Approve Change Order ----

export async function approveChangeOrder(
  coId: string,
  approvalId: string,
  userId: string,
  userRole: string,
  notes?: string
): Promise<{ success: boolean; nextGate?: string; error?: string }> {
  const db = requireSupabase()

  try {
    // 1. Process the approval through the normal gate chain
    const result = await reviewApproval(approvalId, 'approved', userId, userRole, notes)
    if (result.error) return result

    // 2. If no next gate (final approval), mark CO as approved
    if (!result.nextGate) {
      const { error } = await db
        .from('change_orders')
        .update({
          status: 'approved',
          approved_by: userId,
          approved_at: new Date().toISOString(),
        })
        .eq('id', coId)
      if (error) throw error
    }

    return result
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to approve change order'
    return { success: false, error: message }
  }
}

// ---- Reject Change Order ----

export async function rejectChangeOrder(
  coId: string,
  approvalId: string,
  estimateId: string,
  laborLogId: string,
  userId: string,
  userRole: string,
  notes: string
): Promise<{ success: boolean; error?: string }> {
  const db = requireSupabase()

  try {
    // 1. Get CO to find baseline version
    const { data: co, error: coErr } = await db
      .from('change_orders')
      .select('baseline_version_id')
      .eq('id', coId)
      .single()
    if (coErr) throw coErr

    // 2. Process the rejection through the normal approval flow
    const result = await reviewApproval(approvalId, 'rejected', userId, userRole, notes)
    if (result.error) return result

    // 3. Rollback segment data to baseline (without destroying labor logs/approvals/COs)
    if (co.baseline_version_id) {
      await rollbackSegmentData(estimateId, laborLogId, co.baseline_version_id, db)
    }

    // 4. Transition segment back to active
    await transitionSegmentStatus(laborLogId, 'active', `CO rejected — reverted to baseline`, userId)

    // 5. Mark CO as rejected
    const { error } = await db
      .from('change_orders')
      .update({ status: 'rejected' })
      .eq('id', coId)
    if (error) throw error

    // 6. Record in version history
    await createVersionSnapshot(estimateId, userId, `CO rejected: ${notes} — segment rolled back to baseline`)

    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to reject change order'
    return { success: false, error: message }
  }
}

/**
 * Targeted rollback: restores labor entries, line items, and schedule data
 * for a single segment from a baseline snapshot, WITHOUT deleting/recreating
 * the labor log itself (which would cascade-delete approvals and change orders).
 */
async function rollbackSegmentData(
  estimateId: string,
  laborLogId: string,
  baselineVersionId: string,
  db: ReturnType<typeof requireSupabase>
) {
  // Fetch baseline snapshot
  const { data: version, error: vErr } = await db
    .from('estimate_versions')
    .select('snapshot_json')
    .eq('id', baselineVersionId)
    .single()
  if (vErr) throw vErr

  const snapshot = version.snapshot_json as EstimateSnapshot

  // Find this segment in the snapshot by matching labor_log_id
  const baselineLog = snapshot.labor_logs.find(
    (ll) => (ll as Record<string, unknown>).id === laborLogId
  )
  if (!baselineLog) throw new Error('Segment not found in baseline snapshot')

  const baselineEntries = (baselineLog.entries || []) as Record<string, unknown>[]
  const baselineLineItems = (snapshot.line_items || []).filter(
    (li) => (li as Record<string, unknown>).labor_log_id === laborLogId
  ) as Record<string, unknown>[]
  const baselineScheduleEntries = (snapshot.schedule_entries || []).filter(
    (se) => (se as Record<string, unknown>).labor_log_id === laborLogId
  ) as Record<string, unknown>[]
  const baselineDayEntries = snapshot.schedule_day_entries || []

  // 1. Delete current data for this segment only
  // Schedule day entries (via schedule entry IDs)
  const { data: currentSE } = await db
    .from('schedule_entries')
    .select('id')
    .eq('labor_log_id', laborLogId)
  const seIds = (currentSE || []).map((e: { id: string }) => e.id)
  if (seIds.length > 0) {
    await db.from('schedule_day_entries').delete().in('schedule_entry_id', seIds)
  }
  await db.from('schedule_day_types').delete().eq('labor_log_id', laborLogId)
  await db.from('schedule_entries').delete().eq('labor_log_id', laborLogId)
  await db.from('labor_entries').delete().eq('labor_log_id', laborLogId)
  await db.from('estimate_line_items').delete().eq('labor_log_id', laborLogId)

  // 2. Restore labor entries
  for (const entry of baselineEntries) {
    await db.from('labor_entries').insert({ ...stripSysCols(entry), labor_log_id: laborLogId })
  }

  // 3. Restore line items
  for (const item of baselineLineItems) {
    await db.from('estimate_line_items').insert({ ...stripSysCols(item), labor_log_id: laborLogId, estimate_id: estimateId })
  }

  // 4. Restore schedule entries + day entries
  for (const se of baselineScheduleEntries) {
    const oldSeId = (se as Record<string, unknown>).id as string
    const { data: newSe, error: seErr } = await db
      .from('schedule_entries')
      .insert({ ...stripSysCols(se, ['ot_hourly_rate', 'ot_cost_rate']), labor_log_id: laborLogId })
      .select()
      .single()
    if (seErr) throw seErr

    // Restore day entries for this schedule entry
    const dayEntries = baselineDayEntries.filter(
      (de) => (de as Record<string, unknown>).schedule_entry_id === oldSeId
    )
    for (const de of dayEntries) {
      await db.from('schedule_day_entries').insert({ ...stripSysCols(de), schedule_entry_id: newSe.id })
    }
  }

  // 5. Restore schedule day types
  const baselineDayTypes = (snapshot.schedule_day_types || []).filter(
    (dt) => (dt as Record<string, unknown>).labor_log_id === laborLogId
  )
  await db.from('schedule_day_types').delete().eq('labor_log_id', laborLogId)
  for (const dt of baselineDayTypes) {
    await db.from('schedule_day_types').insert({ ...stripSysCols(dt), labor_log_id: laborLogId })
  }
}

// ---- Format helper ----

export function formatCONumber(coNumber: number): string {
  return `CO-${String(coNumber).padStart(3, '0')}`
}
