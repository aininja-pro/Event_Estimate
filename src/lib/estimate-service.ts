import { supabase } from './supabase'
import type {
  Estimate,
  EstimateInsert,
  EstimateUpdate,
  EstimateWithClient,
  LaborLog,
  LaborLogInsert,
  LaborLogUpdate,
  LaborEntry,
  LaborEntryInsert,
  LaborEntryUpdate,
  EstimateLineItem,
  EstimateLineItemInsert,
  EstimateLineItemUpdate,
} from '../types/estimate'

function requireSupabase() {
  if (!supabase) {
    throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
  }
  return supabase
}

// ---- Estimates ----

export async function getEstimates(): Promise<EstimateWithClient[]> {
  const db = requireSupabase()
  const { data, error } = await db
    .from('estimates')
    .select('*, clients(name, code, third_party_markup, office_payout_pct)')
    .order('updated_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getEstimate(id: string): Promise<EstimateWithClient> {
  const db = requireSupabase()
  const { data, error } = await db
    .from('estimates')
    .select('*, clients(name, code, third_party_markup, office_payout_pct)')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function createEstimate(estimate: EstimateInsert): Promise<Estimate> {
  const db = requireSupabase()
  const { data, error } = await db
    .from('estimates')
    .insert(estimate)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateEstimate(id: string, updates: EstimateUpdate): Promise<Estimate> {
  const db = requireSupabase()
  const { data, error } = await db
    .from('estimates')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteEstimate(id: string): Promise<void> {
  const db = requireSupabase()
  const { error } = await db
    .from('estimates')
    .delete()
    .eq('id', id)
  if (error) throw error
}

// ---- Labor Logs ----

export async function getLaborLogs(estimateId: string): Promise<LaborLog[]> {
  const db = requireSupabase()
  const { data, error } = await db
    .from('labor_logs')
    .select('*')
    .eq('estimate_id', estimateId)
    .order('location_order')
  if (error) throw error
  return data
}

export async function createLaborLog(log: LaborLogInsert): Promise<LaborLog> {
  const db = requireSupabase()
  const { data, error } = await db
    .from('labor_logs')
    .insert(log)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateLaborLog(id: string, updates: LaborLogUpdate): Promise<LaborLog> {
  const db = requireSupabase()
  const { data, error } = await db
    .from('labor_logs')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteLaborLog(id: string): Promise<void> {
  const db = requireSupabase()
  const { error } = await db
    .from('labor_logs')
    .delete()
    .eq('id', id)
  if (error) throw error
}

// ---- Labor Entries ----

export async function getLaborEntries(laborLogId: string): Promise<LaborEntry[]> {
  const db = requireSupabase()
  const { data, error } = await db
    .from('labor_entries')
    .select('*')
    .eq('labor_log_id', laborLogId)
    .order('display_order')
  if (error) throw error
  return data
}

export async function createLaborEntry(entry: LaborEntryInsert): Promise<LaborEntry> {
  const db = requireSupabase()
  const { data, error } = await db
    .from('labor_entries')
    .insert(entry)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateLaborEntry(id: string, updates: LaborEntryUpdate): Promise<LaborEntry> {
  const db = requireSupabase()
  const { data, error } = await db
    .from('labor_entries')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteLaborEntry(id: string): Promise<void> {
  const db = requireSupabase()
  const { error } = await db
    .from('labor_entries')
    .delete()
    .eq('id', id)
  if (error) throw error
}

// ---- Estimate Line Items ----

export async function getLineItems(estimateId: string, section?: string): Promise<EstimateLineItem[]> {
  const db = requireSupabase()
  let query = db
    .from('estimate_line_items')
    .select('*')
    .eq('estimate_id', estimateId)
    .order('display_order')

  if (section) {
    query = query.eq('section', section)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function createLineItem(item: EstimateLineItemInsert): Promise<EstimateLineItem> {
  const db = requireSupabase()
  const { data, error } = await db
    .from('estimate_line_items')
    .insert(item)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateLineItem(id: string, updates: EstimateLineItemUpdate): Promise<EstimateLineItem> {
  const db = requireSupabase()
  const { data, error } = await db
    .from('estimate_line_items')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteLineItem(id: string): Promise<void> {
  const db = requireSupabase()
  const { error } = await db
    .from('estimate_line_items')
    .delete()
    .eq('id', id)
  if (error) throw error
}
