// ---- Phase 2: Estimate Builder types ----

export interface Estimate {
  id: string
  client_id: string
  client_contact_id?: string | null
  event_name: string
  event_type: string | null
  location: string | null
  start_date: string | null
  end_date: string | null
  duration_days: number | null
  expected_attendance: string | null
  po_number: string | null
  project_id: string | null
  revenue_segment_id?: string | null
  event_city?: string | null
  event_state?: string | null
  intacct_project_id?: string | null
  accounting_department_id?: string | null
  accounting_location_id?: string | null
  accounting_customer_id?: string | null
  accounting_payment_terms?: string | null
  office_accounting_profile_id?: string | null
  cost_structure: 'corporate' | 'office'
  internal_notes: string | null
  published_notes: string | null
  status: 'pipeline' | 'estimate' | 'in_review' | 'active' | 'recap' | 'accounting_review' | 'export_ready' | 'invoiced' | 'lost' | 'cancelled' | 'archived'
  created_by: string | null
  created_at: string
  updated_at: string
}

export type EstimateInsert = Omit<Estimate, 'id' | 'created_at' | 'updated_at'>

export type EstimateUpdate = Partial<Omit<Estimate, 'id' | 'client_id' | 'created_at' | 'updated_at'>>

export interface EstimateWithClient extends Estimate {
  clients: {
    name: string
    code: string
    third_party_markup: number
    office_payout_pct: number
    billing_contact_email: string | null
    intacct_customer_id?: string | null
    default_payment_terms?: string | null
    default_department_id?: string | null
    default_location_id?: string | null
    default_currency?: string
    default_exchange_rate_type?: string
  }
  client_contact?: {
    id: string
    name: string
    email: string
    phone: string | null
    title: string | null
  } | null
}

export interface EstimateWithSegments extends EstimateWithClient {
  labor_logs: Pick<LaborLog, 'id' | 'location_name' | 'status' | 'is_primary'>[]
}

export interface LaborLog {
  id: string
  estimate_id: string
  location_name: string
  is_primary: boolean
  location_order: number
  start_date: string | null
  end_date: string | null
  notes: string | null
  status: 'pipeline' | 'estimate' | 'in_review' | 'active' | 'recap' | 'accounting_review' | 'export_ready' | 'invoiced' | 'lost' | 'cancelled'
  created_at: string
  updated_at: string
}

export type LaborLogInsert = Pick<LaborLog, 'estimate_id' | 'location_name' | 'is_primary'> & Partial<Pick<LaborLog, 'location_order' | 'start_date' | 'end_date' | 'notes' | 'status'>>

export type LaborLogUpdate = Partial<Omit<LaborLog, 'id' | 'estimate_id' | 'created_at' | 'updated_at'>>

export interface LaborEntry {
  id: string
  labor_log_id: string
  rate_card_item_id: string | null
  role_name: string
  quantity: number
  days: number
  unit_rate: number
  cost_rate: number | null
  override_rate: number | null
  override_reason: string | null
  has_overtime: boolean
  overtime_rate: number | null
  overtime_hours: number | null
  gl_code: string | null
  notes: string | null
  resource_type: 'internal' | 'external' | 'vendor'
  is_unplanned: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export type LaborEntryInsert = Omit<LaborEntry, 'id' | 'created_at' | 'updated_at'>

export type LaborEntryUpdate = Partial<Omit<LaborEntry, 'id' | 'labor_log_id' | 'created_at' | 'updated_at'>>

export interface EstimateLineItem {
  id: string
  estimate_id: string
  labor_log_id: string
  section: string
  rate_card_item_id: string | null
  item_name: string
  description: string | null
  quantity: number
  unit_cost: number
  markup_pct: number
  gl_code: string | null
  notes: string | null
  is_auto_generated: boolean
  fee_basis: string | null
  is_unplanned: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export type EstimateLineItemInsert = Omit<EstimateLineItem, 'id' | 'created_at' | 'updated_at'>

export type EstimateLineItemUpdate = Partial<Omit<EstimateLineItem, 'id' | 'estimate_id' | 'labor_log_id' | 'created_at' | 'updated_at'>>
