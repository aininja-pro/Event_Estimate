// ---- Phase 2: Supabase table types ----

export interface ClientApprover {
  id: string
  full_name: string
  email: string
  role: 'admin' | 'cfo' | 'operations' | 'production_manager' | 'account_manager' | 'accounting'
}

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
  billing_contact_name: string | null
  billing_contact_email: string | null
  billing_address: string | null
  billing_phone: string | null
  primary_approver_id: string | null
  primary_approver?: ClientApprover | null
  intacct_customer_id?: string | null
  default_payment_terms?: string | null
  default_department_id?: string | null
  default_location_id?: string | null
  default_currency?: string
  default_exchange_rate_type?: string
  created_at: string
  updated_at: string
}

export interface ClientContact {
  id: string
  client_id: string
  name: string
  email: string
  phone: string | null
  title: string | null
  is_primary: boolean
  active: boolean
  created_at: string
  updated_at: string
}

export type ClientContactInsert = Omit<ClientContact, 'id' | 'created_at' | 'updated_at'>
export type ClientContactUpdate = Partial<Omit<ClientContact, 'id' | 'client_id' | 'created_at' | 'updated_at'>>

export type ClientUpdate = Partial<
  Pick<
    Client,
    | 'billing_contact_name'
    | 'billing_contact_email'
    | 'billing_address'
    | 'billing_phone'
    | 'primary_approver_id'
    | 'intacct_customer_id'
    | 'default_payment_terms'
    | 'default_department_id'
    | 'default_location_id'
    | 'default_currency'
    | 'default_exchange_rate_type'
  >
>

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
  corporate_cost: number | null
  corporate_cost_is_percent: boolean
  office_cost: number | null
  office_cost_is_percent: boolean
  fee_type_id: string | null
  notes: string | null
  display_order: number
  is_active: boolean
  is_rate_locked: boolean
  intacct_ar_item_id?: string | null
  intacct_ap_gl_account_no?: string | null
  default_unit?: string | null
  accounting_memo?: string | null
  created_at: string
  updated_at: string
  created_by: string | null
}

export type RateCardItemInsert =
  Omit<RateCardItem, 'id' | 'created_at' | 'updated_at' | 'intacct_ar_item_id' | 'intacct_ap_gl_account_no' | 'default_unit' | 'accounting_memo'> &
  Partial<Pick<RateCardItem, 'intacct_ar_item_id' | 'intacct_ap_gl_account_no' | 'default_unit' | 'accounting_memo'>>

export type RateCardItemUpdate = Partial<Omit<RateCardItem, 'id' | 'client_id' | 'created_at' | 'updated_at'>>

export interface RateCardItemsBySection {
  section: RateCardSection
  items: RateCardItem[]
}

// ---- Fee Types ----

export interface FeeType {
  id: string
  name: string
  gl_code: string
  cost_type: 'labor' | 'flat_fee' | 'pass_through'
  unit_label: string | null
  section: string
  intacct_ar_item_id?: string | null
  intacct_ap_gl_account_no?: string | null
  default_unit?: string
  accounting_memo?: string | null
  display_order: number
  created_at: string
  updated_at: string
}

export type FeeTypeInsert = Omit<FeeType, 'id' | 'created_at' | 'updated_at'>

export type FeeTypeUpdate = Partial<Omit<FeeType, 'id' | 'created_at' | 'updated_at'>>

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
