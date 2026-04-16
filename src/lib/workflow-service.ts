import { supabase } from './supabase'
import { computeScheduleRollup } from './schedule-service'
import {
  createNotification,
  notifyByRole,
  getEstimateCreatorId,
} from './notification-service'
import type { ScheduleEntry } from '../types/schedule'
import { hasPermission } from './permissions'
import { getApprovalThreshold } from './system-settings-service'
import { getClientApproverForEstimate } from './rate-card-service'
import type {
  EstimateVersion,
  ApprovalRequest,
  ApprovalGate,
  StatusTransition,
  EstimateSnapshot,
  SegmentStatus,
} from '../types/workflow'

// ---- Approval Role Gating ----

/** Check if a user's role allows them to approve a given approval request based on its gate. */
export function canUserApprove(approval: ApprovalRequest, userRole: string): boolean {
  switch (approval.approval_gate) {
    case 'executive':
      return hasPermission(userRole, 'approve_threshold')
    case 'am':
    case 'client':
    default:
      return hasPermission(userRole, 'approve_standard')
  }
}

function requireSupabase() {
  if (!supabase) {
    throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
  }
  return supabase
}

/** Resolve a profile UUID to full_name. Returns the ID as-is if not a UUID or lookup fails. */
async function resolveDisplayName(userId: string): Promise<string> {
  // If it doesn't look like a UUID, it's already a display name
  if (!userId.match(/^[0-9a-f]{8}-/)) return userId
  const db = requireSupabase()
  const { data } = await db
    .from('profiles')
    .select('full_name')
    .eq('id', userId)
    .maybeSingle()
  return data?.full_name || userId
}

/** Strip system-generated columns before re-inserting a snapshot record. */
function stripSystemCols(obj: Record<string, unknown>, extra: string[] = []): Record<string, unknown> {
  const omit = new Set(['id', 'created_at', 'updated_at', ...extra])
  const result: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(obj)) {
    if (!omit.has(k)) result[k] = v
  }
  return result
}

// ---- Status State Machine ----

const VALID_TRANSITIONS: Record<string, string[]> = {
  pipeline: ['estimate', 'lost', 'cancelled'],
  estimate: ['in_review', 'lost', 'cancelled'],
  in_review: ['active', 'estimate', 'lost', 'cancelled'],
  active: ['recap'],
  recap: ['invoiced'],
  invoiced: ['recap'],
  lost: ['estimate'],
  cancelled: ['estimate'],
}

export function canTransition(from: string, to: string): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false
}

/** Get the list of valid next statuses for a given status. */
export function getNextStatuses(from: string): string[] {
  return VALID_TRANSITIONS[from] || []
}

// ---- Status Transition ----

export async function transitionStatus(
  estimateId: string,
  toStatus: string,
  userId: string,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  const db = requireSupabase()

  // Get current status
  const { data: estimate, error: fetchError } = await db
    .from('estimates')
    .select('status')
    .eq('id', estimateId)
    .single()
  if (fetchError) return { success: false, error: fetchError.message }

  const fromStatus = estimate.status

  // Validate transition
  if (!canTransition(fromStatus, toStatus)) {
    return { success: false, error: `Cannot transition from "${fromStatus}" to "${toStatus}"` }
  }

  // Require reason for send-back (in_review → estimate)
  if (toStatus === 'estimate' && fromStatus === 'in_review' && !reason) {
    return { success: false, error: 'Reason is required when sending back an estimate' }
  }

  // Create version snapshot before transitioning
  const { versionId, error: snapError } = await createVersionSnapshot(
    estimateId,
    userId,
    `Status changed from ${fromStatus} to ${toStatus}${reason ? `: ${reason}` : ''}`
  )
  if (snapError) return { success: false, error: snapError }

  // Update the estimate status
  const { error: updateError } = await db
    .from('estimates')
    .update({ status: toStatus })
    .eq('id', estimateId)
  if (updateError) return { success: false, error: updateError.message }

  // Log the transition
  const { error: logError } = await db
    .from('status_transitions')
    .insert({
      estimate_id: estimateId,
      from_status: fromStatus,
      to_status: toStatus,
      transitioned_by: userId,
      reason: reason || null,
      version_id: versionId || null,
    })
  if (logError) return { success: false, error: logError.message }

  return { success: true }
}

// ---- Version Snapshots ----

async function buildSnapshot(estimateId: string): Promise<EstimateSnapshot> {
  const db = requireSupabase()

  // 1. Estimate record
  const { data: estimate, error: estErr } = await db
    .from('estimates')
    .select('*')
    .eq('id', estimateId)
    .single()
  if (estErr) throw estErr

  // 2. Labor logs
  const { data: laborLogs, error: llErr } = await db
    .from('labor_logs')
    .select('*')
    .eq('estimate_id', estimateId)
    .order('location_order')
  if (llErr) throw llErr

  // 3. Labor entries for each labor log
  const laborLogIds = (laborLogs || []).map((ll: Record<string, unknown>) => ll.id as string)
  let laborEntries: Record<string, unknown>[] = []
  if (laborLogIds.length > 0) {
    const { data, error } = await db
      .from('labor_entries')
      .select('*')
      .in('labor_log_id', laborLogIds)
    if (error) throw error
    laborEntries = data || []
  }

  // 4. Line items
  const { data: lineItems, error: liErr } = await db
    .from('estimate_line_items')
    .select('*')
    .eq('estimate_id', estimateId)
  if (liErr) throw liErr

  // 5. Schedule entries (with day entries nested)
  let scheduleEntries: Record<string, unknown>[] = []
  let scheduleDayEntries: Record<string, unknown>[] = []
  let scheduleDayTypes: Record<string, unknown>[] = []
  if (laborLogIds.length > 0) {
    const { data: se, error: seErr } = await db
      .from('schedule_entries')
      .select('*')
      .in('labor_log_id', laborLogIds)
    if (seErr) throw seErr
    scheduleEntries = se || []

    const scheduleEntryIds = scheduleEntries.map((e) => e.id as string)
    if (scheduleEntryIds.length > 0) {
      const { data: sde, error: sdeErr } = await db
        .from('schedule_day_entries')
        .select('*')
        .in('schedule_entry_id', scheduleEntryIds)
      if (sdeErr) throw sdeErr
      scheduleDayEntries = sde || []
    }

    const { data: sdt, error: sdtErr } = await db
      .from('schedule_day_types')
      .select('*')
      .in('labor_log_id', laborLogIds)
    if (sdtErr) throw sdtErr
    scheduleDayTypes = sdt || []
  }

  // 6. Calculate totals from labor entries (manual) or schedule entries + line items
  let totalRevenue = 0
  let totalCost = 0

  // Build a set of labor log IDs that have schedule data
  const logsWithSchedule = new Set(scheduleEntries.map((se) => se.labor_log_id as string))

  // Nest day entries under their parent schedule entries for rollup
  const dayEntriesByScheduleEntry = new Map<string, Record<string, unknown>[]>()
  for (const de of scheduleDayEntries) {
    const seId = de.schedule_entry_id as string
    const list = dayEntriesByScheduleEntry.get(seId) || []
    list.push(de)
    dayEntriesByScheduleEntry.set(seId, list)
  }

  // Compute schedule rollup for logs that use schedule
  for (const logId of logsWithSchedule) {
    const logScheduleEntries: ScheduleEntry[] = scheduleEntries
      .filter((se) => se.labor_log_id === logId)
      .map((se) => ({
        id: se.id as string,
        labor_log_id: se.labor_log_id as string,
        rate_card_item_id: (se.rate_card_item_id as string) || null,
        role_name: (se.role_name as string) || '',
        person_name: (se.person_name as string) || null,
        row_index: Number(se.row_index) || 0,
        staff_group_id: (se.staff_group_id as string) || null,
        needs_airfare: Boolean(se.needs_airfare),
        needs_hotel: Boolean(se.needs_hotel),
        needs_per_diem: Boolean(se.needs_per_diem),
        day_rate: Number(se.day_rate) || 0,
        cost_rate: Number(se.cost_rate) || 0,
        ot_hourly_rate: Number(se.ot_hourly_rate) || 0,
        ot_cost_rate: Number(se.ot_cost_rate) || 0,
        gl_code: (se.gl_code as string) || null,
        notes: (se.notes as string) || null,
        resource_type: (se.resource_type as 'internal' | 'external' | 'vendor') || 'external',
        created_at: (se.created_at as string) || '',
        updated_at: (se.updated_at as string) || '',
        day_entries: (dayEntriesByScheduleEntry.get(se.id as string) || []).map((de) => ({
          id: de.id as string,
          schedule_entry_id: de.schedule_entry_id as string,
          work_date: de.work_date as string,
          hours: Number(de.hours) || 0,
          per_diem_override: (de.per_diem_override as boolean | null) ?? null,
          created_at: (de.created_at as string) || '',
          updated_at: (de.updated_at as string) || '',
        })),
      }))

    const rollup = computeScheduleRollup(logScheduleEntries)
    for (const row of rollup) {
      totalRevenue += row.revenue_total
      totalCost += row.cost_total
    }
  }

  // Only use manual labor entries for logs WITHOUT schedule data
  for (const entry of laborEntries) {
    const logId = entry.labor_log_id as string
    if (logsWithSchedule.has(logId)) continue
    const qty = (entry.quantity as number) || 0
    const days = (entry.days as number) || 0
    const rate = (entry.unit_rate as number) || 0
    const costRate = (entry.cost_rate as number) || 0
    totalRevenue += qty * days * rate
    totalCost += qty * days * costRate
  }
  for (const item of (lineItems || [])) {
    const qty = (item.quantity as number) || 0
    const unitCost = (item.unit_cost as number) || 0
    const markupPct = (item.markup_pct as number) || 0
    const cost = qty * unitCost
    totalCost += cost
    totalRevenue += cost * (1 + markupPct / 100)
  }

  const grossProfit = totalRevenue - totalCost
  const grossMarginPct = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0

  // 7. Nest entries under labor logs
  const logsWithEntries = (laborLogs || []).map((ll: Record<string, unknown>) => ({
    ...ll,
    entries: laborEntries.filter((e) => e.labor_log_id === ll.id),
  }))

  return {
    estimate,
    labor_logs: logsWithEntries,
    line_items: lineItems || [],
    schedule_entries: scheduleEntries,
    schedule_day_entries: scheduleDayEntries,
    schedule_day_types: scheduleDayTypes,
    totals: {
      total_revenue: Math.round(totalRevenue * 100) / 100,
      total_cost: Math.round(totalCost * 100) / 100,
      gross_profit: Math.round(grossProfit * 100) / 100,
      gross_margin_pct: Math.round(grossMarginPct * 100) / 100,
    },
    snapshot_at: new Date().toISOString(),
  }
}

export async function createVersionSnapshot(
  estimateId: string,
  userId: string,
  changeSummary?: string
): Promise<{ versionId: string; versionNumber: number; error?: string }> {
  const db = requireSupabase()

  try {
    // Get next version number
    const { data: latest, error: countErr } = await db
      .from('estimate_versions')
      .select('version_number')
      .eq('estimate_id', estimateId)
      .order('version_number', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (countErr) throw countErr

    const nextVersion = (latest?.version_number ?? 0) + 1

    // Build snapshot
    const snapshot = await buildSnapshot(estimateId)

    // Insert version
    const { data, error } = await db
      .from('estimate_versions')
      .insert({
        estimate_id: estimateId,
        version_number: nextVersion,
        snapshot_json: snapshot,
        status_at_version: (snapshot.estimate as Record<string, unknown>).status as string,
        change_summary: changeSummary || null,
        changed_by: userId,
      })
      .select()
      .single()
    if (error) throw error

    return { versionId: data.id, versionNumber: nextVersion }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create version snapshot'
    return { versionId: '', versionNumber: 0, error: message }
  }
}

// ---- Version History ----

export async function getVersionHistory(estimateId: string): Promise<EstimateVersion[]> {
  const db = requireSupabase()
  const { data, error } = await db
    .from('estimate_versions')
    .select('*')
    .eq('estimate_id', estimateId)
    .order('version_number', { ascending: false })
  if (error) throw error
  return data
}

export async function getVersion(versionId: string): Promise<EstimateVersion> {
  const db = requireSupabase()
  const { data, error } = await db
    .from('estimate_versions')
    .select('*')
    .eq('id', versionId)
    .single()
  if (error) throw error
  return data
}

// ---- Rollback ----

export async function rollbackToVersion(
  estimateId: string,
  versionId: string,
  userId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  const db = requireSupabase()

  try {
    // Get the target version's snapshot
    const { data: version, error: vErr } = await db
      .from('estimate_versions')
      .select('*')
      .eq('id', versionId)
      .single()
    if (vErr) throw vErr

    const snapshot = version.snapshot_json as EstimateSnapshot

    // Get current labor log IDs to clean up child records
    const { data: currentLogs } = await db
      .from('labor_logs')
      .select('id')
      .eq('estimate_id', estimateId)
    const currentLogIds = (currentLogs || []).map((l: { id: string }) => l.id)

    // Delete existing child data before removing labor logs
    if (currentLogIds.length > 0) {
      // Clean up tables that reference labor_log_id (including approval/activity tables)
      await db.from('approval_requests').delete().in('labor_log_id', currentLogIds)
      await db.from('segment_activities').delete().in('labor_log_id', currentLogIds)
      await db.from('recap_actuals').delete().in('labor_log_id', currentLogIds)

      // Delete schedule day entries via schedule entries
      const { data: currentScheduleEntries } = await db
        .from('schedule_entries')
        .select('id')
        .in('labor_log_id', currentLogIds)
      const seIds = (currentScheduleEntries || []).map((e: { id: string }) => e.id)
      if (seIds.length > 0) {
        await db.from('schedule_day_entries').delete().in('schedule_entry_id', seIds)
      }

      await db.from('schedule_day_types').delete().in('labor_log_id', currentLogIds)
      await db.from('schedule_entries').delete().in('labor_log_id', currentLogIds)
      await db.from('labor_entries').delete().in('labor_log_id', currentLogIds)
      await db.from('estimate_line_items').delete().eq('estimate_id', estimateId)
      await db.from('labor_logs').delete().eq('estimate_id', estimateId)
    }

    // Restore estimate fields
    const est = snapshot.estimate as Record<string, unknown>
    const { error: estErr } = await db
      .from('estimates')
      .update({
        event_name: est.event_name,
        event_type: est.event_type,
        location: est.location,
        start_date: est.start_date,
        end_date: est.end_date,
        duration_days: est.duration_days,
        expected_attendance: est.expected_attendance,
        po_number: est.po_number,
        project_id: est.project_id,
        cost_structure: est.cost_structure,
        internal_notes: est.internal_notes,
        published_notes: est.published_notes,
        status: est.status,
      })
      .eq('id', estimateId)
    if (estErr) throw estErr

    // Restore labor logs
    for (const log of snapshot.labor_logs) {
      const entries = (log as Record<string, unknown>).entries as Record<string, unknown>[]
      const logFields = stripSystemCols(log as Record<string, unknown>, ['entries'])
      const { data: newLog, error: llErr } = await db
        .from('labor_logs')
        .insert({ ...logFields, estimate_id: estimateId })
        .select()
        .single()
      if (llErr) throw llErr

      // Restore labor entries for this log
      if (entries && entries.length > 0) {
        for (const entry of entries) {
          await db.from('labor_entries').insert({ ...stripSystemCols(entry), labor_log_id: newLog.id })
        }
      }

      // Restore line items for this log
      const logLineItems = (snapshot.line_items || []).filter(
        (li) => li.labor_log_id === log.id
      )
      for (const item of logLineItems) {
        await db.from('estimate_line_items').insert({
          ...stripSystemCols(item),
          labor_log_id: newLog.id,
          estimate_id: estimateId,
        })
      }

      // Restore schedule entries for this log
      const logScheduleEntries = (snapshot.schedule_entries || []).filter(
        (se) => se.labor_log_id === log.id
      )
      for (const se of logScheduleEntries) {
        const oldSeId = se.id
        const seFields = stripSystemCols(se, ['ot_hourly_rate', 'ot_cost_rate'])
        const { data: newSe, error: seErr } = await db
          .from('schedule_entries')
          .insert({ ...seFields, labor_log_id: newLog.id })
          .select()
          .single()
        if (seErr) throw seErr

        // Restore day entries for this schedule entry
        const dayEntries = (snapshot.schedule_day_entries || []).filter(
          (de) => de.schedule_entry_id === oldSeId
        )
        if (dayEntries.length > 0) {
          const dayInserts = dayEntries.map((de) => ({
            ...stripSystemCols(de),
            schedule_entry_id: newSe.id,
          }))
          await db.from('schedule_day_entries').insert(dayInserts)
        }
      }

      // Restore day types for this log
      const logDayTypes = (snapshot.schedule_day_types || []).filter(
        (dt) => dt.labor_log_id === log.id
      )
      if (logDayTypes.length > 0) {
        const dtInserts = logDayTypes.map((dt) => ({
          ...stripSystemCols(dt),
          labor_log_id: newLog.id,
        }))
        await db.from('schedule_day_types').insert(dtInserts)
      }
    }

    // Create a new version documenting the rollback
    await createVersionSnapshot(
      estimateId,
      userId,
      `Rolled back to version ${version.version_number}. Reason: ${reason}`
    )

    // Log the transition
    const { error: logError } = await db
      .from('status_transitions')
      .insert({
        estimate_id: estimateId,
        from_status: 'rollback',
        to_status: est.status as string,
        transitioned_by: userId,
        reason,
        version_id: versionId,
      })
    if (logError) throw logError

    // Notify estimate creator of the rollback
    const creatorId = await getEstimateCreatorId(estimateId)
    if (creatorId) {
      createNotification({
        user_id: creatorId,
        type: 'rollback',
        title: 'Estimate rolled back',
        body: `${userId} rolled back to version ${version.version_number}. Reason: ${reason}`,
        estimate_id: estimateId,
        metadata: { version_number: version.version_number, rolled_back_by: userId },
      }).catch((err) => console.error('Rollback notification failed:', err))
    }

    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Rollback failed'
    return { success: false, error: message }
  }
}

// ---- Approval Workflow ----

export async function determineApprovalThreshold(estimateTotal: number): Promise<{ label: string; triggered: boolean }> {
  const threshold = await getApprovalThreshold()
  if (estimateTotal >= threshold) {
    return { label: `$${Math.round(threshold / 1000)}K+ executive review`, triggered: true }
  }
  return { label: 'standard AM review', triggered: false }
}

export async function submitForApproval(
  estimateId: string,
  userId: string,
  laborLogId: string,
  comment?: string
): Promise<{ approvalId: string; threshold: string; error?: string }> {
  const db = requireSupabase()

  // Transition the segment to in_review via segment-status-service
  const { transitionSegmentStatus: transitionSeg } = await import('./segment-status-service')
  const submitterName = await resolveDisplayName(userId)
  const summary = `Submitted for review by ${submitterName}${comment ? ` — ${comment}` : ''}`
  const result = await transitionSeg(laborLogId, 'in_review', summary, submitterName)
  if (!result.success) {
    return { approvalId: '', threshold: '', error: result.error }
  }

  // Get the version that was just created by transitionSegmentStatus
  const { data: latestVersion, error: vErr } = await db
    .from('estimate_versions')
    .select('*')
    .eq('estimate_id', estimateId)
    .order('version_number', { ascending: false })
    .limit(1)
    .single()
  if (vErr) return { approvalId: '', threshold: '', error: vErr.message }

  // Calculate threshold from segment revenue (not full estimate)
  const snapshot = latestVersion.snapshot_json as EstimateSnapshot
  const segmentRevenue = computeSegmentRevenue(snapshot, laborLogId)
  const thresholdResult = await determineApprovalThreshold(segmentRevenue)

  // Resolve the client's designated approver (if any) and stamp it on the
  // approval_request for audit/history. Notification dispatch happens in
  // dispatchSegmentNotifications — this column is intent-of-record only.
  const approver = await getClientApproverForEstimate(estimateId)

  // Create approval request with segment reference — starts at AM gate
  const { data, error } = await db
    .from('approval_requests')
    .insert({
      estimate_id: estimateId,
      version_id: latestVersion.id,
      requested_by: userId,
      threshold_triggered: thresholdResult.label,
      labor_log_id: laborLogId,
      approval_phase: 'internal',
      approval_gate: 'am',
      reviewer: approver?.id ?? null,
      notes: comment || null,
    })
    .select()
    .single()
  if (error) return { approvalId: '', threshold: '', error: error.message }

  return { approvalId: data.id, threshold: thresholdResult.label }
}

/** Compute revenue for a single segment from a snapshot. */
function computeSegmentRevenue(snapshot: EstimateSnapshot, laborLogId: string): number {
  let revenue = 0

  // Schedule-based labor revenue
  const segScheduleEntries = (snapshot.schedule_entries || []).filter(
    (se) => se.labor_log_id === laborLogId
  )
  if (segScheduleEntries.length > 0) {
    // Sum day_rate * hours for each day entry
    for (const se of segScheduleEntries) {
      const dayEntries = (snapshot.schedule_day_entries || []).filter(
        (de) => de.schedule_entry_id === se.id
      )
      const dayRate = Number(se.day_rate) || 0
      for (const de of dayEntries) {
        const hours = Number(de.hours) || 0
        if (hours > 0) revenue += dayRate // day rate per worked day
      }
    }
  } else {
    // Manual labor entries
    const segLog = (snapshot.labor_logs || []).find(
      (ll) => ll.id === laborLogId
    )
    if (segLog) {
      for (const entry of (segLog.entries || [])) {
        const qty = Number(entry.quantity) || 0
        const days = Number(entry.days) || 0
        const rate = Number(entry.unit_rate) || 0
        revenue += qty * days * rate
      }
    }
  }

  // Non-labor line items for this segment
  const segLineItems = (snapshot.line_items || []).filter(
    (li) => li.labor_log_id === laborLogId
  )
  for (const item of segLineItems) {
    const qty = Number(item.quantity) || 0
    const unitCost = Number(item.unit_cost) || 0
    const markupPct = Number(item.markup_pct) || 0
    revenue += qty * unitCost * (1 + markupPct / 100)
  }

  return revenue
}

export async function reviewApproval(
  approvalId: string,
  decision: 'approved' | 'rejected',
  reviewerId: string,
  reviewerRole: string,
  notes?: string
): Promise<{ success: boolean; nextGate?: ApprovalGate; error?: string }> {
  const db = requireSupabase()

  if (decision === 'rejected' && !notes) {
    return { success: false, error: 'Notes are required when sending back a segment' }
  }

  // Get the approval request
  const { data: approval, error: fetchErr } = await db
    .from('approval_requests')
    .select('*')
    .eq('id', approvalId)
    .single()
  if (fetchErr) return { success: false, error: fetchErr.message }

  if (approval.status !== 'pending') {
    return { success: false, error: `This approval has already been ${approval.status}` }
  }

  const gate = (approval.approval_gate || 'am') as ApprovalGate

  // Role gating: check if this user's role is authorized to approve at this gate
  if (!canUserApprove(approval as ApprovalRequest, reviewerRole)) {
    return { success: false, error: `Your role (${reviewerRole}) is not authorized to approve this request` }
  }

  // Mark the current approval as resolved
  const { error: updateErr } = await db
    .from('approval_requests')
    .update({
      status: decision,
      reviewed_by: reviewerId,
      reviewed_at: new Date().toISOString(),
      notes: notes || null,
      approval_role: reviewerRole,
    })
    .eq('id', approvalId)

  if (updateErr) return { success: false, error: updateErr.message }

  const creatorId = await getEstimateCreatorId(approval.estimate_id)
  const targetUserId = creatorId || approval.requested_by

  // ── Rejection at any gate → send back to estimate ──
  if (decision === 'rejected') {
    const reviewerName = await resolveDisplayName(reviewerId)
    let result: { success: boolean; error?: string }
    if (approval.labor_log_id) {
      const { transitionSegmentStatus: transitionSeg } = await import('./segment-status-service')
      const gateLabel = gate === 'client' ? 'Client' : gate === 'executive' ? 'Executive' : 'AM'
      result = await transitionSeg(approval.labor_log_id, 'estimate' as SegmentStatus, `Sent back by ${reviewerName} (${gateLabel} review)${notes ? ` — ${notes}` : ''}`, reviewerName)
    } else {
      result = await transitionStatus(approval.estimate_id, 'estimate', reviewerName, notes)
    }

    if (result.success && targetUserId) {
      const gateLabel = gate === 'client' ? 'Client' : gate === 'executive' ? 'Executive' : 'AM'
      createNotification({
        user_id: targetUserId,
        type: 'approval_decision',
        title: `Segment sent back (${gateLabel} review)`,
        body: `Your segment was sent back by ${reviewerId}. Reason: ${notes}`,
        estimate_id: approval.estimate_id,
        labor_log_id: approval.labor_log_id,
        metadata: { decision, gate, reviewer: reviewerId, approval_role: reviewerRole },
      }).catch((err) => console.error('Notification dispatch failed:', err))
    }

    return result
  }

  // ── Approval — determine next gate ──
  const thresholdTriggered = approval.threshold_triggered?.includes('executive')

  let nextGate: ApprovalGate | null = null
  if (gate === 'am' && thresholdTriggered) {
    nextGate = 'executive'
  } else if (gate === 'am' && !thresholdTriggered) {
    nextGate = 'client'
  } else if (gate === 'executive') {
    nextGate = 'client'
  }
  // gate === 'client' → no next gate, transition to active

  if (nextGate) {
    // Create the next approval request — segment stays in_review
    const { error: nextErr } = await db
      .from('approval_requests')
      .insert({
        estimate_id: approval.estimate_id,
        version_id: approval.version_id,
        requested_by: approval.requested_by,
        threshold_triggered: approval.threshold_triggered,
        labor_log_id: approval.labor_log_id,
        approval_phase: nextGate === 'client' ? 'client' : 'internal',
        approval_gate: nextGate,
      })
    if (nextErr) return { success: false, error: nextErr.message }

    // Gate-specific notifications
    if (nextGate === 'executive') {
      // AM approved + threshold → notify CFO for executive review
      notifyByRole('cfo', {
        type: 'approval_requested',
        title: 'Executive review required',
        body: `AM approved a segment that exceeds the threshold. Executive review needed.`,
        estimate_id: approval.estimate_id,
        labor_log_id: approval.labor_log_id,
        metadata: { gate: 'executive', previous_gate: 'am' },
      }).catch((err) => console.error('Notification dispatch failed:', err))
    } else if (nextGate === 'client') {
      // Internal approval complete → notify creator
      if (targetUserId) {
        createNotification({
          user_id: targetUserId,
          type: 'approval_decision',
          title: 'Internal approval passed',
          body: `Your segment passed internal review. Awaiting client approval.`,
          estimate_id: approval.estimate_id,
          labor_log_id: approval.labor_log_id,
          metadata: { gate: 'client', previous_gate: gate },
        }).catch((err) => console.error('Notification dispatch failed:', err))
      }
    }

    // Record the intermediate approval in version history
    const gateApprovedLabel = gate === 'am' ? 'AM review approved' : 'Executive review approved'
    const nextGateLabel = nextGate === 'executive' ? 'advancing to executive review' : 'advancing to client approval'
    const reviewerName = await resolveDisplayName(reviewerId)
    await createVersionSnapshot(
      approval.estimate_id,
      reviewerName,
      `${gateApprovedLabel} by ${reviewerName}${notes ? ` — ${notes}` : ''} — ${nextGateLabel}`
    )

    return { success: true, nextGate }
  }

  // ── Client gate approved → transition segment to active ──
  let result: { success: boolean; error?: string }
  if (approval.labor_log_id) {
    const { transitionSegmentStatus: transitionSeg } = await import('./segment-status-service')
    const gateLabel = gate === 'client' ? 'Client approved' : gate === 'executive' ? 'Executive approved' : 'AM approved'
    const reviewerName = await resolveDisplayName(reviewerId)
    result = await transitionSeg(approval.labor_log_id, 'active' as SegmentStatus, `${gateLabel} by ${reviewerName}${notes ? ` — ${notes}` : ''}`, reviewerName)
  } else {
    result = await transitionStatus(approval.estimate_id, 'active', reviewerId)
  }

  if (result.success) {
    // Notify creator + production team
    if (targetUserId) {
      createNotification({
        user_id: targetUserId,
        type: 'approval_decision',
        title: 'Segment approved — now active',
        body: `Your segment was approved by the client and is now active.`,
        estimate_id: approval.estimate_id,
        labor_log_id: approval.labor_log_id,
        metadata: { decision, gate: 'client', reviewer: reviewerId },
      }).catch((err) => console.error('Notification dispatch failed:', err))
    }
    notifyByRole('production_manager', {
      type: 'segment_status_changed',
      title: 'Segment now active',
      body: `A segment has been fully approved and is now active.`,
      estimate_id: approval.estimate_id,
      labor_log_id: approval.labor_log_id,
      metadata: { gate: 'client', new_status: 'active' },
    }).catch((err) => console.error('Notification dispatch failed:', err))
  }

  return { success: result.success, error: result.error }
}

export async function getApprovalHistory(estimateId: string): Promise<ApprovalRequest[]> {
  const db = requireSupabase()
  const { data, error } = await db
    .from('approval_requests')
    .select('*')
    .eq('estimate_id', estimateId)
    .order('created_at', { ascending: false })
  if (error) throw error

  // Resolve profile UUIDs to display names
  const profileIds = new Set<string>()
  for (const a of (data || [])) {
    if (a.requested_by) profileIds.add(a.requested_by)
    if (a.reviewed_by) profileIds.add(a.reviewed_by)
  }
  if (profileIds.size > 0) {
    const { data: profiles } = await db
      .from('profiles')
      .select('id, full_name')
      .in('id', Array.from(profileIds))
    const nameMap = new Map((profiles || []).map((p: { id: string; full_name: string }) => [p.id, p.full_name]))
    for (const a of (data || [])) {
      if (a.requested_by && nameMap.has(a.requested_by)) a.requested_by = nameMap.get(a.requested_by)!
      if (a.reviewed_by && nameMap.has(a.reviewed_by)) a.reviewed_by = nameMap.get(a.reviewed_by)!
    }
  }

  return data || []
}

/** Get the pending approval for a specific segment. */
export async function getPendingSegmentApproval(laborLogId: string): Promise<ApprovalRequest | null> {
  const db = requireSupabase()
  const { data, error } = await db
    .from('approval_requests')
    .select('*')
    .eq('labor_log_id', laborLogId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  if (!data) return null

  // Resolve UUIDs to display names
  if (data.requested_by) {
    data.requested_by = await resolveDisplayName(data.requested_by)
  }
  if (data.reviewed_by) {
    data.reviewed_by = await resolveDisplayName(data.reviewed_by)
  }
  return data
}

/** Backward-compat: get the first pending approval across all segments for an estimate. */
export async function getPendingApproval(estimateId: string): Promise<ApprovalRequest | null> {
  const db = requireSupabase()
  const { data, error } = await db
    .from('approval_requests')
    .select('*')
    .eq('estimate_id', estimateId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data
}

/** Get all approval requests for a specific segment. */
export async function getSegmentApprovalHistory(laborLogId: string): Promise<ApprovalRequest[]> {
  const db = requireSupabase()
  const { data, error } = await db
    .from('approval_requests')
    .select('*')
    .eq('labor_log_id', laborLogId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

// ---- Status Transition History ----

export async function getStatusTransitions(estimateId: string): Promise<StatusTransition[]> {
  const db = requireSupabase()
  const { data, error } = await db
    .from('status_transitions')
    .select('*')
    .eq('estimate_id', estimateId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

// ---- Segment Status ----

const VALID_SEGMENT_TRANSITIONS: Record<string, string[]> = {
  pipeline: ['estimate', 'lost', 'cancelled'],
  estimate: ['in_review', 'lost', 'cancelled'],
  in_review: ['active', 'estimate', 'lost', 'cancelled'],
  active: ['recap'],
  recap: ['invoiced'],
  invoiced: ['recap'],
  lost: ['estimate'],
  cancelled: ['estimate'],
}

export function canTransitionSegment(from: string, to: string): boolean {
  return VALID_SEGMENT_TRANSITIONS[from]?.includes(to) ?? false
}

export async function updateSegmentStatus(
  laborLogId: string,
  toStatus: SegmentStatus
): Promise<{ success: boolean; error?: string }> {
  const db = requireSupabase()

  // Get current segment status
  const { data: log, error: fetchErr } = await db
    .from('labor_logs')
    .select('status, estimate_id')
    .eq('id', laborLogId)
    .single()
  if (fetchErr) return { success: false, error: fetchErr.message }

  const fromStatus = log.status || 'estimate'
  if (!canTransitionSegment(fromStatus, toStatus)) {
    return { success: false, error: `Cannot transition segment from "${fromStatus}" to "${toStatus}"` }
  }

  const { error: updateErr } = await db
    .from('labor_logs')
    .update({ status: toStatus })
    .eq('id', laborLogId)
  if (updateErr) return { success: false, error: updateErr.message }

  return { success: true }
}
