import { supabase } from './supabase'
import { createVersionSnapshot } from './workflow-service'
import type {
  SegmentStatus,
  SegmentActivity,
  SegmentEditRules,
  RecapActual,
  VarianceRow,
} from '../types/workflow'

function requireSupabase() {
  if (!supabase) {
    throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
  }
  return supabase
}

// ---- Segment Status Transitions ----

const VALID_SEGMENT_TRANSITIONS: Record<string, string[]> = {
  draft: ['review'],
  review: ['approved', 'draft'],
  approved: ['active', 'draft'],
  active: ['recap'],
  recap: ['invoiced', 'active'],
  invoiced: ['complete'],
}

export function canTransitionSegment(from: string, to: string): boolean {
  return VALID_SEGMENT_TRANSITIONS[from]?.includes(to) ?? false
}

export function getNextSegmentStatuses(from: string): string[] {
  return VALID_SEGMENT_TRANSITIONS[from] || []
}

export async function getSegmentStatus(laborLogId: string): Promise<SegmentStatus> {
  const db = requireSupabase()
  const { data, error } = await db
    .from('labor_logs')
    .select('status')
    .eq('id', laborLogId)
    .single()
  if (error) throw error
  return (data.status || 'draft') as SegmentStatus
}

export async function transitionSegmentStatus(
  laborLogId: string,
  toStatus: SegmentStatus,
  comment?: string
): Promise<{ success: boolean; error?: string }> {
  const db = requireSupabase()

  // Get current segment
  const { data: log, error: fetchErr } = await db
    .from('labor_logs')
    .select('status, estimate_id, location_name')
    .eq('id', laborLogId)
    .single()
  if (fetchErr) return { success: false, error: fetchErr.message }

  const fromStatus = (log.status || 'draft') as string

  // Validate transition
  if (!canTransitionSegment(fromStatus, toStatus)) {
    return { success: false, error: `Cannot transition segment from "${fromStatus}" to "${toStatus}"` }
  }

  // Require reason for send-back transitions
  if (toStatus === 'draft' && (fromStatus === 'review' || fromStatus === 'approved') && !comment) {
    return { success: false, error: 'A reason is required when sending back a segment' }
  }

  // Update the segment status
  const { error: updateErr } = await db
    .from('labor_logs')
    .update({ status: toStatus })
    .eq('id', laborLogId)
  if (updateErr) return { success: false, error: updateErr.message }

  // Log the activity
  const { error: actErr } = await db
    .from('segment_activities')
    .insert({
      labor_log_id: laborLogId,
      estimate_id: log.estimate_id,
      action: 'status_change',
      from_status: fromStatus,
      to_status: toStatus,
      changed_by: 'Current User',
      comment: comment || null,
    })
  if (actErr) console.error('Failed to log segment activity:', actErr)

  // Sync estimate-level status
  await computeEstimateStatus(log.estimate_id)

  // Create version snapshot for History panel
  await createVersionSnapshot(
    log.estimate_id,
    'Current User',
    `Segment "${log.location_name}" moved from ${fromStatus} to ${toStatus}`
  )

  return { success: true }
}

// ---- Segment Activity Log ----

export async function getSegmentActivities(laborLogId: string): Promise<SegmentActivity[]> {
  const db = requireSupabase()
  const { data, error } = await db
    .from('segment_activities')
    .select('*')
    .eq('labor_log_id', laborLogId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function logSegmentActivity(
  laborLogId: string,
  estimateId: string,
  action: string,
  metadata?: Record<string, unknown>,
  comment?: string
): Promise<void> {
  const db = requireSupabase()
  await db.from('segment_activities').insert({
    labor_log_id: laborLogId,
    estimate_id: estimateId,
    action,
    changed_by: 'Current User',
    comment: comment || null,
    metadata: metadata || null,
  })
}

// ---- Estimate-Level Status Computation ----

export async function computeEstimateStatus(estimateId: string): Promise<string> {
  const db = requireSupabase()

  // Get all segments for this estimate
  const { data: segments, error } = await db
    .from('labor_logs')
    .select('status')
    .eq('estimate_id', estimateId)
  if (error) throw error

  const statuses = (segments || []).map((s: { status: string | null }) => s.status || 'draft')

  // Single-segment: estimate status matches segment status directly
  if (statuses.length <= 1) {
    const segStatus = statuses[0] || 'draft'
    // Map segment statuses to estimate statuses
    const mapped = segStatus === 'invoiced' ? 'complete' : segStatus
    await db.from('estimates').update({ status: mapped }).eq('id', estimateId)
    return mapped
  }

  // Multi-segment computation rules (from kickoff doc):
  let computedStatus: string

  if (statuses.every((s: string) => s === 'complete' || s === 'invoiced')) {
    computedStatus = 'complete'
  } else if (statuses.some((s: string) => s === 'active' || s === 'recap' || s === 'invoiced')) {
    computedStatus = 'active'
  } else if (statuses.every((s: string) => s === 'approved')) {
    computedStatus = 'approved'
  } else if (statuses.some((s: string) => s === 'review')) {
    computedStatus = 'review'
  } else {
    computedStatus = 'draft'
  }

  // Update estimate status if changed
  const { data: est } = await db
    .from('estimates')
    .select('status')
    .eq('id', estimateId)
    .single()

  if (est && est.status !== computedStatus) {
    await db.from('estimates').update({ status: computedStatus }).eq('id', estimateId)
  }

  return computedStatus
}

// ---- Edit Permission Rules ----

const SEGMENT_EDIT_RULES: Record<string, SegmentEditRules> = {
  draft:    { schedule_hours: true,  schedule_names: true,  schedule_add_remove: true,  schedule_dates: true,  labor_log: true,  line_items: true,  event_details: true,  notes: true,  actuals: false, names_required: false },
  review:   { schedule_hours: false, schedule_names: false, schedule_add_remove: false, schedule_dates: false, labor_log: false, line_items: false, event_details: false, notes: false, actuals: false, names_required: false },
  approved: { schedule_hours: false, schedule_names: false, schedule_add_remove: false, schedule_dates: false, labor_log: false, line_items: false, event_details: false, notes: true,  actuals: false, names_required: false },
  active:   { schedule_hours: false, schedule_names: true,  schedule_add_remove: false, schedule_dates: false, labor_log: false, line_items: false, event_details: false, notes: true,  actuals: false, names_required: false },
  recap:    { schedule_hours: false, schedule_names: true,  schedule_add_remove: false, schedule_dates: false, labor_log: false, line_items: false, event_details: false, notes: true,  actuals: true,  names_required: true },
  invoiced: { schedule_hours: false, schedule_names: false, schedule_add_remove: false, schedule_dates: false, labor_log: false, line_items: false, event_details: false, notes: false, actuals: false, names_required: false },
  complete: { schedule_hours: false, schedule_names: false, schedule_add_remove: false, schedule_dates: false, labor_log: false, line_items: false, event_details: false, notes: false, actuals: false, names_required: false },
}

export function getSegmentEditRules(segmentStatus: string): SegmentEditRules {
  return SEGMENT_EDIT_RULES[segmentStatus] || SEGMENT_EDIT_RULES.draft
}

// ---- Recap Actuals ----

export async function getRecapActuals(laborLogId: string): Promise<RecapActual[]> {
  const db = requireSupabase()
  const { data, error } = await db
    .from('recap_actuals')
    .select('*')
    .eq('labor_log_id', laborLogId)
  if (error) throw error
  return data
}

export async function upsertRecapActual(actual: Partial<RecapActual> & { estimate_id: string; labor_log_id: string }): Promise<RecapActual> {
  const db = requireSupabase()

  if (actual.id) {
    // Update existing — strip read-only fields
    const updates = { ...actual }
    const updateId = updates.id!
    delete updates.id
    delete updates.created_at
    delete updates.updated_at
    const { data, error } = await db
      .from('recap_actuals')
      .update(updates)
      .eq('id', updateId)
      .select()
      .single()
    if (error) throw error
    return data
  }

  // Insert new
  const { data, error } = await db
    .from('recap_actuals')
    .insert(actual)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getVarianceReport(laborLogId: string): Promise<VarianceRow[]> {
  const db = requireSupabase()

  // Get actuals for this segment
  const { data: actuals, error: actErr } = await db
    .from('recap_actuals')
    .select('*')
    .eq('labor_log_id', laborLogId)
  if (actErr) throw actErr

  // Get labor entries for this segment
  const { data: laborEntries, error: leErr } = await db
    .from('labor_entries')
    .select('*')
    .eq('labor_log_id', laborLogId)
  if (leErr) throw leErr

  // Get line items for this segment
  const { data: lineItems, error: liErr } = await db
    .from('estimate_line_items')
    .select('*')
    .eq('labor_log_id', laborLogId)
  if (liErr) throw liErr

  const rows: VarianceRow[] = []

  // Build variance rows from labor entries
  for (const entry of (laborEntries || [])) {
    const qty = (entry.quantity as number) || 0
    const days = (entry.days as number) || 0
    const rate = (entry.unit_rate as number) || 0
    const estimatedTotal = qty * days * rate

    const actual = (actuals || []).find(
      (a: RecapActual) => a.labor_entry_id === entry.id
    )
    const actualTotal = actual?.actual_total ?? 0

    const variance = estimatedTotal - actualTotal
    rows.push({
      item_name: entry.role_name || 'Unnamed Role',
      section: 'labor',
      estimated_total: estimatedTotal,
      actual_total: actualTotal,
      variance,
      variance_pct: estimatedTotal > 0 ? (variance / estimatedTotal) * 100 : 0,
    })
  }

  // Build variance rows from line items
  for (const item of (lineItems || [])) {
    const qty = (item.quantity as number) || 0
    const unitCost = (item.unit_cost as number) || 0
    const estimatedTotal = qty * unitCost

    const actual = (actuals || []).find(
      (a: RecapActual) => a.line_item_id === item.id
    )
    const actualTotal = actual?.actual_total ?? 0

    const variance = estimatedTotal - actualTotal
    rows.push({
      item_name: item.item_name || 'Unnamed Item',
      section: item.section || 'misc',
      estimated_total: estimatedTotal,
      actual_total: actualTotal,
      variance,
      variance_pct: estimatedTotal > 0 ? (variance / estimatedTotal) * 100 : 0,
    })
  }

  return rows
}
