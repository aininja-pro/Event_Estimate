export interface OfficeAccountingProfile {
  id: string
  office_name: string
  legal_name: string | null
  intacct_vendor_id: string | null
  default_payment_terms: string | null
  default_department_id: string | null
  default_location_id: string | null
  active: boolean
  created_at: string
  updated_at: string
}

export type OfficeAccountingProfileInsert = Omit<OfficeAccountingProfile, 'id' | 'created_at' | 'updated_at'>
export type OfficeAccountingProfileUpdate = Partial<Omit<OfficeAccountingProfile, 'id' | 'created_at' | 'updated_at'>>

export interface RevenueSegment {
  id: string
  name: string
  code: string | null
  active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export type RevenueSegmentInsert = Omit<RevenueSegment, 'id' | 'created_at' | 'updated_at'>
export type RevenueSegmentUpdate = Partial<Omit<RevenueSegment, 'id' | 'created_at' | 'updated_at'>>

export type AccountingExportType = 'ap' | 'ar'

export interface AccountingReadinessIssue {
  field: string
  source:
    | 'client'
    | 'office_profile'
    | 'estimate'
    | 'fee_type'
    | 'rate_card_item'
    | 'line_item'
    | 'labor_entry'
    | 'schedule_entry'
    | 'accounting_review'
    | 'segment'
  message: string
  lineItemId?: string
  laborEntryId?: string
  scheduleEntryId?: string
  feeTypeId?: string
  rateCardItemId?: string
}

export interface AccountingValidationResult {
  exportType: AccountingExportType
  isValid: boolean
  missingFields: AccountingReadinessIssue[]
  warnings: AccountingReadinessIssue[]
}

export interface AccountingReadinessSummary {
  laborLogId: string
  isOfficeEvent: boolean
  ap: AccountingValidationResult
  ar: AccountingValidationResult
  isReady: boolean
}
