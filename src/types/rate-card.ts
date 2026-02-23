// ---- Phase 2: Supabase table types ----

export interface Client {
  id: string
  name: string
  code: string
  third_party_markup: number
  agency_fee: number
  agency_fee_basis: string
  trucking_markup: number
  office_payout_pct: number
  is_active: boolean
  notes: string | null
  created_at: string
  updated_at: string
}

export interface RateCardSection {
  id: string
  name: string
  display_order: number
  cost_type: 'labor' | 'flat_fee' | 'pass_through'
  description: string | null
}

export interface RateCardItem {
  id: string
  client_id: string
  section_id: string
  name: string
  unit_rate: number | null
  unit_label: string | null
  gl_code: string | null
  is_from_msa: boolean
  is_pass_through: boolean
  has_overtime_rate: boolean
  overtime_rate: number | null
  overtime_unit_label: string | null
  overtime_gl_code: string | null
  notes: string | null
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
  created_by: string | null
}

export type RateCardItemInsert = Omit<RateCardItem, 'id' | 'created_at' | 'updated_at'>

export type RateCardItemUpdate = Partial<Omit<RateCardItem, 'id' | 'client_id' | 'created_at' | 'updated_at'>>

export interface RateCardItemsBySection {
  section: RateCardSection
  items: RateCardItem[]
}

// ---- Phase 1: Analysis types (legacy) ----

export interface RateRange {
  min: number
  max: number
  avg: number
  median: number
}

export interface RateCardRole {
  role: string
  rate_units: string[]
  gl_codes: string[]
  occurrences: number
  has_ot_variant: boolean
  has_dt_variant: boolean
  has_weekend_variant: boolean
  has_afterhours_variant: boolean
  unit_rate_range: RateRange
  unit_rate_range_raw: RateRange
  margin_range: RateRange
}
