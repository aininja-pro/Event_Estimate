import { supabase } from './supabase'

export type PunchItemType = 'bug' | 'feature' | 'question' | 'task'
export type PunchItemArea = 'accounting' | 'operations' | 'rates' | 'ai' | 'general'
export type PunchItemStatus = 'open' | 'in_progress' | 'done'

export interface PunchListItem {
  id: string
  title: string
  notes: string | null
  item_type: PunchItemType
  area: PunchItemArea
  status: PunchItemStatus
  resolution_note: string | null
  created_by: string | null
  resolved_by: string | null
  created_at: string
  updated_at: string
  resolved_at: string | null
}

function requireSupabase() {
  if (!supabase) throw new Error('Supabase is not configured.')
  return supabase
}

export async function getPunchListItems(): Promise<PunchListItem[]> {
  const db = requireSupabase()
  const { data, error } = await db
    .from('punch_list_items')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function createPunchListItem(input: {
  title: string
  item_type: PunchItemType
  area: PunchItemArea
  notes?: string
  created_by?: string
}): Promise<PunchListItem> {
  const db = requireSupabase()
  const { data, error } = await db
    .from('punch_list_items')
    .insert({
      title: input.title,
      item_type: input.item_type,
      area: input.area,
      notes: input.notes || null,
      created_by: input.created_by || null,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updatePunchListItem(
  id: string,
  updates: Partial<Pick<PunchListItem, 'title' | 'notes' | 'item_type' | 'area' | 'status' | 'resolution_note' | 'resolved_by' | 'resolved_at'>>,
): Promise<PunchListItem> {
  const db = requireSupabase()
  const { data, error } = await db
    .from('punch_list_items')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

/** Move an item to a new status, stamping/clearing resolution fields. */
export async function movePunchListItem(
  id: string,
  status: PunchItemStatus,
  resolvedBy?: string,
): Promise<PunchListItem> {
  if (status === 'done') {
    return updatePunchListItem(id, {
      status,
      resolved_by: resolvedBy || null,
      resolved_at: new Date().toISOString(),
    })
  }
  return updatePunchListItem(id, { status, resolved_by: null, resolved_at: null })
}

export async function deletePunchListItem(id: string): Promise<void> {
  const db = requireSupabase()
  const { error } = await db.from('punch_list_items').delete().eq('id', id)
  if (error) throw error
}
