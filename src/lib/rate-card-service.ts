import { supabase } from './supabase'
import type {
  Client,
  ClientUpdate,
  RateCardSection,
  RateCardItem,
  RateCardItemInsert,
  RateCardItemUpdate,
  RateCardItemsBySection,
  FeeType,
  FeeTypeInsert,
  FeeTypeUpdate,
} from '../types/rate-card'

function requireSupabase() {
  if (!supabase) {
    throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
  }
  return supabase
}

// ---- Clients ----

// Join the approver profile everywhere we fetch clients so the UI can render
// the assignee's name without a second round-trip. FK is auto-named
// clients_primary_approver_id_fkey by the Step 1 migration.
const CLIENT_SELECT =
  '*, primary_approver:profiles!clients_primary_approver_id_fkey(id, full_name, email, role)'

export async function getClients(): Promise<Client[]> {
  const db = requireSupabase()
  const { data, error } = await db
    .from('clients')
    .select(CLIENT_SELECT)
    .eq('is_active', true)
    .order('name')
  if (error) throw error
  return data as unknown as Client[]
}

export async function getClient(id: string): Promise<Client> {
  const db = requireSupabase()
  const { data, error } = await db
    .from('clients')
    .select(CLIENT_SELECT)
    .eq('id', id)
    .single()
  if (error) throw error
  return data as unknown as Client
}

export async function updateClient(id: string, updates: ClientUpdate): Promise<Client> {
  const db = requireSupabase()
  const { data, error } = await db
    .from('clients')
    .update(updates)
    .eq('id', id)
    .select(CLIENT_SELECT)
    .single()
  if (error) throw error
  return data as unknown as Client
}

// Users eligible to be a client's primary approver. Role gate matches the
// requirements doc: account_manager or admin only.
export interface ApproverUser {
  id: string
  full_name: string
  role: 'admin' | 'account_manager'
}

export async function getApproverUsers(): Promise<ApproverUser[]> {
  const db = requireSupabase()
  const { data, error } = await db
    .from('profiles')
    .select('id, full_name, role')
    .in('role', ['account_manager', 'admin'])
    .eq('is_active', true)
    .order('full_name')
  if (error) throw error
  return data as ApproverUser[]
}

// Look up the designated primary approver for the client attached to an
// estimate. Returns null if the estimate has no client, the client has no
// primary_approver_id set, or the lookup fails — callers should treat null as
// "fall back to broadcast routing."
export async function getClientApproverForEstimate(
  estimateId: string
): Promise<{ id: string; full_name: string } | null> {
  const db = requireSupabase()
  const { data, error } = await db
    .from('estimates')
    .select(
      'client:clients!inner(primary_approver:profiles!clients_primary_approver_id_fkey(id, full_name))'
    )
    .eq('id', estimateId)
    .single()
  if (error) return null
  const approver = (data as unknown as { client?: { primary_approver?: { id: string; full_name: string } | null } })
    ?.client?.primary_approver
  return approver ?? null
}

// ---- Sections ----

export async function getRateCardSections(): Promise<RateCardSection[]> {
  const db = requireSupabase()
  const { data, error } = await db
    .from('rate_card_sections')
    .select('*')
    .order('display_order')
  if (error) throw error
  return data
}

// ---- Rate Card Items ----

export async function getRateCardItems(clientId: string): Promise<RateCardItem[]> {
  const db = requireSupabase()
  const { data, error } = await db
    .from('rate_card_items')
    .select('*, fee_types(gl_code)')
    .eq('client_id', clientId)
    .eq('is_active', true)
    .order('display_order')
  if (error) throw error

  // Use canonical GL code from fee_types when available
  return data.map((row: any) => {
    const { fee_types, ...item } = row
    return {
      ...item,
      gl_code: fee_types?.gl_code ?? item.gl_code,
    }
  })
}

export async function getRateCardItemsBySection(clientId: string): Promise<RateCardItemsBySection[]> {
  const [sections, items] = await Promise.all([
    getRateCardSections(),
    getRateCardItems(clientId),
  ])

  return sections.map((section) => ({
    section,
    items: items.filter((item) => item.section_id === section.id),
  }))
}

export async function createRateCardItem(item: RateCardItemInsert): Promise<RateCardItem> {
  const db = requireSupabase()
  const { data, error } = await db
    .from('rate_card_items')
    .insert({ ...item, is_from_msa: false })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateRateCardItem(id: string, updates: RateCardItemUpdate): Promise<RateCardItem> {
  const db = requireSupabase()
  const { data, error } = await db
    .from('rate_card_items')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteRateCardItem(id: string): Promise<void> {
  const db = requireSupabase()
  const { error } = await db
    .from('rate_card_items')
    .update({ is_active: false })
    .eq('id', id)
  if (error) throw error
}

// ---- Fee Types ----

export async function getFeeTypes(): Promise<FeeType[]> {
  const db = requireSupabase()
  const { data, error } = await db
    .from('fee_types')
    .select('*')
    .order('section')
    .order('display_order')
  if (error) throw error
  return data
}

export async function createFeeType(feeType: FeeTypeInsert): Promise<FeeType> {
  const db = requireSupabase()
  const { data, error } = await db
    .from('fee_types')
    .insert(feeType)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateFeeType(id: string, updates: FeeTypeUpdate): Promise<FeeType> {
  const db = requireSupabase()
  const { data, error } = await db
    .from('fee_types')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteFeeType(id: string): Promise<void> {
  const db = requireSupabase()
  const { error } = await db
    .from('fee_types')
    .delete()
    .eq('id', id)
  if (error) throw error
}
