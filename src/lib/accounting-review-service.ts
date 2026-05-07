import { supabase } from './supabase'
import { createVersionSnapshot } from './workflow-service'
import { transitionSegmentStatus, logSegmentActivity } from './segment-status-service'
import { createNotification, notifyByRole, getEstimateCreatorId, getSegmentAssigneeId } from './notification-service'
import { hasPermission, type Permission } from './permissions'
import type { AccountingReview, SegmentStatus } from '../types/workflow'

function requireSupabase() {
  if (!supabase) {
    throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
  }
  return supabase
}

function uuidOrNull(value: string): string | null {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
    ? value
    : null
}

async function getUserRole(userId: string): Promise<string | null> {
  const profileId = uuidOrNull(userId)
  if (!profileId) return null

  const db = requireSupabase()
  const { data, error } = await db
    .from('profiles')
    .select('role')
    .eq('id', profileId)
    .maybeSingle()
  if (error) throw error
  return data?.role || null
}

async function requirePermission(userId: string, permission: Permission): Promise<{ ok: boolean; error?: string }> {
  const role = await getUserRole(userId)
  if (!role || !hasPermission(role, permission)) {
    return { ok: false, error: 'You do not have permission to perform this accounting review action.' }
  }
  return { ok: true }
}

async function getLatestVersionId(estimateId: string): Promise<string | null> {
  const db = requireSupabase()
  const { data } = await db
    .from('estimate_versions')
    .select('id')
    .eq('estimate_id', estimateId)
    .order('version_number', { ascending: false })
    .limit(1)
    .maybeSingle()
  return data?.id || null
}

async function getLaborLogContext(laborLogId: string): Promise<{
  id: string
  estimate_id: string
  status: SegmentStatus
  location_name: string
  cost_structure: 'corporate' | 'office'
}> {
  const db = requireSupabase()
  const { data: log, error: logErr } = await db
    .from('labor_logs')
    .select('id, estimate_id, status, location_name')
    .eq('id', laborLogId)
    .single()
  if (logErr) throw logErr

  const { data: estimate, error: estErr } = await db
    .from('estimates')
    .select('cost_structure')
    .eq('id', log.estimate_id)
    .single()
  if (estErr) throw estErr

  return {
    id: log.id,
    estimate_id: log.estimate_id,
    status: (log.status || 'estimate') as SegmentStatus,
    location_name: log.location_name || 'Segment',
    cost_structure: (estimate.cost_structure || 'corporate') as 'corporate' | 'office',
  }
}

async function getRecapRevision(laborLogId: string): Promise<string> {
  const db = requireSupabase()
  const [actuals, scheduleEntries, lineItems] = await Promise.all([
    db
      .from('recap_actuals')
      .select('id, updated_at')
      .eq('labor_log_id', laborLogId),
    db
      .from('schedule_entries')
      .select('id, updated_at, day_entries:schedule_day_entries(id, updated_at, actual_hours)')
      .eq('labor_log_id', laborLogId),
    db
      .from('estimate_line_items')
      .select('id')
      .eq('labor_log_id', laborLogId),
  ])

  let receipts: { data: Array<{ id: string; uploaded_at: string | null }> | null } = { data: [] }
  const lineItemIds = (lineItems.data || []).map((item: { id: string }) => item.id)
  if (lineItemIds.length > 0) {
    const { data } = await db
      .from('receipt_attachments')
      .select('id, uploaded_at')
      .in('line_item_id', lineItemIds)
    receipts = { data }
  }

  const stamps: string[] = []
  for (const row of actuals.data || []) stamps.push(row.updated_at || row.id)
  for (const row of scheduleEntries.data || []) {
    stamps.push(row.updated_at || row.id)
    for (const day of row.day_entries || []) {
      stamps.push(`${day.updated_at || day.id}:${day.actual_hours ?? ''}`)
    }
  }
  for (const row of receipts.data || []) stamps.push(row.uploaded_at || row.id)
  stamps.sort()
  return `${stamps.length}:${stamps.at(-1) || 'empty'}`
}

async function notifyInternalReviewers(estimateId: string, laborLogId: string, segmentName: string): Promise<void> {
  const notification = {
    type: 'approval_requested' as const,
    title: 'Recap submitted for accounting review',
    body: `"${segmentName}" is ready for accounting review.`,
    estimate_id: estimateId,
    labor_log_id: laborLogId,
    metadata: { gate: 'accounting_review' },
  }
  await notifyByRole('accounting', notification)
  await notifyByRole('admin', notification)
}

async function notifySubmitterAndAssignee(
  review: AccountingReview,
  title: string,
  body: string,
  metadata: Record<string, unknown>
): Promise<void> {
  const recipients = new Set<string>()
  if (review.submitted_by) recipients.add(review.submitted_by)
  const assignee = await getSegmentAssigneeId(review.labor_log_id)
  if (assignee) recipients.add(assignee)
  const creator = await getEstimateCreatorId(review.estimate_id)
  if (creator) recipients.add(creator)

  await Promise.all(Array.from(recipients).map((userId) =>
    createNotification({
      user_id: userId,
      type: 'approval_decision',
      title,
      body,
      estimate_id: review.estimate_id,
      labor_log_id: review.labor_log_id,
      metadata,
    })
  ))
}

export async function getAccountingReview(laborLogId: string): Promise<AccountingReview | null> {
  const db = requireSupabase()
  const { data, error } = await db
    .from('accounting_reviews')
    .select('*')
    .eq('labor_log_id', laborLogId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function validateRecapCompleteness(laborLogId: string): Promise<{ valid: boolean; error?: string }> {
  const db = requireSupabase()
  const { data: schedEntries, error } = await db
    .from('schedule_entries')
    .select('id, person_name')
    .eq('labor_log_id', laborLogId)
  if (error) return { valid: false, error: error.message }

  const unnamed = (schedEntries || []).filter((e: { person_name: string | null }) => !e.person_name?.trim())
  if (unnamed.length > 0) {
    return {
      valid: false,
      error: `${unnamed.length} staff member${unnamed.length === 1 ? '' : 's'} still need${unnamed.length === 1 ? 's' : ''} names assigned.`,
    }
  }

  // TODO: enforce receipt completeness for pass-through actuals once the exact accounting rule is confirmed.
  return { valid: true }
}

export async function submitRecapForAccounting(
  laborLogId: string,
  userId: string,
  notes?: string
): Promise<{ success: boolean; reviewId?: string; error?: string }> {
  const db = requireSupabase()

  try {
    const permission = await requirePermission(userId, 'submit_recap_for_accounting')
    if (!permission.ok) return { success: false, error: permission.error }

    const ctx = await getLaborLogContext(laborLogId)
    if (ctx.cost_structure !== 'office') {
      return { success: false, error: 'Accounting review is only required for Office Events.' }
    }
    if (ctx.status !== 'recap') {
      return { success: false, error: `Cannot submit recap from "${ctx.status}" status.` }
    }

    const validation = await validateRecapCompleteness(laborLogId)
    if (!validation.valid) return { success: false, error: validation.error }

    await db
      .from('accounting_reviews')
      .update({ status: 'superseded' })
      .eq('labor_log_id', laborLogId)
      .eq('status', 'pending')

    const { versionId } = await createVersionSnapshot(
      ctx.estimate_id,
      userId,
      `Recap submitted for accounting review${notes ? ` - ${notes}` : ''}`
    )

    const { data: review, error: insertErr } = await db
      .from('accounting_reviews')
      .insert({
        estimate_id: ctx.estimate_id,
        labor_log_id: laborLogId,
        status: 'pending',
        submitted_by: uuidOrNull(userId),
        submitted_version_id: versionId || null,
        recap_revision: await getRecapRevision(laborLogId),
        review_notes: notes || null,
      })
      .select()
      .single()
    if (insertErr) throw insertErr

    const transition = await transitionSegmentStatus(
      laborLogId,
      'accounting_review',
      `Submitted recap for accounting review${notes ? ` - ${notes}` : ''}`,
      userId
    )
    if (!transition.success) {
      await db.from('accounting_reviews').update({ status: 'superseded' }).eq('id', review.id)
      return { success: false, error: transition.error }
    }

    await logSegmentActivity(
      laborLogId,
      ctx.estimate_id,
      'accounting_review_submitted',
      { accounting_review_id: review.id },
      notes,
      userId
    )
    await notifyInternalReviewers(ctx.estimate_id, laborLogId, ctx.location_name)

    return { success: true, reviewId: review.id }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to submit recap for accounting review' }
  }
}

export async function approveRecap(
  reviewId: string,
  reviewerId: string,
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  const db = requireSupabase()

  try {
    const permission = await requirePermission(reviewerId, 'approve_recap')
    if (!permission.ok) return { success: false, error: permission.error }

    const { data: review, error: fetchErr } = await db
      .from('accounting_reviews')
      .select('*')
      .eq('id', reviewId)
      .single()
    if (fetchErr) throw fetchErr
    if (review.status !== 'pending') return { success: false, error: `This review is already ${review.status}.` }

    const transition = await transitionSegmentStatus(
      review.labor_log_id,
      'export_ready',
      `Accounting approved recap${notes ? ` - ${notes}` : ''}`,
      reviewerId
    )
    if (!transition.success) return { success: false, error: transition.error }

    const approvedVersionId = await getLatestVersionId(review.estimate_id)
    const { data: updated, error: updateErr } = await db
      .from('accounting_reviews')
      .update({
        status: 'approved',
        reviewed_by: uuidOrNull(reviewerId),
        reviewed_at: new Date().toISOString(),
        review_notes: notes || null,
        approved_version_id: approvedVersionId,
        recap_revision: await getRecapRevision(review.labor_log_id),
      })
      .eq('id', reviewId)
      .select()
      .single()
    if (updateErr) throw updateErr

    await logSegmentActivity(
      review.labor_log_id,
      review.estimate_id,
      'accounting_review_approved',
      { accounting_review_id: reviewId, approved_version_id: approvedVersionId },
      notes,
      reviewerId
    )
    await notifySubmitterAndAssignee(
      updated,
      'Recap approved by accounting',
      'Accounting approved the recap. This segment is Ready for Intacct Upload.',
      { accounting_review_id: reviewId, decision: 'approved' }
    )

    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to approve recap' }
  }
}

export async function requestRecapCorrections(
  reviewId: string,
  reviewerId: string,
  notes: string
): Promise<{ success: boolean; error?: string }> {
  const db = requireSupabase()

  if (!notes.trim()) {
    return { success: false, error: 'Correction notes are required.' }
  }

  try {
    const permission = await requirePermission(reviewerId, 'request_recap_corrections')
    if (!permission.ok) return { success: false, error: permission.error }

    const { data: review, error: fetchErr } = await db
      .from('accounting_reviews')
      .select('*')
      .eq('id', reviewId)
      .single()
    if (fetchErr) throw fetchErr
    if (review.status !== 'pending') return { success: false, error: `This review is already ${review.status}.` }

    const transition = await transitionSegmentStatus(
      review.labor_log_id,
      'recap',
      `Accounting requested recap corrections - ${notes}`,
      reviewerId
    )
    if (!transition.success) return { success: false, error: transition.error }

    const { data: updated, error: updateErr } = await db
      .from('accounting_reviews')
      .update({
        status: 'corrections_requested',
        reviewed_by: uuidOrNull(reviewerId),
        reviewed_at: new Date().toISOString(),
        correction_notes: notes,
      })
      .eq('id', reviewId)
      .select()
      .single()
    if (updateErr) throw updateErr

    await logSegmentActivity(
      review.labor_log_id,
      review.estimate_id,
      'accounting_review_corrections_requested',
      { accounting_review_id: reviewId },
      notes,
      reviewerId
    )
    await notifySubmitterAndAssignee(
      updated,
      'Recap corrections requested',
      `Accounting requested recap corrections: ${notes}`,
      { accounting_review_id: reviewId, decision: 'corrections_requested' }
    )

    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to request recap corrections' }
  }
}

export async function canExportIntacct(laborLogId: string): Promise<boolean> {
  const ctx = await getLaborLogContext(laborLogId)
  if (ctx.cost_structure !== 'office') return false
  if (ctx.status !== 'export_ready') return false

  const review = await getAccountingReview(laborLogId)
  return review?.status === 'approved'
}

export async function canMarkInvoiced(laborLogId: string): Promise<boolean> {
  const ctx = await getLaborLogContext(laborLogId)
  if (ctx.cost_structure !== 'office') return ctx.status === 'recap'
  return canExportIntacct(laborLogId)
}
