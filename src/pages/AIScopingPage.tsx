import { useState } from 'react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { Separator } from '@/components/ui/separator'
import { Sparkles, Loader2, AlertTriangle, RotateCcw, Info } from 'lucide-react'
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">AI Scoping Assistant</h1>
        <p className="text-muted-foreground">
          Generate data-backed event scope estimates powered by Claude and {aiContext.totalEvents.toLocaleString()} historical events.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Event Parameters</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="eventName">Event Name</Label>
                <Input
                  id="eventName"
                  placeholder="e.g. CES 2025 Auto Show"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="eventType">Event Type</Label>
                <Select value={eventType} onValueChange={setEventType} required>
                  <SelectTrigger id="eventType" className="w-full">
                    <SelectValue placeholder="Select event type" />
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (days)</Label>
                <Input
                  id="duration"
                  type="number"
                  min={1}
                  max={14}
                  placeholder="e.g. 3"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="attendance">Estimated Attendance</Label>
                <Input
                  id="attendance"
                  type="number"
                  min={1}
                  placeholder="e.g. 5000"
                  value={attendance}
                  onChange={(e) => setAttendance(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location / Market</Label>
                <Input
                  id="location"
                  placeholder="e.g. Las Vegas, NV"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="budgetRange">Budget Range</Label>
                <Select value={budgetRange} onValueChange={setBudgetRange}>
                  <SelectTrigger id="budgetRange" className="w-full">
                    <SelectValue placeholder="Select budget range" />
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
            </div>

            <div className="space-y-2">
              <Label>Sections to Include</Label>
              <div className="flex flex-wrap gap-3">
                {SECTIONS.map((section) => (
                  <label
                    key={section}
                    className="flex items-center gap-2 text-sm cursor-pointer"
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

            <div className="space-y-2">
              <Label htmlFor="specialRequirements">Special Requirements</Label>
              <Textarea
                id="specialRequirements"
                placeholder="Any specific needs, constraints, or notes for this event..."
                value={specialRequirements}
                onChange={(e) => setSpecialRequirements(e.target.value)}
                rows={3}
              />
            </div>

            <Button type="submit" size="lg" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Sparkles className="size-4" />
              )}
              {isLoading ? 'Generating...' : 'Generate Scope Estimate'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive font-medium">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Streaming: show raw text while loading */}
      {isLoading && streamedText && (
        <Card>
          <CardHeader>
            <CardTitle>Generating Scope Estimate...</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
              {streamedText}
            </pre>
          </CardContent>
        </Card>
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
          <Card>
            <CardHeader>
              <CardTitle>Scope Estimate (Raw)</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
                {streamedText}
              </pre>
            </CardContent>
          </Card>
        </>
      )}

      {/* Structured result display */}
      {showStructured && (
        <div className="space-y-6">
          {/* Proof-of-concept banner */}
          <div className="flex items-start gap-3 rounded-md border-l-4 border-l-[oklch(0.546_0.245_262.881)] bg-[oklch(0.546_0.245_262.881_/_0.05)] px-4 py-3">
            <Info className="mt-0.5 size-4 shrink-0 text-[oklch(0.546_0.245_262.881)]" />
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">AI-Generated Estimate</span>
              {' '}&mdash; Based on analysis of {aiContext.totalEvents.toLocaleString()} historical DriveShop events. This is a proof-of-concept demonstration.
            </p>
          </div>

          {/* a. Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="size-5" />
                Scope Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg leading-relaxed">{parsedEstimate.summary}</p>
            </CardContent>
          </Card>

          {/* b. Total Estimate KPIs */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Low Estimate</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(parsedEstimate.totalEstimate.low)}
                </p>
              </CardContent>
            </Card>
            <Card className="border-primary">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Mid Estimate</p>
                <p className="text-3xl font-bold text-primary">
                  {formatCurrency(parsedEstimate.totalEstimate.mid)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">High Estimate</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(parsedEstimate.totalEstimate.high)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* c. Staffing Recommendations Table */}
          <Card>
            <CardHeader>
              <CardTitle>Staffing Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>

          {/* d. Cost Breakdown by Section */}
          <Card>
            <CardHeader>
              <CardTitle>Cost Breakdown by Section</CardTitle>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>

          {/* e. Confidence & Assumptions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-muted-foreground">
                <AlertTriangle className="size-5" />
                Confidence &amp; Assumptions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {parsedEstimate.confidenceNotes.map((note, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-muted-foreground" />
                    {note}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* f. Margin Recommendation */}
          <Card>
            <CardHeader>
              <CardTitle>Margin Recommendation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-4">
                <span className="text-4xl font-bold text-[oklch(0.696_0.17_162.48)]">
                  {parsedEstimate.marginRecommendation.suggestedMarginPct}%
                </span>
                <span className="text-sm text-muted-foreground">suggested margin</span>
              </div>
              <Separator className="my-4" />
              <p className="text-sm text-muted-foreground leading-relaxed">
                {parsedEstimate.marginRecommendation.rationale}
              </p>
            </CardContent>
          </Card>

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
