import { supabase } from './supabase'

export interface Notification {
  id: string
  user_id: string
  type: 'approval_requested' | 'segment_status_changed' | 'approval_decision' | 'rollback' | 'estimate_assigned'
  title: string
  body: string
  estimate_id: string | null
  labor_log_id: string | null
  metadata: Record<string, unknown>
  is_read: boolean
  created_at: string
}

export interface CreateNotificationInput {
  user_id: string
  type: Notification['type']
  title: string
  body: string
  estimate_id?: string
  labor_log_id?: string
  metadata?: Record<string, unknown>
}

function requireSupabase() {
  if (!supabase) {
    throw new Error('Supabase is not configured.')
  }
  return supabase
}

/** Insert a notification for a specific user. */
export async function createNotification(input: CreateNotificationInput): Promise<void> {
  const db = requireSupabase()
  const { error } = await db.from('notifications').insert({
    user_id: input.user_id,
    type: input.type,
    title: input.title,
    body: input.body,
    estimate_id: input.estimate_id || null,
    labor_log_id: input.labor_log_id || null,
    metadata: input.metadata || {},
  })
  if (error) console.error('Failed to create notification:', error)
}

/** Send notification to all users with a given role. */
export async function notifyByRole(
  role: string,
  input: Omit<CreateNotificationInput, 'user_id'>
): Promise<void> {
  const db = requireSupabase()
  const { data: profiles } = await db
    .from('profiles')
    .select('id, notification_prefs')
    .eq('role', role)
    .eq('is_active', true)
  if (!profiles?.length) return

  for (const profile of profiles) {
    const prefs = profile.notification_prefs as { in_app?: boolean } | null
    if (prefs?.in_app === false) continue
    await createNotification({ ...input, user_id: profile.id })
  }
}

/** Get notifications for a user, most recent first. */
export async function getNotifications(userId: string, limit = 20): Promise<Notification[]> {
  const db = requireSupabase()
  const { data, error } = await db
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data as Notification[]
}

/** Get unread count for a user. */
export async function getUnreadCount(userId: string): Promise<number> {
  const db = requireSupabase()
  const { count, error } = await db
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false)
  if (error) throw error
  return count ?? 0
}

/** Mark a single notification as read. */
export async function markAsRead(notificationId: string): Promise<void> {
  const db = requireSupabase()
  await db
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
}

/** Mark all notifications as read for a user. */
export async function markAllAsRead(userId: string): Promise<void> {
  const db = requireSupabase()
  await db
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false)
}

/** Get the estimate creator's profile ID. */
export async function getEstimateCreatorId(estimateId: string): Promise<string | null> {
  const db = requireSupabase()
  const { data } = await db
    .from('estimates')
    .select('created_by')
    .eq('id', estimateId)
    .single()
  return data?.created_by || null
}

/** Get the segment assignee's profile ID. */
export async function getSegmentAssigneeId(laborLogId: string): Promise<string | null> {
  const db = requireSupabase()
  const { data } = await db
    .from('labor_logs')
    .select('assigned_to')
    .eq('id', laborLogId)
    .single()
  return data?.assigned_to || null
}
