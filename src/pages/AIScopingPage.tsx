import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { Sparkles, Loader2, AlertTriangle, RotateCcw, ArrowRight, Search, X, ChevronRight, Check, History } from 'lucide-react'
import { getAIContext } from '@/lib/data'
import { getClients } from '@/lib/rate-card-service'
import { createEstimate, createLaborLog, createLaborEntry, createLineItem, createAutoFeeLines, updateLaborLog } from '@/lib/estimate-service'
import { generateDateRange, upsertScheduleDayType, addScheduleEntry, upsertScheduleDayEntry } from '@/lib/schedule-service'
import { searchHistoricalEvents, getDistinctHistoricalClients } from '@/lib/historical-service'
import type { HistoricalEventSummary } from '@/lib/historical-service'
import type { ScopeEstimate } from '@/types/ai-context'
import type { Client } from '@/types/rate-card'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const aiContext = getAIContext()

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

const BUDGET_RANGES = [
  'Under $10K',
  '$10K-$25K',
  '$25K-$50K',
  '$50K-$100K',
  '$100K+',
]

const SECTIONS = aiContext.sections.map((s) => s.name)

function formatCurrency(value: number): string {
  if (Math.abs(value) >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`
  }
  if (Math.abs(value) >= 1_000) {
    return `$${(value / 1_000).toFixed(0)}K`
  }
  return `$${value.toLocaleString()}`
}

function formatDollar(value: number): string {
  return `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
}

export function AIScopingPage() {
  const navigate = useNavigate()
  const [clients, setClients] = useState<Client[]>([])
  const [clientId, setClientId] = useState('')
  const [costStructure, setCostStructure] = useState<'corporate' | 'office'>('corporate')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [eventName, setEventName] = useState('')
  const [eventType, setEventType] = useState('')
  const [duration, setDuration] = useState('')
  const [attendance, setAttendance] = useState('')
  const [location, setLocation] = useState('')
  const [budgetRange, setBudgetRange] = useState('')
  const [selectedSections, setSelectedSections] = useState<string[]>([...SECTIONS])
  const [specialRequirements, setSpecialRequirements] = useState('')

  const [isLoading, setIsLoading] = useState(false)
  const [streamedText, setStreamedText] = useState('')
  const [parsedEstimate, setParsedEstimate] = useState<ScopeEstimate | null>(null)
  const [parseError, setParseError] = useState(false)
  const [error, setError] = useState('')
  const [creating, setCreating] = useState(false)

  // Tab state
  const [activeTab, setActiveTab] = useState('generate')

  // Historical search state
  const [historicalClients, setHistoricalClients] = useState<string[]>([])
  const [histSearchQuery, setHistSearchQuery] = useState('')
  const [histClientFilter, setHistClientFilter] = useState('')
  const [histTypeFilter, setHistTypeFilter] = useState('')
  const [histResults, setHistResults] = useState<HistoricalEventSummary[]>([])
  const [histLoading, setHistLoading] = useState(false)
  const [histLoadingMore, setHistLoadingMore] = useState(false)
  const [histSearched, setHistSearched] = useState(false)
  const [histHasMore, setHistHasMore] = useState(false)
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null)

  useEffect(() => { getClients().then(setClients) }, [])
  useEffect(() => { getDistinctHistoricalClients().then(setHistoricalClients).catch(() => {}) }, [])

  // Auto-calculate duration from dates
  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate + 'T00:00:00')
      const end = new Date(endDate + 'T00:00:00')
      const diff = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
      if (diff > 0) setDuration(String(diff))
    }
  }, [startDate, endDate])

  function handleSectionToggle(section: string) {
    setSelectedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section],
    )
  }

  function handleReset() {
    setClientId('')
    setCostStructure('corporate')
    setStartDate('')
    setEndDate('')
    setEventName('')
    setEventType('')
    setDuration('')
    setAttendance('')
    setLocation('')
    setBudgetRange('')
    setSelectedSections([...SECTIONS])
    setSpecialRequirements('')
    setStreamedText('')
    setParsedEstimate(null)
    setParseError(false)
    setError('')
  }

  const PAGE_SIZE = 20

  const handleHistoricalSearch = useCallback(async () => {
    setHistLoading(true)
    setHistSearched(true)
    setExpandedEventId(null)
    try {
      const results = await searchHistoricalEvents({
        query: histSearchQuery || undefined,
        client: histClientFilter && histClientFilter !== 'all_clients' ? histClientFilter : undefined,
        event_type: histTypeFilter && histTypeFilter !== 'all_types' ? histTypeFilter : undefined,
        limit: PAGE_SIZE,
        offset: 0,
      })
      setHistResults(results)
      setHistHasMore(results.length === PAGE_SIZE)
    } catch (err) {
      console.error('Historical search failed:', err)
      setHistResults([])
      setHistHasMore(false)
    } finally {
      setHistLoading(false)
    }
  }, [histSearchQuery, histClientFilter, histTypeFilter])

  async function handleLoadMore() {
    setHistLoadingMore(true)
    try {
      const more = await searchHistoricalEvents({
        query: histSearchQuery || undefined,
        client: histClientFilter && histClientFilter !== 'all_clients' ? histClientFilter : undefined,
        event_type: histTypeFilter && histTypeFilter !== 'all_types' ? histTypeFilter : undefined,
        limit: PAGE_SIZE,
        offset: histResults.length,
      })
      setHistResults((prev) => [...prev, ...more])
      setHistHasMore(more.length === PAGE_SIZE)
    } catch (err) {
      console.error('Load more failed:', err)
    } finally {
      setHistLoadingMore(false)
    }
  }

  // Debounced search on filter changes
  useEffect(() => {
    if (!histSearched && !histSearchQuery && !histClientFilter && !histTypeFilter) return
    const timer = setTimeout(handleHistoricalSearch, 500)
    return () => clearTimeout(timer)
  }, [histClientFilter, histTypeFilter]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleUseAsTemplate(event: HistoricalEventSummary) {
    // Match historical client name to clients table
    const matchedClient = clients.find(
      (c) => c.name.toLowerCase() === event.client?.toLowerCase()
    )
    if (matchedClient) setClientId(matchedClient.id)
    else setClientId('')

    if (event.event_type) setEventType(event.event_type)
    if (event.location) setLocation(event.location)

    // Pre-fill special requirements with historical context
    const total = event.grand_total ? formatCurrency(event.grand_total) : 'N/A'
    setSpecialRequirements(
      `Based on historical event: ${event.event_name} (${event.client}). Original total: ${total}.`
    )

    // Switch to Generate New tab
    setActiveTab('generate')
  }

  async function handleCreateEstimate() {
    if (!parsedEstimate || !clientId) return
    setCreating(true)
    setError('')
    try {
      const client = clients.find((c) => c.id === clientId)

      // Call backend to match scope to rate card
      const res = await fetch(`${API_URL}/api/ai/scope-to-estimate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: clientId,
          staffing: parsedEstimate.staffing,
          cost_breakdown: parsedEstimate.costBreakdown,
        }),
      })
      const matched = await res.json()
      if (matched.error) throw new Error(matched.error)

      // Create estimate
      const estimate = await createEstimate({
        client_id: clientId,
        event_name: eventName || 'New AI-Scoped Estimate',
        event_type: eventType || null,
        location: location || null,
        start_date: startDate || null,
        end_date: endDate || null,
        duration_days: duration ? parseInt(duration, 10) : null,
        expected_attendance: attendance || null,
        cost_structure: costStructure,
        po_number: null,
        project_id: null,
        internal_notes: null,
        published_notes: null,
        status: 'pipeline',
        created_by: null,
      })

      // Create primary labor log
      const laborLog = await createLaborLog({
        estimate_id: estimate.id,
        location_name: location || 'Primary',
        is_primary: true,
      })

      // Create labor entries from matched staffing
      for (const entry of matched.labor_entries || []) {
        await createLaborEntry({
          labor_log_id: laborLog.id,
          role_name: entry.role_name,
          rate_card_item_id: entry.rate_card_item_id || null,
          gl_code: entry.gl_code || null,
          quantity: entry.quantity,
          days: entry.days,
          unit_rate: entry.unit_rate,
          cost_rate: null,
          override_rate: null,
          override_reason: null,
          has_overtime: false,
          overtime_rate: null,
          overtime_hours: null,
          notes: null,
          resource_type: entry.resource_type || 'external',
          is_unplanned: false,
          display_order: entry.display_order,
        })
      }

      // Create line items from matched cost breakdown
      for (const item of matched.line_items || []) {
        await createLineItem({
          estimate_id: estimate.id,
          labor_log_id: laborLog.id,
          section: item.section,
          rate_card_item_id: item.rate_card_item_id || null,
          item_name: item.item_name,
          description: null,
          quantity: item.quantity,
          unit_cost: item.unit_cost,
          markup_pct: item.markup_pct || 0,
          gl_code: item.gl_code || null,
          notes: null,
          is_auto_generated: false,
          fee_basis: null,
          is_unplanned: false,
          display_order: item.display_order,
        })
      }

      // Auto-generate agency fee if client has one
      if (client?.agency_fee) {
        await createAutoFeeLines(estimate.id, laborLog.id, client.agency_fee)
      }

      // Create schedule if we have dates
      if (startDate && endDate) {
        // Set dates on the labor log
        await updateLaborLog(laborLog.id, { start_date: startDate, end_date: endDate })

        // Create day type columns for each date
        const dates = generateDateRange(startDate, endDate)
        for (let i = 0; i < dates.length; i++) {
          await upsertScheduleDayType(laborLog.id, dates[i], 'event', i)
        }

        // Create schedule entries (rows) for each staffing role and fill 10hr days
        for (const entry of matched.labor_entries || []) {
          for (let q = 0; q < (entry.quantity || 1); q++) {
            const schedEntry = await addScheduleEntry({
              labor_log_id: laborLog.id,
              rate_card_item_id: entry.rate_card_item_id || null,
              role_name: entry.role_name,
              person_name: null,
              row_index: 0,
              staff_group_id: null,
              needs_airfare: true,
              needs_hotel: true,
              hotel_nights: null,
              needs_per_diem: true,
              day_rate: entry.unit_rate,
              cost_rate: 0,
              gl_code: entry.gl_code || null,
              notes: null,
              resource_type: entry.resource_type || 'external',
              is_unplanned: false,
            })

            // Fill in 10 hours for each day this role works
            const roleDays = Math.min(entry.days || dates.length, dates.length)
            for (let d = 0; d < roleDays; d++) {
              await upsertScheduleDayEntry(schedEntry.id, dates[d], 10)
            }
          }
        }
      }

      // Navigate to the new estimate
      navigate(`/estimates/${estimate.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create estimate')
    } finally {
      setCreating(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setStreamedText('')
    setParsedEstimate(null)
    setParseError(false)
    setIsLoading(true)

    try {
      const res = await fetch(`${API_URL}/api/ai/generate-scope`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: clientId,
          event_name: eventName,
          event_type: eventType,
          duration: parseInt(duration, 10) || 1,
          attendance: parseInt(attendance, 10) || 0,
          location,
          budget_range: budgetRange,
          sections: selectedSections,
          special_requirements: specialRequirements,
        }),
      })
      const data = await res.json()
      if (data.error) {
        setError(data.error)
        if (data.raw) setStreamedText(data.raw)
      } else {
        setParsedEstimate(data as ScopeEstimate)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.')
    } finally {
      setIsLoading(false)
    }
  }

  const hasResults = (parsedEstimate || streamedText || error) && !isLoading
  const showStructured = !isLoading && parsedEstimate && !parseError

  const fieldLabel = "mb-0.5 text-[10px] uppercase tracking-widest text-muted-foreground font-medium"
  const fieldInput = "h-7 text-[13px] font-medium rounded-none border-0 border-b border-border/40 bg-transparent hover:border-border/60 focus-visible:border-foreground/40 focus-visible:ring-0 px-0 transition-colors"

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">AI Scoping</h1>
          <p className="text-[13px] text-muted-foreground">
            Generate scope estimates from {aiContext.totalEvents.toLocaleString()} historical events.
          </p>
        </div>
        {activeTab === 'history' && histResults.length > 0 && (
          <p className="text-[11px] text-muted-foreground/60 tabular-nums">{histResults.length} result{histResults.length !== 1 ? 's' : ''}</p>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList variant="line" className="border-b border-border/40 w-full justify-start">
          <TabsTrigger value="generate" className="text-[13px] gap-1.5">
            <Sparkles className="size-3.5" />
            Generate New
          </TabsTrigger>
          <TabsTrigger value="history" className="text-[13px] gap-1.5">
            <History className="size-3.5" />
            From History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generate">
      <div className="border-l-[3px] border-l-foreground/12 border border-border/40 rounded-lg px-5 py-4 bg-gradient-to-br from-zinc-50/80 via-stone-50/40 to-white shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.03)]">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-4 gap-x-5 gap-y-2">
            <div>
              <p className={fieldLabel}>Client</p>
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger className={`${fieldInput} h-7 w-full`}>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <p className={fieldLabel}>Event Name</p>
              <Input
                placeholder="e.g. CES 2025 Auto Show"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                className={fieldInput}
              />
            </div>
            <div>
              <p className={fieldLabel}>Event Type</p>
              <Select value={eventType} onValueChange={setEventType} required>
                <SelectTrigger className={`${fieldInput} h-7 w-full`}>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <p className={fieldLabel}>Budget Range</p>
              <Select value={budgetRange} onValueChange={setBudgetRange}>
                <SelectTrigger className={`${fieldInput} h-7 w-full`}>
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  {BUDGET_RANGES.map((range) => (
                    <SelectItem key={range} value={range}>
                      {range}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <p className={fieldLabel}>Event Dates</p>
              <DateRangePicker
                value={{ from: startDate || null, to: endDate || null }}
                onChange={(range) => {
                  setStartDate(range.from ?? '')
                  setEndDate(range.to ?? '')
                }}
                placeholder="Select start and end dates"
                triggerClassName={`${fieldInput} w-full justify-start`}
              />
            </div>
            <div>
              <p className={fieldLabel}>Duration (days)</p>
              <Input
                type="number"
                min={1}
                max={14}
                placeholder="e.g. 3"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                readOnly={!!(startDate && endDate)}
                required
                className={`${fieldInput} ${startDate && endDate ? 'text-muted-foreground cursor-default' : ''}`}
              />
            </div>
            <div>
              <p className={fieldLabel}>Attendance</p>
              <Input
                type="number"
                min={1}
                placeholder="e.g. 5000"
                value={attendance}
                onChange={(e) => setAttendance(e.target.value)}
                required
                className={fieldInput}
              />
            </div>
            <div>
              <p className={fieldLabel}>Location</p>
              <Input
                placeholder="e.g. Las Vegas, NV"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className={fieldInput}
              />
            </div>
            <div>
              <p className={fieldLabel}>Cost Structure</p>
              <div className="flex items-center gap-0 h-7">
                <button type="button" onClick={() => setCostStructure('corporate')} className={`text-[13px] transition-colors ${costStructure === 'corporate' ? 'font-medium text-foreground border-b border-foreground/40' : 'text-muted-foreground/70 hover:text-foreground/90'}`}>Corporate</button>
                <span className="mx-2 text-muted-foreground/30">|</span>
                <button type="button" onClick={() => setCostStructure('office')} className={`text-[13px] transition-colors ${costStructure === 'office' ? 'font-medium text-foreground border-b border-foreground/40' : 'text-muted-foreground/70 hover:text-foreground/90'}`}>Office</button>
              </div>
            </div>
          </div>

          <div>
            <p className={fieldLabel}>Sections to Include</p>
            <div className="flex flex-wrap gap-3 mt-1">
              {SECTIONS.map((section) => (
                <label
                  key={section}
                  className="flex items-center gap-1.5 text-[13px] cursor-pointer text-foreground/80"
                >
                  <input
                    type="checkbox"
                    checked={selectedSections.includes(section)}
                    onChange={() => handleSectionToggle(section)}
                    className="rounded border-border/60 accent-foreground"
                  />
                  {section}
                </label>
              ))}
            </div>
          </div>

          <div>
            <p className={fieldLabel}>Special Requirements</p>
            <Textarea
              placeholder="Any specific needs, constraints, or notes..."
              value={specialRequirements}
              onChange={(e) => setSpecialRequirements(e.target.value)}
              rows={2}
              className="mt-1 text-[13px] resize-none border-border/40 bg-transparent focus-visible:ring-0"
            />
          </div>

          <Button type="submit" variant="outline" size="sm" disabled={isLoading || !clientId} className="text-[13px] shadow-sm bg-white hover:bg-stone-50 border-border/60">
            {isLoading ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Sparkles className="size-3.5" />
            )}
            {isLoading ? 'Generating...' : 'Generate Scope Estimate'}
          </Button>
        </form>
      </div>

      {error && (
        <div className="border border-red-200 rounded-md px-4 py-3">
          <p className="text-[13px] text-red-700 font-medium">{error}</p>
        </div>
      )}

      {/* Streaming: show raw text while loading */}
      {isLoading && streamedText && (
        <div className="border border-border/50 rounded-md px-4 py-3">
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/50 mb-2">Generating Scope Estimate...</p>
          <pre className="whitespace-pre-wrap text-[13px] leading-relaxed">{streamedText}</pre>
        </div>
      )}

      {/* Parse error fallback: show raw text with warning */}
      {hasResults && parseError && (
        <>
          <div className="flex items-center gap-2">
            <Badge variant="destructive">
              <AlertTriangle className="size-3" />
              Could not parse structured response
            </Badge>
          </div>
          <div className="border border-border/50 rounded-md px-4 py-3">
            <pre className="whitespace-pre-wrap text-[13px] leading-relaxed">{streamedText}</pre>
          </div>
        </>
      )}

      {/* Structured result display */}
      {showStructured && (
        <div className="space-y-4">
          {/* a. Summary */}
          <div className="border-l-2 border-l-foreground/8 border border-border/50 rounded-md px-5 py-3 bg-gradient-to-r from-stone-50/50 to-transparent shadow-sm">
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/50 mb-1">Scope Summary</p>
            <p className="text-[13px] leading-relaxed">{parsedEstimate.summary}</p>
          </div>

          {/* b. Total Estimate KPIs */}
          <div className="grid grid-cols-3 gap-3">
            <div className="border border-border/50 rounded-md px-4 py-3 shadow-sm bg-gradient-to-br from-stone-50/30 to-transparent">
              <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/50">Low Estimate</p>
              <p className="text-xl font-bold mt-0.5">{formatCurrency(parsedEstimate.totalEstimate.low)}</p>
            </div>
            <div className="border border-stone-200 bg-gradient-to-br from-stone-100/60 to-stone-50/30 rounded-md px-4 py-3 shadow-sm">
              <p className="text-[10px] font-medium uppercase tracking-widest text-stone-500">Mid Estimate</p>
              <p className="text-2xl font-bold text-foreground mt-0.5">{formatCurrency(parsedEstimate.totalEstimate.mid)}</p>
            </div>
            <div className="border border-border/50 rounded-md px-4 py-3 shadow-sm bg-gradient-to-br from-stone-50/30 to-transparent">
              <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/50">High Estimate</p>
              <p className="text-xl font-bold mt-0.5">{formatCurrency(parsedEstimate.totalEstimate.high)}</p>
            </div>
          </div>

          {/* c. Staffing Recommendations Table */}
          <div className="border border-border/50 rounded-md px-4 py-3 shadow-sm">
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/50 mb-2">Staffing Recommendations</p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Days</TableHead>
                    <TableHead className="text-right">Daily Rate</TableHead>
                    <TableHead className="text-right">Line Total</TableHead>
                    <TableHead>Rationale</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedEstimate.staffing.map((item) => (
                    <TableRow key={item.role}>
                      <TableCell className="font-medium">{item.role}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">{item.days}</TableCell>
                      <TableCell className="text-right">{formatDollar(item.dailyRate)}</TableCell>
                      <TableCell className="text-right">{formatDollar(item.totalCost)}</TableCell>
                      <TableCell className="text-muted-foreground max-w-xs whitespace-normal">{item.rationale}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={4} className="font-medium">Total Staffing Cost</TableCell>
                    <TableCell className="text-right font-bold">
                      {formatDollar(parsedEstimate.staffing.reduce((sum, s) => sum + s.totalCost, 0))}
                    </TableCell>
                    <TableCell />
                  </TableRow>
                </TableFooter>
              </Table>
          </div>

          {/* d. Cost Breakdown by Section */}
          <div className="border border-border/50 rounded-md px-4 py-3 shadow-sm">
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/50 mb-2">Cost Breakdown by Section</p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Section</TableHead>
                    <TableHead className="text-right">Estimated Cost</TableHead>
                    <TableHead className="w-48">% of Total</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedEstimate.costBreakdown.map((item) => (
                    <TableRow key={item.section}>
                      <TableCell className="font-medium">{item.section}</TableCell>
                      <TableCell className="text-right">{formatDollar(item.estimatedCost)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-2 flex-1 rounded-full bg-muted">
                            <div
                              className="h-2 rounded-full bg-primary"
                              style={{ width: `${Math.min(item.percentOfTotal, 100)}%` }}
                            />
                          </div>
                          <span className="w-10 text-right text-sm text-muted-foreground">
                            {item.percentOfTotal}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground max-w-xs whitespace-normal">{item.notes}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell className="font-medium">Grand Total</TableCell>
                    <TableCell className="text-right font-bold">
                      {formatDollar(parsedEstimate.costBreakdown.reduce((sum, c) => sum + c.estimatedCost, 0))}
                    </TableCell>
                    <TableCell />
                    <TableCell />
                  </TableRow>
                </TableFooter>
              </Table>
          </div>

          {/* e. Confidence & Assumptions */}
          <div className="border border-border/50 rounded-md px-4 py-3 shadow-sm">
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/50 mb-2">Confidence & Assumptions</p>
            <ul className="space-y-1.5">
              {parsedEstimate.confidenceNotes.map((note, i) => (
                <li key={i} className="flex items-start gap-2 text-[13px] text-muted-foreground">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-muted-foreground/40" />
                  {note}
                </li>
              ))}
            </ul>
          </div>

          {/* f. Margin Recommendation */}
          <div className="border-l-2 border-l-green-700/20 border border-border/50 rounded-md px-5 py-3 shadow-sm bg-gradient-to-r from-green-50/20 to-transparent">
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/50 mb-2">Margin Recommendation</p>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-green-800/80">
                {parsedEstimate.marginRecommendation.suggestedMarginPct}%
              </span>
              <span className="text-[13px] text-muted-foreground">suggested margin</span>
            </div>
            <p className="mt-2 text-[13px] text-muted-foreground leading-relaxed">
              {parsedEstimate.marginRecommendation.rationale}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button variant="ghost" size="sm" onClick={handleReset}>
              <RotateCcw className="size-3.5" />
              Start Over
            </Button>
            {clientId && (
              <Button variant="outline" size="sm" onClick={handleCreateEstimate} disabled={creating} className="text-[13px] shadow-sm bg-white hover:bg-green-800/10 border-border/60 hover:border-green-800/30 hover:text-green-800/80">
                {creating ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <ArrowRight className="size-3.5" />
                )}
                {creating ? 'Creating...' : 'Create Estimate'}
              </Button>
            )}
            {!clientId && (
              <p className="text-[12px] text-muted-foreground">Select a client above to create an estimate</p>
            )}
          </div>
        </div>
      )}

      {/* Show New Estimate button on parse error too */}
      {hasResults && parseError && (
        <div className="flex justify-center pt-2">
          <Button variant="ghost" size="lg" onClick={handleReset}>
            <RotateCcw className="size-4" />
            New Estimate
          </Button>
        </div>
      )}
        </TabsContent>

        <TabsContent value="history">
          {/* Search & Filters */}
          <div className="border-l-[3px] border-l-foreground/12 border border-border/40 rounded-lg px-5 py-4 bg-gradient-to-br from-zinc-50/80 via-stone-50/40 to-white shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.03)]">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40" />
                <input
                  type="text"
                  placeholder="Search events by name, client, or location..."
                  value={histSearchQuery}
                  onChange={(e) => setHistSearchQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleHistoricalSearch() }}
                  className="h-7 w-full rounded-none border-0 border-b border-border/40 bg-transparent pl-7 pr-7 text-[13px] font-medium placeholder:text-muted-foreground/40 placeholder:font-normal focus:outline-none focus:border-foreground/40 transition-colors"
                />
                {histSearchQuery && (
                  <button
                    onClick={() => { setHistSearchQuery(''); handleHistoricalSearch() }}
                    className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-foreground transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Select value={histClientFilter} onValueChange={setHistClientFilter}>
                  <SelectTrigger className="h-7 w-[170px] text-[13px] font-medium rounded-none border-0 border-b border-border/40 bg-transparent hover:border-border/60 focus-visible:border-foreground/40 focus-visible:ring-0 px-0 transition-colors">
                    <SelectValue placeholder="All clients" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_clients">All clients</SelectItem>
                    {historicalClients.map((c) => (
                      <SelectItem key={c} value={c} className="text-[13px]">{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={histTypeFilter} onValueChange={setHistTypeFilter}>
                  <SelectTrigger className="h-7 w-[150px] text-[13px] font-medium rounded-none border-0 border-b border-border/40 bg-transparent hover:border-border/60 focus-visible:border-foreground/40 focus-visible:ring-0 px-0 transition-colors">
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_types">All types</SelectItem>
                    {EVENT_TYPES.map((t) => (
                      <SelectItem key={t} value={t} className="text-[13px]">{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" size="sm" onClick={handleHistoricalSearch} disabled={histLoading} className="text-[13px] h-7 px-3">
                {histLoading ? <Loader2 className="size-3.5 animate-spin" /> : <Search className="size-3.5" />}
                Search
              </Button>
            </div>
          </div>

          {/* Results */}
          {histLoading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="size-4 animate-spin text-muted-foreground/50" />
              <span className="ml-2 text-[13px] text-muted-foreground/60">Searching {aiContext.totalEvents.toLocaleString()} historical events...</span>
            </div>
          )}

          {!histLoading && !histSearched && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="size-10 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                <History className="size-5 text-muted-foreground/40" />
              </div>
              <p className="text-[13px] font-medium text-muted-foreground/70">Search DriveShop's event archive</p>
              <p className="text-[12px] text-muted-foreground/40 mt-1">Find past events to use as templates for new estimates</p>
            </div>
          )}

          {!histLoading && histSearched && histResults.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="size-10 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                <Search className="size-5 text-muted-foreground/40" />
              </div>
              <p className="text-[13px] font-medium text-muted-foreground/70">No events found</p>
              <p className="text-[12px] text-muted-foreground/40 mt-1">Try a different search term or adjust filters</p>
            </div>
          )}

          {!histLoading && histResults.length > 0 && (
            <div className="border border-border/40 rounded-lg overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.03)]">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border/40 bg-slate-50 dark:bg-slate-800/30 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium w-6 py-2" />
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium py-2">Event Name</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium py-2">Client</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium py-2">Type</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium py-2">Location</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium text-right py-2">Total</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium text-right py-2">Staff</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium text-center py-2">Recap</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {histResults.map((event) => {
                    const isExpanded = expandedEventId === event.id
                    const staffCount = event.labor_roles?.length ?? 0
                    const sections = (event.sections || []) as Array<{ canonical_name: string; bid_total: number; recap_total: number }>
                    const totalBid = sections.reduce((s, sec) => s + (sec.bid_total || 0), 0) || event.grand_total || 0

                    return (
                      <React.Fragment key={event.id}>
                        <TableRow
                          className={`cursor-pointer transition-colors border-b border-border/30 ${isExpanded ? 'bg-muted/20 hover:bg-muted/20' : 'hover:bg-muted/30'}`}
                          onClick={() => setExpandedEventId(isExpanded ? null : event.id)}
                        >
                          <TableCell className="py-2.5 px-2">
                            <ChevronRight className={`size-3.5 text-muted-foreground/50 transition-transform duration-150 ${isExpanded ? 'rotate-90' : ''}`} />
                          </TableCell>
                          <TableCell className="text-[13px] font-medium py-2.5">{event.event_name || 'Unnamed'}</TableCell>
                          <TableCell className="text-[13px] py-2.5">{event.client}</TableCell>
                          <TableCell className="py-2.5">
                            <span className="inline-flex text-[11px] font-medium px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground">
                              {event.event_type}
                            </span>
                          </TableCell>
                          <TableCell className="text-[13px] text-muted-foreground py-2.5">{event.location || '—'}</TableCell>
                          <TableCell className="text-[13px] tabular-nums text-right py-2.5 font-medium">{event.grand_total ? formatDollar(event.grand_total) : '—'}</TableCell>
                          <TableCell className="text-[13px] tabular-nums text-right py-2.5 text-muted-foreground">{staffCount || '—'}</TableCell>
                          <TableCell className="text-center py-2.5">
                            {event.has_recap_data && (
                              <span className="inline-flex items-center justify-center size-5 rounded-full bg-green-50">
                                <Check className="size-3 text-green-600" />
                              </span>
                            )}
                          </TableCell>
                        </TableRow>

                        {isExpanded && (
                          <TableRow className="bg-gradient-to-b from-zinc-50/80 to-stone-50/40 hover:bg-gradient-to-b border-b border-border/30">
                            <TableCell colSpan={8} className="p-0">
                              <div className="px-8 py-5 border-l-[3px] border-l-foreground/8">
                                <div className="grid grid-cols-3 gap-6">
                                  {/* Section Breakdown */}
                                  <div className="col-span-2">
                                    {sections.filter((s) => s.bid_total > 0).length > 0 && (
                                      <div>
                                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-3">Section Breakdown</p>
                                        <div className="space-y-2">
                                          {sections
                                            .filter((s) => s.bid_total > 0)
                                            .sort((a, b) => b.bid_total - a.bid_total)
                                            .map((sec) => {
                                              const pct = totalBid > 0 ? (sec.bid_total / totalBid) * 100 : 0
                                              return (
                                                <div key={sec.canonical_name} className="flex items-center gap-3">
                                                  <span className="text-[12px] text-foreground/70 w-[150px] truncate">{sec.canonical_name}</span>
                                                  <div className="flex-1 h-2 bg-zinc-100 rounded-full">
                                                    <div className="h-2 bg-zinc-300 rounded-full transition-all" style={{ width: `${Math.min(pct, 100)}%` }} />
                                                  </div>
                                                  <span className="text-[12px] tabular-nums font-medium w-[70px] text-right">{formatDollar(sec.bid_total)}</span>
                                                  <span className="text-[11px] tabular-nums text-muted-foreground/50 w-[35px] text-right">{pct.toFixed(0)}%</span>
                                                </div>
                                              )
                                            })}
                                        </div>
                                      </div>
                                    )}

                                    {/* Common Roles */}
                                    {event.labor_roles && event.labor_roles.length > 0 && (
                                      <div className="mt-4">
                                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-1.5">Roles ({event.labor_roles.length})</p>
                                        <div className="flex flex-wrap gap-1.5">
                                          {event.labor_roles.map((r, i) => (
                                            <span key={i} className="text-[11px] px-2 py-0.5 rounded-md bg-white border border-border/50 text-foreground/70 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                                              {r.role}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  {/* Right column: Financials + Action */}
                                  <div className="space-y-4">
                                    {/* Financial Summary */}
                                    {event.has_recap_data && event.grand_total && (
                                      <div className="border border-border/40 rounded-md px-3 py-2.5 bg-white">
                                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-2">Financials</p>
                                        <div className="space-y-1.5">
                                          <div className="flex justify-between text-[12px]">
                                            <span className="text-muted-foreground">Estimated</span>
                                            <span className="font-medium tabular-nums">{formatDollar(event.grand_total)}</span>
                                          </div>
                                          {event.final_invoice_amount && (
                                            <div className="flex justify-between text-[12px]">
                                              <span className="text-muted-foreground">Actual</span>
                                              <span className="font-medium tabular-nums">{formatDollar(event.final_invoice_amount)}</span>
                                            </div>
                                          )}
                                          {event.final_invoice_amount && (() => {
                                            const variance = event.grand_total - event.final_invoice_amount
                                            const pct = (variance / event.grand_total) * 100
                                            const isUnder = variance > 0
                                            return (
                                              <div className={`flex justify-between text-[12px] pt-1.5 border-t border-border/30 ${isUnder ? 'text-green-700' : 'text-red-600'}`}>
                                                <span>Variance</span>
                                                <span className="font-medium tabular-nums">{isUnder ? '+' : ''}{formatDollar(variance)} ({Math.abs(pct).toFixed(1)}%)</span>
                                              </div>
                                            )
                                          })()}
                                        </div>
                                      </div>
                                    )}

                                    {/* Grand total card when no recap */}
                                    {!event.has_recap_data && event.grand_total && (
                                      <div className="border border-border/40 rounded-md px-3 py-2.5 bg-white">
                                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-1">Total</p>
                                        <p className="text-lg font-bold tabular-nums">{formatDollar(event.grand_total)}</p>
                                        <p className="text-[11px] text-muted-foreground/50 mt-0.5">Estimate only — no recap data</p>
                                      </div>
                                    )}

                                    {/* Use as Template button */}
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={(e) => { e.stopPropagation(); handleUseAsTemplate(event) }}
                                      className="w-full text-[13px] bg-white hover:bg-green-800/10 text-foreground border border-border/50 hover:border-green-800/30 hover:text-green-800/80 shadow-sm"
                                    >
                                      <ArrowRight className="size-3.5" />
                                      Use as Template
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {!histLoading && histResults.length > 0 && histHasMore && (
            <div className="flex justify-center pt-2">
              <Button variant="outline" size="sm" onClick={handleLoadMore} disabled={histLoadingMore} className="text-[13px] shadow-sm">
                {histLoadingMore ? <Loader2 className="size-3.5 animate-spin" /> : null}
                {histLoadingMore ? 'Loading...' : `Load more results`}
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
