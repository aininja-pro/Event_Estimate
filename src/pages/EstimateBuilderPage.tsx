import { useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction,
} from '@/components/ui/card'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Pencil,
  Plus,
  Trash2,
  Send,
  X,
  ChevronDown,
  MapPin,
  Info,
} from 'lucide-react'

// ── Sample Data ──────────────────────────────────────────────────────────────

const laborRows = [
  { role: 'Program Director', qty: 1, days: 4, dayRate: 750, costRate: 450, rateLabel: '$750', costLabel: '$450' },
  { role: 'Event/Vehicle Manager', qty: 2, days: 4, dayRate: 500, costRate: 300, rateLabel: '$500', costLabel: '$300' },
  { role: 'Product Specialist', qty: 6, days: 4, dayRate: 425, costRate: 255, rateLabel: '$425', costLabel: '$255' },
  { role: 'In-Vehicle Host', qty: 8, days: 4, dayRate: 375, costRate: 225, rateLabel: '$375', costLabel: '$225' },
  { role: 'Registration Host', qty: 3, days: 4, dayRate: 300, costRate: 180, rateLabel: '$300', costLabel: '$180' },
  { role: 'Professional Chauffeur', qty: 4, days: 4, dayRate: 1000, costRate: 650, rateLabel: '$100/hr (10hr)', costLabel: '$65/hr' },
  { role: 'Event/Vehicle Handler', qty: 4, days: 4, dayRate: 330, costRate: 200, rateLabel: '$330', costLabel: '$200' },
  { role: 'Per Diem (28 staff)', qty: 28, days: 4, dayRate: 50, costRate: 50, rateLabel: '$50', costLabel: '$50' },
]

const productionRows = [
  { item: 'Vehicle Transport (LA)', desc: 'Carrier delivery of 12 vehicles', qty: 1, unitCost: 8500, markup: 15 },
  { item: 'Tent & Structure Rental', desc: '40x60 event tent, 4 days', qty: 1, unitCost: 12000, markup: 10 },
  { item: 'Signage & Branding', desc: 'Event branded materials', qty: 1, unitCost: 3200, markup: 15 },
]

const travelRows = [
  { item: 'Staff Airfare (out of market)', desc: 'Round trip for 8 OOM staff', qty: 8, unitCost: 450, markup: 0 },
  { item: 'Hotel (staff)', desc: '4 nights, 8 rooms', qty: 32, unitCost: 189, markup: 0 },
  { item: 'Ground Transport', desc: 'Van rental + fuel, 5 days', qty: 1, unitCost: 1800, markup: 10 },
]

const creativeRows = [
  { item: 'Event Branding Package', desc: 'Logo placement, banners, digital assets', qty: 1, unitCost: 4500, markup: 15 },
  { item: 'Photography/Videography', desc: 'On-site content capture, 2 days', qty: 1, unitCost: 1500, markup: 0 },
]

const accessRows = [
  { item: 'General Liability Insurance', desc: 'Event GL coverage, 4 days', qty: 1, unitCost: 2200, markup: 10 },
  { item: 'Auto Insurance Rider', desc: 'Vehicle coverage for ride & drive', qty: 1, unitCost: 1600, markup: 10 },
]

const summaryData = [
  { section: 'Labor', revenue: 47680, cost: 31080 },
  { section: 'Per Diem', revenue: 5600, cost: 5600 },
  { section: 'Production', revenue: 26655, cost: 23700 },
  { section: 'Travel/Logistics', revenue: 11628, cost: 11448 },
  { section: 'Creative', revenue: 6900, cost: 6000 },
  { section: 'Access/Insurance', revenue: 4250, cost: 3800 },
]

const nudges = [
  {
    type: 'suggestion' as const,
    icon: '💡',
    label: 'STAFFING SUGGESTION',
    message: 'For Mazda ride & drives with 5,000 attendees, you typically staff 2 In-Vehicle Hosts per 500 attendees. Your current plan has 8 — consider scaling to 10.',
    footer: 'Based on 14 similar Mazda events',
  },
  {
    type: 'warning' as const,
    icon: '⚠️',
    label: 'COST ALERT',
    message: 'LA logistics costs have come in 20% over budget on the last 6 LA-based ride & drive events. Consider adding a 15-20% buffer to your logistics line items.',
    footer: 'Based on 6 LA ride & drive events',
  },
  {
    type: 'validation' as const,
    icon: '✅',
    label: 'VALIDATION',
    message: 'Insurance line item detected. ✓ 94% of ride & drive events in this revenue range include General Liability + Auto coverage.',
    footer: 'Validated against 342 ride & drive events',
  },
  {
    type: 'insight' as const,
    icon: '📊',
    label: 'MARGIN INSIGHT',
    message: 'Your current blended GP is 20.5%. The average for Mazda events in this revenue range is 28.3%. Labor margins look healthy — check production and travel markups.',
    footer: 'Based on 23 Mazda events ($75K-$150K range)',
  },
  {
    type: 'suggestion' as const,
    icon: '💡',
    label: 'MISSING ITEM CHECK',
    message: "You haven't included a Vehicle Detailing line item. 87% of ride & drive events include detailing services ($150-$300/vehicle/day).",
    footer: 'Based on 342 ride & drive events',
  },
]

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  return '$' + n.toLocaleString()
}

function pct(gp: number, rev: number): string {
  if (rev === 0) return '0.0%'
  return ((gp / rev) * 100).toFixed(1) + '%'
}

// ── Sub-Components ───────────────────────────────────────────────────────────

function ConceptBanner() {
  const [visible, setVisible] = useState(true)
  if (!visible) return null
  return (
    <div className="flex items-start gap-3 rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
      <div className="flex-1">
        <span className="font-medium text-blue-300">UI Concept</span>
        <span className="text-blue-300/80"> — This is an interactive mockup of the production system. Layout and features will be refined based on team feedback.</span>
      </div>
      <button onClick={() => setVisible(false)} className="shrink-0 text-blue-400 hover:text-blue-300">
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

function EventHeader() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Event Details</CardTitle>
        <CardAction>
          <Button variant="ghost" size="icon-xs">
            <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-x-6 gap-y-4">
          <Field label="Client" value="Mazda" />
          <Field label="Event Type" value="Ride & Drive" />
          <Field label="Event Name" value="Mazda CX-70 Launch Experience" className="col-span-2" />
          <Field label="Location" value="Los Angeles, CA" />
          <Field label="Dates" value="March 15-18, 2025 (4 days)" />
          <Field label="Expected Attendance" value="5,000" />
          <div>
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">Status</p>
            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Draft</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function Field({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <p className="mb-1.5 text-xs font-medium text-muted-foreground">{label}</p>
      <Input readOnly value={value} className="h-8 text-sm bg-muted/30 cursor-default" />
    </div>
  )
}

function LaborLogTab() {
  return (
    <div className="space-y-4">
      {/* Location Selector */}
      <div className="flex items-center gap-2">
        <Button variant="default" size="sm" className="gap-1.5">
          <MapPin className="h-3.5 w-3.5" />
          Los Angeles (Primary)
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5 text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          San Diego
        </Button>
        <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
          <Plus className="h-3.5 w-3.5" />
          Add Location
        </Button>
      </div>

      {/* Labor Table */}
      <Card>
        <CardContent className="pt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Role</TableHead>
                <TableHead className="text-center w-16">Qty</TableHead>
                <TableHead className="text-center w-16">Days</TableHead>
                <TableHead className="text-right w-24">Day Rate</TableHead>
                <TableHead className="text-right w-24">Line Total</TableHead>
                <TableHead className="text-right w-24">Cost Rate</TableHead>
                <TableHead className="text-right w-24">Cost Total</TableHead>
                <TableHead className="text-right w-20">GP</TableHead>
                <TableHead className="text-right w-16">GP%</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {laborRows.map((row) => {
                const lineTotal = row.qty * row.days * row.dayRate
                const costTotal = row.qty * row.days * row.costRate
                const gp = lineTotal - costTotal
                const gpPct = lineTotal > 0 ? ((gp / lineTotal) * 100).toFixed(0) : '0'
                return (
                  <TableRow key={row.role} className="group hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{row.role}</span>
                        <ChevronDown className="h-3 w-3 text-muted-foreground/50" />
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Input readOnly value={row.qty} className="h-7 w-14 text-center text-sm bg-transparent mx-auto" />
                    </TableCell>
                    <TableCell className="text-center">
                      <Input readOnly value={row.days} className="h-7 w-14 text-center text-sm bg-transparent mx-auto" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Input readOnly value={row.rateLabel} className="h-7 w-24 text-right text-sm bg-transparent ml-auto" />
                    </TableCell>
                    <TableCell className="text-right bg-muted/20">
                      <span className="text-sm font-medium">{fmt(lineTotal)}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Input readOnly value={row.costLabel} className="h-7 w-24 text-right text-sm bg-transparent ml-auto" />
                    </TableCell>
                    <TableCell className="text-right bg-muted/20">
                      <span className="text-sm">{fmt(costTotal)}</span>
                    </TableCell>
                    <TableCell className="text-right bg-muted/20">
                      <span className="text-sm text-green-400">{fmt(gp)}</span>
                    </TableCell>
                    <TableCell className="text-right bg-muted/20">
                      <span className="text-sm text-muted-foreground">{gpPct}%</span>
                    </TableCell>
                    <TableCell>
                      <Trash2 className="h-3.5 w-3.5 text-muted-foreground/30 group-hover:text-muted-foreground/70 transition-colors cursor-pointer" />
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          <div className="mt-3 border-t border-border pt-3">
            <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
              <Plus className="h-3.5 w-3.5" />
              Add Role
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Labor Summary */}
      <Card className="bg-muted/30">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between gap-6 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Total Labor Revenue</p>
              <p className="text-lg font-bold">{fmt(47680)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Labor Cost</p>
              <p className="text-lg font-bold">{fmt(31080)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Gross Profit</p>
              <p className="text-lg font-bold text-green-400">{fmt(16600)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">GP%</p>
              <p className="text-lg font-bold">34.8%</p>
            </div>
            <div className="border-l border-border pl-6">
              <p className="text-xs text-muted-foreground">Staff Count</p>
              <p className="text-lg font-bold">28</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Per Diem Total</p>
              <p className="text-lg font-bold">{fmt(5600)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total with Per Diem</p>
              <p className="text-lg font-bold">{fmt(53280)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function LineItemTab({ rows }: { rows: { item: string; desc: string; qty: number; unitCost: number; markup: number }[] }) {
  return (
    <Card>
      <CardContent className="pt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Line Item</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-center w-16">Qty</TableHead>
              <TableHead className="text-right w-24">Unit Cost</TableHead>
              <TableHead className="text-right w-24">Total</TableHead>
              <TableHead className="text-center w-20">Markup %</TableHead>
              <TableHead className="text-right w-28">Client Total</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => {
              const total = row.qty * row.unitCost
              const clientTotal = total * (1 + row.markup / 100)
              return (
                <TableRow key={row.item} className="group hover:bg-muted/50">
                  <TableCell className="font-medium text-sm">{row.item}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{row.desc}</TableCell>
                  <TableCell className="text-center">
                    <Input readOnly value={row.qty} className="h-7 w-14 text-center text-sm bg-transparent mx-auto" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Input readOnly value={fmt(row.unitCost)} className="h-7 w-24 text-right text-sm bg-transparent ml-auto" />
                  </TableCell>
                  <TableCell className="text-right bg-muted/20">
                    <span className="text-sm">{fmt(total)}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Input readOnly value={`${row.markup}%`} className="h-7 w-16 text-center text-sm bg-transparent mx-auto" />
                  </TableCell>
                  <TableCell className="text-right bg-muted/20">
                    <span className="text-sm font-medium">{fmt(clientTotal)}</span>
                  </TableCell>
                  <TableCell>
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground/30 group-hover:text-muted-foreground/70 transition-colors cursor-pointer" />
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
        <div className="mt-3 border-t border-border pt-3">
          <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
            <Plus className="h-3.5 w-3.5" />
            Add Line Item
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function SummaryTab() {
  const totals = summaryData.reduce(
    (acc, row) => ({ revenue: acc.revenue + row.revenue, cost: acc.cost + row.cost }),
    { revenue: 0, cost: 0 }
  )
  const totalGP = totals.revenue - totals.cost

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Consolidated P&L Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Section</TableHead>
              <TableHead className="text-right">Revenue</TableHead>
              <TableHead className="text-right">Cost</TableHead>
              <TableHead className="text-right">GP</TableHead>
              <TableHead className="text-right">GP%</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {summaryData.map((row) => {
              const gp = row.revenue - row.cost
              return (
                <TableRow key={row.section}>
                  <TableCell className="font-medium">{row.section}</TableCell>
                  <TableCell className="text-right">{fmt(row.revenue)}</TableCell>
                  <TableCell className="text-right">{fmt(row.cost)}</TableCell>
                  <TableCell className="text-right text-green-400">{fmt(gp)}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{pct(gp, row.revenue)}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
        <div className="mt-4 border-t-2 border-border pt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-base font-bold">TOTAL</span>
            <div className="flex items-center gap-12">
              <span className="font-bold">{fmt(totals.revenue)}</span>
              <span className="font-bold">{fmt(totals.cost)}</span>
              <span className="font-bold text-green-400">{fmt(totalGP)}</span>
              <span className="font-bold">{pct(totalGP, totals.revenue)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function AINudgePanel() {
  return (
    <div className="flex h-full flex-col">
      {/* Panel Header */}
      <div className="flex items-center gap-2 border-b border-border pb-4 mb-4">
        <span className="text-lg">🤖</span>
        <h2 className="text-sm font-semibold">AI Assistant</h2>
        <div className="ml-auto h-0.5 w-8 rounded-full bg-blue-500" />
      </div>

      {/* Nudge Cards */}
      <div className="flex-1 space-y-3 overflow-y-auto pr-1">
        {nudges.map((nudge, i) => (
          <NudgeCard key={i} {...nudge} />
        ))}
      </div>

      {/* Chat Input */}
      <div className="mt-4 border-t border-border pt-4">
        <div className="flex gap-2">
          <Textarea
            placeholder="Ask about this estimate or describe what you need..."
            className="min-h-[60px] resize-none text-sm"
            readOnly
          />
          <Button size="icon" className="shrink-0 self-end">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

const nudgeColors = {
  suggestion: { border: 'border-blue-500/30', bg: 'bg-blue-500/5', label: 'text-blue-400' },
  warning: { border: 'border-yellow-500/30', bg: 'bg-yellow-500/5', label: 'text-yellow-400' },
  validation: { border: 'border-green-500/30', bg: 'bg-green-500/5', label: 'text-green-400' },
  insight: { border: 'border-purple-500/30', bg: 'bg-purple-500/5', label: 'text-purple-400' },
}

function NudgeCard({ type, icon, label, message, footer }: typeof nudges[number]) {
  const colors = nudgeColors[type]
  return (
    <div className={`rounded-lg border ${colors.border} ${colors.bg} p-3`}>
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="text-sm">{icon}</span>
        <span className={`text-xs font-semibold tracking-wide ${colors.label}`}>{label}</span>
      </div>
      <p className="text-sm leading-relaxed text-foreground/90">{message}</p>
      <p className="mt-2 text-xs text-muted-foreground">{footer}</p>
    </div>
  )
}

// ── Main Page ────────────────────────────────────────────────────────────────

export function EstimateBuilderPage() {
  return (
    <div className="space-y-4">
      <ConceptBanner />

      <div className="pb-2 border-b border-border">
        <h1 className="text-2xl font-bold tracking-tight">Estimate Builder</h1>
        <p className="text-muted-foreground">
          Interactive concept mockup — Mazda CX-70 Launch Experience
        </p>
      </div>

      {/* 70/30 Split Layout */}
      <div className="flex gap-6">
        {/* Left Panel — Estimate Working Area (70%) */}
        <div className="flex-[7] min-w-0 space-y-4">
          <EventHeader />

          <Tabs defaultValue="labor">
            <TabsList>
              <TabsTrigger value="labor">Labor Log</TabsTrigger>
              <TabsTrigger value="production">Production</TabsTrigger>
              <TabsTrigger value="travel">Travel & Logistics</TabsTrigger>
              <TabsTrigger value="creative">Creative</TabsTrigger>
              <TabsTrigger value="access">Access Fees & Insurance</TabsTrigger>
              <TabsTrigger value="summary">Summary</TabsTrigger>
            </TabsList>

            <TabsContent value="labor">
              <LaborLogTab />
            </TabsContent>
            <TabsContent value="production">
              <LineItemTab rows={productionRows} />
            </TabsContent>
            <TabsContent value="travel">
              <LineItemTab rows={travelRows} />
            </TabsContent>
            <TabsContent value="creative">
              <LineItemTab rows={creativeRows} />
            </TabsContent>
            <TabsContent value="access">
              <LineItemTab rows={accessRows} />
            </TabsContent>
            <TabsContent value="summary">
              <SummaryTab />
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Panel — AI Intelligence (30%) */}
        <div className="flex-[3] min-w-[280px] border-l border-border pl-6">
          <AINudgePanel />
        </div>
      </div>
    </div>
  )
}
