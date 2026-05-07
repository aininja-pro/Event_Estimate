import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { Link, useParams, Navigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Trash2,
  Send,
  Search,
  Check,
  Plus,
  ChevronUp,
  ChevronDown,
  Calendar,
  Sparkles,
  PanelRightClose,
  X,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Download,
} from 'lucide-react'
import { ScheduleGrid } from '@/components/schedule/ScheduleGrid'
import { EstimateStatusBar } from '@/components/EstimateStatusBar'
import { VersionHistoryPanel, HistoryButton } from '@/components/VersionHistoryPanel'
import { ApprovalBanner } from '@/components/ApprovalBanner'
import { SegmentTransitionBar } from '@/components/segments/SegmentTransitionBar'
import {
  getLatestClientApprovalToken,
  sendClientApproval,
  type ClientApprovalToken,
} from '@/lib/client-approval-service'
import { getScheduleEntries, getScheduleDayTypes, computeScheduleRollup } from '@/lib/schedule-service'
import {
  getPendingSegmentApproval,
  submitForApproval,
  reviewApproval,
  createVersionSnapshot,
} from '@/lib/workflow-service'
import {
  getDraftChangeOrder,
  getSubmittedChangeOrder,
  createChangeOrder,
  updateChangeOrderBaseline,
  submitChangeOrder,
  approveChangeOrder,
  rejectChangeOrder,
  formatCONumber,
} from '@/lib/change-order-service'
import type { ChangeOrder } from '@/types/change-order'
import { transitionSegmentStatus, getSegmentEditRules, getRecapActuals, upsertRecapActual, getVarianceReport } from '@/lib/segment-status-service'
import {
  getAccountingReview,
  submitRecapForAccounting,
  approveRecap,
  requestRecapCorrections,
} from '@/lib/accounting-review-service'
import { useUser } from '@/lib/auth'
import { hasPermission } from '@/lib/permissions'
import { getGPThreshold } from '@/lib/system-settings-service'
import { getAccountingReadinessSummary } from '@/lib/accounting-validation-service'
import {
  downloadAccountingCsvForSegment,
  getAccountingExports,
} from '@/lib/accounting-csv-service'
import type { AccountingReview, ApprovalRequest, SegmentStatus, SegmentEditRules, RecapActual, VarianceRow } from '@/types/workflow'
import { RecapActualsCells, RecapComputedCells, RecapColumnHeaders } from '@/components/recap/RecapActualsCells'
import { FinancialSummaryCards } from '@/components/FinancialSummaryCards'
import { ReceiptCell } from '@/components/recap/ReceiptCell'
import { VarianceSummary } from '@/components/recap/VarianceSummary'
import { getReceiptsByEstimate } from '@/lib/receipt-service'
import { getActualCostTotal } from '@/lib/accounting-amounts'
import type { ReceiptAttachment } from '@/types/workflow'
import type { ScheduleEntry, ScheduleDayType, LaborRollupRow } from '@/types/schedule'
import {
  getEstimate,
  updateEstimate,
  getLaborLogs,
  createPrimarySegmentForEstimate,
  createLaborLog,
  deleteLaborLog,
  updateLaborLog,
  getLaborEntries,
  createLaborEntry,
  updateLaborEntry,
  deleteLaborEntry,
  getLineItemsByLocation,
  createLineItem,
  updateLineItem,
  deleteLineItem,
} from '@/lib/estimate-service'
import {
  getRateCardItemsBySection,
  getClientApproverForEstimate,
  getClientContacts,
  getOfficeAccountingProfiles,
  getRevenueSegments,
} from '@/lib/rate-card-service'
import type { EstimateWithClient, EstimateUpdate, LaborLog, LaborEntry, EstimateLineItem } from '@/types/estimate'
import type { ClientContact, RateCardItemsBySection } from '@/types/rate-card'
import type { AccountingExportRecord, AccountingExportType, AccountingReadinessIssue, AccountingReadinessSummary, OfficeAccountingProfile, RevenueSegment } from '@/types/accounting'
import type { Nudge } from '@/types/nudge'
import { fetchNudges, fetchFreshEstimateState, sendChatMessage, dismissNudge, getDismissedNudges } from '@/lib/ai-nudge-service'
import { generatePDF, type PDFType } from '@/lib/pdf-service'

// ── Constants ────────────────────────────────────────────────────────────────

const TAB_TO_RC_SECTION: Record<string, string> = {
  production: 'Production Expenses',
  travel: 'Travel Expenses',
  creative: 'Creative Costs',
  access: 'Logistics Expenses',
}

const EVENT_TYPES = [
  'Ride & Drive',
  'Static Display',
  'Press Event',
  'Chauffeur',
  'Auto Show',
  'Tour',
  'Fleet',
  'Other',
]

const CLIENT_CONTACT_NONE = '__none__'


// ── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  return '$' + n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

function pct(gp: number, rev: number): string {
  if (rev === 0) return '0.0%'
  return ((gp / rev) * 100).toFixed(1) + '%'
}

/** Select all text on focus so typing replaces leading zeros */
function selectOnFocus(e: React.FocusEvent<HTMLInputElement>) {
  e.target.select()
}

function computeDuration(start: string | null, end: string | null): number | null {
  if (!start || !end) return null
  const d = Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / 86400000) + 1
  return d > 0 ? d : null
}

function parseSimpleCityState(location: string | null | undefined): { city: string; state: string } | null {
  const match = location?.trim().match(/^([A-Za-z][A-Za-z .'-]+),\s*([A-Z]{2})$/)
  if (!match) return null
  return { city: match[1].trim(), state: match[2].trim() }
}

// ── AI Intelligence Panel ────────────────────────────────────────────────────

const LOADING_STEPS = [
  'Reading estimate data...',
  'Loading client rate card...',
  'Checking staffing levels...',
  'Reviewing financial margins...',
  'Scanning for missing items...',
  'Validating rates against MSA...',
  'Generating recommendations...',
]

function LoadingNarration() {
  const [step, setStep] = useState(0)
  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % LOADING_STEPS.length)
    }, 1200)
    return () => clearInterval(interval)
  }, [])
  return (
    <div className="flex flex-col items-center gap-3 py-6">
      <div className="relative w-8 h-8">
        <Sparkles className="w-8 h-8 text-indigo-400/40 animate-pulse" />
      </div>
      <p className="text-[11px] text-muted-foreground/70 transition-opacity duration-300">{LOADING_STEPS[step]}</p>
      <div className="flex gap-1 mt-1">
        {LOADING_STEPS.map((_, i) => (
          <div key={i} className={`w-1 h-1 rounded-full transition-colors duration-300 ${i <= step ? 'bg-indigo-400/60' : 'bg-muted/30'}`} />
        ))}
      </div>
    </div>
  )
}

const NUDGE_TYPE_COLORS: Record<Nudge['type'], { accent: string; label: string }> = {
  staffing: { accent: 'border-l-indigo-400/60', label: 'text-indigo-600' },
  cost: { accent: 'border-l-amber-400/50', label: 'text-amber-600' },
  validation: { accent: 'border-l-green-700/40', label: 'text-green-700' },
  missing: { accent: 'border-l-purple-400/50', label: 'text-purple-600' },
  margin: { accent: 'border-l-rose-400/50', label: 'text-rose-600' },
}

const SEVERITY_STYLES: Record<Nudge['severity'], string> = {
  critical: 'border-l-[3px] bg-muted/10',
  warning: 'border-l-2 bg-muted/5',
  info: 'border-l-2 bg-muted/3 opacity-80',
}

function AINudgePanel({
  nudges,
  loading,
  error,
  autoRefresh,
  onToggleAutoRefresh,
  onDismiss,
  onRetry,
  onClose,
  chatMessages,
  chatInput,
  chatLoading,
  onChatInputChange,
  onChatSend,
}: {
  nudges: Nudge[]
  loading: boolean
  error: string | null
  autoRefresh: boolean
  onToggleAutoRefresh: () => void
  onDismiss: (nudgeId: string) => void
  onRetry: () => void
  onClose: () => void
  chatMessages: Array<{ role: 'user' | 'assistant'; content: string }>
  chatInput: string
  chatLoading: boolean
  onChatInputChange: (value: string) => void
  onChatSend: () => void
}) {
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages appear
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages, chatLoading])

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/50">Intelligence</p>
        <div className="flex items-center gap-1">
          <button
            onClick={onRetry}
            className="p-1 rounded hover:bg-muted text-muted-foreground/50 hover:text-muted-foreground transition-colors"
            title="Refresh nudges"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={onToggleAutoRefresh}
            className={`px-1.5 py-0.5 rounded text-[9px] font-medium transition-colors ${autoRefresh ? 'bg-indigo-100 text-indigo-700' : 'bg-muted/50 text-muted-foreground/50'}`}
            title={autoRefresh ? 'Auto-refresh on — click to disable' : 'Auto-refresh off — click to enable'}
          >
            Auto
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-muted text-muted-foreground/50 hover:text-muted-foreground transition-colors"
            title="Collapse panel"
          >
            <PanelRightClose className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Nudges zone — scrollable, takes up to half the panel */}
      <div className="min-h-0 max-h-[65%] space-y-1.5 overflow-y-auto pr-1 relative shrink-0">
        {loading && nudges.length > 0 && (
          <div className="absolute inset-0 bg-background/50 z-10 flex items-start justify-center pt-8">
            <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground/50" />
          </div>
        )}
        {loading && nudges.length === 0 && (
          <LoadingNarration />
        )}

        {error && !loading && nudges.length === 0 && (
          <div className="rounded-sm border border-muted/30 bg-muted/5 px-3 py-3 text-center">
            <AlertTriangle className="w-4 h-4 mx-auto mb-1.5 text-muted-foreground/40" />
            <p className="text-[12px] text-muted-foreground/70">{error}</p>
            <button onClick={onRetry} className="mt-2 text-[11px] text-indigo-600 hover:underline">
              Click to retry
            </button>
          </div>
        )}

        {!loading && !error && nudges.length === 0 && (
          <div className="rounded-sm border border-green-200/50 bg-green-50/30 px-3 py-3 text-center">
            <CheckCircle className="w-4 h-4 mx-auto mb-1.5 text-green-600/60" />
            <p className="text-[12px] text-green-800/70">Estimate looks good. No issues detected.</p>
          </div>
        )}

        {nudges.map((nudge) => {
          const colors = NUDGE_TYPE_COLORS[nudge.type] || NUDGE_TYPE_COLORS.validation
          const severity = SEVERITY_STYLES[nudge.severity] || SEVERITY_STYLES.warning
          return (
            <div key={nudge.id} className={`group relative rounded-sm ${severity} ${colors.accent} px-3 py-2`}>
              <button
                onClick={() => onDismiss(nudge.id)}
                className="absolute top-1.5 right-1.5 p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-muted text-muted-foreground/40 hover:text-muted-foreground transition-all"
                title="Dismiss"
              >
                <X className="w-3 h-3" />
              </button>
              <span className={`text-[9px] font-medium tracking-widest uppercase ${colors.label}`}>{nudge.type.toUpperCase()}</span>
              <p className="mt-0.5 text-[12px] font-medium leading-snug text-foreground/90">{nudge.title}</p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-foreground/70">{nudge.message}</p>
              {nudge.suggested_action && (
                <p className="mt-1 text-[10px] text-muted-foreground/60 italic">{nudge.suggested_action}</p>
              )}
            </div>
          )
        })}
      </div>

      {/* Chat zone — separate scrollable area with pinned input */}
      <div className="flex flex-col flex-1 min-h-0 border-t border-border/30 mt-2 pt-2">
        {/* Chat messages — scrollable, only grows when there are messages */}
        <div className={`min-h-0 overflow-y-auto space-y-1.5 pr-1 ${chatMessages.length > 0 || chatLoading ? 'flex-1' : ''}`}>
          {chatMessages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[90%] rounded-md px-2.5 py-1.5 text-[12px] leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-indigo-50 text-indigo-900'
                  : 'text-foreground/80'
              }`}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          {chatLoading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-1 px-2.5 py-1.5">
                <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Chat input — pinned at bottom of chat zone */}
        <div className="pt-2 shrink-0">
          <div className="flex gap-1.5">
            <Textarea
              placeholder="Ask about this estimate..."
              className="min-h-[40px] resize-none text-xs border-border/40 bg-transparent focus-visible:ring-0 placeholder:text-muted-foreground/60"
              value={chatInput}
              onChange={(e) => onChatInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  onChatSend()
                }
              }}
              disabled={chatLoading}
            />
            <button
              onClick={onChatSend}
              disabled={chatLoading || !chatInput.trim()}
              className="shrink-0 self-end p-1.5 text-muted-foreground/60 hover:text-foreground/60 transition-colors disabled:opacity-30"
            >
              <Send className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Combo Input (dropdown with options + custom text) ────────────────────────

const ATTENDANCE_RANGES = [
  '1–25',
  '25–50',
  '50–100',
  '100–250',
  '250–500',
  '500–1,000',
  '1,000–2,500',
  '2,500–5,000',
  '5,000+',
]

function ComboInput({
  value,
  options,
  onChange,
  onSave,
  className,
  readOnly,
}: {
  value: string
  options: string[]
  onChange: (v: string) => void
  onSave: (v: string) => void
  className?: string
  readOnly?: boolean
}) {
  const [open, setOpen] = useState(false)
  const wrapperRef = React.useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('click', handleClick, true)
      return () => document.removeEventListener('click', handleClick, true)
    }
  }, [open])

  function selectOption(opt: string) {
    onChange(opt)
    onSave(opt)
    setOpen(false)
  }

  return (
    <div className="relative" ref={wrapperRef}>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => !readOnly && setOpen(true)}
        onBlur={() => onSave(value)}
        placeholder=""
        className={className}
        readOnly={readOnly}
      />
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white dark:bg-zinc-900 border border-border/50 rounded-md shadow-lg py-1 max-h-[200px] overflow-y-auto">
          {options.map((opt) => (
            <button
              key={opt}
              onMouseDown={(e) => { e.preventDefault(); selectOption(opt) }}
              className="block w-full text-left px-3 py-1 text-[13px] hover:bg-muted/50 transition-colors"
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Event Header ─────────────────────────────────────────────────────────────

function EventHeader({
  estimate,
  onUpdate,
  readOnly,
  notesEditable,
  revenueSegments,
  officeProfiles,
  clientContacts,
  accountingEditable,
  canManageAccountingSetup,
}: {
  estimate: EstimateWithClient
  onUpdate: (updates: EstimateUpdate) => void
  readOnly?: boolean
  notesEditable?: boolean
  revenueSegments: RevenueSegment[]
  officeProfiles: OfficeAccountingProfile[]
  clientContacts: ClientContact[]
  accountingEditable?: boolean
  canManageAccountingSetup?: boolean
}) {
  const [eventName, setEventName] = useState(estimate.event_name)
  const [eventType, setEventType] = useState(estimate.event_type ?? '')
  const [location, setLocation] = useState(estimate.location ?? '')
  const [startDate, setStartDate] = useState(estimate.start_date ?? '')
  const [endDate, setEndDate] = useState(estimate.end_date ?? '')
  const [attendance, setAttendance] = useState(estimate.expected_attendance?.toString() ?? '')
  const [poNumber, setPoNumber] = useState(estimate.po_number ?? '')
  const [projectId, setProjectId] = useState(estimate.project_id ?? '')
  const [eventCity, setEventCity] = useState(estimate.event_city ?? '')
  const [eventState, setEventState] = useState(estimate.event_state ?? '')
  const [intacctProjectId, setIntacctProjectId] = useState(estimate.intacct_project_id ?? '')
  const [acctDepartmentId, setAcctDepartmentId] = useState(estimate.accounting_department_id ?? '')
  const [acctLocationId, setAcctLocationId] = useState(estimate.accounting_location_id ?? '')
  const [acctCustomerId, setAcctCustomerId] = useState(estimate.accounting_customer_id ?? '')
  const [acctPaymentTerms, setAcctPaymentTerms] = useState(estimate.accounting_payment_terms ?? '')
  const [internalNotes, setInternalNotes] = useState(estimate.internal_notes ?? '')
  const [publishedNotes, setPublishedNotes] = useState(estimate.published_notes ?? '')
  const [showNotes, setShowNotes] = useState(!!(estimate.internal_notes || estimate.published_notes))
  const [accountingFieldsOpen, setAccountingFieldsOpen] = useState(true)
  const locationPrefillKey = useRef<string | null>(null)

  function saveField(field: string, value: string | number | null) {
    const updates: EstimateUpdate = { [field]: value || null }
    if (field === 'start_date' || field === 'end_date') {
      const s = field === 'start_date' ? (value as string) : startDate
      const e = field === 'end_date' ? (value as string) : endDate
      updates.duration_days = computeDuration(s, e)
    }
    onUpdate(updates)
  }

  const fieldLabel = "mb-0.5 text-[10px] uppercase tracking-widest text-muted-foreground font-medium"
  const fieldInput = "h-7 text-[13px] font-medium rounded-none border-0 border-b border-border/40 bg-transparent hover:border-border/60 focus-visible:border-foreground/40 focus-visible:ring-0 px-0 transition-colors"
  const readOnlyField = "h-7 text-[13px] font-medium border-0 bg-transparent cursor-default px-0 text-muted-foreground"
  const accountingReadOnly = readOnly && !accountingEditable
  const accountingSectionLabel = "text-[10px] uppercase tracking-widest text-foreground/60 font-semibold"
  const helpText = "mt-1 text-[11px] leading-snug text-muted-foreground/70"
  const emptySetupText = "mt-1 text-[11px] leading-snug text-amber-700"
  const accountingSetupLink = (
    <Link to="/admin/accounting-setup" className="ml-1 font-medium underline underline-offset-2 hover:text-amber-800">
      Open Accounting Setup
    </Link>
  )

  useEffect(() => {
    if (estimate.cost_structure !== 'office' || accountingReadOnly) return
    if ((estimate.event_city ?? '').trim() || (estimate.event_state ?? '').trim()) return
    if (eventCity.trim() || eventState.trim()) return

    const parsed = parseSimpleCityState(estimate.location)
    if (!parsed) return

    const key = `${estimate.id}:${estimate.location}`
    if (locationPrefillKey.current === key) return
    locationPrefillKey.current = key

    setEventCity(parsed.city)
    setEventState(parsed.state)
    onUpdate({ event_city: parsed.city, event_state: parsed.state })
  }, [accountingReadOnly, estimate.cost_structure, estimate.event_city, estimate.event_state, estimate.id, estimate.location, eventCity, eventState, onUpdate])

  return (
    <div className="border border-border/50 bg-slate-50 dark:bg-slate-800/50 rounded-md px-4 py-3">
      <div className="grid grid-cols-5 gap-x-5 gap-y-2">
        <div>
          <p className={fieldLabel}>Client</p>
          <Input readOnly value={estimate.clients.name} className={readOnlyField} />
        </div>
        <div>
          <p className={fieldLabel}>Client Contact</p>
          {readOnly ? (
            <Input readOnly value={estimate.client_contact?.name ?? ''} placeholder="—" className={readOnlyField} />
          ) : (
            <Select
              value={estimate.client_contact_id ?? CLIENT_CONTACT_NONE}
              onValueChange={(v) => onUpdate({ client_contact_id: v === CLIENT_CONTACT_NONE ? null : v })}
            >
              <SelectTrigger className="h-7 text-[13px] rounded-none border-0 border-b border-border/40 bg-transparent px-0 shadow-none focus:ring-0">
                <SelectValue placeholder="Select contact" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={CLIENT_CONTACT_NONE} className="text-[13px] italic text-muted-foreground">— No selected contact —</SelectItem>
                {clientContacts.map((contact) => (
                  <SelectItem key={contact.id} value={contact.id} className="text-[13px]">
                    {contact.name} · {contact.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <div>
          <p className={fieldLabel}>Event Type</p>
          <ComboInput value={eventType} options={EVENT_TYPES} onChange={setEventType} onSave={(v) => saveField('event_type', v || null)} className={readOnly ? readOnlyField : fieldInput} readOnly={readOnly} />
        </div>
        <div className="col-span-2">
          <p className={fieldLabel}>Event Name</p>
          <Input value={eventName} onChange={(e) => setEventName(e.target.value)} onBlur={() => saveField('event_name', eventName)} className={readOnly ? readOnlyField : fieldInput} readOnly={readOnly} />
        </div>
        <div>
          <p className={fieldLabel}>Location</p>
          <Input value={location} onChange={(e) => setLocation(e.target.value)} onBlur={() => saveField('location', location)} className={readOnly ? readOnlyField : fieldInput} readOnly={readOnly} />
        </div>
        <div className="col-span-2">
          <p className={fieldLabel}>Event Dates</p>
          {readOnly ? (
            <Input
              value={startDate && endDate ? `${startDate} → ${endDate}` : startDate || endDate || ''}
              className={readOnlyField}
              readOnly
            />
          ) : (
            <DateRangePicker
              value={{ from: startDate || null, to: endDate || null }}
              onChange={(range) => {
                const nextStart = range.from ?? ''
                const nextEnd = range.to ?? ''
                setStartDate(nextStart)
                setEndDate(nextEnd)
                if (range.from !== (startDate || null)) saveField('start_date', nextStart)
                if (range.to !== (endDate || null)) saveField('end_date', nextEnd)
              }}
              placeholder="Select event dates"
              triggerClassName="h-7 text-[13px] font-medium rounded-none border-0 border-b border-border/40 bg-transparent shadow-none hover:bg-transparent hover:border-border/60 focus-visible:border-foreground/40 focus-visible:ring-0 px-0 transition-colors justify-start"
            />
          )}
        </div>
        <div>
          <p className={fieldLabel}>Attendance</p>
          <ComboInput value={attendance} options={ATTENDANCE_RANGES} onChange={setAttendance} onSave={(v) => saveField('expected_attendance', v || null)} className={readOnly ? readOnlyField : fieldInput} readOnly={readOnly} />
        </div>
        <div>
          <p className={fieldLabel}>PO Number</p>
          <Input value={poNumber} onChange={(e) => setPoNumber(e.target.value)} onBlur={() => saveField('po_number', poNumber)} className={readOnly ? readOnlyField : fieldInput} readOnly={readOnly} />
        </div>
        <div>
          <p className={fieldLabel}>Project ID</p>
          <Input value={projectId} onChange={(e) => setProjectId(e.target.value)} onBlur={() => saveField('project_id', projectId)} className={readOnly ? readOnlyField : fieldInput} readOnly={readOnly} />
        </div>
        <div>
          <p className={fieldLabel}>Cost Structure</p>
          <div className="flex items-center gap-0 h-7">
            <button type="button" onClick={() => !readOnly && onUpdate({ cost_structure: 'corporate' })} className={`text-[13px] transition-colors ${estimate.cost_structure === 'corporate' ? 'font-medium text-foreground border-b border-foreground/40' : 'text-muted-foreground/70 hover:text-foreground/90'} ${readOnly ? 'pointer-events-none' : ''}`}>Corporate</button>
            <span className="mx-2 text-border/40">/</span>
            <button type="button" onClick={() => !readOnly && onUpdate({ cost_structure: 'office' })} className={`text-[13px] transition-colors ${estimate.cost_structure === 'office' ? 'font-medium text-foreground border-b border-foreground/40' : 'text-muted-foreground/70 hover:text-foreground/90'} ${readOnly ? 'pointer-events-none' : ''}`}>Office</button>
          </div>
        </div>
        <div>
          <p className={fieldLabel}>Duration</p>
          <Input readOnly value={estimate.duration_days ? `${estimate.duration_days} days` : '—'} className={readOnlyField} />
        </div>
      </div>
      {estimate.cost_structure === 'office' && (
        <div className="mt-2.5 pt-2.5 border-t border-border/40 space-y-3">
          <button
            type="button"
            onClick={() => setAccountingFieldsOpen((prev) => !prev)}
            className="flex w-full items-center justify-between text-left"
          >
            <span className={accountingSectionLabel}>Accounting Fields</span>
            <span className="text-[11px] text-muted-foreground">
              {accountingFieldsOpen ? 'Hide' : 'Show'}
            </span>
          </button>
          {accountingFieldsOpen && (
            <>
          <div>
            <p className={accountingSectionLabel}>Required Event Accounting Fields</p>
            <div className="mt-1.5 grid grid-cols-5 gap-x-5 gap-y-2">
              <div>
                <p className={fieldLabel}>Revenue Segment</p>
                {accountingReadOnly ? (
                  <Input readOnly value={revenueSegments.find((s) => s.id === estimate.revenue_segment_id)?.name ?? ''} className={readOnlyField} />
                ) : (
                  <Select value={estimate.revenue_segment_id ?? undefined} onValueChange={(v) => onUpdate({ revenue_segment_id: v })} disabled={revenueSegments.length === 0}>
                    <SelectTrigger className="h-7 text-[13px] rounded-none border-0 border-b border-border/40 bg-transparent px-0 shadow-none focus:ring-0">
                      <SelectValue placeholder={revenueSegments.length === 0 ? 'No segments configured' : 'Select segment'} />
                    </SelectTrigger>
                    <SelectContent>
                      {revenueSegments.map((segment) => (
                        <SelectItem key={segment.id} value={segment.id} className="text-[13px]">{segment.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <p className={helpText}>Accounting classification used for Intacct AR upload. Managed by Accounting.</p>
                {revenueSegments.length === 0 && (
                  <p className={emptySetupText}>
                    {canManageAccountingSetup ? 'No revenue segments configured. Add them in Admin → Accounting Setup.' : 'Ask Accounting/Admin to configure this in Accounting Setup.'}
                    {canManageAccountingSetup && accountingSetupLink}
                  </p>
                )}
              </div>
              <div>
                <p className={fieldLabel}>Office Profile</p>
                {accountingReadOnly ? (
                  <Input readOnly value={officeProfiles.find((p) => p.id === estimate.office_accounting_profile_id)?.office_name ?? ''} className={readOnlyField} />
                ) : (
                  <Select value={estimate.office_accounting_profile_id ?? undefined} onValueChange={(v) => onUpdate({ office_accounting_profile_id: v })} disabled={officeProfiles.length === 0}>
                    <SelectTrigger className="h-7 text-[13px] rounded-none border-0 border-b border-border/40 bg-transparent px-0 shadow-none focus:ring-0">
                      <SelectValue placeholder={officeProfiles.length === 0 ? 'No profiles configured' : 'Select office'} />
                    </SelectTrigger>
                    <SelectContent>
                      {officeProfiles.map((profile) => (
                        <SelectItem key={profile.id} value={profile.id} className="text-[13px]">{profile.office_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <p className={helpText}>Office/vendor profile used for AP bill upload. Managed by Accounting.</p>
                {officeProfiles.length === 0 && (
                  <p className={emptySetupText}>
                    {canManageAccountingSetup ? 'No office profiles configured. Add office/vendor profiles in Admin → Accounting Setup.' : 'Ask Accounting/Admin to configure this in Accounting Setup.'}
                    {canManageAccountingSetup && accountingSetupLink}
                  </p>
                )}
              </div>
              <div>
                <p className={fieldLabel}>Event City</p>
                <Input value={eventCity} onChange={(e) => setEventCity(e.target.value)} onBlur={() => saveField('event_city', eventCity)} className={accountingReadOnly ? readOnlyField : fieldInput} readOnly={accountingReadOnly} />
                <p className={helpText}>City where the event occurred. Required for accounting/tax setup.</p>
              </div>
              <div>
                <p className={fieldLabel}>Event State</p>
                <Input value={eventState} onChange={(e) => setEventState(e.target.value)} onBlur={() => saveField('event_state', eventState)} className={accountingReadOnly ? readOnlyField : fieldInput} readOnly={accountingReadOnly} />
                <p className={helpText}>State where the event occurred. Required for accounting/tax setup.</p>
              </div>
              <div>
                <p className={fieldLabel}>Intacct Project ID</p>
                <Input value={intacctProjectId} onChange={(e) => setIntacctProjectId(e.target.value)} onBlur={() => saveField('intacct_project_id', intacctProjectId)} className={accountingReadOnly ? readOnlyField : fieldInput} readOnly={accountingReadOnly} />
                <p className={helpText}>Project dimension used in Intacct upload. Usually provided by accounting/project setup.</p>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-border/30">
            <p className={accountingSectionLabel}>Advanced Intacct Overrides</p>
            <div className="mt-1.5 grid grid-cols-4 gap-x-5 gap-y-2">
              <div>
                <p className={fieldLabel}>Intacct Department Override</p>
                <Input value={acctDepartmentId} onChange={(e) => setAcctDepartmentId(e.target.value)} onBlur={() => saveField('accounting_department_id', acctDepartmentId)} className={accountingReadOnly ? readOnlyField : fieldInput} readOnly={accountingReadOnly} />
                <p className={helpText}>Only overrides the default Intacct department when needed.</p>
              </div>
              <div>
                <p className={fieldLabel}>Intacct Location Override</p>
                <Input value={acctLocationId} onChange={(e) => setAcctLocationId(e.target.value)} onBlur={() => saveField('accounting_location_id', acctLocationId)} className={accountingReadOnly ? readOnlyField : fieldInput} readOnly={accountingReadOnly} />
                <p className={helpText}>Intacct location dimension override, not the event city/state.</p>
              </div>
              <div>
                <p className={fieldLabel}>Intacct Customer ID Override</p>
                <Input value={acctCustomerId} onChange={(e) => setAcctCustomerId(e.target.value)} onBlur={() => saveField('accounting_customer_id', acctCustomerId)} className={accountingReadOnly ? readOnlyField : fieldInput} readOnly={accountingReadOnly} />
                <p className={helpText}>Only overrides the client's default Intacct customer ID when needed.</p>
              </div>
              <div>
                <p className={fieldLabel}>Intacct Payment Terms Override</p>
                <Input value={acctPaymentTerms} onChange={(e) => setAcctPaymentTerms(e.target.value)} onBlur={() => saveField('accounting_payment_terms', acctPaymentTerms)} className={accountingReadOnly ? readOnlyField : fieldInput} readOnly={accountingReadOnly} />
                <p className={helpText}>Only overrides the client/office default terms when needed.</p>
              </div>
            </div>
          </div>
            </>
          )}
        </div>
      )}
      {!showNotes ? (
        (!readOnly || notesEditable) && <button onClick={() => setShowNotes(true)} className="mt-2.5 text-[10px] uppercase tracking-widest text-muted-foreground/60 hover:text-muted-foreground/60 transition-colors font-medium">
          + Add notes
        </button>
      ) : (
        <div className="mt-2.5 grid grid-cols-2 gap-3">
          <div>
            <p className={fieldLabel}>Internal Notes <span className="text-muted-foreground/40 normal-case tracking-normal">(not shown to client)</span></p>
            <Textarea value={internalNotes} onChange={(e) => setInternalNotes(e.target.value)} onBlur={() => saveField('internal_notes', internalNotes)} className="min-h-[40px] text-[13px] border-border/40 bg-transparent resize-none focus-visible:ring-0 focus-visible:border-border/40" placeholder="Internal team notes..." readOnly={readOnly && !notesEditable} />
          </div>
          <div>
            <p className={fieldLabel}>Published Notes <span className="text-muted-foreground/40 normal-case tracking-normal">(shown on estimate)</span></p>
            <Textarea value={publishedNotes} onChange={(e) => setPublishedNotes(e.target.value)} onBlur={() => saveField('published_notes', publishedNotes)} className="min-h-[40px] text-[13px] border-border/40 bg-transparent resize-none focus-visible:ring-0 focus-visible:border-border/40" placeholder="Notes visible to client..." readOnly={readOnly && !notesEditable} />
          </div>
        </div>
      )}
    </div>
  )
}

// ── Add Unplanned Labor Entry Modal (Recap, manual segments only) ────────────
// Single-item form mirroring AddUnplannedLineItemModal. No qty/days/rate entry
// on the estimate side — unplanned roles have no approved budget, only an
// actual cost. Role name can be picked from the rate card (inherits GL code +
// rate_card_item_id + day rate for reference) or typed free-text.

function AddUnplannedLaborEntryModal({
  open,
  onOpenChange,
  rateCardData,
  onAdd,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  rateCardData: RateCardItemsBySection[]
  onAdd: (data: { role_name: string; description: string; actual_cost: number; gl_code: string | null; rate_card_item_id: string | null; day_rate: number }) => Promise<void>
}) {
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showCustom, setShowCustom] = useState(false)
  const [customName, setCustomName] = useState('')
  const [customRate, setCustomRate] = useState('')
  const [description, setDescription] = useState('')
  const [actualCost, setActualCost] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) {
      setSearch('')
      setSelectedId(null)
      setShowCustom(false)
      setCustomName('')
      setCustomRate('')
      setDescription('')
      setActualCost('')
      setSaving(false)
    }
  }, [open])

  const laborSections = rateCardData.filter((s) => s.section.cost_type === 'labor')
  const allRoles = laborSections.flatMap((s) => s.items.map((item) => ({ ...item, sectionName: s.section.name })))
  const filtered = search
    ? allRoles.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()))
    : allRoles

  const isCustom = selectedId === '__custom__'
  const picked = allRoles.find((r) => r.id === selectedId)
  const resolvedName = isCustom ? customName.trim() : (picked?.name ?? '')
  const resolvedGlCode: string | null = isCustom ? null : (picked?.gl_code ?? null)
  const resolvedRcId: string | null = isCustom || !picked ? null : picked.id
  const resolvedDayRate = isCustom ? (parseFloat(customRate) || 0) : (picked?.unit_rate ?? 0)

  const costNum = parseFloat(actualCost)
  const valid = resolvedName.length > 0 && !isNaN(costNum) && costNum > 0

  function pickRole(id: string) {
    setSelectedId(id)
    setShowCustom(false)
  }

  function openCustom() {
    setSelectedId('__custom__')
    setShowCustom(true)
  }

  async function handleSave() {
    if (!valid || saving) return
    setSaving(true)
    try {
      await onAdd({
        role_name: resolvedName,
        description: description.trim(),
        actual_cost: costNum,
        gl_code: resolvedGlCode,
        rate_card_item_id: resolvedRcId,
        day_rate: resolvedDayRate,
      })
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold flex items-center gap-2">
            Add Unplanned Role
            <span className="text-[9px] uppercase tracking-widest font-medium text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">Unplanned</span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            Recap-only. Pick the role and enter the actual cost paid. This role wasn't part of the approved staff plan.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground/50" />
          <Input placeholder="Search roles..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-8 text-sm border-border/30" autoFocus />
        </div>

        <div className="max-h-[240px] overflow-y-auto space-y-0.5">
          {filtered.length === 0 && !isCustom && (
            <p className="text-xs text-muted-foreground/50 text-center py-4">No roles found — use Custom below</p>
          )}
          {filtered.map((role) => {
            const selected = selectedId === role.id
            return (
              <button
                key={role.id}
                onClick={() => pickRole(role.id)}
                className={`w-full text-left px-3 py-1.5 rounded-sm transition-colors flex items-start gap-2.5 ${selected ? 'bg-rose-50/70' : 'hover:bg-muted/40'}`}
              >
                <div className={`mt-1 flex-shrink-0 w-3.5 h-3.5 rounded-full border ${selected ? 'border-rose-500 bg-rose-500' : 'border-border/50'} flex items-center justify-center`}>
                  {selected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-medium text-foreground/90">{role.name}</span>
                    <span className="text-[13px] text-muted-foreground/60 tabular-nums">${role.unit_rate?.toLocaleString() ?? '0'}/day</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground/70">{role.sectionName}{role.gl_code ? ` · GL ${role.gl_code}` : ''}</p>
                </div>
              </button>
            )
          })}
        </div>

        {showCustom ? (
          <div className="border border-border/40 rounded-md p-2.5 space-y-2 bg-rose-50/30">
            <p className="text-[11px] font-medium text-rose-700/80 uppercase tracking-wider">Custom Unplanned Role</p>
            <div className="flex gap-2">
              <Input
                placeholder="Role name"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="h-7 text-[13px] border-border/40 flex-1"
                autoFocus
              />
              <Input
                type="number"
                placeholder="Day rate"
                value={customRate}
                onChange={(e) => setCustomRate(e.target.value)}
                className="h-7 text-[13px] border-border/40 w-24"
              />
            </div>
          </div>
        ) : (
          <button
            onClick={openCustom}
            className="flex items-center gap-1.5 text-[11px] text-muted-foreground/60 hover:text-foreground/80 transition-colors"
          >
            <Plus className="h-3 w-3" />
            Add custom role (not in rate card)
          </button>
        )}

        <div className="space-y-2 pt-1 border-t border-border/30">
          <div className="space-y-1">
            <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">Description (optional)</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Last-minute backup A/V tech"
              className="h-8 text-sm border-border/30"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">Actual Cost *</Label>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground/60">$</span>
              <Input
                type="number"
                inputMode="decimal"
                value={actualCost}
                onChange={(e) => setActualCost(e.target.value)}
                placeholder="0.00"
                className="h-8 text-sm border-border/30 pl-6"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleSave}
            disabled={!valid || saving}
            size="sm"
            className="text-xs bg-white hover:bg-rose-50 text-foreground border border-border/50 hover:border-rose-400 hover:text-rose-700 shadow-sm"
          >
            {saving ? 'Adding…' : (valid ? `Add Unplanned · $${costNum.toLocaleString()}` : 'Pick a role and enter a cost')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Add Role Modal ───────────────────────────────────────────────────────────

function AddRoleModal({
  open,
  onOpenChange,
  rateCardData,
  estimate,
  onAdd,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  rateCardData: RateCardItemsBySection[]
  estimate: EstimateWithClient
  onAdd: (entries: { role_name: string; unit_rate: number; cost_rate: number | null; gl_code: string | null; rate_card_item_id: string | null }[]) => void
}) {
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showCustom, setShowCustom] = useState(false)
  const [customName, setCustomName] = useState('')
  const [customRate, setCustomRate] = useState('')
  type CustomRole = { id: string; role_name: string; unit_rate: number }
  const [customRoles, setCustomRoles] = useState<CustomRole[]>([])

  // Clear selections when modal opens/closes
  useEffect(() => {
    if (!open) {
      setSelectedIds(new Set())
      setSearch('')
      setShowCustom(false)
      setCustomName('')
      setCustomRate('')
      setCustomRoles([])
    }
  }, [open])

  // Filter to labor sections only
  const laborSections = rateCardData.filter((s) => s.section.cost_type === 'labor')
  const allRoles = laborSections.flatMap((s) =>
    s.items.map((item) => ({ ...item, sectionName: s.section.name }))
  )
  const filtered = search
    ? allRoles.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()))
    : allRoles

  function toggleRole(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleAddCustom() {
    if (!customName.trim()) return
    const id = `custom-${Date.now()}`
    setCustomRoles((prev) => [...prev, { id, role_name: customName.trim(), unit_rate: parseFloat(customRate) || 0 }])
    setSelectedIds((prev) => new Set(prev).add(id))
    setCustomName('')
    setCustomRate('')
    setShowCustom(false)
  }

  function handleAddSelected() {
    const isOffice = estimate.cost_structure === 'office'
    const rcEntries = allRoles
      .filter((r) => selectedIds.has(r.id))
      .map((role) => ({
        role_name: role.name,
        unit_rate: role.unit_rate ?? 0,
        cost_rate: isOffice && role.unit_rate
          ? role.unit_rate * (1 - estimate.clients.office_payout_pct)
          : null,
        gl_code: role.gl_code,
        rate_card_item_id: role.id,
      }))
    const customEntries = customRoles
      .filter((r) => selectedIds.has(r.id))
      .map((role) => ({
        role_name: role.role_name,
        unit_rate: role.unit_rate,
        cost_rate: isOffice && role.unit_rate
          ? role.unit_rate * (1 - estimate.clients.office_payout_pct)
          : null,
        gl_code: null as string | null,
        rate_card_item_id: null as string | null,
      }))
    onAdd([...rcEntries, ...customEntries])
    onOpenChange(false)
  }

  const totalSelected = selectedIds.size

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold">Add Roles from Rate Card</DialogTitle>
          <DialogDescription className="text-xs">Select roles from {estimate.clients.name}'s rate card</DialogDescription>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground/50" />
          <Input placeholder="Search roles..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-8 text-sm border-border/30" autoFocus />
        </div>
        <div className="max-h-[300px] overflow-y-auto space-y-0.5">
          {filtered.length === 0 && customRoles.length === 0 && (
            <p className="text-xs text-muted-foreground/50 text-center py-4">No matching roles found</p>
          )}
          {filtered.map((role) => {
            const selected = selectedIds.has(role.id)
            return (
              <button
                key={role.id}
                onClick={() => toggleRole(role.id)}
                className={`w-full text-left px-3 py-1.5 rounded-sm transition-colors flex items-start gap-2.5 ${selected ? 'bg-muted/60' : 'hover:bg-muted/40'}`}
              >
                <div className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded border ${selected ? 'bg-green-800/15 border-green-800/40' : 'border-border/50'} flex items-center justify-center`}>
                  {selected && <Check className="h-3 w-3 text-green-800/70" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-medium text-foreground/90">{role.name}</span>
                    <span className="text-[13px] text-muted-foreground/60 tabular-nums">
                      {role.unit_rate ? `$${role.unit_rate.toLocaleString()}` : 'Pass-through'}
                      {role.unit_label ? ` ${role.unit_label}` : ''}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground/70">{role.sectionName}{role.gl_code ? ` · GL ${role.gl_code}` : ''}</p>
                </div>
              </button>
            )
          })}
          {/* Custom roles already added */}
          {customRoles.map((role) => {
            const selected = selectedIds.has(role.id)
            return (
              <button
                key={role.id}
                onClick={() => toggleRole(role.id)}
                className={`w-full text-left px-3 py-1.5 rounded-sm transition-colors flex items-start gap-2.5 ${selected ? 'bg-muted/60' : 'hover:bg-muted/40'}`}
              >
                <div className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded border ${selected ? 'bg-green-800/15 border-green-800/40' : 'border-border/50'} flex items-center justify-center`}>
                  {selected && <Check className="h-3 w-3 text-green-800/70" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-medium text-foreground/90">{role.role_name}</span>
                    <span className="text-[13px] text-muted-foreground/60 tabular-nums">
                      {role.unit_rate ? `$${role.unit_rate.toLocaleString()}` : '$0'}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground/70">Custom role</p>
                </div>
              </button>
            )
          })}
        </div>

        {/* Custom role inline form */}
        {showCustom ? (
          <div className="border border-border/40 rounded-md p-2.5 space-y-2 bg-muted/20">
            <p className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wider">Custom Role</p>
            <div className="flex gap-2">
              <Input
                placeholder="Role name"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="h-7 text-[13px] border-border/40 flex-1"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleAddCustom()}
              />
              <Input
                type="number"
                placeholder="Rate"
                value={customRate}
                onChange={(e) => setCustomRate(e.target.value)}
                className="h-7 text-[13px] border-border/40 w-24"
                onKeyDown={(e) => e.key === 'Enter' && handleAddCustom()}
              />
              <Button size="sm" variant="outline" className="h-7 text-[11px] px-2.5" onClick={handleAddCustom} disabled={!customName.trim()}>Add</Button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowCustom(true)}
            className="flex items-center gap-1.5 text-[11px] text-muted-foreground/60 hover:text-foreground/80 transition-colors"
          >
            <Plus className="h-3 w-3" />
            Add custom role
          </button>
        )}

        <DialogFooter>
          <Button
            onClick={handleAddSelected}
            disabled={totalSelected === 0}
            size="sm"
            className="text-xs bg-white hover:bg-green-800/10 text-foreground border border-border/50 hover:border-green-800/30 hover:text-green-800/80 shadow-sm"
          >
            {totalSelected === 0
              ? 'Select roles to add'
              : `Add ${totalSelected} Role${totalSelected > 1 ? 's' : ''}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Segment Selector (shared across Labor Log + Line Item tabs) ──────────────

const SEGMENT_TAB_STYLES: Record<string, { dot: string; selected: string; unselected: string; underline: string }> = {
  pipeline:  { dot: 'bg-zinc-300',    selected: 'text-zinc-600',    unselected: 'text-zinc-300',    underline: 'bg-zinc-300' },
  estimate:  { dot: 'bg-zinc-400',    selected: 'text-zinc-700',    unselected: 'text-zinc-400',    underline: 'bg-zinc-400' },
  in_review: { dot: 'bg-amber-500',   selected: 'text-amber-700',   unselected: 'text-amber-400/70', underline: 'bg-amber-500' },
  active:    { dot: 'bg-fuchsia-500', selected: 'text-fuchsia-700', unselected: 'text-fuchsia-400/70', underline: 'bg-fuchsia-500' },
  recap:     { dot: 'bg-violet-500',  selected: 'text-violet-700',  unselected: 'text-violet-400/70', underline: 'bg-violet-500' },
  accounting_review: { dot: 'bg-sky-500', selected: 'text-sky-700', unselected: 'text-sky-400/70', underline: 'bg-sky-500' },
  export_ready: { dot: 'bg-emerald-500', selected: 'text-emerald-700', unselected: 'text-emerald-400/70', underline: 'bg-emerald-500' },
  invoiced:  { dot: 'bg-teal-500',   selected: 'text-teal-700',    unselected: 'text-teal-400/70',  underline: 'bg-teal-500' },
  lost:      { dot: 'bg-red-500',     selected: 'text-red-700',     unselected: 'text-red-400/70',   underline: 'bg-red-500' },
  cancelled: { dot: 'bg-slate-400',   selected: 'text-slate-600',   unselected: 'text-slate-400/60', underline: 'bg-slate-400' },
}

const SEGMENT_BADGE_LABELS: Record<string, string> = {
  pipeline: 'PIPELINE', estimate: 'ESTIMATE', in_review: 'IN REVIEW', active: 'ACTIVE',
  recap: 'RECAP', accounting_review: 'ACCOUNTING REVIEW', export_ready: 'READY FOR INTACCT UPLOAD',
  invoiced: 'INVOICED', lost: 'LOST', cancelled: 'CANCELLED',
}

function LocationSelector({
  laborLogs,
  activeLocationId,
  onSelectLocation,
  onAddLocation,
  onDeleteLocation,
  onRenameLocation,
  readOnly,
  canDelete,
}: {
  laborLogs: LaborLog[]
  activeLocationId: string | null
  onSelectLocation: (id: string) => void
  onAddLocation: (name: string) => void
  onDeleteLocation: (id: string) => void
  onRenameLocation: (id: string, name: string) => void
  readOnly?: boolean
  canDelete?: boolean
}) {
  const [showAddLocation, setShowAddLocation] = useState(false)
  const [newLocationName, setNewLocationName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  function startEditing(log: LaborLog) {
    setEditingId(log.id)
    setEditingName(log.location_name)
  }

  function commitEdit() {
    if (editingId && editingName.trim() && editingName.trim() !== laborLogs.find((l) => l.id === editingId)?.location_name) {
      onRenameLocation(editingId, editingName.trim())
    }
    setEditingId(null)
    setEditingName('')
  }

  return (
    <>
      <div className="flex items-center gap-4 flex-wrap border-b border-border/30">
        {laborLogs.map((log) => {
          const status = (log.status || 'estimate') as string
          const style = SEGMENT_TAB_STYLES[status] || SEGMENT_TAB_STYLES.estimate
          const isActive = log.id === activeLocationId
          return editingId === log.id ? (
            <input
              key={log.id}
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              onBlur={commitEdit}
              onKeyDown={(e) => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') { setEditingId(null); setEditingName('') } }}
              autoFocus
              className="text-[12px] px-1 py-1.5 font-medium bg-white dark:bg-slate-900 border-b-2 border-foreground outline-none w-[120px]"
            />
          ) : (
            <button
              key={log.id}
              onClick={() => onSelectLocation(log.id)}
              onDoubleClick={() => !readOnly && startEditing(log)}
              className={`relative text-[12px] px-1 py-1.5 transition-colors ${
                isActive ? `font-semibold ${style.selected}` : `${style.unselected} hover:opacity-100`
              }`}
            >
              <span className="flex items-center gap-1.5">
                <span className={`inline-block h-1.5 w-1.5 rounded-full ${style.dot} ${isActive ? '' : 'opacity-60'}`} />
                {log.location_name}{log.is_primary ? ' (Primary)' : ''}
                <span className="text-[9px] uppercase tracking-wider opacity-70">{SEGMENT_BADGE_LABELS[status] || 'ESTIMATE'}</span>
              </span>
              {isActive && <span className={`absolute bottom-0 left-0 right-0 h-[2px] ${style.underline} rounded-full`} />}
            </button>
          )
        })}
        <button onClick={() => setShowAddLocation(true)} className="text-[11px] px-1 py-1.5 text-muted-foreground/50 hover:text-foreground/60 transition-colors">
          + Add Segment
        </button>
        {canDelete && activeLocationId && laborLogs.length > 1 && (() => {
          const activeLog = laborLogs.find((l) => l.id === activeLocationId)
          return activeLog && !activeLog.is_primary && (!activeLog.status || activeLog.status === 'pipeline' || activeLog.status === 'estimate')
        })() && (
          <button
            className="text-[11px] px-1 py-1.5 text-red-400 hover:text-red-600 transition-colors"
            onClick={() => {
              if (confirm('Delete this segment and all its data?')) {
                onDeleteLocation(activeLocationId)
              }
            }}
          >
            ✕ Remove
          </button>
        )}
      </div>

      <Dialog open={showAddLocation} onOpenChange={setShowAddLocation}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold">Add Segment</DialogTitle>
            <DialogDescription className="text-xs">Add a geographic location or time period for this estimate</DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label className="text-xs">Segment Name</Label>
            <Input placeholder="e.g., San Diego or January 2026" value={newLocationName} onChange={(e) => setNewLocationName(e.target.value)} className="h-8 text-sm border-border/50" autoFocus />
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => { setShowAddLocation(false); setNewLocationName('') }} className="text-[13px]">Cancel</Button>
            <Button size="sm" disabled={!newLocationName.trim()} onClick={() => { onAddLocation(newLocationName.trim()); setNewLocationName(''); setShowAddLocation(false) }} className="text-[13px] bg-white hover:bg-green-800/10 text-foreground border border-border/50 hover:border-green-800/30 hover:text-green-800/80 shadow-sm">Add Segment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

// ── Labor Log Tab ────────────────────────────────────────────────────────────

function LaborLogTab({
  estimate,
  laborLogs,
  activeLocationId,
  entries,
  rateCardData,
  allEntriesMap,
  scheduleEntriesMap,
  onSelectLocation,
  onAddLocation,
  onDeleteLocation,
  onRenameLocation,
  onAddEntry,
  onAddUnplannedLaborEntry,
  onUpdateEntry,
  onDeleteEntry,
  onSwitchToSchedule,
  readOnly,
  canDelete,
  editRules,
  estimateId,
}: {
  estimate: EstimateWithClient
  laborLogs: LaborLog[]
  activeLocationId: string | null
  entries: LaborEntry[]
  rateCardData: RateCardItemsBySection[]
  allEntriesMap: Record<string, LaborEntry[]>
  scheduleEntriesMap: Record<string, ScheduleEntry[]>
  onSelectLocation: (id: string) => void
  onAddLocation: (name: string) => void
  onDeleteLocation: (id: string) => void
  onRenameLocation: (id: string, name: string) => void
  onAddEntry: (entries: { role_name: string; unit_rate: number; cost_rate: number | null; gl_code: string | null; rate_card_item_id: string | null }[]) => void
  onAddUnplannedLaborEntry?: (data: { role_name: string; unit_rate: number; cost_rate: number | null; gl_code: string | null; rate_card_item_id: string | null }) => Promise<LaborEntry | null>
  onUpdateEntry: (id: string, updates: Partial<LaborEntry>) => void
  onDeleteEntry: (id: string) => void
  onSwitchToSchedule: () => void
  readOnly?: boolean
  canDelete?: boolean
  editRules?: SegmentEditRules
  estimateId?: string
}) {
  const [showAddRole, setShowAddRole] = useState(false)
  const [showAddUnplannedRole, setShowAddUnplannedRole] = useState(false)
  const [recapMap, setRecapMap] = useState<Record<string, RecapActual>>({})
  const isRecapMode = editRules?.actuals === true

  // Load recap actuals when in recap mode
  useEffect(() => {
    if (!isRecapMode || !activeLocationId) {
      setRecapMap({})
      return
    }
    getRecapActuals(activeLocationId).then((actuals) => {
      const map: Record<string, RecapActual> = {}
      for (const a of actuals) {
        if (a.labor_entry_id) map[`labor_${a.labor_entry_id}`] = a
        if (a.schedule_entry_id) map[`schedule_${a.schedule_entry_id}`] = a
      }
      setRecapMap(map)
    }).catch(console.error)
  }, [isRecapMode, activeLocationId])

  // Check if the active segment has schedule data
  const activeScheduleEntries = activeLocationId ? (scheduleEntriesMap[activeLocationId] ?? []) : []
  const hasScheduleData = activeScheduleEntries.length > 0
  const activeRollup = hasScheduleData ? computeScheduleRollup(activeScheduleEntries) : []

  // Name progress tracking
  const namedCount = activeScheduleEntries.filter((e) => e.person_name?.trim()).length
  const totalStaffCount = activeScheduleEntries.length
  const allNamed = totalStaffCount > 0 && namedCount === totalStaffCount

  async function handleSaveRecapActual(
    key: string,
    entryRef: { labor_entry_id?: string; schedule_entry_id?: string },
    updates: { actual_days?: number | null; actual_total?: number | null; actual_cost_total?: number | null }
  ) {
    if (!activeLocationId || !estimateId) return
    const existing = recapMap[key]
    try {
      const result = await upsertRecapActual({
        ...(existing ? { id: existing.id } : {}),
        estimate_id: estimateId,
        labor_log_id: activeLocationId,
        labor_entry_id: entryRef.labor_entry_id || null,
        schedule_entry_id: entryRef.schedule_entry_id || null,
        line_item_id: null,
        actual_days: updates.actual_days ?? existing?.actual_days ?? null,
        actual_cost_total: updates.actual_cost_total ?? existing?.actual_cost_total ?? null,
        actual_total: updates.actual_total ?? existing?.actual_total ?? null,
      })
      setRecapMap((prev) => ({ ...prev, [key]: result }))
    } catch (err) {
      console.error('Failed to save recap actual:', err)
    }
  }

  async function handleSubmitUnplannedLaborEntry(data: { role_name: string; description: string; actual_cost: number; gl_code: string | null; rate_card_item_id: string | null; day_rate: number }) {
    if (!onAddUnplannedLaborEntry || !activeLocationId || !estimateId) return
    const newEntry = await onAddUnplannedLaborEntry({
      role_name: data.role_name,
      unit_rate: data.day_rate,
      cost_rate: null,
      gl_code: data.gl_code,
      rate_card_item_id: data.rate_card_item_id,
    })
    if (!newEntry) return
    try {
      const result = await upsertRecapActual({
        estimate_id: estimateId,
        labor_log_id: activeLocationId,
        labor_entry_id: newEntry.id,
        schedule_entry_id: null,
        line_item_id: null,
        actual_cost_total: data.actual_cost,
        actual_total: data.actual_cost,
        notes: data.description || null,
      })
      setRecapMap((prev) => ({ ...prev, [`labor_${newEntry.id}`]: result }))
    } catch (err) {
      console.error('Failed to record unplanned labor actual:', err)
    }
  }

  // Active segment summary (from schedule rollup or manual entries)
  const activeLog = laborLogs.find((l) => l.id === activeLocationId)
  let segRevenue: number, segCost: number, segGP: number, segStaff: number

  if (hasScheduleData) {
    segRevenue = activeRollup.reduce((s, r) => s + r.revenue_total, 0)
    segCost = activeRollup.reduce((s, r) => s + r.cost_total, 0)
    segGP = segRevenue - segCost
    segStaff = activeRollup.reduce((s, r) => s + r.quantity, 0)
  } else {
    const segLabor = entries.filter((e) => !e.role_name.toLowerCase().includes('per diem'))
    segRevenue = segLabor.reduce((sum, e) => sum + e.quantity * e.days * (e.override_rate ?? e.unit_rate), 0)
    segCost = segLabor.reduce((sum, e) => sum + e.quantity * e.days * (e.cost_rate ?? 0), 0)
    segGP = segRevenue - segCost
    segStaff = segLabor.reduce((sum, e) => sum + e.quantity, 0)
  }

  // All-segments summary
  let laborRevenue = 0, laborCost = 0, laborGP = 0, staffCount = 0, perDiemTotal = 0
  for (const log of laborLogs) {
    const schedEntries = scheduleEntriesMap[log.id] ?? []
    if (schedEntries.length > 0) {
      const rollup = computeScheduleRollup(schedEntries)
      laborRevenue += rollup.reduce((s, r) => s + r.revenue_total, 0)
      laborCost += rollup.reduce((s, r) => s + r.cost_total, 0)
      staffCount += rollup.reduce((s, r) => s + r.quantity, 0)
    } else {
      const allEntries = allEntriesMap[log.id] ?? []
      const labor = allEntries.filter((e) => !e.role_name.toLowerCase().includes('per diem'))
      const perDiem = allEntries.filter((e) => e.role_name.toLowerCase().includes('per diem'))
      laborRevenue += labor.reduce((sum, e) => sum + e.quantity * e.days * (e.override_rate ?? e.unit_rate), 0)
      laborCost += labor.reduce((sum, e) => sum + e.quantity * e.days * (e.cost_rate ?? 0), 0)
      staffCount += labor.reduce((sum, e) => sum + e.quantity, 0)
      perDiemTotal += perDiem.reduce((sum, e) => sum + e.quantity * e.days * (e.override_rate ?? e.unit_rate), 0)
    }
  }
  laborGP = laborRevenue - laborCost

  return (
    <div className="space-y-2">
      <LocationSelector
        laborLogs={laborLogs}
        activeLocationId={activeLocationId}
        onSelectLocation={onSelectLocation}
        onAddLocation={onAddLocation}
        onDeleteLocation={onDeleteLocation}
        onRenameLocation={onRenameLocation}
        readOnly={readOnly}
        canDelete={canDelete}
      />

      {/* Schedule-driven banner */}
      {hasScheduleData && (
        <div className="flex items-center gap-2 px-3 py-2 bg-sky-50 dark:bg-sky-900/20 border border-sky-200/50 rounded-md">
          <Calendar className="h-3.5 w-3.5 text-sky-600/70" />
          <p className="text-[12px] text-sky-800/70">This labor log is driven by the Schedule tab. Edit the schedule to update labor.</p>
        </div>
      )}

      {/* Labor Table */}
      <div>
        {hasScheduleData ? (
          /* Read-only rollup from schedule data */
          activeRollup.length === 0 ? (
            <p className="text-xs text-muted-foreground/70 text-center py-6">No staff scheduled yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border/40 bg-slate-50 dark:bg-slate-800/30 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                  <TableHead className="w-[200px] text-[10px] uppercase tracking-widest text-muted-foreground font-medium py-2">Role</TableHead>
                  <TableHead className="text-center w-14 text-[10px] uppercase tracking-widest text-muted-foreground font-medium py-2">Qty</TableHead>
                  <TableHead className="text-center w-14 text-[10px] uppercase tracking-widest text-muted-foreground font-medium py-2">Days</TableHead>
                  <TableHead className="text-right w-24 text-[10px] uppercase tracking-widest text-muted-foreground font-medium py-2">Day Rate</TableHead>
                  <TableHead className="text-right w-24 text-[10px] uppercase tracking-widest text-muted-foreground font-medium py-2">Line Total</TableHead>
                  <TableHead className="text-right w-24 text-[10px] uppercase tracking-widest text-muted-foreground font-medium py-2">Cost Rate</TableHead>
                  <TableHead className="text-right w-24 text-[10px] uppercase tracking-widest text-muted-foreground font-medium py-2">Cost Total</TableHead>
                  <TableHead className="text-right w-20 text-[10px] uppercase tracking-widest text-muted-foreground font-medium py-2">GP</TableHead>
                  <TableHead className="text-right w-14 text-[10px] uppercase tracking-widest text-muted-foreground font-medium py-2">GP%</TableHead>
                  {isRecapMode && <RecapColumnHeaders />}
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeRollup.map((row, idx) => {
                  const gp = row.revenue_total - row.cost_total
                  const rowClass = row.is_unplanned
                    ? "border-b border-border/10 hover:bg-rose-50/40 bg-rose-50/20 [&>td:first-child]:border-l-[3px] [&>td:first-child]:border-l-rose-400"
                    : "border-b border-border/10 hover:bg-muted/30"
                  const dash = <span className="text-muted-foreground/40 tabular-nums">—</span>
                  return (
                    <TableRow key={idx} className={rowClass}>
                      <TableCell className="py-1.5 text-[13px] font-medium">
                        <div className="flex items-center gap-1.5">
                          <span>{row.role_name}</span>
                          {row.is_unplanned && (
                            <span className="text-[9px] uppercase tracking-widest font-medium text-rose-600 bg-rose-50 px-1 py-0.5 rounded">Unplanned</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-1.5 text-[13px] text-center tabular-nums">{row.is_unplanned ? dash : row.quantity}</TableCell>
                      <TableCell className="py-1.5 text-[13px] text-center tabular-nums">{row.is_unplanned ? dash : row.total_days}</TableCell>
                      <TableCell className="py-1.5 text-[13px] text-right tabular-nums">{row.is_unplanned ? dash : fmt(row.day_rate)}</TableCell>
                      <TableCell className="py-1.5 text-[13px] text-right tabular-nums">{row.is_unplanned ? dash : fmt(row.revenue_total)}</TableCell>
                      <TableCell className="py-1.5 text-[13px] text-right tabular-nums">{row.is_unplanned ? dash : fmt(row.cost_rate)}</TableCell>
                      <TableCell className="py-1.5 text-[13px] text-right tabular-nums">{row.is_unplanned ? dash : fmt(row.cost_total)}</TableCell>
                      <TableCell className="py-1.5 text-[13px] text-right tabular-nums text-green-800/60 font-medium">{row.is_unplanned ? dash : fmt(gp)}</TableCell>
                      <TableCell className="py-1.5 text-[13px] text-right tabular-nums">{row.is_unplanned ? dash : pct(gp, row.revenue_total)}</TableCell>
                      {isRecapMode && (
                        <RecapComputedCells
                          estimatedTotal={row.revenue_total}
                          actualDays={row.actual_days}
                          actualTotal={row.actual_revenue_total}
                        />
                      )}
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )
        ) : (
          /* Editable labor entries (no schedule data — backward compat) */
          <>
            {entries.length === 0 ? (
              <p className="text-xs text-muted-foreground/70 text-center py-6">No roles added yet</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border/40 bg-slate-50 dark:bg-slate-800/30 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <TableHead className="w-[200px] text-[10px] uppercase tracking-widest text-muted-foreground font-medium py-2">Role</TableHead>
                    <TableHead className="text-center w-14 text-[10px] uppercase tracking-widest text-muted-foreground font-medium py-2">Qty</TableHead>
                    <TableHead className="text-center w-14 text-[10px] uppercase tracking-widest text-muted-foreground font-medium py-2">Days</TableHead>
                    <TableHead className="text-right w-24 text-[10px] uppercase tracking-widest text-muted-foreground font-medium py-2">Day Rate</TableHead>
                    <TableHead className="text-right w-24 text-[10px] uppercase tracking-widest text-muted-foreground font-medium py-2">Line Total</TableHead>
                    <TableHead className="text-right w-24 text-[10px] uppercase tracking-widest text-muted-foreground font-medium py-2">Cost Rate</TableHead>
                    <TableHead className="text-right w-24 text-[10px] uppercase tracking-widest text-muted-foreground font-medium py-2">Cost Total</TableHead>
                    <TableHead className="text-right w-20 text-[10px] uppercase tracking-widest text-muted-foreground font-medium py-2">GP</TableHead>
                    <TableHead className="text-right w-14 text-[10px] uppercase tracking-widest text-muted-foreground font-medium py-2">GP%</TableHead>
                    {isRecapMode && <RecapColumnHeaders />}
                    <TableHead className="w-6" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((entry) => (
                    <LaborEntryRow
                      key={entry.id}
                      entry={entry}
                      isOffice={estimate.cost_structure === 'office'}
                      officePayout={estimate.clients.office_payout_pct}
                      onUpdate={onUpdateEntry}
                      onDelete={onDeleteEntry}
                      readOnly={readOnly}
                      recapActual={isRecapMode ? (recapMap[`labor_${entry.id}`] || null) : undefined}
                      onSaveRecapActual={isRecapMode ? (updates) => handleSaveRecapActual(`labor_${entry.id}`, { labor_entry_id: entry.id }, updates) : undefined}
                    />
                  ))}
                </TableBody>
              </Table>
            )}
          </>
        )}
        {!readOnly && (hasScheduleData ? (
          <button onClick={onSwitchToSchedule} className="mt-1.5 text-[11px] text-muted-foreground/60 hover:text-foreground/90 transition-colors">
            + Add Staff on Schedule
          </button>
        ) : (
          <button onClick={() => setShowAddRole(true)} className="mt-1.5 text-[11px] text-muted-foreground/60 hover:text-foreground/90 transition-colors">
            + Add Role
          </button>
        ))}
        {isRecapMode && onAddUnplannedLaborEntry && (hasScheduleData ? (
          <button
            onClick={onSwitchToSchedule}
            className="mt-1.5 ml-3 text-[11px] text-rose-600/80 hover:text-rose-700 border border-dashed border-rose-300/70 hover:border-rose-400 rounded px-2 py-0.5 transition-colors"
          >
            + Add Unplanned Staff on Schedule →
          </button>
        ) : (
          <button
            onClick={() => setShowAddUnplannedRole(true)}
            className="mt-1.5 ml-3 text-[11px] text-rose-600/80 hover:text-rose-700 border border-dashed border-rose-300/70 hover:border-rose-400 rounded px-2 py-0.5 transition-colors"
          >
            + Add Unplanned Role
          </button>
        ))}
      </div>

      {/* Name progress counter (recap mode) */}
      {editRules?.names_required && totalStaffCount > 0 && (
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded text-[11px] ${allNamed ? 'bg-green-50 border border-green-200/60 text-green-700' : 'bg-amber-50 border border-amber-200/60 text-amber-700'}`}>
          <span className="font-medium">{namedCount} of {totalStaffCount} names assigned</span>
          {!allNamed && <span className="text-amber-600/70">— assign all names before invoicing</span>}
        </div>
      )}

      {/* Labor Summary — two compact lines */}
      <div className="mt-1.5 space-y-1 border-t border-border/40 pt-2.5">
        <p className="text-[13px] tabular-nums">
          <span className="font-medium text-foreground">{activeLog?.location_name ?? 'Segment'}:</span>{' '}
          <span className="text-foreground/90">{fmt(segRevenue)} rev</span>
          <span className="text-muted-foreground/60 mx-1">·</span>
          <span className="text-foreground/90">{fmt(segCost)} cost</span>
          <span className="text-muted-foreground/60 mx-1">·</span>
          <span className="text-green-800/60 font-medium">{fmt(segGP)} GP</span>
          <span className="text-muted-foreground/60 mx-1">·</span>
          <span className="text-foreground/80">{pct(segGP, segRevenue)}</span>
          <span className="text-muted-foreground/60 mx-1">·</span>
          <span className="text-foreground/80">{segStaff} staff</span>
        </p>
        {laborLogs.length > 1 && (
          <p className="text-[13px] tabular-nums text-muted-foreground/60">
            <span className="font-medium text-muted-foreground/70">All Segments:</span>{' '}
            <span>{fmt(laborRevenue)} rev</span>
            <span className="text-muted-foreground/60 mx-1">·</span>
            <span>{fmt(laborCost)} cost</span>
            <span className="text-muted-foreground/60 mx-1">·</span>
            <span className="text-green-800/60 font-medium">{fmt(laborGP)} GP</span>
            <span className="text-muted-foreground/60 mx-1">·</span>
            <span>{staffCount} staff</span>
            {perDiemTotal > 0 && (<>
              <span className="text-muted-foreground/60 mx-1">·</span>
              <span>{fmt(perDiemTotal)} per diem</span>
            </>)}
          </p>
        )}
      </div>

      {/* Modals (only used in manual mode) */}
      {!hasScheduleData && (
        <>
          <AddRoleModal
            open={showAddRole}
            onOpenChange={setShowAddRole}
            rateCardData={rateCardData}
            estimate={estimate}
            onAdd={onAddEntry}
          />
          <AddUnplannedLaborEntryModal
            open={showAddUnplannedRole}
            onOpenChange={setShowAddUnplannedRole}
            rateCardData={rateCardData}
            onAdd={handleSubmitUnplannedLaborEntry}
          />
        </>
      )}
    </div>
  )
}

// ── Stepper Input (up/down arrows for integer fields) ────────────────────────

function StepperInput({
  value,
  onChange,
  onBlur,
  onStep,
  min = 0,
  className = '',
  disabled,
}: {
  value: string
  onChange: (v: string) => void
  onBlur: () => void
  onStep: (newValue: number) => void
  min?: number
  className?: string
  disabled?: boolean
}) {
  function step(delta: number) {
    const next = Math.max(min, (parseInt(value) || 0) + delta)
    onChange(next.toString())
    onStep(next)
  }

  return (
    <div className="flex items-center justify-center gap-0.5 mx-auto group/stepper">
      {!disabled && (
        <div className="flex flex-col opacity-0 group-hover/stepper:opacity-100 transition-opacity">
          <button onClick={() => step(1)} className="h-3 w-3.5 flex items-center justify-center rounded-sm hover:bg-muted/60 text-muted-foreground/50 hover:text-foreground/70" tabIndex={-1}>
            <ChevronUp className="h-3 w-3" />
          </button>
          <button onClick={() => step(-1)} className="h-3 w-3.5 flex items-center justify-center rounded-sm hover:bg-muted/60 text-muted-foreground/50 hover:text-foreground/70" tabIndex={-1}>
            <ChevronDown className="h-3 w-3" />
          </button>
        </div>
      )}
      <Input value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} onFocus={selectOnFocus} className={`${className} w-10 text-center`} readOnly={disabled} />
    </div>
  )
}

// ── Labor Entry Row ──────────────────────────────────────────────────────────

function LaborEntryRow({
  entry,
  isOffice,
  officePayout,
  onUpdate,
  onDelete,
  readOnly,
  recapActual,
  onSaveRecapActual,
}: {
  entry: LaborEntry
  isOffice: boolean
  officePayout: number
  onUpdate: (id: string, updates: Partial<LaborEntry>) => void
  onDelete: (id: string) => void
  readOnly?: boolean
  recapActual?: RecapActual | null
  onSaveRecapActual?: (updates: { actual_days?: number | null; actual_total?: number | null; actual_cost_total?: number | null }) => void
}) {
  const [qty, setQty] = useState(entry.quantity.toString())
  const [days, setDays] = useState(entry.days.toString())
  const [rate, setRate] = useState((entry.override_rate ?? entry.unit_rate).toString())
  const [costRate, setCostRate] = useState((entry.cost_rate ?? '').toString())

  const effectiveRate = parseFloat(rate) || 0
  const effectiveCost = isOffice ? effectiveRate * (1 - officePayout) : (parseFloat(costRate) || 0)
  const qtyNum = parseInt(qty) || 0
  const daysNum = parseInt(days) || 0
  const lineTotal = qtyNum * daysNum * effectiveRate
  const costTotal = qtyNum * daysNum * effectiveCost
  const gp = lineTotal - costTotal
  const gpPct = lineTotal > 0 ? ((gp / lineTotal) * 100).toFixed(0) : '0'
  const isOverridden = entry.override_rate !== null && entry.override_rate !== entry.unit_rate

  function saveQty() {
    const v = parseInt(qty) || 1
    setQty(v.toString())
    onUpdate(entry.id, { quantity: v })
  }

  function saveDays() {
    const v = parseInt(days) || 1
    setDays(v.toString())
    onUpdate(entry.id, { days: v })
  }

  function saveRate() {
    const v = parseFloat(rate) || 0
    if (v !== entry.unit_rate) {
      onUpdate(entry.id, { override_rate: v, override_reason: 'Custom rate' })
    } else {
      onUpdate(entry.id, { override_rate: null, override_reason: null })
    }
  }

  function saveCostRate() {
    const v = parseFloat(costRate) || 0
    onUpdate(entry.id, { cost_rate: v })
  }

  const cellInput = "h-6 text-[13px] bg-transparent border-0 focus-visible:ring-0 focus-visible:bg-muted/50 rounded-sm transition-colors tabular-nums"

  const isUnplanned = entry.is_unplanned
  const rowClass = isUnplanned
    ? "group border-b border-border/30 hover:bg-rose-50/40 bg-rose-50/20 [&>td:first-child]:border-l-[3px] [&>td:first-child]:border-l-rose-400"
    : "group border-b border-border/30 hover:bg-muted/30"
  const dash = <span className="text-[13px] text-muted-foreground/40 tabular-nums">—</span>

  return (
    <TableRow className={rowClass}>
      <TableCell className="py-1">
        <span className="text-[13px] text-foreground">{entry.role_name}</span>
        {isOverridden && <span className="ml-1 text-[9px] text-amber-600 font-medium">*</span>}
        {isUnplanned && (
          <span className="ml-1.5 text-[9px] uppercase tracking-widest font-medium text-rose-600 bg-rose-50 px-1 py-0.5 rounded">Unplanned</span>
        )}
      </TableCell>
      <TableCell className="text-center py-1">
        {isUnplanned ? dash : (
          <StepperInput value={qty} onChange={setQty} onBlur={saveQty} onStep={(v) => onUpdate(entry.id, { quantity: v })} min={0} className={cellInput} disabled={readOnly} />
        )}
      </TableCell>
      <TableCell className="text-center py-1">
        {isUnplanned ? dash : (
          <StepperInput value={days} onChange={setDays} onBlur={saveDays} onStep={(v) => onUpdate(entry.id, { days: v })} min={0} className={cellInput} disabled={readOnly} />
        )}
      </TableCell>
      <TableCell className="text-right py-1">
        {isUnplanned ? <div className="text-right pr-1">{dash}</div> : (
          <div className="relative w-[72px] ml-auto">
            <span className="absolute left-1 top-1/2 -translate-y-1/2 text-[13px] text-muted-foreground/60 pointer-events-none">$</span>
            <Input
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              onBlur={saveRate}
              onFocus={selectOnFocus}
              className={`${cellInput} w-full text-right pl-4 ${isOverridden ? 'text-amber-600' : ''}`}
              readOnly={readOnly}
            />
          </div>
        )}
      </TableCell>
      <TableCell className="text-right py-1">
        {isUnplanned ? dash : <span className="text-[13px] font-medium tabular-nums text-foreground">{fmt(lineTotal)}</span>}
      </TableCell>
      <TableCell className="text-right py-1">
        {isUnplanned ? <div className="text-right pr-1">{dash}</div> : (
          isOffice ? (
            <span className="text-[13px] text-muted-foreground/50 tabular-nums">{fmt(effectiveCost)}</span>
          ) : (
            <div className="relative w-[72px] ml-auto">
              <span className="absolute left-1 top-1/2 -translate-y-1/2 text-[13px] text-muted-foreground/60 pointer-events-none">$</span>
              <Input value={costRate} onChange={(e) => setCostRate(e.target.value)} onBlur={saveCostRate} onFocus={selectOnFocus} className={`${cellInput} w-full text-right pl-4`} readOnly={readOnly} />
            </div>
          )
        )}
      </TableCell>
      <TableCell className="text-right py-1">
        {isUnplanned ? dash : <span className="text-[13px] font-medium tabular-nums text-foreground">{fmt(costTotal)}</span>}
      </TableCell>
      <TableCell className="text-right py-1">
        {isUnplanned ? dash : <span className="text-[13px] font-medium tabular-nums text-green-800/60">{fmt(gp)}</span>}
      </TableCell>
      <TableCell className="text-right py-1">
        {isUnplanned ? dash : <span className="text-[13px] tabular-nums text-muted-foreground/50">{gpPct}%</span>}
      </TableCell>
      {recapActual !== undefined && onSaveRecapActual && (
        <RecapActualsCells
          recapActual={recapActual}
          estimatedTotal={isUnplanned ? 0 : lineTotal}
          onSave={onSaveRecapActual}
          autoCalcRate={isUnplanned ? undefined : effectiveRate}
          autoCalcQty={isUnplanned ? undefined : qtyNum}
        />
      )}
      <TableCell className="py-1">
        {(!readOnly || isUnplanned) && (
          <Trash2
            className="h-3 w-3 opacity-0 group-hover:opacity-50 hover:!opacity-100 transition-opacity cursor-pointer text-foreground/60"
            onClick={() => onDelete(entry.id)}
          />
        )}
      </TableCell>
    </TableRow>
  )
}

// ── Line Item Tab ────────────────────────────────────────────────────────────

function LineItemTab({
  items,
  section,
  isPassThrough,
  defaultMarkup,
  rateCardData,
  clientName,
  laborLogs,
  activeLocationId,
  onSelectLocation,
  onAddLocation,
  onDeleteLocation,
  onRenameLocation,
  onAdd,
  onAddUnplanned,
  onUpdate,
  onDelete,
  readOnly,
  canDelete,
  editRules,
  estimateId,
}: {
  items: EstimateLineItem[]
  section: string
  isPassThrough: boolean
  defaultMarkup: number
  rateCardData: RateCardItemsBySection[]
  clientName: string
  laborLogs: LaborLog[]
  activeLocationId: string | null
  onSelectLocation: (id: string) => void
  onAddLocation: (name: string) => void
  onDeleteLocation: (id: string) => void
  onRenameLocation: (id: string, name: string) => void
  onAdd: (items: { item_name: string; description: string; quantity: number; unit_cost: number; markup_pct: number; gl_code: string | null; rate_card_item_id: string | null }[]) => void
  onAddUnplanned?: (data: { item_name: string; description: string; gl_code: string | null; rate_card_item_id: string | null }) => Promise<EstimateLineItem | null>
  onUpdate: (id: string, updates: Partial<EstimateLineItem>) => void
  onDelete: (id: string) => void
  readOnly?: boolean
  canDelete?: boolean
  editRules?: SegmentEditRules
  estimateId?: string
}) {
  const [showModal, setShowModal] = useState(false)
  const [showUnplannedModal, setShowUnplannedModal] = useState(false)
  const [recapMap, setRecapMap] = useState<Record<string, RecapActual>>({})
  const [receiptsMap, setReceiptsMap] = useState<Record<string, ReceiptAttachment>>({})
  const isRecapMode = editRules?.actuals === true

  // Load recap actuals and receipts when in recap mode
  useEffect(() => {
    if (!isRecapMode || !activeLocationId) {
      setRecapMap({})
      setReceiptsMap({})
      return
    }
    getRecapActuals(activeLocationId).then((actuals) => {
      const map: Record<string, RecapActual> = {}
      for (const a of actuals) {
        if (a.line_item_id) map[a.line_item_id] = a
      }
      setRecapMap(map)
    }).catch(console.error)

    if (estimateId) {
      getReceiptsByEstimate(estimateId).then((receipts) => {
        const map: Record<string, ReceiptAttachment> = {}
        for (const r of receipts) {
          if (r.line_item_id) map[r.line_item_id] = r
        }
        setReceiptsMap(map)
      }).catch(console.error)
    }
  }, [isRecapMode, activeLocationId, estimateId])

  async function handleSaveLineItemActual(lineItemId: string, updates: { actual_total?: number | null; actual_cost_total?: number | null }) {
    if (!activeLocationId || !estimateId) return
    const existing = recapMap[lineItemId]
    try {
      const result = await upsertRecapActual({
        ...(existing ? { id: existing.id } : {}),
        estimate_id: estimateId,
        labor_log_id: activeLocationId,
        line_item_id: lineItemId,
        labor_entry_id: null,
        schedule_entry_id: null,
        actual_cost_total: updates.actual_cost_total ?? existing?.actual_cost_total ?? null,
        actual_total: updates.actual_total ?? existing?.actual_total ?? null,
      })
      setRecapMap((prev) => ({ ...prev, [lineItemId]: result }))
    } catch (err) {
      console.error('Failed to save recap actual:', err)
    }
  }

  async function handleSubmitUnplanned(data: { item_name: string; description: string; actual_cost: number; gl_code: string | null; rate_card_item_id: string | null }) {
    if (!onAddUnplanned || !activeLocationId || !estimateId) return
    const newItem = await onAddUnplanned({
      item_name: data.item_name,
      description: data.description,
      gl_code: data.gl_code,
      rate_card_item_id: data.rate_card_item_id,
    })
    if (!newItem) return
    try {
      const result = await upsertRecapActual({
        estimate_id: estimateId,
        labor_log_id: activeLocationId,
        line_item_id: newItem.id,
        labor_entry_id: null,
        schedule_entry_id: null,
        actual_cost_total: data.actual_cost,
        actual_total: data.actual_cost,
        notes: data.description || null,
      })
      setRecapMap((prev) => ({ ...prev, [newItem.id]: result }))
    } catch (err) {
      console.error('Failed to record unplanned actual:', err)
    }
  }

  return (
    <div className="space-y-2">
      <LocationSelector
        laborLogs={laborLogs}
        activeLocationId={activeLocationId}
        onSelectLocation={onSelectLocation}
        onAddLocation={onAddLocation}
        onDeleteLocation={onDeleteLocation}
        onRenameLocation={onRenameLocation}
        readOnly={readOnly}
        canDelete={canDelete}
      />

      <div>
        {isPassThrough && (
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground/70 font-medium mb-1.5">
            Pass-through · {defaultMarkup}% markup
          </p>
        )}
        {items.length === 0 ? (
          <p className="text-xs text-muted-foreground/70 text-center py-6">No items added yet</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border/40 bg-slate-50 dark:bg-slate-800/30 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                <TableHead className="w-[200px] text-[10px] uppercase tracking-widest text-muted-foreground font-medium py-2">Item</TableHead>
                <TableHead className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium py-2">Description</TableHead>
                <TableHead className="text-center w-14 text-[10px] uppercase tracking-widest text-muted-foreground font-medium py-2">Qty</TableHead>
                <TableHead className="text-right w-24 text-[10px] uppercase tracking-widest text-muted-foreground font-medium py-2">Unit Cost</TableHead>
                <TableHead className="text-right w-24 text-[10px] uppercase tracking-widest text-muted-foreground font-medium py-2">Total</TableHead>
                <TableHead className="text-center w-18 text-[10px] uppercase tracking-widest text-muted-foreground font-medium py-2">Markup %</TableHead>
                <TableHead className="text-right w-28 text-[10px] uppercase tracking-widest text-muted-foreground font-medium py-2">Client Total</TableHead>
                {isRecapMode && (
                  <>
                    <th className="text-right w-24 text-[10px] uppercase tracking-widest text-muted-foreground font-medium py-2">Actual Cost</th>
                    <th className="text-right w-24 text-[10px] uppercase tracking-widest text-muted-foreground font-medium py-2">Variance</th>
                    <th className="text-center w-10 text-[10px] uppercase tracking-widest text-muted-foreground font-medium py-2">Receipt</th>
                  </>
                )}
                <TableHead className="w-6" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <LineItemRow
                  key={item.id}
                  item={item}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                  readOnly={readOnly}
                  recapActual={isRecapMode ? (recapMap[item.id] || null) : undefined}
                  onSaveRecapActual={isRecapMode ? (updates) => handleSaveLineItemActual(item.id, updates) : undefined}
                  receipt={isRecapMode ? (receiptsMap[item.id] || null) : undefined}
                  estimateId={isRecapMode ? estimateId : undefined}
                  onReceiptUpload={isRecapMode ? (receipt) => setReceiptsMap((prev) => ({ ...prev, [item.id]: receipt })) : undefined}
                  onReceiptDelete={isRecapMode ? (id) => setReceiptsMap((prev) => { const next = { ...prev }; delete next[id]; return next }) : undefined}
                />
              ))}
            </TableBody>
          </Table>
        )}
        {!readOnly && (
          <button onClick={() => setShowModal(true)} className="mt-1.5 text-[11px] text-muted-foreground/60 hover:text-foreground/90 transition-colors">
            + Add Item
          </button>
        )}
        {isRecapMode && onAddUnplanned && (
          <button
            onClick={() => setShowUnplannedModal(true)}
            className="mt-1.5 ml-3 text-[11px] text-rose-600/80 hover:text-rose-700 border border-dashed border-rose-300/70 hover:border-rose-400 rounded px-2 py-0.5 transition-colors"
          >
            + Add Unplanned Item
          </button>
        )}
      </div>

      <AddLineItemModal
        open={showModal}
        onOpenChange={setShowModal}
        section={section}
        defaultMarkup={defaultMarkup}
        rateCardData={rateCardData}
        clientName={clientName}
        onAdd={onAdd}
      />

      <AddUnplannedLineItemModal
        open={showUnplannedModal}
        onOpenChange={setShowUnplannedModal}
        section={section}
        rateCardData={rateCardData}
        onAdd={handleSubmitUnplanned}
      />
    </div>
  )
}

// ── Line Item Row ────────────────────────────────────────────────────────────

function LineItemRow({
  item,
  onUpdate,
  onDelete,
  readOnly,
  recapActual,
  onSaveRecapActual,
  receipt,
  estimateId,
  onReceiptUpload,
  onReceiptDelete,
}: {
  item: EstimateLineItem
  onUpdate: (id: string, updates: Partial<EstimateLineItem>) => void
  onDelete: (id: string) => void
  readOnly?: boolean
  recapActual?: RecapActual | null
  onSaveRecapActual?: (updates: { actual_total?: number | null; actual_cost_total?: number | null }) => void
  receipt?: ReceiptAttachment | null
  estimateId?: string
  onReceiptUpload?: (receipt: ReceiptAttachment) => void
  onReceiptDelete?: (lineItemId: string) => void
}) {
  const [qty, setQty] = useState(item.quantity.toString())
  const [unitCost, setUnitCost] = useState(item.unit_cost.toString())
  const [markup, setMarkup] = useState(item.markup_pct.toString())
  const [desc, setDesc] = useState(item.description || '')
  const [actTotal, setActTotal] = useState(getActualCostTotal(recapActual)?.toString() ?? '')
  const [saved, setSaved] = useState(false)

  // Sync local state when async-loaded recapActual arrives
  useEffect(() => {
    setActTotal(getActualCostTotal(recapActual)?.toString() ?? '')
  }, [recapActual?.id])

  const qtyNum = parseFloat(qty) || 0
  const costNum = parseFloat(unitCost) || 0
  const markupNum = parseFloat(markup) || 0
  const total = qtyNum * costNum
  const clientTotal = total * (1 + markupNum / 100)
  const actTotalNum = parseFloat(actTotal) || 0
  const hasActual = actTotal !== '' && recapActual !== undefined
  const variance = hasActual ? total - actTotalNum : null

  const cellInput = "h-6 text-[13px] bg-transparent border-0 focus-visible:ring-0 focus-visible:bg-muted/50 rounded-sm transition-colors tabular-nums"

  function handleActualBlur() {
    if (!onSaveRecapActual) return
    const val = parseFloat(actTotal) || null
    onSaveRecapActual({ actual_cost_total: val, actual_total: val })
    setSaved(true)
    setTimeout(() => setSaved(false), 1200)
  }

  const isUnplanned = item.is_unplanned
  const rowClass = isUnplanned
    ? "group border-b border-border/30 hover:bg-rose-50/40 bg-rose-50/20 [&>td:first-child]:border-l-[3px] [&>td:first-child]:border-l-rose-400"
    : "group border-b border-border/30 hover:bg-muted/30"
  const dash = <span className="text-[13px] text-muted-foreground/40 tabular-nums">—</span>

  return (
    <TableRow className={rowClass}>
      <TableCell className="text-[13px] text-foreground py-1">
        {item.item_name}
        {item.is_auto_generated && (
          <span className="ml-1.5 text-[9px] uppercase tracking-widest font-medium text-blue-600/70 bg-blue-50 px-1 py-0.5 rounded">Auto</span>
        )}
        {isUnplanned && (
          <span className="ml-1.5 text-[9px] uppercase tracking-widest font-medium text-rose-600 bg-rose-50 px-1 py-0.5 rounded">Unplanned</span>
        )}
      </TableCell>
      <TableCell className="py-1">
        <Input
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          onBlur={() => onUpdate(item.id, { description: desc.trim() || null })}
          placeholder="—"
          className={`${cellInput} w-full text-muted-foreground`}
          readOnly={readOnly}
        />
      </TableCell>
      <TableCell className="text-center py-1">
        {isUnplanned ? dash : (
          <StepperInput value={qty} onChange={setQty} onBlur={() => onUpdate(item.id, { quantity: parseFloat(qty) || 1 })} onStep={(v) => onUpdate(item.id, { quantity: v })} min={0} className={cellInput} disabled={readOnly} />
        )}
      </TableCell>
      <TableCell className="text-right py-1">
        {isUnplanned ? <div className="text-right pr-1">{dash}</div> : (
          <div className="relative w-[72px] ml-auto">
            <span className="absolute left-1 top-1/2 -translate-y-1/2 text-[13px] text-muted-foreground/60 pointer-events-none">$</span>
            <Input value={unitCost} onChange={(e) => setUnitCost(e.target.value)} onBlur={() => onUpdate(item.id, { unit_cost: parseFloat(unitCost) || 0 })} onFocus={selectOnFocus} className={`${cellInput} w-full text-right pl-4`} readOnly={readOnly} />
          </div>
        )}
      </TableCell>
      <TableCell className="text-right py-1">
        {isUnplanned ? dash : <span className="text-[13px] font-medium tabular-nums text-foreground">{fmt(total)}</span>}
      </TableCell>
      <TableCell className="text-center py-1">
        {isUnplanned ? dash : (
          <div className="relative w-14 mx-auto">
            <Input
              value={markup}
              onChange={(e) => setMarkup(e.target.value)}
              onBlur={() => onUpdate(item.id, { markup_pct: parseFloat(markup.replace('%', '')) || 0 })}
              onFocus={selectOnFocus}
              className={`${cellInput} w-full text-right pr-4`}
              readOnly={readOnly}
            />
            <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[12px] text-muted-foreground/60 pointer-events-none">%</span>
          </div>
        )}
      </TableCell>
      <TableCell className="text-right py-1">
        {isUnplanned ? dash : <span className="text-[13px] font-medium tabular-nums text-foreground">{fmt(clientTotal)}</span>}
      </TableCell>
      {recapActual !== undefined && onSaveRecapActual && (
        <>
          <TableCell className="text-right py-1">
            <div className="relative w-[72px] ml-auto flex items-center">
              <span className="absolute left-1 top-1/2 -translate-y-1/2 text-[13px] text-muted-foreground/60 pointer-events-none">$</span>
              <Input
                value={actTotal}
                onChange={(e) => setActTotal(e.target.value)}
                onBlur={handleActualBlur}
                placeholder="—"
                className={`${cellInput} w-full text-right pl-4`}
              />
              {saved && <Check className="absolute -right-4 h-3 w-3 text-green-600" />}
            </div>
          </TableCell>
          <TableCell className="text-right py-1">
            {variance !== null ? (
              <span className={`text-[13px] font-medium tabular-nums ${variance >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                {variance >= 0 ? '+' : ''}{fmt(variance)}
              </span>
            ) : (
              <span className="text-[13px] text-muted-foreground/40">—</span>
            )}
          </TableCell>
          <TableCell className="text-center py-1">
            {estimateId && onReceiptUpload && onReceiptDelete && (
              <ReceiptCell
                estimateId={estimateId}
                lineItemId={item.id}
                receipt={receipt ?? null}
                onUploadComplete={onReceiptUpload}
                onDeleteComplete={onReceiptDelete}
              />
            )}
          </TableCell>
        </>
      )}
      <TableCell className="py-1">
        {(!readOnly || isUnplanned) && !item.is_auto_generated && (
          <Trash2 className="h-3 w-3 opacity-0 group-hover:opacity-50 hover:!opacity-100 transition-opacity cursor-pointer text-foreground/60" onClick={() => onDelete(item.id)} />
        )}
      </TableCell>
    </TableRow>
  )
}

// ── Add Line Item Modal (Multi-Select from Rate Card) ────────────────────────

function AddLineItemModal({
  open,
  onOpenChange,
  section,
  defaultMarkup,
  rateCardData,
  clientName,
  onAdd,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  section: string
  defaultMarkup: number
  rateCardData: RateCardItemsBySection[]
  clientName: string
  onAdd: (items: { item_name: string; description: string; quantity: number; unit_cost: number; markup_pct: number; gl_code: string | null; rate_card_item_id: string | null }[]) => void
}) {
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showCustom, setShowCustom] = useState(false)
  const [customName, setCustomName] = useState('')
  const [customCost, setCustomCost] = useState('')
  type CustomItem = { id: string; item_name: string; unit_cost: number }
  const [customItems, setCustomItems] = useState<CustomItem[]>([])

  // Clear selections when modal opens/closes
  useEffect(() => {
    if (!open) {
      setSelectedIds(new Set())
      setSearch('')
      setShowCustom(false)
      setCustomName('')
      setCustomCost('')
      setCustomItems([])
    }
  }, [open])

  // Find matching rate card section
  const rcSectionName = TAB_TO_RC_SECTION[section]
  const rcSection = rateCardData.find((s) => s.section.name === rcSectionName)
  const rcItems = (rcSection?.items ?? []).map((item) => ({ ...item, sectionName: rcSection?.section.name ?? '' }))
  const filtered = search
    ? rcItems.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()))
    : rcItems

  function toggleItem(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleAddCustom() {
    if (!customName.trim()) return
    const id = `custom-${Date.now()}`
    setCustomItems((prev) => [...prev, { id, item_name: customName.trim(), unit_cost: parseFloat(customCost) || 0 }])
    setSelectedIds((prev) => new Set(prev).add(id))
    setCustomName('')
    setCustomCost('')
    setShowCustom(false)
  }

  function handleAddSelected() {
    const rcSelected = rcItems
      .filter((r) => selectedIds.has(r.id))
      .map((item) => ({
        item_name: item.name,
        description: '',
        quantity: 1,
        unit_cost: item.unit_rate ?? 0,
        markup_pct: defaultMarkup,
        gl_code: item.gl_code,
        rate_card_item_id: item.id,
      }))
    const customSelected = customItems
      .filter((r) => selectedIds.has(r.id))
      .map((item) => ({
        item_name: item.item_name,
        description: '',
        quantity: 1,
        unit_cost: item.unit_cost,
        markup_pct: defaultMarkup,
        gl_code: null as string | null,
        rate_card_item_id: null as string | null,
      }))
    onAdd([...rcSelected, ...customSelected])
    onOpenChange(false)
  }

  // Fallback: if no rate card section mapped (e.g., misc), show a simple free-text form
  if (!rcSectionName || rcItems.length === 0) {
    return <AddLineItemManualModal open={open} onOpenChange={onOpenChange} section={section} defaultMarkup={defaultMarkup} onAdd={(item) => onAdd([item])} />
  }

  const sectionLabel = rcSectionName.replace(' Expenses', '').replace(' Costs', '')
  const totalSelected = selectedIds.size

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold">Add Items from Rate Card</DialogTitle>
          <DialogDescription className="text-xs">Select {sectionLabel.toLowerCase()} items from {clientName}'s rate card</DialogDescription>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground/50" />
          <Input placeholder="Search items..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-8 text-sm border-border/30" autoFocus />
        </div>
        <div className="max-h-[300px] overflow-y-auto space-y-0.5">
          {filtered.length === 0 && customItems.length === 0 && (
            <p className="text-xs text-muted-foreground/50 text-center py-4">No matching items found</p>
          )}
          {filtered.map((item) => {
            const selected = selectedIds.has(item.id)
            return (
              <button
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className={`w-full text-left px-3 py-1.5 rounded-sm transition-colors flex items-start gap-2.5 ${selected ? 'bg-muted/60' : 'hover:bg-muted/40'}`}
              >
                <div className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded border ${selected ? 'bg-green-800/15 border-green-800/40' : 'border-border/50'} flex items-center justify-center`}>
                  {selected && <Check className="h-3 w-3 text-green-800/70" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-medium text-foreground/90">{item.name}</span>
                    <span className="text-[13px] text-muted-foreground/60 tabular-nums">
                      {item.unit_rate ? `$${item.unit_rate.toLocaleString()}` : 'Pass-through'}
                      {item.unit_label ? ` ${item.unit_label}` : ''}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground/70">{item.sectionName}{item.gl_code ? ` · GL ${item.gl_code}` : ''}</p>
                </div>
              </button>
            )
          })}
          {/* Custom items already added */}
          {customItems.map((item) => {
            const selected = selectedIds.has(item.id)
            return (
              <button
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className={`w-full text-left px-3 py-1.5 rounded-sm transition-colors flex items-start gap-2.5 ${selected ? 'bg-muted/60' : 'hover:bg-muted/40'}`}
              >
                <div className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded border ${selected ? 'bg-green-800/15 border-green-800/40' : 'border-border/50'} flex items-center justify-center`}>
                  {selected && <Check className="h-3 w-3 text-green-800/70" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-medium text-foreground/90">{item.item_name}</span>
                    <span className="text-[13px] text-muted-foreground/60 tabular-nums">
                      {item.unit_cost ? `$${item.unit_cost.toLocaleString()}` : '$0'}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground/70">Custom item</p>
                </div>
              </button>
            )
          })}
        </div>

        {/* Custom item inline form */}
        {showCustom ? (
          <div className="border border-border/40 rounded-md p-2.5 space-y-2 bg-muted/20">
            <p className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wider">Custom Item</p>
            <div className="flex gap-2">
              <Input
                placeholder="Item name"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="h-7 text-[13px] border-border/40 flex-1"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleAddCustom()}
              />
              <Input
                type="number"
                placeholder="Unit cost"
                value={customCost}
                onChange={(e) => setCustomCost(e.target.value)}
                className="h-7 text-[13px] border-border/40 w-24"
                onKeyDown={(e) => e.key === 'Enter' && handleAddCustom()}
              />
              <Button size="sm" variant="outline" className="h-7 text-[11px] px-2.5" onClick={handleAddCustom} disabled={!customName.trim()}>Add</Button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowCustom(true)}
            className="flex items-center gap-1.5 text-[11px] text-muted-foreground/60 hover:text-foreground/80 transition-colors"
          >
            <Plus className="h-3 w-3" />
            Add custom item
          </button>
        )}

        <DialogFooter>
          <Button
            onClick={handleAddSelected}
            disabled={totalSelected === 0}
            size="sm"
            className="text-xs bg-white hover:bg-green-800/10 text-foreground border border-border/50 hover:border-green-800/30 hover:text-green-800/80 shadow-sm"
          >
            {totalSelected === 0
              ? 'Select items to add'
              : `Add ${totalSelected} Item${totalSelected > 1 ? 's' : ''}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Manual Add Line Item Modal (fallback for Misc tab) ───────────────────────

function AddLineItemManualModal({
  open,
  onOpenChange,
  section,
  defaultMarkup,
  onAdd,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  section: string
  defaultMarkup: number
  onAdd: (item: { item_name: string; description: string; quantity: number; unit_cost: number; markup_pct: number; gl_code: string | null; rate_card_item_id: string | null }) => void
}) {
  const [itemName, setItemName] = useState('')
  const [description, setDescription] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [unitCost, setUnitCost] = useState('')
  const [markupPct, setMarkupPct] = useState(defaultMarkup.toString())

  function handleSave() {
    if (!itemName.trim()) return
    onAdd({
      item_name: itemName.trim(),
      description: description.trim(),
      quantity: parseFloat(quantity) || 1,
      unit_cost: parseFloat(unitCost) || 0,
      markup_pct: parseFloat(markupPct) || 0,
      gl_code: null,
      rate_card_item_id: null,
    })
    setItemName('')
    setDescription('')
    setQuantity('1')
    setUnitCost('')
    setMarkupPct(defaultMarkup.toString())
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold">Add Line Item</DialogTitle>
          <DialogDescription className="text-xs">Add to {section} section</DialogDescription>
        </DialogHeader>
        <div className="space-y-2.5">
          <div className="space-y-1">
            <Label className="text-xs">Item Name *</Label>
            <Input value={itemName} onChange={(e) => setItemName(e.target.value)} placeholder="e.g., Vehicle Transport" className="h-8 text-sm border-border/30" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Description</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g., Carrier delivery of 12 vehicles" className="h-8 text-sm border-border/30" />
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            <div className="space-y-1">
              <Label className="text-xs">Quantity</Label>
              <Input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="h-8 text-sm border-border/30" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Unit Cost ($)</Label>
              <Input type="number" value={unitCost} onChange={(e) => setUnitCost(e.target.value)} className="h-8 text-sm border-border/30" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Markup %</Label>
              <Input type="number" value={markupPct} onChange={(e) => setMarkupPct(e.target.value)} className="h-8 text-sm border-border/30" />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button size="sm" disabled={!itemName.trim()} onClick={handleSave}>Add Item</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Add Unplanned Line Item Modal (Recap Only) ───────────────────────────────
// Single-item form. No qty/unit cost/markup — unplanned items have no approved
// budget, only an actual cost. Item name can be picked from the rate card (to
// inherit GL code + rate_card_item_id) or typed free-text.

function AddUnplannedLineItemModal({
  open,
  onOpenChange,
  section,
  rateCardData,
  onAdd,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  section: string
  rateCardData: RateCardItemsBySection[]
  onAdd: (data: { item_name: string; description: string; actual_cost: number; gl_code: string | null; rate_card_item_id: string | null }) => Promise<void>
}) {
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showCustom, setShowCustom] = useState(false)
  const [customName, setCustomName] = useState('')
  const [description, setDescription] = useState('')
  const [actualCost, setActualCost] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) {
      setSearch('')
      setSelectedId(null)
      setShowCustom(false)
      setCustomName('')
      setDescription('')
      setActualCost('')
      setSaving(false)
    }
  }, [open])

  const rcSectionName = TAB_TO_RC_SECTION[section]
  const rcSection = rateCardData.find((s) => s.section.name === rcSectionName)
  const rcItems = (rcSection?.items ?? []).map((item) => ({ ...item, sectionName: rcSection?.section.name ?? '' }))
  const filtered = search
    ? rcItems.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()))
    : rcItems

  const isCustom = selectedId === '__custom__'
  const picked = rcItems.find((r) => r.id === selectedId)
  const resolvedName = isCustom ? customName.trim() : (picked?.name ?? '')
  const resolvedGlCode: string | null = isCustom ? null : (picked?.gl_code ?? null)
  const resolvedRcId: string | null = isCustom || !picked ? null : picked.id

  const costNum = parseFloat(actualCost)
  const valid = resolvedName.length > 0 && !isNaN(costNum) && costNum > 0

  const sectionLabel = (rcSectionName ?? section).replace(' Expenses', '').replace(' Costs', '')

  function pickItem(id: string) {
    setSelectedId(id)
    setShowCustom(false)
  }

  function openCustom() {
    setSelectedId('__custom__')
    setShowCustom(true)
  }

  async function handleSave() {
    if (!valid || saving) return
    setSaving(true)
    try {
      await onAdd({
        item_name: resolvedName,
        description: description.trim(),
        actual_cost: costNum,
        gl_code: resolvedGlCode,
        rate_card_item_id: resolvedRcId,
      })
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold flex items-center gap-2">
            Add Unplanned Item
            <span className="text-[9px] uppercase tracking-widest font-medium text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">Unplanned</span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            Pick a {sectionLabel.toLowerCase()} item (or add custom) and enter the actual cost. This wasn't part of the approved budget.
          </DialogDescription>
        </DialogHeader>

        {rcItems.length > 0 && (
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground/50" />
            <Input placeholder="Search items..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-8 text-sm border-border/30" autoFocus />
          </div>
        )}

        <div className="max-h-[240px] overflow-y-auto space-y-0.5">
          {rcItems.length === 0 && !isCustom && (
            <p className="text-xs text-muted-foreground/50 text-center py-4">No rate card items — use Custom below</p>
          )}
          {filtered.map((item) => {
            const selected = selectedId === item.id
            return (
              <button
                key={item.id}
                onClick={() => pickItem(item.id)}
                className={`w-full text-left px-3 py-1.5 rounded-sm transition-colors flex items-start gap-2.5 ${selected ? 'bg-rose-50/70' : 'hover:bg-muted/40'}`}
              >
                <div className={`mt-1 flex-shrink-0 w-3.5 h-3.5 rounded-full border ${selected ? 'border-rose-500 bg-rose-500' : 'border-border/50'} flex items-center justify-center`}>
                  {selected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-medium text-foreground/90">{item.name}</span>
                    <span className="text-[13px] text-muted-foreground/60 tabular-nums">
                      {item.unit_rate ? `$${item.unit_rate.toLocaleString()}` : 'Pass-through'}
                      {item.unit_label ? ` ${item.unit_label}` : ''}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground/70">{item.sectionName}{item.gl_code ? ` · GL ${item.gl_code}` : ''}</p>
                </div>
              </button>
            )
          })}
        </div>

        {showCustom ? (
          <div className="border border-border/40 rounded-md p-2.5 space-y-2 bg-rose-50/30">
            <p className="text-[11px] font-medium text-rose-700/80 uppercase tracking-wider">Custom Unplanned Item</p>
            <Input
              placeholder="Item name"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="h-7 text-[13px] border-border/40"
              autoFocus
            />
          </div>
        ) : (
          <button
            onClick={openCustom}
            className="flex items-center gap-1.5 text-[11px] text-muted-foreground/60 hover:text-foreground/80 transition-colors"
          >
            <Plus className="h-3 w-3" />
            Add custom item (not in rate card)
          </button>
        )}

        <div className="space-y-2 pt-1 border-t border-border/30">
          <div className="space-y-1">
            <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">Description (optional)</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Flood response after Day 2"
              className="h-8 text-sm border-border/30"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">Actual Cost *</Label>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground/60">$</span>
              <Input
                type="number"
                inputMode="decimal"
                value={actualCost}
                onChange={(e) => setActualCost(e.target.value)}
                placeholder="0.00"
                className="h-8 text-sm border-border/30 pl-6"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleSave}
            disabled={!valid || saving}
            size="sm"
            className="text-xs bg-white hover:bg-rose-50 text-foreground border border-border/50 hover:border-rose-400 hover:text-rose-700 shadow-sm"
          >
            {saving ? 'Adding…' : (valid ? `Add Unplanned · $${costNum.toLocaleString()}` : 'Pick an item and enter a cost')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Summary Tab ──────────────────────────────────────────────────────────────

// Rate card section display order and line-item key mapping
const SUMMARY_SECTIONS = [
  { name: 'Planning & Administration Labor', type: 'labor', lineItemKey: null, passThrough: false },
  { name: 'Onsite Event Labor', type: 'labor', lineItemKey: null, passThrough: false },
  { name: 'Travel Expenses', type: 'line_item', lineItemKey: 'travel', passThrough: true },
  { name: 'Creative Costs', type: 'line_item', lineItemKey: 'creative', passThrough: false },
  { name: 'Production Expenses', type: 'line_item', lineItemKey: 'production', passThrough: true },
  { name: 'Logistics Expenses', type: 'line_item', lineItemKey: 'access', passThrough: false },
  { name: 'Misc', type: 'line_item', lineItemKey: 'misc', passThrough: false },
  { name: 'Fees & Markups', type: 'line_item', lineItemKey: 'fees', passThrough: false },
] as const

function SummaryTab({
  laborLogs,
  allEntriesMap,
  lineItemsMap,
  rateCardData,
  scheduleEntriesMap,
  gpThreshold,
}: {
  laborLogs: LaborLog[]
  allEntriesMap: Record<string, LaborEntry[]>
  lineItemsMap: Record<string, EstimateLineItem[]>
  rateCardData: RateCardItemsBySection[]
  scheduleEntriesMap: Record<string, ScheduleEntry[]>
  gpThreshold: number
  editRules?: SegmentEditRules
}) {
  // Variance data for recap segments
  const [varianceData, setVarianceData] = useState<Record<string, VarianceRow[]>>({})
  const recapLogs = laborLogs.filter((l) =>
    l.status === 'recap' ||
    l.status === 'accounting_review' ||
    l.status === 'export_ready' ||
    l.status === 'invoiced'
  )
  const hasRecapData = recapLogs.length > 0
  const recapLogIds = recapLogs.map((l) => l.id).join(',')

  // Signal that re-fires when actual_hours change on any schedule cell in a
  // recap segment, so the variance re-loads (labor actuals are derived from
  // schedule actuals for schedule-driven segments).
  const scheduleActualsSignal = recapLogs
    .map((log) => (scheduleEntriesMap[log.id] ?? [])
      .flatMap((e) => e.day_entries ?? [])
      .map((d) => `${d.id || d.work_date}:${d.actual_hours ?? ''}:${d.hours}`)
      .join('|'))
    .join('||')

  useEffect(() => {
    if (!hasRecapData) return
    const loadVariance = async () => {
      const results: Record<string, VarianceRow[]> = {}
      await Promise.all(recapLogs.map(async (log) => {
        try {
          results[log.id] = await getVarianceReport(log.id)
        } catch (err) {
          console.error('Failed to load variance for segment:', log.id, err)
        }
      }))
      setVarianceData(results)
    }
    loadVariance()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasRecapData, recapLogIds, scheduleActualsSignal])
  // Build lookup: rate_card_item_id → rate_card_section name
  const itemSectionMap = new Map<string, string>()
  for (const { section, items } of rateCardData) {
    for (const item of items) {
      itemSectionMap.set(item.id, section.name)
    }
  }



  const hasMultipleSegments = laborLogs.length > 1

  // Categorize labor entries by rate card section
  function laborSectionName(entry: LaborEntry): string {
    if (entry.rate_card_item_id) {
      const sec = itemSectionMap.get(entry.rate_card_item_id)
      if (sec) return sec
    }
    // Default: onsite for day-rate roles, planning for hourly admin
    return 'Onsite Event Labor'
  }

  // Categorize schedule rollup rows by rate card item
  function rollupSectionName(row: LaborRollupRow, schedEntries: ScheduleEntry[]): string {
    // Find the first schedule entry matching this role to get its rate_card_item_id
    const entry = schedEntries.find((e) => e.role_name === row.role_name)
    if (entry?.rate_card_item_id) {
      const sec = itemSectionMap.get(entry.rate_card_item_id)
      if (sec) return sec
    }
    return 'Onsite Event Labor'
  }

  type DetailRow = {
    label: string
    detail: string  // e.g. "2 × 4 days × $700" or "3 × $200"
    revenue: number
    cost: number
    isSegmentHeader?: boolean
  }

  type ResourceBreakdown = { internal: number; external: number; vendor: number }

  type SectionBlock = {
    name: string
    details: DetailRow[]
    total: { revenue: number; cost: number }
    passThrough: boolean
    resourceBreakdown: ResourceBreakdown | null
  }

  const blocks: SectionBlock[] = []

  for (const sec of SUMMARY_SECTIONS) {
    const details: DetailRow[] = []
    let totalRevenue = 0
    let totalCost = 0
    const resByType: ResourceBreakdown = { internal: 0, external: 0, vendor: 0 }
    let hasResourceData = false

    if (sec.type === 'labor') {
      for (const log of laborLogs) {
        const schedEntries = scheduleEntriesMap[log.id] ?? []

        if (schedEntries.length > 0) {
          // Schedule-driven: use rollup data
          const rollup = computeScheduleRollup(schedEntries)
          const sectionRows = rollup.filter((r) => rollupSectionName(r, schedEntries) === sec.name)
          if (sectionRows.length === 0) continue

          if (hasMultipleSegments) {
            details.push({ label: log.location_name, detail: '', revenue: 0, cost: 0, isSegmentHeader: true })
          }

          for (const r of sectionRows) {
            details.push({
              label: r.role_name,
              detail: `${r.quantity} × ${r.total_days}d × ${fmt(r.day_rate)}${r.total_ot_hours > 0 ? ` + ${r.total_ot_hours}h OT` : ''}`,
              revenue: r.revenue_total,
              cost: r.cost_total,
            })
            totalRevenue += r.revenue_total
            totalCost += r.cost_total

            // Accumulate resource type breakdown from schedule entries matching this role
            const matchingEntries = schedEntries.filter((e) => e.role_name === r.role_name)
            for (const me of matchingEntries) {
              const rt = me.resource_type ?? 'external'
              const entryDays = me.day_entries?.filter((d) => d.hours > 0).length ?? 0
              const entryRev = entryDays * me.day_rate
              resByType[rt] += entryRev
              hasResourceData = true
            }
          }
        } else {
          // Manual labor entries (backward compat)
          const entries = (allEntriesMap[log.id] ?? []).filter(
            (e) => laborSectionName(e) === sec.name
          )
          if (entries.length === 0) continue

          if (hasMultipleSegments) {
            details.push({ label: log.location_name, detail: '', revenue: 0, cost: 0, isSegmentHeader: true })
          }

          for (const e of entries) {
            const rev = e.quantity * e.days * (e.override_rate ?? e.unit_rate)
            const cost = e.quantity * e.days * (e.cost_rate ?? 0)
            const rate = e.override_rate ?? e.unit_rate
            details.push({
              label: e.role_name,
              detail: `${e.quantity} × ${e.days}d × ${fmt(rate)}`,
              revenue: rev,
              cost,
            })
            totalRevenue += rev
            totalCost += cost

            // Accumulate resource type from labor entries
            const rt = e.resource_type ?? 'external'
            resByType[rt] += rev
            hasResourceData = true
          }
        }
      }
    } else {
      // For fee lines with fee_basis, compute revenue as % of total estimate subtotal
      const priorTotalRevenue = sec.lineItemKey === 'fees'
        ? blocks.reduce((s, b) => s + b.total.revenue, 0)
        : 0

      for (const log of laborLogs) {
        const items = (lineItemsMap[log.id] ?? []).filter((i) => i.section === sec.lineItemKey)
        if (items.length === 0) continue

        if (hasMultipleSegments) {
          details.push({ label: log.location_name, detail: '', revenue: 0, cost: 0, isSegmentHeader: true })
        }

        for (const i of items) {
          let cost: number
          let rev: number
          let detail: string

          if (i.fee_basis === 'total_estimate') {
            // Dynamic fee: revenue = total estimate subtotal × percentage
            cost = 0
            rev = priorTotalRevenue * (i.markup_pct / 100)
            detail = `${i.markup_pct}% of ${fmt(priorTotalRevenue)}`
          } else {
            cost = i.quantity * i.unit_cost
            rev = cost * (1 + i.markup_pct / 100)
            detail = i.quantity === 1 ? fmt(i.unit_cost) : `${i.quantity} × ${fmt(i.unit_cost)}`
          }

          details.push({ label: i.item_name, detail, revenue: rev, cost })
          totalRevenue += rev
          totalCost += cost
        }
      }
    }

    if (details.length > 0) {
      blocks.push({ name: sec.name, details, total: { revenue: totalRevenue, cost: totalCost }, passThrough: sec.passThrough, resourceBreakdown: hasResourceData ? resByType : null })
    }
  }

  const grandRevenue = blocks.reduce((s, b) => s + b.total.revenue, 0)
  const grandCost = blocks.reduce((s, b) => s + b.total.cost, 0)
  const grandGP = grandRevenue - grandCost
  const ptBlocks = blocks.filter(b => b.passThrough)
  const passThroughRevenue = ptBlocks.reduce((s, b) => s + b.total.revenue, 0)
  const passThroughCost = ptBlocks.reduce((s, b) => s + b.total.cost, 0)
  const netRevenue = grandRevenue - passThroughRevenue
  const netCost = grandCost - passThroughCost
  const netGP = netRevenue - netCost

  return (
    <div className="border border-border/40 rounded-md">
      <div className="px-4 py-2.5 border-b border-border/40">
        <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground/50">P&L Summary</p>
      </div>
      <div className="px-3 pb-3 pt-1">
        {blocks.length === 0 ? (
          <p className="text-[11px] text-muted-foreground/70 text-center py-6">No data yet. Add labor roles and line items to see the summary.</p>
        ) : (
          <Table className="text-[12px]">
            <TableHeader>
              <TableRow className="border-b border-border/40 bg-slate-50 dark:bg-slate-800/30 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                <TableHead className="w-[200px] py-2 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Item</TableHead>
                <TableHead className="py-2 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Detail</TableHead>
                <TableHead className="py-2 text-[10px] font-medium uppercase tracking-widest text-right w-[80px] text-muted-foreground">GR</TableHead>
                <TableHead className="py-2 text-[10px] font-medium uppercase tracking-widest text-right w-[80px] text-muted-foreground">Cost</TableHead>
                <TableHead className="py-2 text-[10px] font-medium uppercase tracking-widest text-right w-[80px] text-muted-foreground">GP</TableHead>
                <TableHead className="py-2 text-[10px] font-medium uppercase tracking-widest text-right w-[52px] text-muted-foreground">GP%</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {blocks.map((block) => {
                const blockGP = block.total.revenue - block.total.cost
                return (
                  <React.Fragment key={block.name}>
                    <TableRow className="bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800/50 border-b border-border/40">
                      <TableCell colSpan={6} className="font-semibold text-[11px] py-1.5 text-foreground uppercase tracking-wide">{block.name}</TableCell>
                    </TableRow>
                    {block.details.map((row, idx) => {
                      if (row.isSegmentHeader) {
                        return (
                          <TableRow key={`${block.name}-seg-${idx}`} className="hover:bg-transparent">
                            <TableCell colSpan={6} className="pl-5 text-[9px] font-medium text-muted-foreground/70 uppercase tracking-widest py-0.5">{row.label}</TableCell>
                          </TableRow>
                        )
                      }
                      const gp = row.revenue - row.cost
                      return (
                        <TableRow key={`${block.name}-${idx}`} className="hover:bg-muted/30 border-b border-border/5">
                          <TableCell className="pl-5 py-0.5 text-[12px] text-foreground/90">{row.label}</TableCell>
                          <TableCell className="py-0.5 text-[12px] text-muted-foreground/70 tabular-nums">{row.detail}</TableCell>
                          <TableCell className="py-0.5 text-[12px] text-right tabular-nums text-foreground/60">{fmt(row.revenue)}</TableCell>
                          <TableCell className="py-0.5 text-[12px] text-right tabular-nums text-foreground/60">{fmt(row.cost)}</TableCell>
                          <TableCell className="py-0.5 text-[12px] text-right tabular-nums text-green-800/60">{fmt(gp)}</TableCell>
                          <TableCell className="py-0.5 text-[12px] text-right tabular-nums text-muted-foreground/70">{pct(gp, row.revenue)}</TableCell>
                        </TableRow>
                      )
                    })}
                    <TableRow className="border-b border-border/40 hover:bg-transparent">
                      <TableCell colSpan={2} className="py-1 pl-5">
                        <span className="text-[11px] font-medium text-muted-foreground/50">{block.name} Subtotal</span>
                        {block.resourceBreakdown && (
                          <span className="ml-2 text-[10px] text-muted-foreground/40">
                            {(['internal', 'external', 'vendor'] as const)
                              .filter((t) => block.resourceBreakdown![t] > 0)
                              .map((t) => `${t.charAt(0).toUpperCase() + t.slice(1)}: ${fmt(block.resourceBreakdown![t])}`)
                              .join(' · ')}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="py-1 text-[12px] text-right font-medium tabular-nums text-foreground/90">{fmt(block.total.revenue)}</TableCell>
                      <TableCell className="py-1 text-[12px] text-right font-medium tabular-nums text-foreground/90">{fmt(block.total.cost)}</TableCell>
                      <TableCell className="py-1 text-[12px] text-right font-medium tabular-nums text-green-800/60">{fmt(blockGP)}</TableCell>
                      <TableCell className="py-1 text-[12px] text-right font-medium tabular-nums text-muted-foreground/50">{pct(blockGP, block.total.revenue)}</TableCell>
                    </TableRow>
                  </React.Fragment>
                )
              })}
              {/* Grand Totals */}
              <TableRow className="border-t border-foreground/10 hover:bg-transparent">
                <TableCell colSpan={2} className="py-1.5 text-[11px] font-bold uppercase tracking-widest text-foreground/90">GR (Gross Revenue)</TableCell>
                <TableCell className="py-1.5 text-[12px] text-right font-bold tabular-nums text-foreground">{fmt(grandRevenue)}</TableCell>
                <TableCell className="py-1.5 text-[12px] text-right font-bold tabular-nums text-foreground">{fmt(grandCost)}</TableCell>
                <TableCell className="py-1.5 text-[12px] text-right font-bold tabular-nums text-green-800/60">{fmt(grandGP)}</TableCell>
                <TableCell className="py-1.5 text-[12px] text-right font-bold tabular-nums text-foreground/60">{pct(grandGP, grandRevenue)}</TableCell>
              </TableRow>
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={2} className="py-1.5 text-[11px] font-bold uppercase tracking-widest text-foreground/70">NR (Net Revenue)</TableCell>
                <TableCell className="py-1.5 text-[12px] text-right font-bold tabular-nums text-foreground/80">{fmt(netRevenue)}</TableCell>
                <TableCell className="py-1.5 text-[12px] text-right font-bold tabular-nums text-foreground/80">{fmt(netCost)}</TableCell>
                <TableCell className="py-1.5 text-[12px] text-right font-bold tabular-nums text-green-800/60">{fmt(netGP)}</TableCell>
                <TableCell className="py-1.5 text-[12px] text-right font-bold tabular-nums text-foreground/60">{pct(netGP, netRevenue)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        )}
        {blocks.length > 0 && grandRevenue > 0 && (() => {
          const gpPct = (grandGP / grandRevenue) * 100
          return gpPct < gpThreshold ? (
            <div className="mt-3 px-4 py-2.5 rounded-md border border-amber-300/60 bg-amber-50/50">
              <p className="text-[12px] text-amber-800 font-medium">
                GP is {gpPct.toFixed(1)}% — below the {gpThreshold}% minimum threshold. This estimate may require additional review.
              </p>
            </div>
          ) : null
        })()}

        {/* Variance Summary for recap segments */}
        {hasRecapData && Object.keys(varianceData).length > 0 && (
          <div className="mt-4 pt-4 border-t border-border/40 space-y-4">
            {recapLogs.map((log) => {
              const rows = varianceData[log.id]
              if (!rows || rows.length === 0) return null
              return (
                <VarianceSummary
                  key={log.id}
                  varianceRows={rows}
                  segmentName={laborLogs.length > 1 ? log.location_name : undefined}
                />
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Intacct Readiness Panel ──────────────────────────────────────────────────

function IntacctReadinessPanel({
  summary,
  exportHistory,
  lastGeneratedCsv,
  lastSavedCsvPath,
  canExportCsv,
  canEditActualBillable,
  exportingType,
  onDownload,
  onSaveActualBillable,
}: {
  summary: AccountingReadinessSummary | null | undefined
  exportHistory: AccountingExportRecord[]
  lastGeneratedCsv: { filename: string; url: string } | null
  lastSavedCsvPath: string | null
  canExportCsv: boolean
  canEditActualBillable: boolean
  exportingType: AccountingExportType | null
  onDownload: (exportType: AccountingExportType) => void
  onSaveActualBillable: (issue: AccountingReadinessIssue, amount: number) => Promise<void>
}) {
  const [exportHistoryOpen, setExportHistoryOpen] = useState(false)

  if (!summary || !summary.isOfficeEvent) return null

  const getFixLocation = (issue: AccountingReadinessIssue): string => {
    if (issue.fixLocation) return issue.fixLocation

    switch (issue.field) {
      case 'customerId':
      case 'lineCustomerId':
        return 'Rate Cards → Client Intacct Defaults'
      case 'paymentTerms':
        return issue.exportType === 'ap'
          ? 'Accounting Setup → Office Profiles, or Estimate Builder → Advanced Intacct Overrides'
          : 'Rate Cards → Client Intacct Defaults, or Estimate Builder → Advanced Intacct Overrides'
      case 'office_accounting_profile_id':
        return 'Estimate Builder → Required Event Accounting Fields'
      case 'vendorId':
        return 'Accounting Setup → Office Profiles'
      case 'lineDepartmentId':
        return 'Estimate Builder → Advanced Intacct Overrides, or Rate Cards → Client Intacct Defaults'
      case 'lineLocationId':
        return 'Estimate Builder → Advanced Intacct Overrides, or Rate Cards → Client Intacct Defaults'
      case 'lineProjectId':
      case 'lineprojectId':
        return 'Estimate Builder → Required Event Accounting Fields'
      case 'revenue_segment_id':
        return 'Estimate Builder → Required Event Accounting Fields'
      case 'event_city':
        return 'Estimate Builder → Required Event Accounting Fields'
      case 'event_state':
        return 'Estimate Builder → Required Event Accounting Fields'
      case 'itemId':
        return 'Rate Cards → Fee Type Mapping'
      case 'glAccountNo':
        return 'Rate Cards → Fee Type Mapping'
      case 'actual_billable_total':
        return 'Estimate Builder → Recap, or confirm safe billable derivation with accounting'
      case 'transAmount':
        return 'Estimate Builder → Recap, or Rate Cards → Fee Type Mapping'
      case 'quantity':
        return 'Estimate Builder → Labor/Schedule or Recap actual days/quantity'
      case 'price':
        return 'Estimate Builder → Rate Card pricing or Recap actual billable amount'
      case 'accounting_review':
        return 'Estimate Builder → Accounting Review'
      case 'segment_status':
        return 'Estimate Builder → Segment Workflow'
      case 'cost_structure':
        return 'Estimate Builder → Event Details'
      case 'permission':
        return 'Admin Users → User Role / Accounting export permission'
      case 'lines':
        return 'Estimate Builder → Recap actuals and accounting mappings'
      default:
        break
    }

    switch (issue.source) {
      case 'client':
        return 'Rate Cards → Client Intacct Defaults'
      case 'office_profile':
        return 'Accounting Setup → Office Profiles'
      case 'estimate':
        return 'Estimate Builder → Required Event Accounting Fields'
      case 'fee_type':
      case 'rate_card_item':
        return 'Rate Cards → Fee Type Mapping'
      case 'line_item':
        return 'Estimate Builder → Line Items / Recap'
      case 'labor_entry':
      case 'schedule_entry':
        return 'Estimate Builder → Labor/Schedule / Recap'
      case 'accounting_review':
        return 'Estimate Builder → Accounting Review'
      case 'segment':
        return 'Estimate Builder → Segment Workflow'
      default:
        return issue.actionHint || 'Review the source record and accounting mapping.'
    }
  }

  const groups = [
    { label: 'AP Bill Upload', result: summary.ap, exportType: 'ap' as const, buttonLabel: 'Download AP Bill Upload CSV' },
    { label: 'AR Invoice Upload', result: summary.ar, exportType: 'ar' as const, buttonLabel: 'Download AR Invoice Upload CSV' },
  ]

  const formatExportType = (value: string) => value === 'ap_bill' ? 'AP Bill' : 'AR Invoice'
  const formatGeneratedBy = (record: AccountingExportRecord) =>
    record.generated_by_profile?.full_name || record.generated_by_profile?.email || 'Unknown user'

  return (
    <div className="border border-border/50 rounded-md bg-white px-3 py-2.5 space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium">Intacct Readiness</p>
          <p className="text-[12px] text-muted-foreground">Generate AP/AR upload files after accounting approval.</p>
        </div>
        <span className={`text-[11px] font-medium px-2 py-1 rounded border ${summary.isReady ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-amber-700 bg-amber-50 border-amber-200'}`}>
          {summary.isReady ? 'Ready' : 'Missing Data'}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {groups.map(({ label, result, exportType, buttonLabel }) => (
          <div key={label} className="border border-border/40 rounded-md p-2">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[13px] font-medium">{label}</span>
              <span className={`text-[11px] ${result.isValid ? 'text-emerald-700' : 'text-amber-700'}`}>
                {result.isValid ? 'Valid' : `${result.missingFields.length} missing`}
              </span>
            </div>
            {result.missingFields.length === 0 ? (
              <p className="text-[12px] text-muted-foreground">No blocking readiness issues found.</p>
            ) : (
              <ul className="space-y-1">
                {result.missingFields.slice(0, 8).map((issue, idx) => (
                  <li key={`${issue.field}-${idx}`} className="text-[12px] text-muted-foreground flex gap-1.5">
                    <AlertTriangle className="h-3 w-3 text-amber-600 mt-0.5 shrink-0" />
                    <span>
                      <span>{issue.message}</span>
                      <span className="block text-[11px] text-muted-foreground/70 mt-0.5">
                        Fix in: {getFixLocation(issue)}
                      </span>
                      {issue.exportType === 'ar' && issue.field === 'actual_billable_total' && canEditActualBillable && (
                        <ActualBillableFixControl issue={issue} onSave={onSaveActualBillable} />
                      )}
                    </span>
                  </li>
                ))}
                {result.missingFields.length > 8 && (
                  <li className="text-[12px] text-muted-foreground">+ {result.missingFields.length - 8} more</li>
                )}
              </ul>
            )}
            {canExportCsv && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={!result.isValid || exportingType === exportType}
                onClick={() => onDownload(exportType)}
                className="mt-2 h-7 text-[11px] gap-1"
              >
                <Download className="h-3 w-3" />
                {exportingType === exportType ? 'Generating...' : buttonLabel}
              </Button>
            )}
          </div>
        ))}
      </div>
      {lastGeneratedCsv && (
        <div className="rounded border border-emerald-200 bg-emerald-50 px-2 py-1.5 text-[12px] text-emerald-800">
          {lastSavedCsvPath ? (
            <>
              CSV saved to <span className="font-mono">{lastSavedCsvPath}</span>.
            </>
          ) : (
            <>CSV generated:</>
          )}
          <a
            href={lastGeneratedCsv.url}
            download={lastGeneratedCsv.filename}
            className="ml-1 font-medium underline underline-offset-2"
          >
            Download again
          </a>
        </div>
      )}
      {exportHistory.length > 0 && (
        <div className="border-t border-border/40 pt-2">
          <button
            type="button"
            onClick={() => setExportHistoryOpen((prev) => !prev)}
            className="flex w-full items-center justify-between text-left"
          >
            <span className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium">
              Export History <span className="normal-case tracking-normal">({exportHistory.length})</span>
            </span>
            <span className="text-[11px] text-muted-foreground">
              {exportHistoryOpen ? 'Hide' : 'Show'}
            </span>
          </button>
          {exportHistoryOpen && (
            <div className="space-y-1 mt-1.5">
              {exportHistory.slice(0, 6).map((record) => {
                const warningCount = Array.isArray(record.warnings) ? record.warnings.length : 0
                return (
                  <div key={record.id} className="grid grid-cols-[80px_1fr_90px_115px_54px] gap-2 items-center text-[11px] text-muted-foreground">
                    <span className="font-medium text-foreground/80">{formatExportType(record.export_type)}</span>
                    <span className="truncate" title={record.file_name}>{record.file_name}</span>
                    <span className="truncate" title={formatGeneratedBy(record)}>{formatGeneratedBy(record)}</span>
                    <span>{new Date(record.generated_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
                    <span className="text-right">{record.row_count} row{record.row_count === 1 ? '' : 's'}{warningCount > 0 ? ` · ${warningCount} warn` : ''}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ActualBillableFixControl({
  issue,
  onSave,
}: {
  issue: AccountingReadinessIssue
  onSave: (issue: AccountingReadinessIssue, amount: number) => Promise<void>
}) {
  const [value, setValue] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    const amount = Number(value)
    if (!Number.isFinite(amount)) {
      toast.error('Enter a valid Actual Billable amount.')
      return
    }

    setSaving(true)
    try {
      await onSave(issue, amount)
      setValue('')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mt-1.5 flex items-center gap-1.5">
      <div className="relative w-28">
        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[12px] text-muted-foreground/60 pointer-events-none">$</span>
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Billable"
          className="h-7 text-[12px] pl-5"
          inputMode="decimal"
        />
      </div>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="h-7 text-[11px]"
        disabled={saving || value.trim() === ''}
        onClick={handleSave}
      >
        {saving ? 'Saving...' : 'Save Actual Billable'}
      </Button>
    </div>
  )
}

// ── Export PDF Button ────────────────────────────────────────────────────────

function ExportButton({ estimateId }: { estimateId: string }) {
  const [open, setOpen] = useState(false)
  const [generating, setGenerating] = useState<PDFType | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  async function handleExport(pdfType: PDFType) {
    setGenerating(pdfType)
    setOpen(false)
    try {
      await generatePDF(estimateId, pdfType)
    } catch (err) {
      console.error('PDF generation failed:', err)
    } finally {
      setGenerating(null)
    }
  }

  const options: { type: PDFType; label: string }[] = [
    { type: 'client_summary', label: 'Client Estimate (Summary)' },
    { type: 'client_detailed', label: 'Client Estimate (Detailed)' },
    { type: 'internal', label: 'Internal P&L' },
    { type: 'invoice_with_receipts', label: 'Receipt Backup Packet' },
  ]

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="outline"
        size="sm"
        className="h-7 text-[11px] gap-1.5"
        onClick={() => setOpen(!open)}
        disabled={generating !== null}
      >
        <Download className="h-3 w-3" />
        {generating ? 'Generating...' : 'Export'}
      </Button>
      {open && (
        <div className="absolute right-0 top-8 z-50 min-w-[200px] bg-white border border-gray-200 rounded-md shadow-lg py-1">
          {options.map((opt) => (
            <button
              key={opt.type}
              className="w-full text-left px-3 py-1.5 text-[12px] hover:bg-gray-50 text-gray-700"
              onClick={() => handleExport(opt.type)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main Page ────────────────────────────────────────────────────────────────

function EstimateBuilderContent({ estimateId }: { estimateId: string }) {
  const { user, displayName, profile } = useUser()
  const userRole = profile?.role || 'account_manager'
  const [estimate, setEstimate] = useState<EstimateWithClient | null>(null)
  const [laborLogs, setLaborLogs] = useState<LaborLog[]>([])
  const [activeLocationId, setActiveLocationId] = useState<string | null>(null)
  const [laborEntriesMap, setLaborEntriesMap] = useState<Record<string, LaborEntry[]>>({})
  const [lineItemsMap, setLineItemsMap] = useState<Record<string, EstimateLineItem[]>>({})
  const [rateCardData, setRateCardData] = useState<RateCardItemsBySection[]>([])
  const [revenueSegments, setRevenueSegments] = useState<RevenueSegment[]>([])
  const [officeProfiles, setOfficeProfiles] = useState<OfficeAccountingProfile[]>([])
  const [scheduleEntriesMap, setScheduleEntriesMap] = useState<Record<string, ScheduleEntry[]>>({})
  const [scheduleRefreshKey, setScheduleRefreshKey] = useState(0)
  const [dayTypesMap, setDayTypesMap] = useState<Record<string, ScheduleDayType[]>>({})
  const [activeTab, setActiveTab] = useState('schedule')
  const [aiPanelOpen, setAiPanelOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [segmentApprovals, setSegmentApprovals] = useState<Record<string, ApprovalRequest | null>>({})
  const [accountingReviews, setAccountingReviews] = useState<Record<string, AccountingReview | null>>({})
  const [accountingReadiness, setAccountingReadiness] = useState<Record<string, AccountingReadinessSummary | null>>({})
  const [accountingExports, setAccountingExports] = useState<Record<string, AccountingExportRecord[]>>({})
  const [exportingType, setExportingType] = useState<AccountingExportType | null>(null)
  const [lastGeneratedCsv, setLastGeneratedCsv] = useState<{ filename: string; url: string; laborLogId: string } | null>(null)
  const [lastSavedCsvPath, setLastSavedCsvPath] = useState<string | null>(null)
  const [draftChangeOrders, setDraftChangeOrders] = useState<Record<string, ChangeOrder | null>>({})
  const [submittedChangeOrders, setSubmittedChangeOrders] = useState<Record<string, ChangeOrder | null>>({})
  const [clientContacts, setClientContacts] = useState<ClientContact[]>([])
  const [gpThreshold, setGpThreshold] = useState(20)
  const [primaryApprover, setPrimaryApprover] = useState<{ id: string; full_name: string } | null>(null)
  const [clientTokens, setClientTokens] = useState<Record<string, ClientApprovalToken | null>>({})

  useEffect(() => {
    return () => {
      if (lastGeneratedCsv?.url) URL.revokeObjectURL(lastGeneratedCsv.url)
    }
  }, [lastGeneratedCsv?.url])
  const [loading, setLoading] = useState(true)

  useEffect(() => { getGPThreshold().then(setGpThreshold) }, [])

  const loadData = useCallback(async () => {
    try {
      const est = await getEstimate(estimateId)
      setEstimate(est)

      const [loadedLogs, rcData, approver, contactData, revenueSegmentData, officeProfileData] = await Promise.all([
        getLaborLogs(estimateId),
        getRateCardItemsBySection(est.client_id),
        getClientApproverForEstimate(estimateId),
        getClientContacts(est.client_id),
        getRevenueSegments(),
        getOfficeAccountingProfiles(),
      ])

      const logs = loadedLogs.length > 0
        ? loadedLogs
        : [await createPrimarySegmentForEstimate(est)]

      setLaborLogs(logs)
      setRateCardData(rcData)
      setPrimaryApprover(approver)
      setClientContacts(contactData)
      setRevenueSegments(revenueSegmentData)
      setOfficeProfiles(officeProfileData)

      // Load entries, line items, and schedule entries for all logs in parallel
      const entriesMap: Record<string, LaborEntry[]> = {}
      const itemsMap: Record<string, EstimateLineItem[]> = {}
      const schedMap: Record<string, ScheduleEntry[]> = {}
      const dtMap: Record<string, ScheduleDayType[]> = {}
      await Promise.all(logs.map(async (log) => {
        const [entries, items, schedEntries, dayTypes] = await Promise.all([
          getLaborEntries(log.id),
          getLineItemsByLocation(log.id),
          getScheduleEntries(log.id),
          getScheduleDayTypes(log.id),
        ])
        entriesMap[log.id] = entries
        itemsMap[log.id] = items
        schedMap[log.id] = schedEntries
        dtMap[log.id] = dayTypes
      }))
      setLaborEntriesMap(entriesMap)
      setLineItemsMap(itemsMap)
      setScheduleEntriesMap(schedMap)
      setDayTypesMap(dtMap)

      // Load pending approvals for segments in in_review status
      const approvalsMap: Record<string, ApprovalRequest | null> = {}
      const tokensMap: Record<string, ClientApprovalToken | null> = {}
      await Promise.all(logs.map(async (log) => {
        if (log.status === 'in_review') {
          approvalsMap[log.id] = await getPendingSegmentApproval(log.id)
          try {
            tokensMap[log.id] = await getLatestClientApprovalToken(log.id)
          } catch (err) {
            console.error('Failed to load client approval token:', err)
            tokensMap[log.id] = null
          }
        }
      }))
      setSegmentApprovals(approvalsMap)
      setClientTokens(tokensMap)

      const accountingReviewMap: Record<string, AccountingReview | null> = {}
      await Promise.all(logs.map(async (log) => {
        if (['recap', 'accounting_review', 'export_ready', 'invoiced'].includes(log.status)) {
          accountingReviewMap[log.id] = await getAccountingReview(log.id)
        }
      }))
      setAccountingReviews(accountingReviewMap)

      const readinessMap: Record<string, AccountingReadinessSummary | null> = {}
      const exportMap: Record<string, AccountingExportRecord[]> = {}
      if (est.cost_structure === 'office') {
        await Promise.all(logs.map(async (log) => {
          if (log.status === 'export_ready') {
            const [summary, exports] = await Promise.all([
              getAccountingReadinessSummary(log.id),
              getAccountingExports(log.id),
            ])
            readinessMap[log.id] = summary
            exportMap[log.id] = exports
          }
        }))
      }
      setAccountingReadiness(readinessMap)
      setAccountingExports(exportMap)

      // Load draft and submitted change orders for active/estimate segments
      const draftCOs: Record<string, ChangeOrder | null> = {}
      const submittedCOs: Record<string, ChangeOrder | null> = {}
      await Promise.all(logs.map(async (log) => {
        if (log.status === 'estimate') {
          draftCOs[log.id] = await getDraftChangeOrder(log.id)
        }
        if (log.status === 'in_review') {
          submittedCOs[log.id] = await getSubmittedChangeOrder(log.id)
        }
      }))
      setDraftChangeOrders(draftCOs)
      setSubmittedChangeOrders(submittedCOs)

      // Set active location (preserve current selection if still valid)
      if (logs.length > 0) {
        setActiveLocationId((prev) => {
          if (prev && logs.some((l) => l.id === prev)) return prev
          const primary = logs.find((l) => l.is_primary)
          return primary?.id ?? logs[0].id
        })
      }
    } catch (err) {
      console.error('Failed to load estimate:', err)
    } finally {
      setLoading(false)
    }
  }, [estimateId])

  useEffect(() => { loadData() }, [loadData])

  // ── AI Nudge State ──
  const [aiNudges, setAiNudges] = useState<Nudge[]>([])
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [dismissedNudgeIds, setDismissedNudgeIds] = useState<string[]>([])
  const [aiAutoRefresh, setAiAutoRefresh] = useState(() => {
    const stored = localStorage.getItem('ai_auto_refresh')
    return stored !== null ? stored === 'true' : true
  })


  // ── AI Chat State ──
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)

  // Load dismissed nudges on mount
  useEffect(() => { getDismissedNudges(estimateId).then(setDismissedNudgeIds) }, [estimateId])

  // Serialize current estimate state for the AI endpoint
  const estimateStateForAI = useMemo(() => {
    if (!estimate) return null

    // Compute simple summary totals across all segments
    let totalRevenue = 0
    let totalCost = 0
    for (const log of laborLogs) {
      for (const entry of laborEntriesMap[log.id] || []) {
        totalRevenue += entry.quantity * entry.days * entry.unit_rate
        totalCost += entry.quantity * entry.days * (entry.cost_rate || 0)
      }
      for (const item of lineItemsMap[log.id] || []) {
        const rev = item.quantity * item.unit_cost * (1 + item.markup_pct / 100)
        totalRevenue += rev
        totalCost += item.quantity * item.unit_cost
      }
    }
    const grossProfit = totalRevenue - totalCost
    const gpPercent = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0

    return {
      client_name: estimate.clients?.name || null,
      event_type: estimate.event_type,
      event_name: estimate.event_name,
      location: estimate.location,
      start_date: estimate.start_date,
      end_date: estimate.end_date,
      cost_structure: estimate.cost_structure,
      attendance: estimate.expected_attendance || null,
      segments: laborLogs.map((log) => ({
        name: log.location_name,
        status: log.status,
        labor_entries: (laborEntriesMap[log.id] || []).map((e) => ({
          role_name: e.role_name,
          quantity: e.quantity,
          days: e.days,
          unit_rate: e.unit_rate,
          cost_rate: e.cost_rate,
          resource_type: e.resource_type,
          gl_code: e.gl_code,
          rate_card_item_id: e.rate_card_item_id,
        })),
        schedule_entries: (scheduleEntriesMap[log.id] || []).map((s) => ({
          role_name: s.role_name,
          resource_type: s.resource_type,
          day_rate: s.day_rate,
          cost_rate: s.cost_rate,
          days_scheduled: s.day_entries?.length || 0,
          total_hours: s.day_entries?.reduce((sum, d) => sum + (d.hours || 0), 0) || 0,
        })),
        staff_count: (scheduleEntriesMap[log.id] || []).length,
        schedule_day_types: (dayTypesMap[log.id] || []).map((dt) => ({
          work_date: dt.work_date,
          day_type: dt.day_type,
        })),
        line_items: (lineItemsMap[log.id] || []).map((li) => ({
          section: li.section,
          item_name: li.item_name,
          quantity: li.quantity,
          unit_cost: li.unit_cost,
          markup_pct: li.markup_pct,
          gl_code: li.gl_code,
          rate_card_item_id: li.rate_card_item_id,
          is_auto_generated: li.is_auto_generated,
          fee_basis: li.fee_basis,
        })),
      })),
      summary: {
        total_revenue: Math.round(totalRevenue * 100) / 100,
        total_cost: Math.round(totalCost * 100) / 100,
        gross_profit: Math.round(grossProfit * 100) / 100,
        gp_percent: Math.round(gpPercent * 10) / 10,
      },
    }
  }, [estimate, laborLogs, laborEntriesMap, lineItemsMap, scheduleEntriesMap, dayTypesMap])

  const dismissedRef = useRef(dismissedNudgeIds)
  dismissedRef.current = dismissedNudgeIds

  const triggerNudgeFetch = useCallback(async (bypassCache = false) => {
    setAiLoading(true)
    setAiError(null)
    try {
      const freshState = await fetchFreshEstimateState(estimateId)
      if (!freshState) {
        setAiLoading(false)
        return
      }
      const [response] = await Promise.all([
        fetchNudges(estimateId, freshState, bypassCache),
        new Promise((r) => setTimeout(r, 800)),
      ])
      if (response.error) {
        setAiError(response.error)
      }
      setAiNudges(response.nudges.filter((n) => !dismissedRef.current.includes(n.id)))
    } catch {
      setAiError('Failed to load estimate data for analysis')
    } finally {
      setAiLoading(false)
    }
  }, [estimateId])

  // Track if we've fetched at least once (gates initial panel-open fetch only)
  const hasFetchedOnce = useRef(false)

  // Auto-refresh: 3-second debounce after ANY estimateStateForAI change
  useEffect(() => {
    if (!aiAutoRefresh || !aiPanelOpen || !estimateStateForAI) return
    if (!hasFetchedOnce.current) return // don't debounce before first fetch
    const timer = setTimeout(() => { triggerNudgeFetch() }, 3000)
    return () => clearTimeout(timer)
  }, [estimateStateForAI, aiAutoRefresh, aiPanelOpen, triggerNudgeFetch])

  // Fetch once when panel opens
  useEffect(() => {
    if (aiPanelOpen && estimateStateForAI && !hasFetchedOnce.current) {
      hasFetchedOnce.current = true
      triggerNudgeFetch()
    }
  }, [aiPanelOpen, estimateStateForAI, triggerNudgeFetch])

  function handleDismissNudge(nudgeId: string) {
    setAiNudges((prev) => prev.filter((n) => n.id !== nudgeId))
    setDismissedNudgeIds((prev) => [...prev, nudgeId])
    if (profile?.id) dismissNudge(estimateId, nudgeId, profile.id)
  }

  function handleToggleAutoRefresh() {
    setAiAutoRefresh((prev) => {
      const next = !prev
      localStorage.setItem('ai_auto_refresh', String(next))
      return next
    })
  }

  async function handleChatSend() {
    const msg = chatInput.trim()
    if (!msg || chatLoading) return
    setChatInput('')
    const userMsg = { role: 'user' as const, content: msg }
    setChatMessages((prev) => [...prev, userMsg])
    setChatLoading(true)
    try {
      const freshState = await fetchFreshEstimateState(estimateId)
      if (!freshState) {
        setChatMessages((prev) => [...prev, { role: 'assistant', content: 'Unable to load estimate data. Please try again.' }])
        return
      }
      const result = await sendChatMessage(estimateId, msg, [...chatMessages, userMsg], freshState)
      setChatMessages((prev) => [...prev, { role: 'assistant', content: result.response }])
    } catch {
      setChatMessages((prev) => [...prev, { role: 'assistant', content: 'Something went wrong. Please try again.' }])
    } finally {
      setChatLoading(false)
    }
  }

  // ── Handlers ──

  async function handleUpdateEstimate(updates: EstimateUpdate) {
    if (!estimate) return
    try {
      const updated = await updateEstimate(estimateId, updates)
      const selectedContact = updates.client_contact_id !== undefined
        ? clientContacts.find((contact) => contact.id === updates.client_contact_id) ?? null
        : estimate.client_contact ?? null
      const nextEstimate = { ...estimate, ...updated, client_contact: selectedContact }
      setEstimate((prev) => prev ? { ...prev, ...updated, client_contact: selectedContact } : prev)

      let nextLogs = laborLogs
      if (nextLogs.length === 0) {
        const repairedLog = await createPrimarySegmentForEstimate(nextEstimate)
        nextLogs = [repairedLog]
        setLaborLogs(nextLogs)
        setLaborEntriesMap((prev) => ({ ...prev, [repairedLog.id]: prev[repairedLog.id] ?? [] }))
        setLineItemsMap((prev) => ({ ...prev, [repairedLog.id]: prev[repairedLog.id] ?? [] }))
        setScheduleEntriesMap((prev) => ({ ...prev, [repairedLog.id]: prev[repairedLog.id] ?? [] }))
        setDayTypesMap((prev) => ({ ...prev, [repairedLog.id]: prev[repairedLog.id] ?? [] }))
        setActiveLocationId(repairedLog.id)
      }

      // Keep the estimate header and segment dates aligned only for the
      // single-segment case. Multi-segment estimates own their timelines per
      // segment, so header edits should not overwrite every segment's calendar.
      if (
        (updates.start_date !== undefined || updates.end_date !== undefined) &&
        nextLogs.length === 1 &&
        nextLogs[0].is_primary
      ) {
        const dateUpdates: { start_date?: string | null; end_date?: string | null } = {}
        if (updates.start_date !== undefined) dateUpdates.start_date = updates.start_date
        if (updates.end_date !== undefined) dateUpdates.end_date = updates.end_date
        const updatedLogs = await Promise.all(
          nextLogs.map((log) => updateLaborLog(log.id, dateUpdates))
        )
        nextLogs = updatedLogs
        setLaborLogs(updatedLogs)
      }

      const newLocation = typeof updates.location === 'string' ? updates.location.trim() : ''
      const primaryPlaceholder =
        nextLogs.length === 1 &&
        nextLogs[0].is_primary &&
        nextLogs[0].location_name === 'Primary' &&
        !(estimate.location ?? '').trim()
          ? nextLogs[0]
          : null

      if (newLocation && primaryPlaceholder) {
        const renamed = await updateLaborLog(primaryPlaceholder.id, { location_name: newLocation })
        setLaborLogs((prev) => prev.map((log) => log.id === renamed.id ? renamed : log))
      }
      if (activeLocationId && activeSegmentStatus === 'export_ready' && nextEstimate.cost_structure === 'office') {
        const summary = await getAccountingReadinessSummary(activeLocationId)
        setAccountingReadiness((prev) => ({ ...prev, [activeLocationId]: summary }))
      }
    } catch (err) {
      console.error('Failed to update estimate:', err)
    }
  }

  async function handleAddLocation(name: string) {
    try {
      if (laborLogs.length === 0 && estimate) {
        const log = await createPrimarySegmentForEstimate(estimate, { location_name: name })
        setLaborLogs([log])
        setLaborEntriesMap((prev) => ({ ...prev, [log.id]: prev[log.id] ?? [] }))
        setLineItemsMap((prev) => ({ ...prev, [log.id]: prev[log.id] ?? [] }))
        setScheduleEntriesMap((prev) => ({ ...prev, [log.id]: prev[log.id] ?? [] }))
        setDayTypesMap((prev) => ({ ...prev, [log.id]: prev[log.id] ?? [] }))
        setActiveLocationId(log.id)
        return
      }

      const nextOrder = laborLogs.length > 0 ? Math.max(...laborLogs.map(l => l.location_order ?? 0)) + 1 : 1
      const log = await createLaborLog({
        estimate_id: estimateId,
        location_name: name,
        is_primary: false,
        start_date: null,
        end_date: null,
        status: 'pipeline',
        location_order: nextOrder,
      })
      setLaborLogs((prev) => [...prev, log])
      setLaborEntriesMap((prev) => ({ ...prev, [log.id]: [] }))
      setLineItemsMap((prev) => ({ ...prev, [log.id]: [] }))
      setScheduleEntriesMap((prev) => ({ ...prev, [log.id]: [] }))
      setDayTypesMap((prev) => ({ ...prev, [log.id]: [] }))
      setActiveLocationId(log.id)
    } catch (err) {
      console.error('Failed to add location:', err)
    }
  }

  async function handleDeleteLocation(logId: string) {
    try {
      await deleteLaborLog(logId)
      setLaborLogs((prev) => prev.filter((l) => l.id !== logId))
      setLaborEntriesMap((prev) => {
        const next = { ...prev }
        delete next[logId]
        return next
      })
      setLineItemsMap((prev) => {
        const next = { ...prev }
        delete next[logId]
        return next
      })
      // Switch to first remaining log
      setActiveLocationId((prev) => {
        if (prev === logId) {
          const remaining = laborLogs.filter((l) => l.id !== logId)
          return remaining[0]?.id ?? null
        }
        return prev
      })
    } catch (err) {
      console.error('Failed to delete location:', err)
    }
  }

  async function handleRenameLocation(logId: string, name: string) {
    try {
      await updateLaborLog(logId, { location_name: name })
      setLaborLogs((prev) => prev.map((l) => l.id === logId ? { ...l, location_name: name } : l))
    } catch (err) {
      console.error('Failed to rename location:', err)
    }
  }

  async function handleAddEntry(entries: { role_name: string; unit_rate: number; cost_rate: number | null; gl_code: string | null; rate_card_item_id: string | null }[]) {
    if (!activeLocationId) return
    try {
      const currentCount = laborEntriesMap[activeLocationId]?.length ?? 0
      const created = await Promise.all(
        entries.map((data, i) =>
          createLaborEntry({
            labor_log_id: activeLocationId,
            role_name: data.role_name,
            unit_rate: data.unit_rate,
            cost_rate: data.cost_rate,
            gl_code: data.gl_code,
            rate_card_item_id: data.rate_card_item_id,
            quantity: 1,
            days: estimate?.duration_days ?? 1,
            override_rate: null,
            override_reason: null,
            has_overtime: false,
            overtime_rate: null,
            overtime_hours: null,
            notes: null,
            resource_type: 'external',
            is_unplanned: false,
            display_order: currentCount + i,
          })
        )
      )
      setLaborEntriesMap((prev) => ({
        ...prev,
        [activeLocationId]: [...(prev[activeLocationId] ?? []), ...created],
      }))
    } catch (err) {
      console.error('Failed to add entries:', err)
    }
  }

  async function handleAddUnplannedLaborEntry(
    data: { role_name: string; unit_rate: number; cost_rate: number | null; gl_code: string | null; rate_card_item_id: string | null },
  ): Promise<LaborEntry | null> {
    if (!activeLocationId) return null
    try {
      const currentCount = laborEntriesMap[activeLocationId]?.length ?? 0
      const created = await createLaborEntry({
        labor_log_id: activeLocationId,
        role_name: data.role_name,
        unit_rate: data.unit_rate,
        cost_rate: data.cost_rate,
        gl_code: data.gl_code,
        rate_card_item_id: data.rate_card_item_id,
        quantity: 0,
        days: 0,
        override_rate: null,
        override_reason: null,
        has_overtime: false,
        overtime_rate: null,
        overtime_hours: null,
        notes: null,
        resource_type: 'external',
        is_unplanned: true,
        display_order: currentCount,
      })
      setLaborEntriesMap((prev) => ({
        ...prev,
        [activeLocationId]: [...(prev[activeLocationId] ?? []), created],
      }))
      return created
    } catch (err) {
      console.error('Failed to add unplanned labor entry:', err)
      return null
    }
  }

  async function handleUpdateEntry(id: string, updates: Partial<LaborEntry>) {
    if (!activeLocationId) return
    try {
      const updated = await updateLaborEntry(id, updates)
      setLaborEntriesMap((prev) => ({
        ...prev,
        [activeLocationId]: (prev[activeLocationId] ?? []).map((e) => e.id === id ? updated : e),
      }))
    } catch (err) {
      console.error('Failed to update entry:', err)
    }
  }

  async function handleDeleteEntry(id: string) {
    if (!activeLocationId) return
    try {
      await deleteLaborEntry(id)
      setLaborEntriesMap((prev) => ({
        ...prev,
        [activeLocationId]: (prev[activeLocationId] ?? []).filter((e) => e.id !== id),
      }))
    } catch (err) {
      console.error('Failed to delete entry:', err)
    }
  }

  async function handleAddLineItems(
    section: string,
    items: { item_name: string; description: string; quantity: number; unit_cost: number; markup_pct: number; gl_code: string | null; rate_card_item_id: string | null }[],
  ) {
    if (!activeLocationId) return
    try {
      const activeItems = lineItemsMap[activeLocationId] ?? []
      const baseOrder = activeItems.filter((i) => i.section === section).length
      const created = await Promise.all(
        items.map((data, idx) =>
          createLineItem({
            estimate_id: estimateId,
            labor_log_id: activeLocationId,
            section,
            item_name: data.item_name,
            description: data.description || null,
            quantity: data.quantity,
            unit_cost: data.unit_cost,
            markup_pct: data.markup_pct,
            gl_code: data.gl_code,
            rate_card_item_id: data.rate_card_item_id,
            notes: null,
            is_auto_generated: false,
            fee_basis: null,
            is_unplanned: false,
            display_order: baseOrder + idx,
          })
        )
      )
      setLineItemsMap((prev) => ({
        ...prev,
        [activeLocationId]: [...(prev[activeLocationId] ?? []), ...created],
      }))
    } catch (err) {
      console.error('Failed to add line items:', err)
    }
  }

  async function handleAddUnplannedLineItem(
    section: string,
    data: { item_name: string; description: string; gl_code: string | null; rate_card_item_id: string | null },
  ): Promise<EstimateLineItem | null> {
    if (!activeLocationId) return null
    try {
      const activeItems = lineItemsMap[activeLocationId] ?? []
      const baseOrder = activeItems.filter((i) => i.section === section).length
      const created = await createLineItem({
        estimate_id: estimateId,
        labor_log_id: activeLocationId,
        section,
        item_name: data.item_name,
        description: data.description || null,
        quantity: 0,
        unit_cost: 0,
        markup_pct: 0,
        gl_code: data.gl_code,
        rate_card_item_id: data.rate_card_item_id,
        notes: null,
        is_auto_generated: false,
        fee_basis: null,
        is_unplanned: true,
        display_order: baseOrder,
      })
      setLineItemsMap((prev) => ({
        ...prev,
        [activeLocationId]: [...(prev[activeLocationId] ?? []), created],
      }))
      return created
    } catch (err) {
      console.error('Failed to add unplanned line item:', err)
      return null
    }
  }

  async function handleUpdateLineItem(id: string, updates: Partial<EstimateLineItem>) {
    if (!activeLocationId) return
    try {
      const updated = await updateLineItem(id, updates)
      setLineItemsMap((prev) => ({
        ...prev,
        [activeLocationId]: (prev[activeLocationId] ?? []).map((i) => i.id === id ? updated : i),
      }))
    } catch (err) {
      console.error('Failed to update line item:', err)
    }
  }

  async function handleDeleteLineItem(id: string) {
    if (!activeLocationId) return
    try {
      await deleteLineItem(id)
      setLineItemsMap((prev) => ({
        ...prev,
        [activeLocationId]: (prev[activeLocationId] ?? []).filter((i) => i.id !== id),
      }))
    } catch (err) {
      console.error('Failed to delete line item:', err)
    }
  }

  // ── Workflow handlers ──

  const userId = profile?.id || displayName

  async function handleSegmentTransition(toStatus: SegmentStatus, comment?: string) {
    if (!activeLocationId) return { success: false, error: 'No segment selected' }

    // "Submit for Review" goes through the approval workflow
    if (toStatus === 'in_review') {
      const result = await submitForApproval(estimateId, userId, activeLocationId, comment)
      if (result.error) return { success: false, error: result.error }
      await loadData()
      return { success: true }
    }

    const result = await transitionSegmentStatus(activeLocationId, toStatus, comment, userId)
    if (result.success) await loadData()
    return result
  }

  async function handleApprove(approvalId: string, notes?: string, skipClientGate?: boolean) {
    if (!activeLocationId) return { success: false, error: 'No segment selected' }
    const co = submittedChangeOrders[activeLocationId]
    if (co) {
      const result = await approveChangeOrder(co.id, approvalId, userId, userRole, notes, skipClientGate)
      if (result.success) await loadData()
      return result
    }
    const result = await reviewApproval(approvalId, 'approved', userId, userRole, notes, skipClientGate)
    if (result.success) await loadData()
    return result
  }

  async function handleSendToClient(
    approvalId: string | null,
    params: { recipientEmail: string; note: string },
  ): Promise<{ ok: boolean; error?: string }> {
    if (!activeLocationId) return { ok: false, error: 'No segment selected' }
    const result = await sendClientApproval({
      estimateId,
      laborLogId: activeLocationId,
      approvalRequestId: approvalId,
      recipientEmail: params.recipientEmail,
      note: params.note,
      sentBy: profile?.id ?? null,
    })
    if (result.ok) {
      try {
        const fresh = await getLatestClientApprovalToken(activeLocationId)
        setClientTokens((prev) => ({ ...prev, [activeLocationId]: fresh }))
      } catch (err) {
        console.error('Failed to refresh client approval token:', err)
      }
    }
    return { ok: result.ok, error: result.error }
  }

  async function handleReject(approvalId: string, notes: string) {
    if (!activeLocationId) return { success: false, error: 'No segment selected' }
    const co = submittedChangeOrders[activeLocationId]
    if (co) {
      const result = await rejectChangeOrder(co.id, approvalId, estimateId, activeLocationId, userId, userRole, notes)
      if (result.success) {
        await loadData()
        setScheduleRefreshKey((k) => k + 1)
        return result
      }
      return result
    }
    const result = await reviewApproval(approvalId, 'rejected', userId, userRole, notes)
    if (result.success) await loadData()
    return result
  }

  async function handleSubmitRecapForAccounting(notes?: string) {
    if (!activeLocationId) return { success: false, error: 'No segment selected' }
    const result = await submitRecapForAccounting(activeLocationId, userId, notes)
    if (result.success) await loadData()
    return result
  }

  async function handleApproveRecap(notes?: string) {
    if (!activeLocationId) return { success: false, error: 'No segment selected' }
    const review = accountingReviews[activeLocationId]
    if (!review || review.status !== 'pending') {
      return { success: false, error: 'No pending accounting review found' }
    }
    const result = await approveRecap(review.id, userId, notes)
    if (result.success) await loadData()
    return result
  }

  async function handleDownloadAccountingCsv(exportType: AccountingExportType) {
    if (!activeLocationId || !user?.id) {
      toast.error('You must be signed in to generate Intacct upload CSVs.')
      return
    }
    setExportingType(exportType)
    try {
      const result = await downloadAccountingCsvForSegment(activeLocationId, exportType, user.id)
      if (result.blockingIssues.length > 0) {
        toast.error(result.blockingIssues.slice(0, 3).map((issue) => issue.message).join(' '))
        return
      }
      if (result.csvText) {
        const blob = new Blob([result.csvText], { type: 'text/csv;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        setLastGeneratedCsv({ filename: result.filename, url, laborLogId: activeLocationId })
        setLastSavedCsvPath(result.savedPath ?? null)
      }
      toast.success(result.savedPath ? `Saved ${result.filename}` : `Generated ${result.filename}`)
      const [summary, exports] = await Promise.all([
        getAccountingReadinessSummary(activeLocationId),
        getAccountingExports(activeLocationId),
      ])
      setAccountingReadiness((prev) => ({ ...prev, [activeLocationId]: summary }))
      setAccountingExports((prev) => ({ ...prev, [activeLocationId]: exports }))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to generate Intacct upload CSV.')
    } finally {
      setExportingType(null)
    }
  }

  async function handleSaveActualBillableFromReadiness(issue: AccountingReadinessIssue, amount: number) {
    if (!activeLocationId || !estimate) return
    if (!issue.lineItemId && !issue.laborEntryId) {
      toast.error('This readiness issue is not linked to a recap line.')
      return
    }

    try {
      const actuals = await getRecapActuals(activeLocationId)
      const existing = actuals.find((actual) =>
        (issue.lineItemId && actual.line_item_id === issue.lineItemId) ||
        (issue.laborEntryId && actual.labor_entry_id === issue.laborEntryId)
      )

      await upsertRecapActual({
        ...(existing ?? {}),
        estimate_id: estimate.id,
        labor_log_id: activeLocationId,
        line_item_id: issue.lineItemId ?? existing?.line_item_id ?? null,
        labor_entry_id: issue.laborEntryId ?? existing?.labor_entry_id ?? null,
        actual_billable_total: amount,
        actual_amount_notes: existing?.actual_amount_notes ?? 'Actual billable entered from Intacct Readiness.',
      })

      const summary = await getAccountingReadinessSummary(activeLocationId)
      setAccountingReadiness((prev) => ({ ...prev, [activeLocationId]: summary }))
      toast.success('Actual Billable saved.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save Actual Billable.')
    }
  }

  async function handleRequestRecapCorrections(notes: string) {
    if (!activeLocationId) return { success: false, error: 'No segment selected' }
    const review = accountingReviews[activeLocationId]
    if (!review || review.status !== 'pending') {
      return { success: false, error: 'No pending accounting review found' }
    }
    const result = await requestRecapCorrections(review.id, userId, notes)
    if (result.success) {
      await loadData()
      setScheduleRefreshKey((k) => k + 1)
    }
    return result
  }

  async function handleCreateChangeOrder(description: string) {
    if (!activeLocationId) return { success: false, error: 'No segment selected' }
    try {
      // 1. Create the CO record
      const co = await createChangeOrder({ estimate_id: estimateId, labor_log_id: activeLocationId, description, created_by: userId })
      // 2. Capture baseline version snapshot
      const { versionId, error: snapErr } = await createVersionSnapshot(estimateId, userId, `${formatCONumber(co.co_number)} baseline: ${description}`)
      if (snapErr) return { success: false, error: snapErr }
      // 3. Store baseline version ID and total on the CO
      await updateChangeOrderBaseline(co.id, versionId, 0)
      // 4. Transition segment to estimate for editing
      const result = await transitionSegmentStatus(activeLocationId, 'estimate', `Change Order ${formatCONumber(co.co_number)}: ${description}`, userId)
      if (result.success) await loadData()
      return result
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to create change order' }
    }
  }

  async function handleSubmitChangeOrder() {
    if (!activeLocationId) return { success: false, error: 'No segment selected' }
    const co = draftChangeOrders[activeLocationId]
    if (!co) return { success: false, error: 'No draft change order found' }
    try {
      // 1. Compute delta + create revised snapshot + update CO to submitted
      const { error: submitErr } = await submitChangeOrder(co.id, estimateId, activeLocationId, userId)
      if (submitErr) return { success: false, error: submitErr }
      // 2. Route through approval workflow
      const result = await submitForApproval(estimateId, userId, activeLocationId)
      if (result.error) return { success: false, error: result.error }
      await loadData()
      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to submit change order' }
    }
  }

  // Segment-aware edit rules: derive from the active segment's status
  const activeLog = laborLogs.find((l) => l.id === activeLocationId)
  const activeSegmentStatus = (activeLog?.status || 'estimate') as SegmentStatus
  const activeAccountingReview = activeLocationId ? accountingReviews[activeLocationId] : null
  const isOfficeEvent = estimate?.cost_structure === 'office'
  const baseEditRules: SegmentEditRules = getSegmentEditRules(activeSegmentStatus)
  const canReviewRecap = hasPermission(userRole, 'review_recap')
  const canEditAccountingMappings = hasPermission(userRole, 'edit_accounting_mappings')
  const canEditExportReadyAccountingMetadata =
    isOfficeEvent && activeSegmentStatus === 'export_ready' && canEditAccountingMappings
  const canExportCsv = hasPermission(userRole, 'export_intacct_csv')
  const editRules: SegmentEditRules =
    activeSegmentStatus === 'accounting_review' && canReviewRecap
      ? { ...baseEditRules, actuals: true, names_required: true, notes: true }
      : baseEditRules

  // ── Render ──

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-muted-foreground/50">Loading estimate...</p>
      </div>
    )
  }

  if (!estimate) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-muted-foreground/50">Estimate not found.</p>
      </div>
    )
  }

  const defaultMarkup = estimate.clients.third_party_markup * 100
  const activeEntries = activeLocationId ? (laborEntriesMap[activeLocationId] ?? []) : []
  const activeLineItems = activeLocationId ? (lineItemsMap[activeLocationId] ?? []) : []

  const lineItemTabs = [
    { key: 'production', label: 'Production', pt: true },
    { key: 'travel', label: 'Travel & Logistics', pt: true },
    { key: 'creative', label: 'Creative', pt: false },
    { key: 'access', label: 'Access Fees & Insurance', pt: false },
    { key: 'misc', label: 'Misc', pt: false },
    { key: 'fees', label: 'Fees & Markups', pt: false },
  ]

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">{estimate.event_name}</h1>
          <p className="text-sm text-muted-foreground">{estimate.clients.name} · Estimate Builder</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton estimateId={estimateId} />
          <HistoryButton onClick={() => setHistoryOpen(true)} />
        </div>
      </div>

      <EstimateStatusBar status={activeSegmentStatus} />

      {activeLocationId && segmentApprovals[activeLocationId] && activeSegmentStatus === 'in_review' && (
        <ApprovalBanner
          approval={segmentApprovals[activeLocationId]!}
          userRole={userRole}
          onApprove={handleApprove}
          onReject={handleReject}
          changeOrder={submittedChangeOrders[activeLocationId] ?? undefined}
                clientEmailContext={
                  segmentApprovals[activeLocationId]?.approval_gate === 'client'
                    ? {
                        defaultEmail: estimate.client_contact?.email ?? estimate.clients.billing_contact_email,
                        contacts: clientContacts.map((contact) => ({
                          id: contact.id,
                          name: contact.name,
                          email: contact.email,
                          title: contact.title,
                        })),
                        clientName: estimate.clients.name,
                  eventName: estimate.event_name,
                  estimateId,
                  segmentId: activeLocationId,
                  latestToken: clientTokens[activeLocationId] ?? null,
                  onSend: (params) =>
                    handleSendToClient(segmentApprovals[activeLocationId]?.id ?? null, params),
                }
              : undefined
          }
        />
      )}

      {/* Client rejection feedback banner */}
      {activeLocationId && activeSegmentStatus === 'estimate' && clientTokens[activeLocationId]?.status === 'rejected' && (
        <div className="flex items-start gap-2 px-3 py-2 bg-red-50 border border-red-200/60 rounded text-[11px] text-red-800">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-red-600" />
          <div>
            <span className="font-medium">Client requested changes</span>
            <span className="text-red-700/70 ml-1">
              ({clientTokens[activeLocationId]!.client_email}
              {clientTokens[activeLocationId]!.rejected_at && (
                <> on {new Date(clientTokens[activeLocationId]!.rejected_at!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</>
              )})
            </span>
            {clientTokens[activeLocationId]!.rejection_notes && (
              <p className="mt-1 text-red-700/90 whitespace-pre-wrap">
                &ldquo;{clientTokens[activeLocationId]!.rejection_notes}&rdquo;
              </p>
            )}
          </div>
        </div>
      )}

      {/* Change Order in-progress banner */}
      {activeLocationId && draftChangeOrders[activeLocationId] && activeSegmentStatus === 'estimate' && (
        <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200/60 rounded text-[11px] text-blue-700">
          <Sparkles className="h-3.5 w-3.5 shrink-0" />
          <span className="font-medium">
            {formatCONumber(draftChangeOrders[activeLocationId]!.co_number)} in progress
          </span>
          <span className="text-blue-600/70">— {draftChangeOrders[activeLocationId]!.description}</span>
        </div>
      )}

      {activeLog && (
        <SegmentTransitionBar
          segmentName={activeLog.location_name}
          status={activeSegmentStatus}
          userRole={userRole}
          primaryApprover={primaryApprover}
          isOfficeEvent={isOfficeEvent}
          accountingReview={activeAccountingReview}
          onTransition={handleSegmentTransition}
          onSubmitRecapForAccounting={handleSubmitRecapForAccounting}
          onApproveRecap={handleApproveRecap}
          onRequestCorrections={handleRequestRecapCorrections}
          onCreateChangeOrder={handleCreateChangeOrder}
          onSubmitChangeOrder={handleSubmitChangeOrder}
          hasDraftCO={!!(activeLocationId && draftChangeOrders[activeLocationId])}
          unnamedStaffCount={
            activeSegmentStatus === 'recap' && activeLocationId
              ? (scheduleEntriesMap[activeLocationId] ?? []).filter((e) => !e.person_name?.trim()).length
              : undefined
          }
        />
      )}

      {isOfficeEvent && activeLocationId && activeSegmentStatus === 'export_ready' && (
        <IntacctReadinessPanel
          summary={accountingReadiness[activeLocationId]}
          exportHistory={accountingExports[activeLocationId] ?? []}
          lastGeneratedCsv={lastGeneratedCsv?.laborLogId === activeLocationId ? lastGeneratedCsv : null}
          lastSavedCsvPath={lastGeneratedCsv?.laborLogId === activeLocationId ? lastSavedCsvPath : null}
          canExportCsv={canExportCsv}
          canEditActualBillable={canEditAccountingMappings || canExportCsv}
          exportingType={exportingType}
          onDownload={handleDownloadAccountingCsv}
          onSaveActualBillable={handleSaveActualBillableFromReadiness}
        />
      )}

      {/* 70/30 Split Layout — AI panel collapsible */}
      <div className="flex gap-0">
        {/* Left Panel — Estimate Working Area */}
        <div className={`min-w-0 space-y-2.5 transition-all duration-200 ${aiPanelOpen ? 'flex-[7]' : 'flex-1'}`}>
          <EventHeader
            estimate={estimate}
            onUpdate={handleUpdateEstimate}
            readOnly={!editRules.event_details}
            notesEditable={editRules.notes}
            revenueSegments={revenueSegments}
            officeProfiles={officeProfiles}
            clientContacts={clientContacts}
            accountingEditable={canEditExportReadyAccountingMetadata}
            canManageAccountingSetup={canEditAccountingMappings}
          />

          <FinancialSummaryCards
            laborLogs={laborLogs}
            allEntriesMap={laborEntriesMap}
            scheduleEntriesMap={scheduleEntriesMap}
            lineItemsMap={lineItemsMap}
            rateCardData={rateCardData}
            gpThreshold={gpThreshold}
          />

          <Tabs value={activeTab} onValueChange={async (tab) => {
            setActiveTab(tab)
            // Refresh schedule, labor, and day types when leaving the schedule tab so Labor Log / Summary / AI see latest data
            if (activeTab === 'schedule' && tab !== 'schedule') {
              const schedMap: Record<string, ScheduleEntry[]> = {}
              const entriesMap: Record<string, LaborEntry[]> = {}
              const dtMap: Record<string, ScheduleDayType[]> = {}
              await Promise.all(laborLogs.map(async (log) => {
                const [sched, entries, dayTypes] = await Promise.all([
                  getScheduleEntries(log.id),
                  getLaborEntries(log.id),
                  getScheduleDayTypes(log.id),
                ])
                schedMap[log.id] = sched
                entriesMap[log.id] = entries
                dtMap[log.id] = dayTypes
              }))
              setScheduleEntriesMap(schedMap)
              setLaborEntriesMap(entriesMap)
              setDayTypesMap(dtMap)
            }
          }}>
            <TabsList variant="line" className="border-b border-border/40 w-full">
              <TabsTrigger value="schedule" className="text-[13px]">Schedule</TabsTrigger>
              <TabsTrigger value="labor" className="text-[13px]">Labor Log</TabsTrigger>
              {lineItemTabs.map((tab) => (
                <TabsTrigger key={tab.key} value={tab.key} className="text-[13px]">{tab.label}</TabsTrigger>
              ))}
              <TabsTrigger value="summary" className="text-[13px]">Summary</TabsTrigger>
            </TabsList>

            {activeSegmentStatus === 'pipeline' && activeTab !== 'header' ? (
              <div className="space-y-2">
                <LocationSelector
                  laborLogs={laborLogs}
                  activeLocationId={activeLocationId}
                  onSelectLocation={setActiveLocationId}
                  onAddLocation={handleAddLocation}
                  onDeleteLocation={handleDeleteLocation}
                  onRenameLocation={handleRenameLocation}
                  readOnly={!editRules.schedule_add_remove}
                  canDelete={hasPermission(userRole, 'delete_estimate')}
                />
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="rounded-lg border border-zinc-200/60 bg-zinc-50/50 px-8 py-10 max-w-md">
                    <p className="text-[13px] text-muted-foreground">
                      This segment is in <span className="font-medium text-foreground">Pipeline</span> status. Click{' '}
                      <span className="font-medium text-foreground">"Begin Estimating"</span> above to start building
                      the labor plan and line items.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
            <>

            <TabsContent value="schedule">
              <div className="space-y-2">
                <LocationSelector
                  laborLogs={laborLogs}
                  activeLocationId={activeLocationId}
                  onSelectLocation={setActiveLocationId}
                  onAddLocation={handleAddLocation}
                  onDeleteLocation={handleDeleteLocation}
                  onRenameLocation={handleRenameLocation}
                  readOnly={!editRules.schedule_add_remove}
                  canDelete={hasPermission(userRole, 'delete_estimate')}
                />
                {activeLocationId && laborLogs.find((l) => l.id === activeLocationId) && (
                  <ScheduleGrid
                    key={scheduleRefreshKey}
                    laborLog={laborLogs.find((l) => l.id === activeLocationId)!}
                    estimate={estimate}
                    rateCardData={rateCardData}
                    readOnly={!editRules.schedule_hours}
                    namesEditable={editRules.schedule_names}
                    recapMode={editRules.actuals}
                    onUpdateDates={async (startDate, endDate) => {
                      const updated = await updateLaborLog(activeLocationId, { start_date: startDate, end_date: endDate })
                      setLaborLogs((prev) => prev.map((l) => l.id === activeLocationId ? updated : l))
                    }}
                    onDataChange={async () => {
                      if (!activeLocationId) return
                      const [updatedSched, updatedLabor, updatedDayTypes] = await Promise.all([
                        getScheduleEntries(activeLocationId),
                        getLaborEntries(activeLocationId),
                        getScheduleDayTypes(activeLocationId),
                      ])
                      setScheduleEntriesMap((prev) => ({ ...prev, [activeLocationId]: updatedSched }))
                      setLaborEntriesMap((prev) => ({ ...prev, [activeLocationId]: updatedLabor }))
                      setDayTypesMap((prev) => ({ ...prev, [activeLocationId]: updatedDayTypes }))
                    }}
                  />
                )}
              </div>
            </TabsContent>

            <TabsContent value="labor">
              <LaborLogTab
                estimate={estimate}
                laborLogs={laborLogs}
                activeLocationId={activeLocationId}
                entries={activeEntries}
                rateCardData={rateCardData}
                allEntriesMap={laborEntriesMap}
                scheduleEntriesMap={scheduleEntriesMap}
                onSelectLocation={setActiveLocationId}
                onAddLocation={handleAddLocation}
                onDeleteLocation={handleDeleteLocation}
                onRenameLocation={handleRenameLocation}
                onAddEntry={handleAddEntry}
                onAddUnplannedLaborEntry={handleAddUnplannedLaborEntry}
                onUpdateEntry={handleUpdateEntry}
                onDeleteEntry={handleDeleteEntry}
                onSwitchToSchedule={() => setActiveTab('schedule')}
                readOnly={!editRules.labor_log}
                canDelete={hasPermission(userRole, 'delete_estimate')}
                editRules={editRules}
                estimateId={estimate.id}
              />
            </TabsContent>

            {lineItemTabs.map((tab) => (
              <TabsContent key={tab.key} value={tab.key}>
                <LineItemTab
                  items={activeLineItems.filter((i) => i.section === tab.key)}
                  section={tab.key}
                  isPassThrough={tab.pt}
                  defaultMarkup={tab.pt ? defaultMarkup : 0}
                  rateCardData={rateCardData}
                  clientName={estimate.clients.name}
                  laborLogs={laborLogs}
                  activeLocationId={activeLocationId}
                  onSelectLocation={setActiveLocationId}
                  onAddLocation={handleAddLocation}
                  onDeleteLocation={handleDeleteLocation}
                  onRenameLocation={handleRenameLocation}
                  onAdd={(items) => handleAddLineItems(tab.key, items)}
                  onAddUnplanned={(data) => handleAddUnplannedLineItem(tab.key, data)}
                  onUpdate={handleUpdateLineItem}
                  onDelete={handleDeleteLineItem}
                  readOnly={!editRules.line_items}
                  canDelete={hasPermission(userRole, 'delete_estimate')}
                  editRules={editRules}
                  estimateId={estimate.id}
                />
              </TabsContent>
            ))}

            <TabsContent value="summary">
              <SummaryTab laborLogs={laborLogs} allEntriesMap={laborEntriesMap} lineItemsMap={lineItemsMap} rateCardData={rateCardData} scheduleEntriesMap={scheduleEntriesMap} gpThreshold={gpThreshold} />
            </TabsContent>

            </>
            )}
          </Tabs>
        </div>

        {/* Right Panel — Collapsible AI Intelligence */}
        {aiPanelOpen ? (
          <div className="flex-[3] min-w-[260px] border-l border-border/40 pl-4 sticky top-0 h-screen overflow-hidden py-3">
            <AINudgePanel
              nudges={aiNudges}
              loading={aiLoading}
              error={aiError}
              autoRefresh={aiAutoRefresh}
              onToggleAutoRefresh={handleToggleAutoRefresh}
              onDismiss={handleDismissNudge}
              onRetry={() => triggerNudgeFetch(true)}
              onClose={() => setAiPanelOpen(false)}
              chatMessages={chatMessages}
              chatInput={chatInput}
              chatLoading={chatLoading}
              onChatInputChange={setChatInput}
              onChatSend={handleChatSend}
            />
          </div>
        ) : (
          <div className="w-9 border-l border-border/40 flex flex-col items-center pt-3 shrink-0">
            <button
              onClick={() => setAiPanelOpen(true)}
              className="flex flex-col items-center gap-2 text-muted-foreground/50 hover:text-muted-foreground transition-colors cursor-pointer"
              title="Open AI Intelligence panel"
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-[10px] font-medium tracking-wider uppercase" style={{ writingMode: 'vertical-lr' }}>
                Intelligence
              </span>
            </button>
          </div>
        )}
      </div>

      <VersionHistoryPanel
        estimateId={estimateId}
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        onRollback={loadData}
      />
    </div>
  )
}

export function EstimateBuilderPage() {
  const { id } = useParams()
  if (!id) return <Navigate to="/estimates" replace />
  return <EstimateBuilderContent estimateId={id} />
}
