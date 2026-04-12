import { supabase } from './supabase'
import { createVersionSnapshot } from './workflow-service'
import { prefillScheduleActuals, computeScheduleRollup } from './schedule-service'
import type { ScheduleEntry } from '../types/schedule'
import {
  createNotification,
  notifyByRole,
  getEstimateCreatorId,
} from './notification-service'
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
  pipeline: ['estimate', 'lost', 'cancelled'],
  estimate: ['in_review', 'active', 'lost', 'cancelled'],
  in_review: ['active', 'estimate', 'lost', 'cancelled'],
  active: ['estimate', 'recap'],
  recap: ['invoiced'],
  invoiced: ['recap'],
  lost: ['estimate'],
  cancelled: ['estimate'],
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
  return (data.status || 'estimate') as SegmentStatus
}

export async function transitionSegmentStatus(
  laborLogId: string,
  toStatus: SegmentStatus,
  comment?: string,
  userName?: string
): Promise<{ success: boolean; error?: string }> {
  const db = requireSupabase()

  // Get current segment
  const { data: log, error: fetchErr } = await db
    .from('labor_logs')
    .select('status, estimate_id, location_name')
    .eq('id', laborLogId)
    .single()
  if (fetchErr) return { success: false, error: fetchErr.message }

  const fromStatus = (log.status || 'estimate') as string

  // Validate transition
  if (!canTransitionSegment(fromStatus, toStatus)) {
    return { success: false, error: `Cannot transition segment from "${fromStatus}" to "${toStatus}"` }
  }

  // Require reason for send-back transitions and lost/cancelled
  if (toStatus === 'estimate' && fromStatus === 'in_review' && !comment) {
    return { success: false, error: 'A reason is required when sending back a segment' }
  }
  if (toStatus === 'estimate' && fromStatus === 'active' && !comment) {
    return { success: false, error: 'A reason is required when reopening an active segment for editing' }
  }
  if ((toStatus === 'lost' || toStatus === 'cancelled') && !comment) {
    return { success: false, error: 'A reason is required when marking a segment as lost or cancelled' }
  }

  // Block recap → invoiced if staff names are missing
  if (fromStatus === 'recap' && toStatus === 'invoiced') {
    const { data: schedEntries, error: seErr } = await db
      .from('schedule_entries')
      .select('id, person_name')
      .eq('labor_log_id', laborLogId)
    if (seErr) return { success: false, error: seErr.message }
    const unnamed = (schedEntries || []).filter((e: { person_name: string | null }) => !e.person_name?.trim())
    if (unnamed.length > 0) {
      return {
        success: false,
        error: `Cannot mark as invoiced — ${unnamed.length} staff member${unnamed.length === 1 ? '' : 's'} still need${unnamed.length === 1 ? 's' : ''} names assigned.`,
      }
    }
  }

  // Update the segment status
  const { error: updateErr } = await db
    .from('labor_logs')
    .update({ status: toStatus })
    .eq('id', laborLogId)
  if (updateErr) return { success: false, error: updateErr.message }

  // Pre-fill schedule actuals when entering recap. Idempotent — only touches
  // schedule_day_entries where actual_hours IS NULL. Non-fatal on failure since
  // the status transition has already committed.
  if (toStatus === 'recap') {
    try {
      await prefillScheduleActuals(laborLogId)
    } catch (err) {
      console.error('Failed to pre-fill schedule actuals:', err)
    }
  }

  // Log the activity
  const { error: actErr } = await db
    .from('segment_activities')
    .insert({
      labor_log_id: laborLogId,
      estimate_id: log.estimate_id,
      action: 'status_change',
      from_status: fromStatus,
      to_status: toStatus,
      changed_by: userName || 'Unknown User',
      comment: comment || null,
    })
  if (actErr) console.error('Failed to log segment activity:', actErr)

  // Sync estimate-level status
  await computeEstimateStatus(log.estimate_id)

  // Create version snapshot for History panel
  await createVersionSnapshot(
    log.estimate_id,
    userName || 'Unknown User',
    `Segment "${log.location_name}" moved from ${fromStatus} to ${toStatus}${comment ? ` — ${comment}` : ''}`
  )

  // Dispatch notifications (fire-and-forget)
  dispatchSegmentNotifications(
    log.estimate_id,
    laborLogId,
    log.location_name,
    fromStatus,
    toStatus,
    userName || 'Unknown User',
    comment
  ).catch((err) => console.error('Notification dispatch failed:', err))

  return { success: true }
}

async function dispatchSegmentNotifications(
  estimateId: string,
  laborLogId: string,
  segmentName: string,
  fromStatus: string,
  toStatus: string,
  changedBy: string,
  comment?: string
): Promise<void> {
  const base = {
    type: 'segment_status_changed' as const,
    estimate_id: estimateId,
    labor_log_id: laborLogId,
    metadata: { from_status: fromStatus, to_status: toStatus, changed_by: changedBy },
  }

  if (toStatus === 'in_review') {
    // Notify CFO for $50K+ or account_manager lead for standard
    await notifyByRole('cfo', {
      ...base,
      type: 'approval_requested',
      title: `Review requested: ${segmentName}`,
      body: `${changedBy} submitted "${segmentName}" for review.`,
    })
  } else if (toStatus === 'estimate' && fromStatus === 'in_review') {
    // Segment sent back — notify creator
    const creatorId = await getEstimateCreatorId(estimateId)
    if (creatorId) {
      await createNotification({
        ...base,
        user_id: creatorId,
        title: `Segment sent back: ${segmentName}`,
        body: `"${segmentName}" was sent back by ${changedBy}.${comment ? ` Reason: ${comment}` : ''}`,
      })
    }
  } else if (toStatus === 'active') {
    // Notify estimate creator and production team
    const creatorId = await getEstimateCreatorId(estimateId)
    if (creatorId) {
      await createNotification({
        ...base,
        user_id: creatorId,
        title: `Segment approved & activated: ${segmentName}`,
        body: `"${segmentName}" has been approved and activated by ${changedBy}.`,
      })
    }
    await notifyByRole('production_manager', {
      ...base,
      title: `Segment active: ${segmentName}`,
      body: `"${segmentName}" is now active. ${changedBy} marked it ready for execution.`,
    })
  } else if (toStatus === 'lost' || toStatus === 'cancelled') {
    // Notify estimate creator
    const creatorId = await getEstimateCreatorId(estimateId)
    if (creatorId) {
      await createNotification({
        ...base,
        user_id: creatorId,
        title: `Segment ${toStatus}: ${segmentName}`,
        body: `"${segmentName}" was marked ${toStatus} by ${changedBy}.${comment ? ` Reason: ${comment}` : ''}`,
      })
    }
  }
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
  comment?: string,
  userName?: string
): Promise<void> {
  const db = requireSupabase()
  await db.from('segment_activities').insert({
    labor_log_id: laborLogId,
    estimate_id: estimateId,
    action,
    changed_by: userName || 'Unknown User',
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

  const statuses = (segments || []).map((s: { status: string | null }) => s.status || 'estimate')

  // Single-segment: estimate status matches segment status directly
  if (statuses.length <= 1) {
    const segStatus = statuses[0] || 'estimate'
    await db.from('estimates').update({ status: segStatus }).eq('id', estimateId)
    return segStatus
  }

  // Multi-segment computation rules:
  let computedStatus: string

  if (statuses.every((s: string) => s === 'invoiced')) {
    computedStatus = 'invoiced'
  } else if (statuses.every((s: string) => s === 'lost' || s === 'cancelled')) {
    computedStatus = 'lost'
  } else if (statuses.some((s: string) => s === 'active' || s === 'recap' || s === 'invoiced')) {
    computedStatus = 'active'
  } else if (statuses.some((s: string) => s === 'in_review')) {
    computedStatus = 'in_review'
  } else if (statuses.some((s: string) => s === 'estimate')) {
    computedStatus = 'estimate'
  } else {
    computedStatus = 'pipeline'
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
  pipeline:   { schedule_hours: false, schedule_names: false, schedule_add_remove: false, schedule_dates: false, labor_log: false, line_items: false, event_details: true,  notes: true,  actuals: false, names_required: false },
  estimate:   { schedule_hours: true,  schedule_names: true,  schedule_add_remove: true,  schedule_dates: true,  labor_log: true,  line_items: true,  event_details: true,  notes: true,  actuals: false, names_required: false },
  in_review:  { schedule_hours: false, schedule_names: false, schedule_add_remove: false, schedule_dates: false, labor_log: false, line_items: false, event_details: false, notes: false, actuals: false, names_required: false },
  active:     { schedule_hours: false, schedule_names: true,  schedule_add_remove: false, schedule_dates: false, labor_log: false, line_items: false, event_details: false, notes: true,  actuals: false, names_required: false },
  recap:      { schedule_hours: false, schedule_names: true,  schedule_add_remove: false, schedule_dates: false, labor_log: false, line_items: false, event_details: false, notes: true,  actuals: true,  names_required: true },
  invoiced:   { schedule_hours: false, schedule_names: false, schedule_add_remove: false, schedule_dates: false, labor_log: false, line_items: false, event_details: false, notes: false, actuals: false, names_required: false },
  lost:       { schedule_hours: false, schedule_names: false, schedule_add_remove: false, schedule_dates: false, labor_log: false, line_items: false, event_details: false, notes: false, actuals: false, names_required: false },
  cancelled:  { schedule_hours: false, schedule_names: false, schedule_add_remove: false, schedule_dates: false, labor_log: false, line_items: false, event_details: false, notes: false, actuals: false, names_required: false },
}

export function getSegmentEditRules(segmentStatus: string): SegmentEditRules {
  return SEGMENT_EDIT_RULES[segmentStatus] || SEGMENT_EDIT_RULES.estimate
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

  // Get schedule entries for this segment (schedule-driven segments have no labor_entries)
  const { data: scheduleEntries, error: seErr } = await db
    .from('schedule_entries')
    .select('*, day_entries:schedule_day_entries(*)')
    .eq('labor_log_id', laborLogId)
  if (seErr) throw seErr

  // Get line items for this segment
  const { data: lineItems, error: liErr } = await db
    .from('estimate_line_items')
    .select('*')
    .eq('labor_log_id', laborLogId)
  if (liErr) throw liErr

  const rows: VarianceRow[] = []

  const isScheduleDriven = (scheduleEntries || []).length > 0

  if (isScheduleDriven) {
    // Derive both planned and actual totals from the rollup. Actual revenue
    // is computed from schedule_day_entries.actual_hours, so labor actuals
    // don't require separate entry in recap_actuals.
    const rollup = computeScheduleRollup((scheduleEntries || []) as unknown as ScheduleEntry[])
    for (const row of rollup) {
      const estimatedTotal = row.revenue_total
      const actualTotal = row.actual_revenue_total
      const variance = estimatedTotal - actualTotal
      rows.push({
        item_name: row.role_name || 'Unnamed Role',
        section: 'labor',
        estimated_total: estimatedTotal,
        actual_total: actualTotal,
        variance,
        variance_pct: estimatedTotal > 0 ? (variance / estimatedTotal) * 100 : 0,
      })
    }
  } else {
    // Build variance rows from manual labor entries
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
