import { supabase } from './supabase'
import { getAccountingReview } from './accounting-review-service'
import { computeScheduleRollup } from './schedule-service'
import {
  getActualBillableTotal,
  getActualCostTotal,
  usesLegacyActualCost,
} from './accounting-amounts'
import type {
  AccountingReadinessIssue,
  AccountingReadinessSummary,
  AccountingValidationResult,
} from '../types/accounting'
import type { ScheduleEntry } from '../types/schedule'

function requireSupabase() {
  if (!supabase) {
    throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
  }
  return supabase
}

type MappingEntity = {
  id?: string | null
  gl_code?: string | null
  intacct_ar_item_id?: string | null
  intacct_ap_gl_account_no?: string | null
  default_unit?: string | null
  unit_label?: string | null
  accounting_memo?: string | null
  fee_types?: {
    id?: string | null
    gl_code?: string | null
    intacct_ar_item_id?: string | null
    intacct_ap_gl_account_no?: string | null
    default_unit?: string | null
    accounting_memo?: string | null
  } | null
}

type ActualTotals = {
  actual_total: number | null
  actual_cost_total: number | null
  actual_billable_total: number | null
  actual_days: number | null
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

type AccountingContext = {
  laborLog: {
    id: string
    estimate_id: string
    status: string | null
  }
  estimate: {
    id: string
    cost_structure: 'corporate' | 'office'
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

function emptyResult(exportType: 'ap' | 'ar'): AccountingValidationResult {
  return { exportType, isValid: false, missingFields: [], warnings: [] }
}

function addMissing(
  result: AccountingValidationResult,
  field: string,
  source: AccountingReadinessIssue['source'],
  message: string,
  extra: Partial<AccountingReadinessIssue> = {}
) {
  result.missingFields.push({ field, source, message, ...extra })
}

function addWarning(
  result: AccountingValidationResult,
  field: string,
  source: AccountingReadinessIssue['source'],
  message: string,
  extra: Partial<AccountingReadinessIssue> = {}
) {
  result.warnings.push({ field, source, message, ...extra })
}

function requireValue(
  result: AccountingValidationResult,
  value: unknown,
  field: string,
  source: AccountingReadinessIssue['source'],
  message: string
) {
  if (value == null || String(value).trim() === '') addMissing(result, field, source, message)
}

function resolveArItem(mapping: MappingEntity | null | undefined): string | null {
  return mapping?.intacct_ar_item_id || mapping?.fee_types?.intacct_ar_item_id || null
}

function resolveApGl(mapping: MappingEntity | null | undefined): string | null {
  return (
    mapping?.intacct_ap_gl_account_no ||
    mapping?.fee_types?.intacct_ap_gl_account_no ||
    mapping?.gl_code ||
    mapping?.fee_types?.gl_code ||
    null
  )
}

function resolveUnit(mapping: MappingEntity | null | undefined): string | null {
  return mapping?.default_unit || mapping?.fee_types?.default_unit || mapping?.unit_label || 'Each'
}

async function getContext(laborLogId: string): Promise<AccountingContext> {
  const db = requireSupabase()
  const { data: laborLog, error: logErr } = await db
    .from('labor_logs')
    .select('id, estimate_id, status')
    .eq('id', laborLogId)
    .single()
  if (logErr) throw logErr

  const { data: estimate, error: estErr } = await db
    .from('estimates')
    .select(`
      id,
      cost_structure,
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
      ...(estimate as unknown as Omit<AccountingContext['estimate'], 'clients' | 'revenue_segments' | 'office_accounting_profiles'>),
      clients: firstJoin((estimate as unknown as { clients?: AccountingContext['estimate']['clients'] | AccountingContext['estimate']['clients'][] }).clients),
      revenue_segments: firstJoin((estimate as unknown as { revenue_segments?: AccountingContext['estimate']['revenue_segments'] | AccountingContext['estimate']['revenue_segments'][] }).revenue_segments),
      office_accounting_profiles: firstJoin((estimate as unknown as { office_accounting_profiles?: AccountingContext['estimate']['office_accounting_profiles'] | AccountingContext['estimate']['office_accounting_profiles'][] }).office_accounting_profiles),
    },
  }
}

async function validateGate(ctx: AccountingContext, result: AccountingValidationResult): Promise<boolean> {
  if (ctx.estimate.cost_structure !== 'office') {
    addMissing(result, 'cost_structure', 'estimate', 'Only Office Events use Intacct readiness validation.')
    return false
  }

  if (ctx.laborLog.status !== 'export_ready') {
    addMissing(result, 'segment_status', 'segment', 'Segment must be Ready for Intacct Upload.')
  }

  const review = await getAccountingReview(ctx.laborLog.id)
  if (review?.status !== 'approved') {
    addMissing(result, 'accounting_review', 'accounting_review', 'Accounting review must be approved.')
  }

  return result.missingFields.length === 0
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
      day_entries:schedule_day_entries(id, hours, actual_hours),
      rate_card_items(
        id,
        gl_code,
        unit_label,
        intacct_ar_item_id,
        intacct_ap_gl_account_no,
        default_unit,
        accounting_memo,
        fee_types(id, gl_code, intacct_ar_item_id, intacct_ap_gl_account_no, default_unit, accounting_memo)
      )
    `)
    .eq('labor_log_id', laborLogId)
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
      rate_card_items(
        id,
        gl_code,
        unit_label,
        intacct_ar_item_id,
        intacct_ap_gl_account_no,
        default_unit,
        accounting_memo,
        fee_types(id, gl_code, intacct_ar_item_id, intacct_ap_gl_account_no, default_unit, accounting_memo)
      )
    `)
    .eq('labor_log_id', laborLogId)
  if (error) throw error
  return ((data || []) as unknown as Array<{
    id: string
    role_name: string
    rate_card_item_id: string | null
    is_unplanned: boolean
    quantity: number
    days: number
    unit_rate: number
    cost_rate: number | null
    gl_code: string | null
    rate_card_items?: MappingEntity | MappingEntity[] | null
  }>).map((row) => ({
    ...row,
    rate_card_items: normalizeMapping(row.rate_card_items),
  }))
}

async function getLineRows(laborLogId: string) {
  const db = requireSupabase()
  const { data, error } = await db
    .from('estimate_line_items')
    .select(`
      id,
      item_name,
      rate_card_item_id,
      section,
      is_unplanned,
      fee_basis,
      quantity,
      unit_cost,
      markup_pct,
      gl_code,
      rate_card_items(
        id,
        gl_code,
        unit_label,
        intacct_ar_item_id,
        intacct_ap_gl_account_no,
        default_unit,
        accounting_memo,
        fee_types(id, gl_code, intacct_ar_item_id, intacct_ap_gl_account_no, default_unit, accounting_memo)
      )
    `)
    .eq('labor_log_id', laborLogId)
  if (error) throw error
  return ((data || []) as unknown as Array<{
    id: string
    item_name: string
    rate_card_item_id: string | null
    section: string | null
    is_unplanned: boolean
    fee_basis: string | null
    quantity: number
    unit_cost: number
    markup_pct: number
    gl_code: string | null
    rate_card_items?: MappingEntity | MappingEntity[] | null
  }>).map((row) => ({
    ...row,
    rate_card_items: normalizeMapping(row.rate_card_items),
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

function resolveCommon(ctx: AccountingContext) {
  const client = ctx.estimate.clients
  const office = ctx.estimate.office_accounting_profiles
  return {
    customerId: ctx.estimate.accounting_customer_id || client?.intacct_customer_id || null,
    arPaymentTerms: ctx.estimate.accounting_payment_terms || client?.default_payment_terms || null,
    apPaymentTerms: ctx.estimate.accounting_payment_terms || office?.default_payment_terms || client?.default_payment_terms || null,
    departmentId: ctx.estimate.accounting_department_id || client?.default_department_id || office?.default_department_id || null,
    locationId: ctx.estimate.accounting_location_id || client?.default_location_id || office?.default_location_id || null,
    projectId: ctx.estimate.intacct_project_id || null,
    vendorId: office?.intacct_vendor_id || null,
  }
}

export async function validateApReadiness(laborLogId: string): Promise<AccountingValidationResult> {
  const ctx = await getContext(laborLogId)
  const result = emptyResult('ap')
  await validateGate(ctx, result)
  if (ctx.estimate.cost_structure !== 'office') {
    result.isValid = false
    return result
  }

  const common = resolveCommon(ctx)
  requireValue(result, ctx.estimate.office_accounting_profile_id, 'office_accounting_profile_id', 'estimate', 'Select an office accounting profile.')
  requireValue(result, common.vendorId, 'vendorId', 'office_profile', 'Office profile is missing Intacct vendor ID.')
  requireValue(result, common.apPaymentTerms, 'paymentTerms', 'office_profile', 'AP payment terms are missing.')
  requireValue(result, common.departmentId, 'lineDepartmentId', 'estimate', 'Department dimension is missing.')
  requireValue(result, common.locationId, 'lineLocationId', 'estimate', 'Location dimension is missing.')
  requireValue(result, common.projectId, 'lineProjectId', 'estimate', 'Dedicated Intacct project ID is missing.')
  requireValue(result, common.customerId, 'lineCustomerId', 'client', 'Client Intacct customer ID is missing.')

  const [scheduleRows, laborRows, lineRows, actuals] = await Promise.all([
    getScheduleRows(laborLogId),
    getManualLaborRows(laborLogId),
    getLineRows(laborLogId),
    getActualTotals(laborLogId),
  ])

  if (scheduleRows.length > 0) {
    for (const entry of scheduleRows) {
      const amount = computeScheduleRollup([entry]).reduce((sum, row) => sum + row.actual_cost_total, 0)
      if (amount == null || amount <= 0) continue
      const mapping = { ...entry.rate_card_items, gl_code: entry.gl_code } as MappingEntity
      if (!resolveApGl(mapping)) {
        addMissing(result, 'glAccountNo', 'schedule_entry', `${entry.role_name} is missing AP GL account mapping.`, {
          scheduleEntryId: entry.id,
          rateCardItemId: entry.rate_card_item_id || undefined,
        })
      }
      if (amount <= 0) {
        addMissing(result, 'transAmount', 'schedule_entry', `${entry.role_name} is missing an AP amount.`, { scheduleEntryId: entry.id })
      }
    }
  } else {
    for (const entry of laborRows) {
      const actual = actuals.labor.get(entry.id)
      const amount = getActualCostTotal(actual) ?? entry.quantity * entry.days * (entry.cost_rate || 0)
      if (amount == null || amount <= 0) continue
      if (usesLegacyActualCost(actual)) {
        addWarning(result, 'actual_total', 'labor_entry', `AP cost amount for ${entry.role_name} found from legacy actual_total.`, {
          laborEntryId: entry.id,
          rateCardItemId: entry.rate_card_items?.id || undefined,
        })
      }
      const mapping = { ...entry.rate_card_items, gl_code: entry.gl_code } as MappingEntity
      if (!resolveApGl(mapping)) {
        addMissing(result, 'glAccountNo', 'labor_entry', `${entry.role_name} is missing AP GL account mapping.`, {
          laborEntryId: entry.id,
          rateCardItemId: entry.rate_card_items?.id || undefined,
        })
      }
    }
  }

  for (const item of lineRows) {
    const actual = actuals.line.get(item.id)
    const amount = getActualCostTotal(actual) ?? item.quantity * item.unit_cost
    if (amount == null || amount <= 0) continue
    if (usesLegacyActualCost(actual)) {
      addWarning(result, 'actual_total', 'line_item', `AP cost amount for ${item.item_name} found from legacy actual_total.`, {
        lineItemId: item.id,
        rateCardItemId: item.rate_card_items?.id || undefined,
      })
    }
    const mapping = { ...item.rate_card_items, gl_code: item.gl_code } as MappingEntity
    if (!resolveApGl(mapping)) {
      addMissing(result, 'glAccountNo', 'line_item', `${item.item_name} is missing AP GL account mapping.`, {
        lineItemId: item.id,
        rateCardItemId: item.rate_card_items?.id || undefined,
      })
    }
  }

  result.isValid = result.missingFields.length === 0
  return result
}

export async function validateArReadiness(laborLogId: string): Promise<AccountingValidationResult> {
  const ctx = await getContext(laborLogId)
  const result = emptyResult('ar')
  await validateGate(ctx, result)
  if (ctx.estimate.cost_structure !== 'office') {
    result.isValid = false
    return result
  }

  const common = resolveCommon(ctx)
  requireValue(result, common.customerId, 'customerId', 'client', 'Client Intacct customer ID is missing.')
  requireValue(result, common.arPaymentTerms, 'paymentTerms', 'client', 'AR payment terms are missing.')
  requireValue(result, common.departmentId, 'lineDepartmentId', 'estimate', 'Department dimension is missing.')
  requireValue(result, common.locationId, 'lineLocationId', 'estimate', 'Location dimension is missing.')
  requireValue(result, common.projectId, 'lineProjectId', 'estimate', 'Dedicated Intacct project ID is missing.')
  requireValue(result, ctx.estimate.revenue_segment_id, 'revenue_segment_id', 'estimate', 'Revenue segment must be selected.')
  requireValue(result, ctx.estimate.event_city, 'event_city', 'estimate', 'Event city is required.')
  requireValue(result, ctx.estimate.event_state, 'event_state', 'estimate', 'Event state is required.')

  const [scheduleRows, laborRows, lineRows, actuals] = await Promise.all([
    getScheduleRows(laborLogId),
    getManualLaborRows(laborLogId),
    getLineRows(laborLogId),
    getActualTotals(laborLogId),
  ])

  if (scheduleRows.length > 0) {
    for (const entry of scheduleRows) {
      const rollup = computeScheduleRollup([entry])
      const amount = rollup.reduce((sum, row) => sum + row.actual_revenue_total, 0)
      const quantity = rollup.reduce((sum, row) => sum + row.actual_days, 0)
      if (amount == null || amount <= 0) continue
      if (!resolveArItem(entry.rate_card_items)) {
        addMissing(result, 'itemId', 'schedule_entry', `${entry.role_name} is missing AR item ID mapping.`, {
          scheduleEntryId: entry.id,
          rateCardItemId: entry.rate_card_item_id || undefined,
        })
      }
      if (quantity <= 0) addMissing(result, 'quantity', 'schedule_entry', `${entry.role_name} is missing AR quantity.`, { scheduleEntryId: entry.id })
      if (!resolveUnit(entry.rate_card_items)) addMissing(result, 'unit', 'schedule_entry', `${entry.role_name} is missing AR unit.`, { scheduleEntryId: entry.id })
      if (entry.day_rate <= 0) addMissing(result, 'price', 'schedule_entry', `${entry.role_name} is missing AR price.`, { scheduleEntryId: entry.id })
    }
  } else {
    for (const entry of laborRows) {
      const actual = actuals.labor.get(entry.id)
      const amount = getActualBillableTotal({ sourceType: 'manual_labor', source: entry }, actual)
      const actualCost = getActualCostTotal(actual)
      if (actualCost != null && actualCost > 0 && amount == null) {
        addMissing(result, 'actual_billable_total', 'labor_entry', `Actual cost exists for ${entry.role_name}, but client billable amount could not be safely derived.`, {
          laborEntryId: entry.id,
          rateCardItemId: entry.rate_card_items?.id || undefined,
        })
        continue
      }
      if (amount == null || amount <= 0) continue
      if (!resolveArItem(entry.rate_card_items)) {
        addMissing(result, 'itemId', 'labor_entry', `${entry.role_name} is missing AR item ID mapping.`, {
          laborEntryId: entry.id,
          rateCardItemId: entry.rate_card_items?.id || undefined,
        })
      }
      if (entry.quantity <= 0 || entry.days <= 0) addMissing(result, 'quantity', 'labor_entry', `${entry.role_name} is missing AR quantity.`, { laborEntryId: entry.id })
      if (!resolveUnit(entry.rate_card_items)) addMissing(result, 'unit', 'labor_entry', `${entry.role_name} is missing AR unit.`, { laborEntryId: entry.id })
      if (entry.unit_rate <= 0) addMissing(result, 'price', 'labor_entry', `${entry.role_name} is missing AR price.`, { laborEntryId: entry.id })
    }
  }

  for (const item of lineRows) {
    const actual = actuals.line.get(item.id)
    const amount = getActualBillableTotal({ sourceType: 'line_item', source: item }, actual)
    const actualCost = getActualCostTotal(actual)
    if (actualCost != null && actualCost > 0 && amount == null) {
      addMissing(result, 'actual_billable_total', 'line_item', `Actual cost exists for ${item.item_name}, but client billable amount could not be safely derived.`, {
        lineItemId: item.id,
        rateCardItemId: item.rate_card_items?.id || undefined,
      })
      continue
    }
    if (amount == null || amount <= 0) continue
    if (!resolveArItem(item.rate_card_items)) {
      addMissing(result, 'itemId', 'line_item', `${item.item_name} is missing AR item ID mapping.`, {
        lineItemId: item.id,
        rateCardItemId: item.rate_card_items?.id || undefined,
      })
    }
    if (item.quantity <= 0) addMissing(result, 'quantity', 'line_item', `${item.item_name} is missing AR quantity.`, { lineItemId: item.id })
    if (!resolveUnit(item.rate_card_items)) addMissing(result, 'unit', 'line_item', `${item.item_name} is missing AR unit.`, { lineItemId: item.id })
    if (item.unit_cost <= 0 && amount <= 0) addMissing(result, 'price', 'line_item', `${item.item_name} is missing AR price.`, { lineItemId: item.id })
  }

  result.isValid = result.missingFields.length === 0
  return result
}

export async function validateIntacctReadiness(laborLogId: string): Promise<AccountingReadinessSummary> {
  return getAccountingReadinessSummary(laborLogId)
}

export async function getAccountingReadinessSummary(laborLogId: string): Promise<AccountingReadinessSummary> {
  const ctx = await getContext(laborLogId)
  const [ap, ar] = await Promise.all([
    validateApReadiness(laborLogId),
    validateArReadiness(laborLogId),
  ])
  return {
    laborLogId,
    isOfficeEvent: ctx.estimate.cost_structure === 'office',
    ap,
    ar,
    isReady: ap.isValid && ar.isValid,
  }
}
