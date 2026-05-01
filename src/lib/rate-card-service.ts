import { supabase } from './supabase'
import type {
  Client,
  ClientUpdate,
  ClientContact,
  ClientContactInsert,
  ClientContactUpdate,
  RateCardSection,
  RateCardItem,
  RateCardItemInsert,
  RateCardItemUpdate,
  RateCardItemsBySection,
  FeeType,
  FeeTypeInsert,
  FeeTypeUpdate,
} from '../types/rate-card'
import type {
  OfficeAccountingProfile,
  OfficeAccountingProfileInsert,
  OfficeAccountingProfileUpdate,
  RevenueSegment,
  RevenueSegmentInsert,
  RevenueSegmentUpdate,
} from '../types/accounting'

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

// ---- Client Contacts ----

export async function getClientContacts(clientId: string, includeInactive = false): Promise<ClientContact[]> {
  const db = requireSupabase()
  let query = db
    .from('client_contacts')
    .select('*')
    .eq('client_id', clientId)
    .order('is_primary', { ascending: false })
    .order('name')
  if (!includeInactive) query = query.eq('active', true)
  const { data, error } = await query
  if (error) throw error
  return data as ClientContact[]
}

export async function getPrimaryClientContact(clientId: string): Promise<ClientContact | null> {
  const contacts = await getClientContacts(clientId)
  return contacts.find((contact) => contact.is_primary) ?? contacts[0] ?? null
}

export async function createClientContact(contact: ClientContactInsert): Promise<ClientContact> {
  const db = requireSupabase()
  if (contact.is_primary) {
    await db
      .from('client_contacts')
      .update({ is_primary: false })
      .eq('client_id', contact.client_id)
      .eq('is_primary', true)
  }
  const { data, error } = await db
    .from('client_contacts')
    .insert(contact)
    .select()
    .single()
  if (error) throw error
  return data as ClientContact
}

export async function updateClientContact(id: string, clientId: string, updates: ClientContactUpdate): Promise<ClientContact> {
  const db = requireSupabase()
  if (updates.is_primary) {
    await db
      .from('client_contacts')
      .update({ is_primary: false })
      .eq('client_id', clientId)
      .eq('is_primary', true)
      .neq('id', id)
  }
  const { data, error } = await db
    .from('client_contacts')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as ClientContact
}

export async function deleteClientContact(id: string): Promise<void> {
  const db = requireSupabase()
  const { error } = await db
    .from('client_contacts')
    .update({ active: false, is_primary: false })
    .eq('id', id)
  if (error) throw error
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
    .select('*, fee_types(gl_code, intacct_ar_item_id, intacct_ap_gl_account_no, default_unit, accounting_memo)')
    .eq('client_id', clientId)
    .eq('is_active', true)
    .order('display_order')
  if (error) throw error

  // Use canonical GL code from fee_types when available
  return data.map((row: RateCardItem & { fee_types?: Partial<FeeType> | null }) => {
    const { fee_types, ...item } = row
    return {
      ...item,
      gl_code: fee_types?.gl_code ?? item.gl_code,
      intacct_ar_item_id: item.intacct_ar_item_id ?? fee_types?.intacct_ar_item_id ?? null,
      intacct_ap_gl_account_no: item.intacct_ap_gl_account_no ?? fee_types?.intacct_ap_gl_account_no ?? null,
      default_unit: item.default_unit ?? fee_types?.default_unit ?? item.unit_label ?? 'Each',
      accounting_memo: item.accounting_memo ?? fee_types?.accounting_memo ?? null,
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

// ---- Accounting Metadata ----

export async function getOfficeAccountingProfiles(includeInactive = false): Promise<OfficeAccountingProfile[]> {
  const db = requireSupabase()
  let query = db
    .from('office_accounting_profiles')
    .select('*')
    .order('office_name')
  if (!includeInactive) query = query.eq('active', true)
  const { data, error } = await query
  if (error) throw error
  return data
}

export async function createOfficeAccountingProfile(profile: OfficeAccountingProfileInsert): Promise<OfficeAccountingProfile> {
  const db = requireSupabase()
  const { data, error } = await db
    .from('office_accounting_profiles')
    .insert(profile)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateOfficeAccountingProfile(id: string, updates: OfficeAccountingProfileUpdate): Promise<OfficeAccountingProfile> {
  const db = requireSupabase()
  const { data, error } = await db
    .from('office_accounting_profiles')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getRevenueSegments(includeInactive = false): Promise<RevenueSegment[]> {
  const db = requireSupabase()
  let query = db
    .from('revenue_segments')
    .select('*')
    .order('sort_order')
    .order('name')
  if (!includeInactive) query = query.eq('active', true)
  const { data, error } = await query
  if (error) throw error
  return data
}

export async function createRevenueSegment(segment: RevenueSegmentInsert): Promise<RevenueSegment> {
  const db = requireSupabase()
  const { data, error } = await db
    .from('revenue_segments')
    .insert(segment)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateRevenueSegment(id: string, updates: RevenueSegmentUpdate): Promise<RevenueSegment> {
  const db = requireSupabase()
  const { data, error } = await db
    .from('revenue_segments')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}
