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
  exportType?: AccountingExportType
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
    | 'export_line'
  message: string
  lineItemId?: string
  laborEntryId?: string
  scheduleEntryId?: string
  feeTypeId?: string
  rateCardItemId?: string
  fixLocation?: string
  actionHint?: string
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

export type AccountingExportSide = 'ap' | 'ar'

export type AccountingExportSourceType =
  | 'schedule_labor'
  | 'manual_labor'
  | 'line_item'
  | 'fee'
  | 'per_diem'
  | 'adjustment'

export type AccountingMappingSource = 'rate_card_item' | 'fee_type' | 'legacy_gl_code'

export interface AccountingExportLine {
  exportSide: AccountingExportSide
  sourceType: AccountingExportSourceType
  sourceId: string
  estimateId: string
  laborLogId: string
  reviewId: string | null
  lineNo: number
  description: string
  quantity: number
  unit: string
  unitPrice?: number
  amount: number
  itemId?: string
  glAccountNo?: string
  memo?: string
  departmentId: string
  locationId: string
  projectId: string
  customerId: string
  vendorId?: string
  paymentTerms?: string
  transactionDate: string
  glPostingDate: string
  dueDate?: string
  sourceIsUnplanned: boolean
  sourceIsPassThrough: boolean
  mappingSource?: AccountingMappingSource
  warnings: string[]
}

export interface AccountingExportLineBuildResult {
  laborLogId: string
  estimateId: string | null
  reviewId: string | null
  isOfficeEvent: boolean
  isEligible: boolean
  lines: AccountingExportLine[]
  arLines: AccountingExportLine[]
  apLines: AccountingExportLine[]
  arIssues: AccountingReadinessIssue[]
  apIssues: AccountingReadinessIssue[]
  arWarnings: AccountingReadinessIssue[]
  apWarnings: AccountingReadinessIssue[]
}

export interface AccountingCsvBuildResult {
  csvText: string
  filename: string
  rowCount: number
  warnings: AccountingReadinessIssue[]
  blockingIssues: AccountingReadinessIssue[]
}

export type AccountingExportAuditType = 'ap_bill' | 'ar_invoice'

export interface AccountingExportRecord {
  id: string
  estimate_id: string
  labor_log_id: string
  accounting_review_id: string | null
  export_type: AccountingExportAuditType
  file_name: string
  row_count: number
  generated_by: string | null
  generated_at: string
  checksum: string | null
  warnings: AccountingReadinessIssue[] | null
  metadata: Record<string, unknown> | null
  created_at: string
  generated_by_profile?: {
    full_name: string | null
    email: string | null
  } | null
}

export interface AccountingCsvDownloadResult extends AccountingCsvBuildResult {
  auditRecordId: string | null
  savedPath?: string | null
}
