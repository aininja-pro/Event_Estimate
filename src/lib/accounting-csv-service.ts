import type {
  AccountingCsvBuildResult,
  AccountingCsvDownloadResult,
  AccountingExportAuditType,
  AccountingExportLine,
  AccountingExportLineBuildResult,
  AccountingExportRecord,
  AccountingExportType,
  AccountingReadinessIssue,
} from '../types/accounting'
import { hasPermission } from './permissions'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const LOCAL_FILE_SAVE_ENABLED = import.meta.env.VITE_ENABLE_LOCAL_FILE_SAVE === 'true'

export const AP_BILL_UPLOAD_HEADERS = [
  'billDate',
  'vendorId',
  'billNo',
  'glPostingDate',
  'referenceNo',
  'description',
  'paymentTerms',
  'dueDate',
  'lineNo',
  'glAccountNo',
  'transAmount',
  'memo',
  'lineDepartmentId',
  'lineLocationId',
  'lineProjectId',
  'lineCustomerId',
] as const

export const AR_INVOICE_UPLOAD_HEADERS = [
  'transactionType',
  'transactionDate',
  'customerId',
  'glPostingDate',
  'paymentTerms',
  'referenceNo',
  'message',
  'baseCurrency',
  'transCurrency',
  'exchRateType',
  'lineNo',
  'itemId',
  'quantity',
  'unit',
  'price',
  'memo',
  'lineprojectId',
  'lineDepartmentId',
  'lineLocationId',
] as const

type SegmentCsvContext = {
  estimateId: string
  laborLogId: string
  eventName: string
  clientName: string
  clientCode: string | null
  poNumber: string | null
  projectId: string | null
  intacctProjectId: string | null
  locationName: string
  defaultCurrency: string | null
  defaultExchangeRateType: string | null
}

type ExportAuditInsert = {
  estimate_id: string
  labor_log_id: string
  accounting_review_id: string | null
  export_type: AccountingExportAuditType
  file_name: string
  row_count: number
  generated_by: string
  checksum: string | null
  warnings: AccountingReadinessIssue[] | null
  metadata: Record<string, unknown> | null
}

export interface ApBillCsvOptions {
  billDate?: string
  billNo?: string
  referenceNo?: string
  dueDate?: string
  filenameDate?: string
  repeatHeaderFields?: boolean
}

export interface ArInvoiceCsvOptions {
  transactionType?: string
  transactionDate?: string
  referenceNo?: string
  message?: string
  baseCurrency?: string
  transCurrency?: string
  exchRateType?: string
  filenameDate?: string
  repeatInvoiceFields?: boolean
}

async function getSupabaseClient() {
  const { supabase } = await import('./supabase')
  if (!supabase) {
    throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
  }
  return supabase
}

function csvEscape(value: unknown): string {
  if (value == null) return ''
  const text = String(value)
  if (/[",\r\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`
  }
  return text
}

function serializeRows(headers: readonly string[], rows: Array<Record<string, unknown>>): string {
  return [
    headers.join(','),
    ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(',')),
  ].join('\n')
}

function dateOnly(value: string | null | undefined): string {
  if (!value) return ''
  return value.slice(0, 10)
}

/**
 * Derive an AP bill due date from its payment terms.
 *
 * Only the AP template carries an explicit `dueDate` column; the AR invoice
 * template sends `paymentTerms` and lets Intacct derive the date itself, which
 * is why there is no AR equivalent of this.
 *
 * Terms arrive as free text from Intacct's own customer/vendor records
 * ("Net 30", "Net 45", "Net 60"), so the day count is parsed rather than looked
 * up. Anything unparseable returns '' — a blank due date is a visible gap an
 * accountant can fill, where a guessed date silently posts a wrong one.
 *
 * Arithmetic is UTC-only: the input is a plain `YYYY-MM-DD` with no timezone,
 * and local-time date maths would shift the result by a day either side of
 * midnight depending on where the exporter runs.
 */
export function dueDateFromTerms(isoDate: string, terms: string | null | undefined): string {
  if (!isoDate || !terms) return ''
  const match = /(\d+)/.exec(terms)
  if (!match) return ''
  const days = Number(match[1])
  if (!Number.isFinite(days)) return ''
  const parsed = new Date(`${isoDate.slice(0, 10)}T00:00:00Z`)
  if (Number.isNaN(parsed.getTime())) return ''
  parsed.setUTCDate(parsed.getUTCDate() + days)
  return parsed.toISOString().slice(0, 10)
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

function formatNumber(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return ''
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/\.?0+$/, '')
}

function formatMoney(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return ''
  return value.toFixed(2)
}

function linePrice(line: AccountingExportLine): number {
  if (line.unitPrice != null && Number.isFinite(line.unitPrice)) return line.unitPrice
  if (line.quantity !== 0 && Number.isFinite(line.quantity)) return line.amount / line.quantity
  return line.amount
}

function sanitizeFilenamePart(value: string | null | undefined): string {
  const text = (value || 'Export').trim()
  return text
    .replace(/[^a-zA-Z0-9._-]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 80) || 'Export'
}

function buildReferenceNo(ctx: SegmentCsvContext | null | undefined, fallback?: string): string {
  return fallback || ctx?.poNumber || ctx?.projectId || ctx?.intacctProjectId || ctx?.eventName || ''
}

function buildBillNo(ctx: SegmentCsvContext | null | undefined, date: string, fallback?: string): string {
  if (fallback) return fallback
  const eventPart = sanitizeFilenamePart(ctx?.eventName || ctx?.estimateId || 'Estimate').slice(0, 24)
  const segmentPart = sanitizeFilenamePart(ctx?.locationName || 'Segment').slice(0, 18)
  return `AP-${eventPart}-${segmentPart}-${date}`
}

function buildFilename(kind: 'AP_Bill_Upload' | 'AR_Invoice_Upload', ctx: SegmentCsvContext | null | undefined, date: string): string {
  const clientOrEstimate = sanitizeFilenamePart(ctx?.clientCode || ctx?.clientName || ctx?.eventName || ctx?.estimateId || 'Estimate')
  const segment = sanitizeFilenamePart(ctx?.locationName || ctx?.laborLogId || 'Segment')
  return `${kind}_${clientOrEstimate}_${segment}_${date}.csv`
}

function contextlessFilename(kind: 'AP_Bill_Upload' | 'AR_Invoice_Upload', date: string): string {
  return `${kind}_${date}.csv`
}

function issue(field: string, exportType: AccountingExportType, message: string): AccountingReadinessIssue {
  return { exportType, field, source: 'export_line', message }
}

function validateApLine(line: AccountingExportLine): AccountingReadinessIssue[] {
  const issues: AccountingReadinessIssue[] = []
  if (!line.vendorId) issues.push(issue('vendorId', 'ap', `${line.description} is missing vendorId.`))
  if (!line.glAccountNo) issues.push(issue('glAccountNo', 'ap', `${line.description} is missing glAccountNo.`))
  if (!line.departmentId) issues.push(issue('lineDepartmentId', 'ap', `${line.description} is missing department dimension.`))
  if (!line.locationId) issues.push(issue('lineLocationId', 'ap', `${line.description} is missing location dimension.`))
  if (!line.projectId) issues.push(issue('lineProjectId', 'ap', `${line.description} is missing project dimension.`))
  if (!line.customerId) issues.push(issue('lineCustomerId', 'ap', `${line.description} is missing customer dimension.`))
  if (!Number.isFinite(line.amount) || line.amount === 0) issues.push(issue('transAmount', 'ap', `${line.description} is missing AP amount.`))
  return issues
}

function validateArLine(line: AccountingExportLine): AccountingReadinessIssue[] {
  const issues: AccountingReadinessIssue[] = []
  if (!line.customerId) issues.push(issue('customerId', 'ar', `${line.description} is missing customerId.`))
  if (!line.itemId) issues.push(issue('itemId', 'ar', `${line.description} is missing itemId.`))
  if (!line.departmentId) issues.push(issue('lineDepartmentId', 'ar', `${line.description} is missing department dimension.`))
  if (!line.locationId) issues.push(issue('lineLocationId', 'ar', `${line.description} is missing location dimension.`))
  if (!line.projectId) issues.push(issue('lineprojectId', 'ar', `${line.description} is missing project dimension.`))
  if (!Number.isFinite(line.quantity) || line.quantity === 0) issues.push(issue('quantity', 'ar', `${line.description} is missing AR quantity.`))
  if (!Number.isFinite(line.amount) || line.amount === 0) issues.push(issue('price', 'ar', `${line.description} is missing AR amount.`))
  return issues
}

export function serializeApBillCsv(lines: AccountingExportLine[], options: ApBillCsvOptions & { context?: SegmentCsvContext } = {}): string {
  const apLines = lines.filter((line) => line.exportSide === 'ap')
  const first = apLines[0]
  const billDate = dateOnly(options.billDate || first?.transactionDate) || todayIso()
  const referenceNo = buildReferenceNo(options.context, options.referenceNo)
  const billNo = buildBillNo(options.context, billDate, options.billNo)
  const repeatHeaderFields = options.repeatHeaderFields ?? true

  const rows = apLines.map((line, index) => {
    const includeHeader = repeatHeaderFields || index === 0
    return {
      billDate: includeHeader ? billDate : '',
      vendorId: includeHeader ? line.vendorId || '' : '',
      billNo: includeHeader ? billNo : '',
      glPostingDate: includeHeader ? dateOnly(line.glPostingDate) : '',
      referenceNo: includeHeader ? referenceNo : '',
      description: includeHeader ? line.description : '',
      paymentTerms: includeHeader ? line.paymentTerms || '' : '',
      // An explicit due date always wins. Otherwise derive it from the payment
      // terms, which are now populated on every client and office profile.
      // Previously this column exported blank on every bill.
      dueDate: includeHeader
        ? dateOnly(options.dueDate || line.dueDate) || dueDateFromTerms(billDate, line.paymentTerms)
        : '',
      lineNo: index + 1,
      glAccountNo: line.glAccountNo || '',
      transAmount: formatMoney(line.amount),
      memo: line.memo || '',
      lineDepartmentId: line.departmentId,
      lineLocationId: line.locationId,
      lineProjectId: line.projectId,
      lineCustomerId: line.customerId,
    }
  })

  return serializeRows(AP_BILL_UPLOAD_HEADERS, rows)
}

export function serializeArInvoiceCsv(lines: AccountingExportLine[], options: ArInvoiceCsvOptions & { context?: SegmentCsvContext } = {}): string {
  const arLines = lines.filter((line) => line.exportSide === 'ar')
  const first = arLines[0]
  const transactionDate = dateOnly(options.transactionDate || first?.transactionDate) || todayIso()
  const referenceNo = buildReferenceNo(options.context, options.referenceNo)
  const baseCurrency = options.baseCurrency || options.context?.defaultCurrency || 'USD'
  const transCurrency = options.transCurrency || options.context?.defaultCurrency || 'USD'
  const exchRateType = options.exchRateType || options.context?.defaultExchangeRateType || 'Intacct Daily Rate'
  const repeatInvoiceFields = options.repeatInvoiceFields ?? false

  const rows = arLines.map((line, index) => {
    const includeInvoice = repeatInvoiceFields || index === 0
    const quantity = line.quantity || 1
    return {
      transactionType: includeInvoice ? options.transactionType || 'Sales Invoice' : '',
      transactionDate: includeInvoice ? transactionDate : '',
      customerId: includeInvoice ? line.customerId : '',
      glPostingDate: includeInvoice ? dateOnly(line.glPostingDate) : '',
      paymentTerms: includeInvoice ? line.paymentTerms || '' : '',
      referenceNo: includeInvoice ? referenceNo : '',
      message: includeInvoice ? options.message || '' : '',
      baseCurrency: includeInvoice ? baseCurrency : '',
      transCurrency: includeInvoice ? transCurrency : '',
      exchRateType: includeInvoice ? exchRateType : '',
      lineNo: index + 1,
      itemId: line.itemId || '',
      quantity: formatNumber(quantity),
      unit: line.unit,
      price: formatMoney(linePrice({ ...line, quantity })),
      memo: line.memo || '',
      lineprojectId: line.projectId,
      lineDepartmentId: line.departmentId,
      lineLocationId: line.locationId,
    }
  })

  return serializeRows(AR_INVOICE_UPLOAD_HEADERS, rows)
}

async function getSegmentCsvContext(laborLogId: string): Promise<SegmentCsvContext> {
  const db = await getSupabaseClient()
  const { data: laborLog, error: logErr } = await db
    .from('labor_logs')
    .select('id, estimate_id, location_name')
    .eq('id', laborLogId)
    .single()
  if (logErr) throw logErr

  const { data: estimate, error: estErr } = await db
    .from('estimates')
    .select(`
      id,
      event_name,
      po_number,
      project_id,
      intacct_project_id,
      clients(name, code, default_currency, default_exchange_rate_type)
    `)
    .eq('id', laborLog.estimate_id)
    .single()
  if (estErr) throw estErr

  const client = Array.isArray(estimate.clients) ? estimate.clients[0] : estimate.clients
  return {
    estimateId: estimate.id,
    laborLogId,
    eventName: estimate.event_name || 'Estimate',
    clientName: client?.name || 'Client',
    clientCode: client?.code || null,
    poNumber: estimate.po_number || null,
    projectId: estimate.project_id || null,
    intacctProjectId: estimate.intacct_project_id || null,
    locationName: laborLog.location_name || 'Segment',
    defaultCurrency: client?.default_currency || null,
    defaultExchangeRateType: client?.default_exchange_rate_type || null,
  }
}

function emptyBlockedResult(filename: string, warnings: AccountingReadinessIssue[], blockingIssues: AccountingReadinessIssue[]): AccountingCsvBuildResult {
  return { csvText: '', filename, rowCount: 0, warnings, blockingIssues }
}

function auditTypeFor(exportType: AccountingExportType): AccountingExportAuditType {
  return exportType === 'ap' ? 'ap_bill' : 'ar_invoice'
}

async function buildLineResult(laborLogId: string): Promise<AccountingExportLineBuildResult> {
  const { buildAccountingExportLines } = await import('./accounting-export-line-service')
  return buildAccountingExportLines(laborLogId)
}

async function getUserRole(userId: string): Promise<string | null> {
  const db = await getSupabaseClient()
  const { data, error } = await db
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()
  if (error) throw error
  return data?.role ?? null
}

async function checksumCsv(csvText: string): Promise<string | null> {
  if (!globalThis.crypto?.subtle) return null
  const bytes = new TextEncoder().encode(csvText)
  const hash = await globalThis.crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(hash)).map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

function triggerCsvDownload(csvText: string, filename: string) {
  const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.setTimeout(() => URL.revokeObjectURL(url), 60000)
}

async function saveCsvToLocalDownloads(csvText: string, filename: string): Promise<string | null> {
  if (!LOCAL_FILE_SAVE_ENABLED) return null
  try {
    const res = await fetch(`${API_URL}/api/local-files/save-csv`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename, csv_text: csvText }),
    })
    if (!res.ok) return null
    const data = await res.json()
    return typeof data.path === 'string' ? data.path : null
  } catch {
    return null
  }
}

function buildExportMetadata(
  exportType: AccountingExportType,
  lineResult: AccountingExportLineBuildResult,
  lines: AccountingExportLine[]
): Record<string, unknown> {
  const first = lines[0]
  return {
    exportType,
    statusAtExport: 'export_ready',
    reviewId: lineResult.reviewId,
    customerId: first?.customerId ?? null,
    vendorId: exportType === 'ap' ? first?.vendorId ?? null : null,
    projectId: first?.projectId ?? null,
    lineSourceTypes: Array.from(new Set(lines.map((line) => line.sourceType))),
  }
}

export async function getAccountingExports(laborLogId: string): Promise<AccountingExportRecord[]> {
  const db = await getSupabaseClient()
  const { data, error } = await db
    .from('accounting_exports')
    .select(`
      id,
      estimate_id,
      labor_log_id,
      accounting_review_id,
      export_type,
      file_name,
      row_count,
      generated_by,
      generated_at,
      checksum,
      warnings,
      metadata,
      created_at,
      generated_by_profile:profiles!accounting_exports_generated_by_fkey(full_name, email)
    `)
    .eq('labor_log_id', laborLogId)
    .order('generated_at', { ascending: false })
    .limit(20)
  if (error) throw error
  return (data || []).map((row) => ({
    ...(row as Omit<AccountingExportRecord, 'generated_by_profile'>),
    generated_by_profile: Array.isArray(row.generated_by_profile) ? row.generated_by_profile[0] ?? null : row.generated_by_profile,
  })) as AccountingExportRecord[]
}

export async function recordAccountingExport(input: ExportAuditInsert): Promise<AccountingExportRecord> {
  const db = await getSupabaseClient()
  const { data, error } = await db
    .from('accounting_exports')
    .insert(input)
    .select(`
      id,
      estimate_id,
      labor_log_id,
      accounting_review_id,
      export_type,
      file_name,
      row_count,
      generated_by,
      generated_at,
      checksum,
      warnings,
      metadata,
      created_at,
      generated_by_profile:profiles!accounting_exports_generated_by_fkey(full_name, email)
    `)
    .single()
  if (error) throw error
  return {
    ...(data as Omit<AccountingExportRecord, 'generated_by_profile'>),
    generated_by_profile: Array.isArray(data.generated_by_profile) ? data.generated_by_profile[0] ?? null : data.generated_by_profile,
  } as AccountingExportRecord
}

export async function buildAccountingCsvForSegment(
  laborLogId: string,
  exportType: AccountingExportType,
  options: ApBillCsvOptions | ArInvoiceCsvOptions = {},
): Promise<AccountingCsvBuildResult> {
  const [lineResult, context] = await Promise.all([
    buildLineResult(laborLogId),
    getSegmentCsvContext(laborLogId),
  ])

  const date = (options.filenameDate || todayIso()).slice(0, 10)
  const filename = buildFilename(exportType === 'ap' ? 'AP_Bill_Upload' : 'AR_Invoice_Upload', context, date)
  const lines = exportType === 'ap' ? lineResult.apLines : lineResult.arLines
  const builderIssues = exportType === 'ap' ? lineResult.apIssues : lineResult.arIssues
  const warnings = exportType === 'ap' ? lineResult.apWarnings : lineResult.arWarnings
  const lineIssues = lines.flatMap((line) => exportType === 'ap' ? validateApLine(line) : validateArLine(line))
  const blockingIssues = [...builderIssues, ...lineIssues]

  if (blockingIssues.length > 0) {
    return emptyBlockedResult(filename, warnings, blockingIssues)
  }

  if (lines.length === 0) {
    return emptyBlockedResult(filename, warnings, [
      issue('lines', exportType, `No ${exportType.toUpperCase()} export lines were generated for this segment.`),
    ])
  }

  const csvText = exportType === 'ap'
    ? serializeApBillCsv(lines, { ...(options as ApBillCsvOptions), context })
    : serializeArInvoiceCsv(lines, { ...(options as ArInvoiceCsvOptions), context })

  return {
    csvText,
    filename,
    rowCount: lines.length,
    warnings,
    blockingIssues: [],
  }
}

export async function buildApBillCsvForSegment(laborLogId: string, options: ApBillCsvOptions = {}): Promise<AccountingCsvBuildResult> {
  return buildAccountingCsvForSegment(laborLogId, 'ap', options)
}

export async function buildArInvoiceCsvForSegment(laborLogId: string, options: ArInvoiceCsvOptions = {}): Promise<AccountingCsvBuildResult> {
  return buildAccountingCsvForSegment(laborLogId, 'ar', options)
}

export function buildAccountingCsvFilename(exportType: AccountingExportType, date = todayIso()): string {
  return contextlessFilename(exportType === 'ap' ? 'AP_Bill_Upload' : 'AR_Invoice_Upload', date)
}

export async function buildAndRecordAccountingCsvForSegment(
  laborLogId: string,
  exportType: AccountingExportType,
  userId: string,
  options: ApBillCsvOptions | ArInvoiceCsvOptions = {},
): Promise<AccountingCsvDownloadResult> {
  const role = await getUserRole(userId)
  if (!role || !hasPermission(role, 'export_intacct_csv')) {
    return {
      csvText: '',
      filename: buildAccountingCsvFilename(exportType),
      rowCount: 0,
      warnings: [],
      blockingIssues: [issue('permission', exportType, 'You do not have permission to generate Intacct upload CSVs.')],
      auditRecordId: null,
    }
  }

  const [lineResult, csvResult] = await Promise.all([
    buildLineResult(laborLogId),
    buildAccountingCsvForSegment(laborLogId, exportType, options),
  ])
  if (csvResult.blockingIssues.length > 0 || !csvResult.csvText) {
    return { ...csvResult, auditRecordId: null }
  }

  const lines = exportType === 'ap' ? lineResult.apLines : lineResult.arLines
  const audit = await recordAccountingExport({
    estimate_id: lineResult.estimateId || lines[0]?.estimateId,
    labor_log_id: laborLogId,
    accounting_review_id: lineResult.reviewId,
    export_type: auditTypeFor(exportType),
    file_name: csvResult.filename,
    row_count: csvResult.rowCount,
    generated_by: userId,
    checksum: await checksumCsv(csvResult.csvText),
    warnings: csvResult.warnings.length > 0 ? csvResult.warnings : null,
    metadata: buildExportMetadata(exportType, lineResult, lines),
  })

  return { ...csvResult, auditRecordId: audit.id }
}

export async function downloadAccountingCsvForSegment(
  laborLogId: string,
  exportType: AccountingExportType,
  userId: string,
  options: ApBillCsvOptions | ArInvoiceCsvOptions = {},
): Promise<AccountingCsvDownloadResult> {
  const role = await getUserRole(userId)
  if (!role || !hasPermission(role, 'export_intacct_csv')) {
    return {
      csvText: '',
      filename: buildAccountingCsvFilename(exportType),
      rowCount: 0,
      warnings: [],
      blockingIssues: [issue('permission', exportType, 'You do not have permission to generate Intacct upload CSVs.')],
      auditRecordId: null,
      savedPath: null,
    }
  }

  const [lineResult, result] = await Promise.all([
    buildLineResult(laborLogId),
    buildAccountingCsvForSegment(laborLogId, exportType, options),
  ])
  let savedPath: string | null = null
  if (result.csvText && result.blockingIssues.length === 0) {
    savedPath = await saveCsvToLocalDownloads(result.csvText, result.filename)
    triggerCsvDownload(result.csvText, result.filename)
    const lines = exportType === 'ap' ? lineResult.apLines : lineResult.arLines
    const audit = await recordAccountingExport({
      estimate_id: lineResult.estimateId || lines[0]?.estimateId,
      labor_log_id: laborLogId,
      accounting_review_id: lineResult.reviewId,
      export_type: auditTypeFor(exportType),
      file_name: result.filename,
      row_count: result.rowCount,
      generated_by: userId,
      checksum: await checksumCsv(result.csvText),
      warnings: result.warnings.length > 0 ? result.warnings : null,
      metadata: buildExportMetadata(exportType, lineResult, lines),
    })
    return { ...result, auditRecordId: audit.id, savedPath }
  }
  return { ...result, auditRecordId: null, savedPath }
}
