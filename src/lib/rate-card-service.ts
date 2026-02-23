import { supabase } from './supabase'
import type {
  Client,
  RateCardSection,
  RateCardItem,
  RateCardItemInsert,
  RateCardItemUpdate,
  RateCardItemsBySection,
} from '../types/rate-card'

function requireSupabase() {
  if (!supabase) {
    throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
  }
  return supabase
}

// ---- Clients ----

export async function getClients(): Promise<Client[]> {
  const db = requireSupabase()
  const { data, error } = await db
    .from('clients')
    .select('*')
    .eq('is_active', true)
    .order('name')
  if (error) throw error
  return data
}

export async function getClient(id: string): Promise<Client> {
  const db = requireSupabase()
  const { data, error } = await db
    .from('clients')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
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
    .select('*')
    .eq('client_id', clientId)
    .eq('is_active', true)
    .order('display_order')
  if (error) throw error
  return data
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
