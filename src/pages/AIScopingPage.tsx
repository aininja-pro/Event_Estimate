import { useState, useEffect } from 'react'
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
import { Badge } from '@/components/ui/badge'
import { Sparkles, Loader2, AlertTriangle, RotateCcw, ArrowRight } from 'lucide-react'
import { getAIContext } from '@/lib/data'
import { getClients } from '@/lib/rate-card-service'
import { createEstimate, createLaborLog, createLaborEntry, createLineItem, createAutoFeeLines, updateLaborLog } from '@/lib/estimate-service'
import { generateDateRange, upsertScheduleDayType, addScheduleEntry, upsertScheduleDayEntry } from '@/lib/schedule-service'
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

  useEffect(() => { getClients().then(setClients) }, [])

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
              needs_per_diem: true,
              day_rate: entry.unit_rate,
              cost_rate: 0,
              gl_code: entry.gl_code || null,
              notes: null,
              resource_type: entry.resource_type || 'external',
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
      <div>
        <h1 className="text-lg font-semibold tracking-tight">AI Scoping</h1>
        <p className="text-[13px] text-muted-foreground">
          Generate scope estimates from {aiContext.totalEvents.toLocaleString()} historical events.
        </p>
      </div>

      <div className="border border-border/50 rounded-md px-4 py-3">
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
            <div>
              <p className={fieldLabel}>Start Date</p>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={fieldInput}
              />
            </div>
            <div>
              <p className={fieldLabel}>End Date</p>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={fieldInput}
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
                required
                className={fieldInput}
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
                    className="rounded border-input"
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

          <Button type="submit" size="sm" disabled={isLoading || !clientId}>
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
          <div className="border border-border/50 rounded-md px-4 py-3">
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/50 mb-1">Scope Summary</p>
            <p className="text-[13px] leading-relaxed">{parsedEstimate.summary}</p>
          </div>

          {/* b. Total Estimate KPIs */}
          <div className="grid grid-cols-3 gap-3">
            <div className="border border-border/50 rounded-md px-4 py-3">
              <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/50">Low Estimate</p>
              <p className="text-xl font-bold mt-0.5">{formatCurrency(parsedEstimate.totalEstimate.low)}</p>
            </div>
            <div className="border border-indigo-200 bg-indigo-50/30 rounded-md px-4 py-3">
              <p className="text-[10px] font-medium uppercase tracking-widest text-indigo-600/70">Mid Estimate</p>
              <p className="text-2xl font-bold text-indigo-700 mt-0.5">{formatCurrency(parsedEstimate.totalEstimate.mid)}</p>
            </div>
            <div className="border border-border/50 rounded-md px-4 py-3">
              <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/50">High Estimate</p>
              <p className="text-xl font-bold mt-0.5">{formatCurrency(parsedEstimate.totalEstimate.high)}</p>
            </div>
          </div>

          {/* c. Staffing Recommendations Table */}
          <div className="border border-border/50 rounded-md px-4 py-3">
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
          <div className="border border-border/50 rounded-md px-4 py-3">
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
          <div className="border border-border/50 rounded-md px-4 py-3">
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
          <div className="border border-border/50 rounded-md px-4 py-3">
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/50 mb-2">Margin Recommendation</p>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-green-700">
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
              <Button size="sm" onClick={handleCreateEstimate} disabled={creating}>
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
    </div>
  )
}
