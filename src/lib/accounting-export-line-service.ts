import { getAccountingReview } from './accounting-review-service'
import {
  getActualBillableTotal,
  getActualCostTotal,
  usesLegacyActualCost,
} from './accounting-amounts'
import { computeScheduleRollup } from './schedule-service'
import { supabase } from './supabase'
import type {
  AccountingExportLine,
  AccountingExportLineBuildResult,
  AccountingExportSide,
  AccountingExportSourceType,
  AccountingMappingSource,
  AccountingReadinessIssue,
} from '../types/accounting'
import type { ScheduleEntry } from '../types/schedule'

function requireSupabase() {
  if (!supabase) {
    throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
  }
  return supabase
}

type FeeTypeMapping = {
  id?: string | null
  gl_code?: string | null
  cost_type?: 'labor' | 'flat_fee' | 'pass_through' | null
  intacct_ar_item_id?: string | null
  intacct_ap_gl_account_no?: string | null
  default_unit?: string | null
  unit_label?: string | null
  accounting_memo?: string | null
}

type MappingEntity = {
  id?: string | null
  gl_code?: string | null
  unit_label?: string | null
  is_pass_through?: boolean | null
  office_cost?: number | null
  office_cost_is_percent?: boolean | null
  intacct_ar_item_id?: string | null
  intacct_ap_gl_account_no?: string | null
  default_unit?: string | null
  accounting_memo?: string | null
  fee_types?: FeeTypeMapping | FeeTypeMapping[] | null
}

type ActualTotals = {
  actual_total: number | null
  actual_cost_total: number | null
  actual_billable_total: number | null
  actual_days: number | null
}

type ExportContext = {
  laborLog: {
    id: string
    estimate_id: string
    status: string | null
    location_name: string | null
    start_date: string | null
    end_date: string | null
  }
  estimate: {
    id: string
    cost_structure: 'corporate' | 'office'
    start_date: string | null
    end_date: string | null
    revenue_segment_id: string | null
    event_city: string | null
    event_state: string | null
    intacct_project_id: string | null
    accounting_department_id: string | null
    accounting_location_id: string | null
    accounting_customer_id: string | null
    accounting_payment_terms: string | null
    office_accounting_profile_id: string | null
    clients: {
      id: string
      intacct_customer_id: string | null
      default_payment_terms: string | null
      default_department_id: string | null
      default_location_id: string | null
      default_currency: string | null
      default_exchange_rate_type: string | null
    } | null
    revenue_segments: { id: string; name: string } | null
    office_accounting_profiles: {
      id: string
      office_name: string
      intacct_vendor_id: string | null
      default_payment_terms: string | null
      default_department_id: string | null
      default_location_id: string | null
    } | null
  }
}

type CommonDimensions = {
  customerId: string | null
  arPaymentTerms: string | null
  apPaymentTerms: string | null
  departmentId: string | null
  locationId: string | null
  projectId: string | null
  vendorId: string | null
  transactionDate: string
  glPostingDate: string
}

type ManualLaborRow = {
  id: string
  role_name: string
  rate_card_item_id: string | null
  is_unplanned: boolean
  quantity: number
  days: number
  unit_rate: number
  cost_rate: number | null
  gl_code: string | null
  notes: string | null
  rate_card_items?: MappingEntity | null
}

type LineItemRow = {
  id: string
  item_name: string
  description: string | null
  rate_card_item_id: string | null
  section: string | null
  is_unplanned: boolean
  fee_basis: string | null
  quantity: number
  unit_cost: number
  markup_pct: number
  gl_code: string | null
  notes: string | null
  rate_card_items?: MappingEntity | null
}

function normalizeName(value: string | null | undefined): string {
  return (value ?? '').trim().toLowerCase()
}

function firstJoin<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null
  return value ?? null
}

function normalizeMapping(value: MappingEntity | MappingEntity[] | null | undefined): MappingEntity | null {
  const mapping = firstJoin(value)
  if (!mapping) return null
  return {
    ...mapping,
    fee_types: firstJoin(mapping.fee_types),
  }
}

function finiteNumber(value: unknown): number | null {
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100
}

function isNonZeroAmount(value: number | null | undefined): value is number {
  return value != null && Number.isFinite(value) && value !== 0
}

function issue(
  exportType: AccountingExportSide,
  field: string,
  source: AccountingReadinessIssue['source'],
  message: string,
  extra: Partial<AccountingReadinessIssue> = {}
): AccountingReadinessIssue {
  return { exportType, field, source, message, ...extra }
}

function pushRequired(
  issues: AccountingReadinessIssue[],
  exportType: AccountingExportSide,
  value: unknown,
  field: string,
  source: AccountingReadinessIssue['source'],
  message: string,
  extra: Partial<AccountingReadinessIssue> = {}
) {
  if (value == null || String(value).trim() === '') {
    issues.push(issue(exportType, field, source, message, extra))
  }
}

export function resolveArItemId(mapping: MappingEntity | null | undefined): { itemId: string | null; mappingSource?: AccountingMappingSource } {
  if (mapping?.intacct_ar_item_id) return { itemId: mapping.intacct_ar_item_id, mappingSource: 'rate_card_item' }
  const feeType = firstJoin(mapping?.fee_types)
  if (feeType?.intacct_ar_item_id) return { itemId: feeType.intacct_ar_item_id, mappingSource: 'fee_type' }
  return { itemId: null }
}

export function resolveApGlAccountNo(mapping: MappingEntity | null | undefined): { glAccountNo: string | null; mappingSource?: AccountingMappingSource; warning?: string } {
  if (mapping?.intacct_ap_gl_account_no) return { glAccountNo: mapping.intacct_ap_gl_account_no, mappingSource: 'rate_card_item' }
  const feeType = firstJoin(mapping?.fee_types)
  if (feeType?.intacct_ap_gl_account_no) return { glAccountNo: feeType.intacct_ap_gl_account_no, mappingSource: 'fee_type' }
  if (mapping?.gl_code) {
    return {
      glAccountNo: mapping.gl_code,
      mappingSource: 'legacy_gl_code',
      warning: 'AP GL account resolved from legacy GL code fallback.',
    }
  }
  if (feeType?.gl_code) {
    return {
      glAccountNo: feeType.gl_code,
      mappingSource: 'legacy_gl_code',
      warning: 'AP GL account resolved from legacy fee type GL code fallback.',
    }
  }
  return { glAccountNo: null }
}

function resolveUnit(mapping: MappingEntity | null | undefined): string {
  const feeType = firstJoin(mapping?.fee_types)
  return mapping?.default_unit || feeType?.default_unit || mapping?.unit_label || feeType?.unit_label || 'Each'
}

function resolveMemo(mapping: MappingEntity | null | undefined, fallback?: string | null): string | undefined {
  const feeType = firstJoin(mapping?.fee_types)
  return mapping?.accounting_memo || feeType?.accounting_memo || fallback || undefined
}

function isPassThrough(mapping: MappingEntity | null | undefined, section?: string | null): boolean {
  const feeType = firstJoin(mapping?.fee_types)
  return Boolean(
    mapping?.is_pass_through ||
    feeType?.cost_type === 'pass_through' ||
    section === 'travel' ||
    section === 'production'
  )
}

function sourceTypeForLine(item: LineItemRow, amount: number | null): AccountingExportSourceType {
  if (amount != null && amount < 0) return 'adjustment'
  if (item.fee_basis || item.section === 'fees') return 'fee'
  return 'line_item'
}

function sourceTypeForLabor(roleName: string, amount: number | null): AccountingExportSourceType {
  if (amount != null && amount < 0) return 'adjustment'
  if (roleName.toLowerCase().includes('per diem')) return 'per_diem'
  return 'manual_labor'
}

export function resolveAccountingDimensions(ctx: ExportContext): CommonDimensions {
  const client = ctx.estimate.clients
  const office = ctx.estimate.office_accounting_profiles
  const transactionDate =
    ctx.laborLog.end_date ||
    ctx.estimate.end_date ||
    ctx.laborLog.start_date ||
    ctx.estimate.start_date ||
    new Date().toISOString().slice(0, 10)

  return {
    customerId: ctx.estimate.accounting_customer_id || client?.intacct_customer_id || null,
    arPaymentTerms: ctx.estimate.accounting_payment_terms || client?.default_payment_terms || null,
    apPaymentTerms: ctx.estimate.accounting_payment_terms || office?.default_payment_terms || client?.default_payment_terms || null,
    departmentId: ctx.estimate.accounting_department_id || client?.default_department_id || office?.default_department_id || null,
    locationId: ctx.estimate.accounting_location_id || client?.default_location_id || office?.default_location_id || null,
    projectId: ctx.estimate.intacct_project_id || null,
    vendorId: office?.intacct_vendor_id || null,
    transactionDate,
    glPostingDate: transactionDate,
  }
}

function lineBase(
  side: AccountingExportSide,
  ctx: ExportContext,
  reviewId: string | null,
  dimensions: CommonDimensions,
  sourceType: AccountingExportSourceType,
  sourceId: string,
  lineNo: number,
  description: string,
  quantity: number,
  unit: string,
  amount: number,
  sourceIsUnplanned: boolean,
  sourceIsPassThrough: boolean,
  paymentTerms: string | null,
): Omit<AccountingExportLine, 'itemId' | 'glAccountNo' | 'mappingSource' | 'warnings'> {
  const unitPrice = quantity !== 0 ? roundMoney(amount / quantity) : undefined
  return {
    exportSide: side,
    sourceType,
    sourceId,
    estimateId: ctx.estimate.id,
    laborLogId: ctx.laborLog.id,
    reviewId,
    lineNo,
    description,
    quantity,
    unit,
    unitPrice,
    amount: roundMoney(amount),
    departmentId: dimensions.departmentId || '',
    locationId: dimensions.locationId || '',
    projectId: dimensions.projectId || '',
    customerId: dimensions.customerId || '',
    vendorId: side === 'ap' ? dimensions.vendorId || undefined : undefined,
    paymentTerms: paymentTerms || undefined,
    transactionDate: dimensions.transactionDate,
    glPostingDate: dimensions.glPostingDate,
    sourceIsUnplanned,
    sourceIsPassThrough,
  }
}

export function getLineBillableAmount(input: {
  sourceType: 'schedule_labor' | 'manual_labor' | 'line_item'
  scheduleEntry?: ScheduleEntry
  manualLabor?: ManualLaborRow
  lineItem?: LineItemRow
  recapActual?: ActualTotals | null
}): number | null {
  if (input.sourceType === 'schedule_labor' && input.scheduleEntry) {
    const amount = computeScheduleRollup([input.scheduleEntry]).reduce((sum, row) => sum + row.actual_revenue_total, 0)
    return isNonZeroAmount(amount) ? roundMoney(amount) : null
  }

  if (input.sourceType === 'manual_labor' && input.manualLabor) {
    return getActualBillableTotal({ sourceType: 'manual_labor', source: input.manualLabor }, input.recapActual)
  }

  if (input.sourceType === 'line_item' && input.lineItem) {
    return getActualBillableTotal({ sourceType: 'line_item', source: input.lineItem }, input.recapActual)
  }

  return null
}

function deriveConfiguredOfficeCost(mapping: MappingEntity | null | undefined, billableUnitPrice: number | null): number | null {
  const officeCost = finiteNumber(mapping?.office_cost)
  if (officeCost == null) return null
  if (mapping?.office_cost_is_percent) {
    if (billableUnitPrice == null) return null
    return billableUnitPrice * (officeCost / 100)
  }
  return officeCost
}

export function getLinePayoutAmount(input: {
  sourceType: 'schedule_labor' | 'manual_labor' | 'line_item'
  scheduleEntry?: ScheduleEntry
  manualLabor?: ManualLaborRow
  lineItem?: LineItemRow
  recapActual?: ActualTotals | null
  mapping?: MappingEntity | null
}): number | null {
  if (input.sourceType === 'schedule_labor' && input.scheduleEntry) {
    const amount = computeScheduleRollup([input.scheduleEntry]).reduce((sum, row) => sum + row.actual_cost_total, 0)
    return isNonZeroAmount(amount) ? roundMoney(amount) : null
  }

  const explicit = getActualCostTotal(input.recapActual)
  if (explicit != null) return roundMoney(explicit)

  if (input.sourceType === 'manual_labor' && input.manualLabor) {
    const days = finiteNumber(input.recapActual?.actual_days) ?? (!input.recapActual ? finiteNumber(input.manualLabor.days) : null)
    const qty = finiteNumber(input.manualLabor.quantity)
    const costRate = finiteNumber(input.manualLabor.cost_rate)
    if (qty != null && days != null && costRate != null) return roundMoney(qty * days * costRate)

    const unitCost = deriveConfiguredOfficeCost(input.mapping, finiteNumber(input.manualLabor.unit_rate))
    if (qty != null && days != null && unitCost != null) return roundMoney(qty * days * unitCost)
    return null
  }

  if (input.sourceType === 'line_item' && input.lineItem) {
    const qty = finiteNumber(input.lineItem.quantity)
    const unitCost = finiteNumber(input.lineItem.unit_cost)
    if (!input.recapActual && qty != null && unitCost != null) return roundMoney(qty * unitCost)
  }

  return null
}

async function getContext(laborLogId: string): Promise<ExportContext> {
  const db = requireSupabase()
  const { data: laborLog, error: logErr } = await db
    .from('labor_logs')
    .select('id, estimate_id, status, location_name, start_date, end_date')
    .eq('id', laborLogId)
    .single()
  if (logErr) throw logErr

  const { data: estimate, error: estErr } = await db
    .from('estimates')
    .select(`
      id,
      cost_structure,
      start_date,
      end_date,
      revenue_segment_id,
      event_city,
      event_state,
      intacct_project_id,
      accounting_department_id,
      accounting_location_id,
      accounting_customer_id,
      accounting_payment_terms,
      office_accounting_profile_id,
      clients(
        id,
        intacct_customer_id,
        default_payment_terms,
        default_department_id,
        default_location_id,
        default_currency,
        default_exchange_rate_type
      ),
      revenue_segments(id, name),
      office_accounting_profiles(
        id,
        office_name,
        intacct_vendor_id,
        default_payment_terms,
        default_department_id,
        default_location_id
      )
    `)
    .eq('id', laborLog.estimate_id)
    .single()
  if (estErr) throw estErr

  return {
    laborLog,
    estimate: {
      ...(estimate as unknown as Omit<ExportContext['estimate'], 'clients' | 'revenue_segments' | 'office_accounting_profiles'>),
      clients: firstJoin((estimate as unknown as { clients?: ExportContext['estimate']['clients'] | ExportContext['estimate']['clients'][] }).clients),
      revenue_segments: firstJoin((estimate as unknown as { revenue_segments?: ExportContext['estimate']['revenue_segments'] | ExportContext['estimate']['revenue_segments'][] }).revenue_segments),
      office_accounting_profiles: firstJoin((estimate as unknown as { office_accounting_profiles?: ExportContext['estimate']['office_accounting_profiles'] | ExportContext['estimate']['office_accounting_profiles'][] }).office_accounting_profiles),
    },
  }
}

async function getScheduleRows(laborLogId: string) {
  const db = requireSupabase()
  const { data, error } = await db
    .from('schedule_entries')
    .select(`
      id,
      labor_log_id,
      role_name,
      person_name,
      row_index,
      staff_group_id,
      rate_card_item_id,
      needs_airfare,
      needs_hotel,
      hotel_nights,
      needs_per_diem,
      day_rate,
      cost_rate,
      ot_hourly_rate,
      ot_cost_rate,
      gl_code,
      notes,
      resource_type,
      is_unplanned,
      created_at,
      updated_at,
      day_entries:schedule_day_entries(id, schedule_entry_id, work_date, hours, actual_hours, per_diem_override, created_at, updated_at),
      rate_card_items(
        id,
        gl_code,
        unit_label,
        is_pass_through,
        office_cost,
        office_cost_is_percent,
        intacct_ar_item_id,
        intacct_ap_gl_account_no,
        default_unit,
        accounting_memo,
        fee_types(id, gl_code, cost_type, unit_label, intacct_ar_item_id, intacct_ap_gl_account_no, default_unit, accounting_memo)
      )
    `)
    .eq('labor_log_id', laborLogId)
    .order('row_index')
  if (error) throw error
  return ((data || []) as unknown as Array<ScheduleEntry & { rate_card_items?: MappingEntity | MappingEntity[] | null }>).map((row) => ({
    ...row,
    rate_card_items: normalizeMapping(row.rate_card_items),
  }))
}

async function getManualLaborRows(laborLogId: string) {
  const db = requireSupabase()
  const { data, error } = await db
    .from('labor_entries')
    .select(`
      id,
      role_name,
      rate_card_item_id,
      is_unplanned,
      quantity,
      days,
      unit_rate,
      cost_rate,
      gl_code,
      notes,
      rate_card_items(
        id,
        gl_code,
        unit_label,
        is_pass_through,
        office_cost,
        office_cost_is_percent,
        intacct_ar_item_id,
        intacct_ap_gl_account_no,
        default_unit,
        accounting_memo,
        fee_types(id, gl_code, cost_type, unit_label, intacct_ar_item_id, intacct_ap_gl_account_no, default_unit, accounting_memo)
      )
    `)
    .eq('labor_log_id', laborLogId)
  if (error) throw error
  return ((data || []) as unknown as Array<ManualLaborRow & { rate_card_items?: MappingEntity | MappingEntity[] | null }>).map((row) => ({
    ...row,
    rate_card_items: normalizeMapping(row.rate_card_items),
  }))
}

async function getLineRows(laborLogId: string) {
  const db = requireSupabase()
  const [{ data, error }, { data: feeTypeData, error: feeTypeError }] = await Promise.all([
    db
    .from('estimate_line_items')
    .select(`
      id,
      item_name,
      description,
      rate_card_item_id,
      section,
      is_unplanned,
      fee_basis,
      quantity,
      unit_cost,
      markup_pct,
      gl_code,
      notes,
      rate_card_items(
        id,
        gl_code,
        unit_label,
        is_pass_through,
        office_cost,
        office_cost_is_percent,
        intacct_ar_item_id,
        intacct_ap_gl_account_no,
        default_unit,
        accounting_memo,
        fee_types(id, gl_code, cost_type, unit_label, intacct_ar_item_id, intacct_ap_gl_account_no, default_unit, accounting_memo)
      )
    `)
    .eq('labor_log_id', laborLogId)
      .order('display_order'),
    db
      .from('fee_types')
      .select('id, name, gl_code, cost_type, unit_label, intacct_ar_item_id, intacct_ap_gl_account_no, default_unit, accounting_memo'),
  ])
  if (error) throw error
  if (feeTypeError) throw feeTypeError

  const feeTypesByName = new Map(
    (feeTypeData || []).map((feeType) => [normalizeName(feeType.name), feeType as FeeTypeMapping])
  )

  return ((data || []) as unknown as Array<LineItemRow & { rate_card_items?: MappingEntity | MappingEntity[] | null }>).map((row) => ({
    ...row,
    rate_card_items: normalizeMapping(row.rate_card_items) ?? (
      row.fee_basis ? { fee_types: feeTypesByName.get(normalizeName(row.item_name)) ?? null } : null
    ),
  }))
}

async function getActualTotals(laborLogId: string) {
  const db = requireSupabase()
  const { data, error } = await db
    .from('recap_actuals')
    .select('labor_entry_id, line_item_id, actual_total, actual_cost_total, actual_billable_total, actual_days')
    .eq('labor_log_id', laborLogId)
  if (error) throw error

  const labor = new Map<string, ActualTotals>()
  const line = new Map<string, ActualTotals>()
  for (const row of data || []) {
    const totals = {
      actual_total: row.actual_total == null ? null : Number(row.actual_total),
      actual_cost_total: row.actual_cost_total == null ? null : Number(row.actual_cost_total),
      actual_billable_total: row.actual_billable_total == null ? null : Number(row.actual_billable_total),
      actual_days: row.actual_days == null ? null : Number(row.actual_days),
    }
    if (row.labor_entry_id) labor.set(row.labor_entry_id, totals)
    if (row.line_item_id) line.set(row.line_item_id, totals)
  }
  return { labor, line }
}

async function getReceiptLineItemIds(estimateId: string): Promise<Set<string>> {
  const db = requireSupabase()
  const { data, error } = await db
    .from('receipt_attachments')
    .select('line_item_id')
    .eq('estimate_id', estimateId)
  if (error) throw error
  return new Set((data || []).map((row) => row.line_item_id).filter(Boolean) as string[])
}

function addGateIssues(ctx: ExportContext, reviewId: string | null, reviewStatus: string | null | undefined, result: AccountingExportLineBuildResult) {
  const common = resolveAccountingDimensions(ctx)
  const commonIssues: AccountingReadinessIssue[] = []

  if (ctx.estimate.cost_structure !== 'office') {
    commonIssues.push(issue('ar', 'cost_structure', 'estimate', 'Only Office Events generate AP/AR Intacct upload lines.'))
  }
  if (ctx.laborLog.status !== 'export_ready') {
    commonIssues.push(issue('ar', 'segment_status', 'segment', 'Segment must be Ready for Intacct Upload.'))
  }
  if (!reviewId || reviewStatus !== 'approved') {
    commonIssues.push(issue('ar', 'accounting_review', 'accounting_review', 'Accounting review must be approved.'))
  }

  result.arIssues.push(...commonIssues.map((item) => ({ ...item, exportType: 'ar' as const })))
  result.apIssues.push(...commonIssues.map((item) => ({ ...item, exportType: 'ap' as const })))

  pushRequired(result.arIssues, 'ar', common.customerId, 'customerId', 'client', 'Client Intacct customer ID is missing.')
  pushRequired(result.arIssues, 'ar', common.arPaymentTerms, 'paymentTerms', 'client', 'AR payment terms are missing.')
  pushRequired(result.arIssues, 'ar', common.departmentId, 'lineDepartmentId', 'estimate', 'Department dimension is missing.')
  pushRequired(result.arIssues, 'ar', common.locationId, 'lineLocationId', 'estimate', 'Location dimension is missing.')
  pushRequired(result.arIssues, 'ar', common.projectId, 'lineProjectId', 'estimate', 'Dedicated Intacct project ID is missing.')
  pushRequired(result.arIssues, 'ar', ctx.estimate.revenue_segment_id, 'revenue_segment_id', 'estimate', 'Revenue segment must be selected.')
  pushRequired(result.arIssues, 'ar', ctx.estimate.event_city, 'event_city', 'estimate', 'Event city is required.')
  pushRequired(result.arIssues, 'ar', ctx.estimate.event_state, 'event_state', 'estimate', 'Event state is required.')

  pushRequired(result.apIssues, 'ap', ctx.estimate.office_accounting_profile_id, 'office_accounting_profile_id', 'estimate', 'Select an office accounting profile.')
  pushRequired(result.apIssues, 'ap', common.vendorId, 'vendorId', 'office_profile', 'Office profile is missing Intacct vendor ID.')
  pushRequired(result.apIssues, 'ap', common.apPaymentTerms, 'paymentTerms', 'office_profile', 'AP payment terms are missing.')
  pushRequired(result.apIssues, 'ap', common.departmentId, 'lineDepartmentId', 'estimate', 'Department dimension is missing.')
  pushRequired(result.apIssues, 'ap', common.locationId, 'lineLocationId', 'estimate', 'Location dimension is missing.')
  pushRequired(result.apIssues, 'ap', common.projectId, 'lineProjectId', 'estimate', 'Dedicated Intacct project ID is missing.')
  pushRequired(result.apIssues, 'ap', common.customerId, 'lineCustomerId', 'client', 'Client Intacct customer ID is missing.')
}

function appendArLine(
  result: AccountingExportLineBuildResult,
  ctx: ExportContext,
  reviewId: string | null,
  dimensions: CommonDimensions,
  input: {
    sourceType: AccountingExportSourceType
    sourceId: string
    description: string
    quantity: number
    amount: number
    mapping: MappingEntity | null | undefined
    memo?: string | null
    sourceIsUnplanned: boolean
    sourceIsPassThrough: boolean
    issueExtra?: Partial<AccountingReadinessIssue>
  }
) {
  const { itemId, mappingSource } = resolveArItemId(input.mapping)
  if (!itemId) {
    result.arIssues.push(issue('ar', 'itemId', input.sourceType === 'schedule_labor' ? 'schedule_entry' : input.sourceType === 'manual_labor' || input.sourceType === 'per_diem' ? 'labor_entry' : 'line_item', `${input.description} is missing AR item ID mapping.`, input.issueExtra))
  }
  const unit = resolveUnit(input.mapping)
  const line = lineBase('ar', ctx, reviewId, dimensions, input.sourceType, input.sourceId, result.arLines.length + 1, input.description, input.quantity, unit, input.amount, input.sourceIsUnplanned, input.sourceIsPassThrough, dimensions.arPaymentTerms)
  result.arLines.push({
    ...line,
    itemId: itemId || undefined,
    memo: resolveMemo(input.mapping, input.memo),
    mappingSource,
    warnings: [],
  })
}

function appendApLine(
  result: AccountingExportLineBuildResult,
  ctx: ExportContext,
  reviewId: string | null,
  dimensions: CommonDimensions,
  input: {
    sourceType: AccountingExportSourceType
    sourceId: string
    description: string
    quantity: number
    amount: number
    mapping: MappingEntity | null | undefined
    memo?: string | null
    sourceIsUnplanned: boolean
    sourceIsPassThrough: boolean
    legacyCostFallback: boolean
    issueExtra?: Partial<AccountingReadinessIssue>
  }
) {
  const warnings: string[] = []
  const { glAccountNo, mappingSource, warning } = resolveApGlAccountNo(input.mapping)
  if (warning) {
    warnings.push(warning)
    result.apWarnings.push(issue('ap', 'glAccountNo', input.sourceType === 'schedule_labor' ? 'schedule_entry' : input.sourceType === 'manual_labor' || input.sourceType === 'per_diem' ? 'labor_entry' : 'line_item', `${input.description}: ${warning}`, input.issueExtra))
  }
  if (input.legacyCostFallback) {
    const message = `AP cost amount for ${input.description} found from legacy actual_total.`
    warnings.push(message)
    result.apWarnings.push(issue('ap', 'actual_total', input.sourceType === 'manual_labor' || input.sourceType === 'per_diem' ? 'labor_entry' : 'line_item', message, input.issueExtra))
  }
  if (!glAccountNo) {
    result.apIssues.push(issue('ap', 'glAccountNo', input.sourceType === 'schedule_labor' ? 'schedule_entry' : input.sourceType === 'manual_labor' || input.sourceType === 'per_diem' ? 'labor_entry' : 'line_item', `${input.description} is missing AP GL account mapping.`, input.issueExtra))
  }
  const unit = resolveUnit(input.mapping)
  const line = lineBase('ap', ctx, reviewId, dimensions, input.sourceType, input.sourceId, result.apLines.length + 1, input.description, input.quantity, unit, input.amount, input.sourceIsUnplanned, input.sourceIsPassThrough, dimensions.apPaymentTerms)
  result.apLines.push({
    ...line,
    glAccountNo: glAccountNo || undefined,
    memo: resolveMemo(input.mapping, input.memo),
    mappingSource,
    warnings,
  })
}

export async function buildAccountingExportLines(laborLogId: string): Promise<AccountingExportLineBuildResult> {
  const ctx = await getContext(laborLogId)
  const review = await getAccountingReview(laborLogId)
  const result: AccountingExportLineBuildResult = {
    laborLogId,
    estimateId: ctx.estimate.id,
    reviewId: review?.id ?? null,
    isOfficeEvent: ctx.estimate.cost_structure === 'office',
    isEligible: false,
    lines: [],
    arLines: [],
    apLines: [],
    arIssues: [],
    apIssues: [],
    arWarnings: [],
    apWarnings: [],
  }
  const dimensions = resolveAccountingDimensions(ctx)
  addGateIssues(ctx, review?.id ?? null, review?.status, result)

  const [scheduleRows, laborRows, lineRows, actuals, receiptLineItemIds] = await Promise.all([
    getScheduleRows(laborLogId),
    getManualLaborRows(laborLogId),
    getLineRows(laborLogId),
    getActualTotals(laborLogId),
    getReceiptLineItemIds(ctx.estimate.id),
  ])

  for (const entry of scheduleRows) {
    const mapping = { ...entry.rate_card_items, gl_code: entry.gl_code } as MappingEntity
    const rollup = computeScheduleRollup([entry])[0]
    if (!rollup) continue

    const quantity = rollup.actual_days
    const arAmount = roundMoney(rollup.actual_revenue_total)
    const apAmount = roundMoney(rollup.actual_cost_total)
    const description = entry.person_name ? `${entry.role_name} - ${entry.person_name}` : entry.role_name
    const sourceIsPassThrough = isPassThrough(mapping)
    const issueExtra = { scheduleEntryId: entry.id, rateCardItemId: entry.rate_card_item_id || undefined }

    if (isNonZeroAmount(arAmount)) {
      if (quantity <= 0) result.arIssues.push(issue('ar', 'quantity', 'schedule_entry', `${description} is missing AR quantity.`, issueExtra))
      appendArLine(result, ctx, review?.id ?? null, dimensions, {
        sourceType: arAmount < 0 ? 'adjustment' : 'schedule_labor',
        sourceId: entry.id,
        description,
        quantity: quantity || 1,
        amount: arAmount,
        mapping,
        memo: entry.notes,
        sourceIsUnplanned: entry.is_unplanned,
        sourceIsPassThrough,
        issueExtra,
      })
    }

    if (isNonZeroAmount(apAmount)) {
      appendApLine(result, ctx, review?.id ?? null, dimensions, {
        sourceType: apAmount < 0 ? 'adjustment' : 'schedule_labor',
        sourceId: entry.id,
        description,
        quantity: quantity || 1,
        amount: apAmount,
        mapping,
        memo: entry.notes,
        sourceIsUnplanned: entry.is_unplanned,
        sourceIsPassThrough,
        legacyCostFallback: false,
        issueExtra,
      })
    }
  }

  if (scheduleRows.length === 0) {
    for (const entry of laborRows) {
      const actual = actuals.labor.get(entry.id)
      const mapping = { ...entry.rate_card_items, gl_code: entry.gl_code } as MappingEntity
      const arAmount = getLineBillableAmount({ sourceType: 'manual_labor', manualLabor: entry, recapActual: actual })
      const apAmount = getLinePayoutAmount({ sourceType: 'manual_labor', manualLabor: entry, recapActual: actual, mapping })
      const actualCost = getActualCostTotal(actual)
      const days = actual?.actual_days ?? entry.days ?? 1
      const quantity = entry.quantity * days
      const sourceIsPassThrough = isPassThrough(mapping)
      const issueExtra = { laborEntryId: entry.id, rateCardItemId: entry.rate_card_items?.id || undefined }

      if (actualCost != null && actualCost !== 0 && arAmount == null) {
        result.arIssues.push(issue('ar', 'actual_billable_total', 'labor_entry', `Actual cost exists for ${entry.role_name}, but client billable amount could not be safely derived.`, issueExtra))
      }
      if (isNonZeroAmount(arAmount)) {
        appendArLine(result, ctx, review?.id ?? null, dimensions, {
          sourceType: sourceTypeForLabor(entry.role_name, arAmount),
          sourceId: entry.id,
          description: entry.role_name,
          quantity: quantity || 1,
          amount: arAmount,
          mapping,
          memo: entry.notes,
          sourceIsUnplanned: entry.is_unplanned,
          sourceIsPassThrough,
          issueExtra,
        })
      }

      if (actualCost != null && actualCost !== 0 && apAmount == null) {
        result.apIssues.push(issue('ap', 'transAmount', 'labor_entry', `${entry.role_name} is missing an AP cost/payout amount.`, issueExtra))
      }
      if (isNonZeroAmount(apAmount)) {
        appendApLine(result, ctx, review?.id ?? null, dimensions, {
          sourceType: sourceTypeForLabor(entry.role_name, apAmount),
          sourceId: entry.id,
          description: entry.role_name,
          quantity: quantity || 1,
          amount: apAmount,
          mapping,
          memo: entry.notes,
          sourceIsUnplanned: entry.is_unplanned,
          sourceIsPassThrough,
          legacyCostFallback: usesLegacyActualCost(actual),
          issueExtra,
        })
      }
    }
  }

  for (const item of lineRows) {
    const actual = actuals.line.get(item.id)
    const mapping = { ...item.rate_card_items, gl_code: item.gl_code } as MappingEntity
    const arAmount = getLineBillableAmount({ sourceType: 'line_item', lineItem: item, recapActual: actual })
    const apAmount = getLinePayoutAmount({ sourceType: 'line_item', lineItem: item, recapActual: actual, mapping })
    const actualCost = getActualCostTotal(actual)
    const sourceIsPassThrough = isPassThrough(mapping, item.section)
    const quantity = item.quantity || 1
    const issueExtra = { lineItemId: item.id, rateCardItemId: item.rate_card_items?.id || undefined }

    if (sourceIsPassThrough && (isNonZeroAmount(arAmount) || isNonZeroAmount(apAmount)) && !receiptLineItemIds.has(item.id)) {
      const warning = 'Missing receipt backup for pass-through item; accounting approved export with note may be required.'
      result.arWarnings.push(issue('ar', 'receipt_backup', 'line_item', `${item.item_name}: ${warning}`, issueExtra))
      result.apWarnings.push(issue('ap', 'receipt_backup', 'line_item', `${item.item_name}: ${warning}`, issueExtra))
    }

    if (actualCost != null && actualCost !== 0 && arAmount == null) {
      result.arIssues.push(issue('ar', 'actual_billable_total', 'line_item', `Actual cost exists for ${item.item_name}, but client billable amount could not be safely derived.`, issueExtra))
    } else if (item.fee_basis && arAmount == null) {
      result.arIssues.push(issue('ar', 'actual_billable_total', 'line_item', `Missing actual billable amount for ${item.item_name}; fee-basis lines cannot be safely derived from legacy actual cost.`, issueExtra))
    }
    if (isNonZeroAmount(arAmount)) {
      appendArLine(result, ctx, review?.id ?? null, dimensions, {
        sourceType: sourceTypeForLine(item, arAmount),
        sourceId: item.id,
        description: item.item_name,
        quantity,
        amount: arAmount,
        mapping,
        memo: item.notes || item.description,
        sourceIsUnplanned: item.is_unplanned,
        sourceIsPassThrough,
        issueExtra,
      })
    }

    if (actualCost != null && actualCost !== 0 && apAmount == null) {
      result.apIssues.push(issue('ap', 'transAmount', 'line_item', `${item.item_name} is missing an AP cost/payout amount.`, issueExtra))
    }
    if (isNonZeroAmount(apAmount)) {
      appendApLine(result, ctx, review?.id ?? null, dimensions, {
        sourceType: sourceTypeForLine(item, apAmount),
        sourceId: item.id,
        description: item.item_name,
        quantity,
        amount: apAmount,
        mapping,
        memo: item.notes || item.description,
        sourceIsUnplanned: item.is_unplanned,
        sourceIsPassThrough,
        legacyCostFallback: usesLegacyActualCost(actual),
        issueExtra,
      })
    }
  }

  result.lines = [
    ...result.arLines.map((line, index) => ({ ...line, lineNo: index + 1 })),
    ...result.apLines.map((line, index) => ({ ...line, lineNo: index + 1 })),
  ]
  result.arLines = result.lines.filter((line) => line.exportSide === 'ar')
  result.apLines = result.lines.filter((line) => line.exportSide === 'ap')
  result.isEligible = result.isOfficeEvent && result.arIssues.length === 0 && result.apIssues.length === 0

  return result
}

export async function buildArExportLines(laborLogId: string): Promise<AccountingExportLine[]> {
  const result = await buildAccountingExportLines(laborLogId)
  return result.arLines
}

export async function buildApExportLines(laborLogId: string): Promise<AccountingExportLine[]> {
  const result = await buildAccountingExportLines(laborLogId)
  return result.apLines
}
