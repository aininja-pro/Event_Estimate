import { useState } from 'react'
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
import { Sparkles, Loader2, AlertTriangle, RotateCcw } from 'lucide-react'
import { getAIContext } from '@/lib/data'
import { streamScopeEstimate } from '@/lib/ai'
import type { EventParams } from '@/lib/ai'
import type { ScopeEstimate } from '@/types/ai-context'

const aiContext = getAIContext()

const EVENT_TYPES = [
  'Auto Show',
  'Ride & Drive',
  'Brand Activation',
  'Product Launch',
  'Corporate Event',
  'Experiential Marketing',
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

function extractJson(text: string): ScopeEstimate | null {
  const match = text.match(/```json\s*([\s\S]*?)```/)
  if (!match?.[1]) return null
  try {
    return JSON.parse(match[1]) as ScopeEstimate
  } catch {
    return null
  }
}

export function AIScopingPage() {
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

  function handleSectionToggle(section: string) {
    setSelectedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section],
    )
  }

  function handleReset() {
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setStreamedText('')
    setParsedEstimate(null)
    setParseError(false)
    setIsLoading(true)

    const params: EventParams = {
      eventName,
      eventType,
      duration: parseInt(duration, 10),
      attendance: parseInt(attendance, 10),
      location,
      budgetRange,
      sections: selectedSections,
      specialRequirements,
    }

    try {
      const finalText = await streamScopeEstimate(params, aiContext, (text) => {
        setStreamedText(text)
      })

      const parsed = extractJson(finalText)
      if (parsed) {
        setParsedEstimate(parsed)
      } else {
        setParseError(true)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.')
    } finally {
      setIsLoading(false)
    }
  }

  const hasResults = streamedText && !isLoading
  const showStructured = hasResults && parsedEstimate && !parseError

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

          <Button type="submit" size="sm" disabled={isLoading}>
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

          {/* New Estimate button */}
          <div className="flex justify-center pt-2">
            <Button variant="ghost" size="lg" onClick={handleReset}>
              <RotateCcw className="size-4" />
              New Estimate
            </Button>
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
