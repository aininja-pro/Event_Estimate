import { useState, useMemo } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Plus,
  Search,
  ChevronUp,
  ChevronDown,
  X,
  Info,
  ShieldCheck,
  Lock,
  Building2,
} from 'lucide-react'

// ── Types ────────────────────────────────────────────────────────────────────

interface StandardRate {
  role: string
  glCode: string
  dayType: string
  billingRate: number
  cost: number
  category: 'P&A' | 'Labor' | 'Logistics' | 'Production'
  status: 'active' | 'inactive'
}

interface ClientRate {
  clientRole: string
  dsRole: string
  glCode: string
  dayType: string
  billingRate: number
  cost: number
  source: 'msa' | 'custom' | 'override'
}

interface ClientConfig {
  label: string
  shortLabel: string
  msaDate: string
  passThrough: string
  agencyFee: string
  rateCount: number
  customCount: number
  lastUpdated: string
  rates: ClientRate[]
}

// ── Sample Data ──────────────────────────────────────────────────────────────

const standardRates: StandardRate[] = [
  // Planning & Administration
  { role: 'Program Director', glCode: '4000.26', dayType: '10-hr day', billingRate: 750, cost: 450, category: 'P&A', status: 'active' },
  { role: 'Event/Vehicle Manager', glCode: '4000.17', dayType: '10-hr day', billingRate: 500, cost: 300, category: 'P&A', status: 'active' },
  // Onsite Event Labor
  { role: 'Product Specialist', glCode: '4000.16', dayType: '10-hr day', billingRate: 425, cost: 255, category: 'Labor', status: 'active' },
  { role: 'In-Vehicle Host', glCode: '4000.21', dayType: '10-hr day', billingRate: 375, cost: 225, category: 'Labor', status: 'active' },
  { role: 'Event/Vehicle Handler', glCode: '4000.31', dayType: '10-hr day', billingRate: 330, cost: 200, category: 'Labor', status: 'active' },
  { role: 'Registration Host', glCode: '4000.19', dayType: '10-hr day', billingRate: 300, cost: 180, category: 'Labor', status: 'active' },
  { role: 'Professional Chauffeur', glCode: '4000.32', dayType: 'Hourly', billingRate: 100, cost: 65, category: 'Labor', status: 'active' },
  { role: 'Lead Chauffeur', glCode: '4000.33', dayType: 'Hourly', billingRate: 115, cost: 75, category: 'Labor', status: 'active' },
  { role: 'Promotional Model', glCode: '4000.40', dayType: '10-hr day', billingRate: 350, cost: 210, category: 'Labor', status: 'active' },
  { role: 'Vehicle Detailer', glCode: '4000.35', dayType: '10-hr day', billingRate: 280, cost: 170, category: 'Labor', status: 'active' },
  { role: 'Per Diem', glCode: '4075.07', dayType: 'Per Day', billingRate: 50, cost: 50, category: 'Labor', status: 'active' },
]

const clientConfigs: Record<string, ClientConfig> = {
  mazda: {
    label: 'Mazda MSA',
    shortLabel: 'Mazda',
    msaDate: 'Jan 1, 2024',
    passThrough: '1.5%',
    agencyFee: '15%',
    rateCount: 16,
    customCount: 3,
    lastUpdated: 'Jan 15, 2025',
    rates: [
      { clientRole: 'Event Director', dsRole: 'Program Director', glCode: '4000.26', dayType: '10-hr day', billingRate: 750, cost: 450, source: 'msa' },
      { clientRole: 'Event Manager', dsRole: 'Event/Vehicle Manager', glCode: '4000.17', dayType: '10-hr day', billingRate: 500, cost: 300, source: 'msa' },
      { clientRole: 'Brand Ambassador', dsRole: 'Product Specialist', glCode: '4000.16', dayType: '10-hr day', billingRate: 450, cost: 255, source: 'msa' },
      { clientRole: 'Drive Host', dsRole: 'In-Vehicle Host', glCode: '4000.21', dayType: '10-hr day', billingRate: 375, cost: 225, source: 'msa' },
      { clientRole: 'Registration Staff', dsRole: 'Registration Host', glCode: '4000.19', dayType: '10-hr day', billingRate: 300, cost: 180, source: 'msa' },
      { clientRole: 'Professional Driver', dsRole: 'Professional Chauffeur', glCode: '4000.32', dayType: 'Hourly', billingRate: 100, cost: 65, source: 'msa' },
      { clientRole: 'Vehicle Handler', dsRole: 'Event/Vehicle Handler', glCode: '4000.31', dayType: '10-hr day', billingRate: 330, cost: 200, source: 'msa' },
      { clientRole: 'Road Manager', dsRole: '(Custom)', glCode: '4000.45', dayType: '10-hr day', billingRate: 500, cost: 300, source: 'custom' },
      { clientRole: 'Promotional Model', dsRole: 'Promotional Model', glCode: '4000.40', dayType: '10-hr day', billingRate: 375, cost: 210, source: 'custom' },
    ],
  },
  volvo: {
    label: 'Volvo MSA',
    shortLabel: 'Volvo',
    msaDate: 'Mar 15, 2024',
    passThrough: '2.0%',
    agencyFee: '12%',
    rateCount: 14,
    customCount: 1,
    lastUpdated: 'Nov 20, 2024',
    rates: [
      { clientRole: 'Program Lead', dsRole: 'Program Director', glCode: '4000.26', dayType: '10-hr day', billingRate: 775, cost: 450, source: 'msa' },
      { clientRole: 'Field Manager', dsRole: 'Event/Vehicle Manager', glCode: '4000.17', dayType: '10-hr day', billingRate: 525, cost: 300, source: 'msa' },
      { clientRole: 'Product Expert', dsRole: 'Product Specialist', glCode: '4000.16', dayType: '10-hr day', billingRate: 440, cost: 255, source: 'msa' },
      { clientRole: 'Ride Host', dsRole: 'In-Vehicle Host', glCode: '4000.21', dayType: '10-hr day', billingRate: 390, cost: 225, source: 'msa' },
      { clientRole: 'Guest Greeter', dsRole: 'Registration Host', glCode: '4000.19', dayType: '10-hr day', billingRate: 310, cost: 180, source: 'msa' },
      { clientRole: 'Professional Driver', dsRole: 'Professional Chauffeur', glCode: '4000.32', dayType: 'Hourly', billingRate: 110, cost: 65, source: 'msa' },
      { clientRole: 'Vehicle Attendant', dsRole: 'Event/Vehicle Handler', glCode: '4000.31', dayType: '10-hr day', billingRate: 340, cost: 200, source: 'msa' },
      { clientRole: 'Concierge Host', dsRole: '(Custom)', glCode: '4000.46', dayType: '10-hr day', billingRate: 400, cost: 240, source: 'custom' },
    ],
  },
  genesis: {
    label: 'Genesis MSA',
    shortLabel: 'Genesis',
    msaDate: 'Jun 1, 2024',
    passThrough: '1.0%',
    agencyFee: '18%',
    rateCount: 12,
    customCount: 2,
    lastUpdated: 'Dec 5, 2024',
    rates: [
      { clientRole: 'Experience Director', dsRole: 'Program Director', glCode: '4000.26', dayType: '10-hr day', billingRate: 800, cost: 450, source: 'msa' },
      { clientRole: 'Experience Manager', dsRole: 'Event/Vehicle Manager', glCode: '4000.17', dayType: '10-hr day', billingRate: 550, cost: 300, source: 'msa' },
      { clientRole: 'Genesis Guide', dsRole: 'Product Specialist', glCode: '4000.16', dayType: '10-hr day', billingRate: 475, cost: 255, source: 'msa' },
      { clientRole: 'Drive Specialist', dsRole: 'In-Vehicle Host', glCode: '4000.21', dayType: '10-hr day', billingRate: 400, cost: 225, source: 'msa' },
      { clientRole: 'Welcome Host', dsRole: 'Registration Host', glCode: '4000.19', dayType: '10-hr day', billingRate: 325, cost: 180, source: 'msa' },
      { clientRole: 'Professional Chauffeur', dsRole: 'Professional Chauffeur', glCode: '4000.32', dayType: 'Hourly', billingRate: 120, cost: 65, source: 'msa' },
      { clientRole: 'Vehicle Valet', dsRole: 'Event/Vehicle Handler', glCode: '4000.31', dayType: '10-hr day', billingRate: 350, cost: 200, source: 'override' },
      { clientRole: 'Lifestyle Host', dsRole: '(Custom)', glCode: '4000.47', dayType: '10-hr day', billingRate: 425, cost: 250, source: 'custom' },
      { clientRole: 'VIP Concierge', dsRole: '(Custom)', glCode: '4000.48', dayType: '10-hr day', billingRate: 550, cost: 330, source: 'custom' },
    ],
  },
  audi: {
    label: 'Audi MSA',
    shortLabel: 'Audi',
    msaDate: 'Sep 1, 2023',
    passThrough: '1.5%',
    agencyFee: '14%',
    rateCount: 15,
    customCount: 0,
    lastUpdated: 'Oct 30, 2024',
    rates: [
      { clientRole: 'Program Director', dsRole: 'Program Director', glCode: '4000.26', dayType: '10-hr day', billingRate: 725, cost: 450, source: 'msa' },
      { clientRole: 'Event Supervisor', dsRole: 'Event/Vehicle Manager', glCode: '4000.17', dayType: '10-hr day', billingRate: 500, cost: 300, source: 'msa' },
      { clientRole: 'Brand Specialist', dsRole: 'Product Specialist', glCode: '4000.16', dayType: '10-hr day', billingRate: 425, cost: 255, source: 'msa' },
      { clientRole: 'Co-Pilot', dsRole: 'In-Vehicle Host', glCode: '4000.21', dayType: '10-hr day', billingRate: 375, cost: 225, source: 'msa' },
      { clientRole: 'Check-In Host', dsRole: 'Registration Host', glCode: '4000.19', dayType: '10-hr day', billingRate: 300, cost: 180, source: 'msa' },
      { clientRole: 'Professional Driver', dsRole: 'Professional Chauffeur', glCode: '4000.32', dayType: 'Hourly', billingRate: 105, cost: 65, source: 'msa' },
      { clientRole: 'Vehicle Handler', dsRole: 'Event/Vehicle Handler', glCode: '4000.31', dayType: '10-hr day', billingRate: 330, cost: 200, source: 'msa' },
    ],
  },
  vw: {
    label: 'Volkswagen MSA',
    shortLabel: 'VW',
    msaDate: 'Feb 1, 2024',
    passThrough: '1.5%',
    agencyFee: '15%',
    rateCount: 13,
    customCount: 1,
    lastUpdated: 'Jan 8, 2025',
    rates: [
      { clientRole: 'Program Director', dsRole: 'Program Director', glCode: '4000.26', dayType: '10-hr day', billingRate: 750, cost: 450, source: 'msa' },
      { clientRole: 'Event Manager', dsRole: 'Event/Vehicle Manager', glCode: '4000.17', dayType: '10-hr day', billingRate: 500, cost: 300, source: 'msa' },
      { clientRole: 'Product Specialist', dsRole: 'Product Specialist', glCode: '4000.16', dayType: '10-hr day', billingRate: 425, cost: 255, source: 'msa' },
      { clientRole: 'Drive Coach', dsRole: 'In-Vehicle Host', glCode: '4000.21', dayType: '10-hr day', billingRate: 380, cost: 225, source: 'msa' },
      { clientRole: 'Registration Host', dsRole: 'Registration Host', glCode: '4000.19', dayType: '10-hr day', billingRate: 300, cost: 180, source: 'msa' },
      { clientRole: 'Professional Chauffeur', dsRole: 'Professional Chauffeur', glCode: '4000.32', dayType: 'Hourly', billingRate: 100, cost: 65, source: 'msa' },
      { clientRole: 'Vehicle Handler', dsRole: 'Event/Vehicle Handler', glCode: '4000.31', dayType: '10-hr day', billingRate: 330, cost: 200, source: 'msa' },
      { clientRole: 'Road Manager', dsRole: '(Custom)', glCode: '4000.45', dayType: '10-hr day', billingRate: 500, cost: 300, source: 'custom' },
    ],
  },
}

const clientKeys = ['standard', 'mazda', 'volvo', 'genesis', 'audi', 'vw'] as const
type ClientKey = (typeof clientKeys)[number]

const clientTabMeta: Record<ClientKey, { icon: string; label: string; sub: string; rateCount: number; markup: string }> = {
  standard: { icon: '🏢', label: 'DriveShop', sub: 'Standard', rateCount: 55, markup: '—' },
  mazda: { icon: '🚗', label: 'Mazda', sub: 'MSA', rateCount: 16, markup: '1.5%' },
  volvo: { icon: '🚙', label: 'Volvo', sub: 'MSA', rateCount: 14, markup: '2.0%' },
  genesis: { icon: '🚘', label: 'Genesis', sub: 'MSA', rateCount: 12, markup: '1.0%' },
  audi: { icon: '🚗', label: 'Audi', sub: 'MSA', rateCount: 15, markup: '1.5%' },
  vw: { icon: '🚗', label: 'VW', sub: 'MSA', rateCount: 13, markup: '1.5%' },
}

const categoryLabels: Record<string, string> = {
  'P&A': 'Planning & Administration',
  Labor: 'Onsite Event Labor',
  Logistics: 'Logistics',
  Production: 'Production',
}

const categoryOrder = ['P&A', 'Labor', 'Logistics', 'Production']

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  return '$' + n.toLocaleString()
}

type StdSortKey = 'role' | 'billingRate' | 'cost' | 'margin' | 'category'
type ClientSortKey = 'clientRole' | 'billingRate' | 'cost' | 'margin' | 'source'
type SortDir = 'asc' | 'desc'

// ── Sub-Components ───────────────────────────────────────────────────────────

function ConceptBanner() {
  const [visible, setVisible] = useState(true)
  if (!visible) return null
  return (
    <div className="flex items-start gap-3 rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
      <div className="flex-1">
        <span className="font-medium text-blue-300">UI Concept</span>
        <span className="text-blue-300/80"> — This is an interactive mockup of the production rate card system. Rate data shown is illustrative. Production rates will be imported from actual client MSAs.</span>
      </div>
      <button onClick={() => setVisible(false)} className="shrink-0 text-blue-400 hover:text-blue-300">
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return null
  return dir === 'asc'
    ? <ChevronUp className="inline h-4 w-4 ml-1" />
    : <ChevronDown className="inline h-4 w-4 ml-1" />
}

function SourceBadge({ source }: { source: ClientRate['source'] }) {
  switch (source) {
    case 'msa':
      return <Badge variant="outline" className="border-green-500/30 text-green-400 text-xs">MSA ✓</Badge>
    case 'custom':
      return <Badge variant="outline" className="border-blue-500/30 text-blue-400 text-xs">Custom ⚡</Badge>
    case 'override':
      return <Badge variant="outline" className="border-yellow-500/30 text-yellow-400 text-xs">Override ⚠️</Badge>
  }
}

function ClientSelectorCards({ selected, onSelect }: { selected: ClientKey; onSelect: (k: ClientKey) => void }) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-1">
      {clientKeys.map((key) => {
        const meta = clientTabMeta[key]
        const isActive = selected === key
        return (
          <button
            key={key}
            onClick={() => onSelect(key)}
            className={[
              'flex flex-col items-center gap-1 rounded-lg border px-5 py-3 text-center transition-all min-w-[120px] shrink-0',
              isActive
                ? 'border-primary bg-primary/10 ring-1 ring-primary/30'
                : 'border-border bg-card hover:bg-muted/50 hover:border-muted-foreground/30',
            ].join(' ')}
          >
            <span className="text-xl">{meta.icon}</span>
            <span className={`text-sm font-semibold ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
              {meta.label}
            </span>
            <Badge variant={isActive ? 'default' : 'secondary'} className="text-[10px]">
              {meta.sub}
            </Badge>
            <div className="mt-1 flex flex-col items-center gap-0.5 text-[11px] text-muted-foreground">
              <span>{meta.rateCount} rates</span>
              {meta.markup !== '—' && <span>{meta.markup} markup</span>}
            </div>
          </button>
        )
      })}
      <button className="flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border px-5 py-3 min-w-[120px] shrink-0 text-muted-foreground hover:bg-muted/50 hover:border-muted-foreground/30 transition-all">
        <Plus className="h-5 w-5" />
        <span className="text-xs font-medium">Add Client</span>
      </button>
    </div>
  )
}

// ── Standard Rate Card View ──────────────────────────────────────────────────

function StandardView({ search }: { search: string }) {
  const [sortKey, setSortKey] = useState<StdSortKey>('category')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  const filtered = useMemo(() => {
    const term = search.toLowerCase()
    const matched = standardRates.filter((r) => r.role.toLowerCase().includes(term))
    return [...matched].sort((a, b) => {
      let aVal: string | number
      let bVal: string | number
      switch (sortKey) {
        case 'role': aVal = a.role.toLowerCase(); bVal = b.role.toLowerCase(); break
        case 'billingRate': aVal = a.billingRate; bVal = b.billingRate; break
        case 'cost': aVal = a.cost; bVal = b.cost; break
        case 'margin': aVal = a.billingRate - a.cost; bVal = b.billingRate - b.cost; break
        case 'category':
          aVal = categoryOrder.indexOf(a.category); bVal = categoryOrder.indexOf(b.category)
          if (aVal === bVal) { aVal = a.role.toLowerCase(); bVal = b.role.toLowerCase() }
          break
      }
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
      }
      return sortDir === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number)
    })
  }, [search, sortKey, sortDir])

  function handleSort(key: StdSortKey) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('asc') }
  }

  // Pre-compute which indices get a group header
  const groupHeaderIndices = useMemo(() => {
    if (sortKey !== 'category') return new Set<number>()
    const set = new Set<number>()
    let prev = ''
    filtered.forEach((row, i) => {
      if (row.category !== prev) { set.add(i); prev = row.category }
    })
    return set
  }, [filtered, sortKey])

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Roles</p>
            <p className="text-2xl font-bold">55</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Standard Roles</p>
            <p className="text-2xl font-bold">16</p>
            <p className="text-xs text-muted-foreground">From typical MSA</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Extended Roles</p>
            <p className="text-2xl font-bold">39</p>
            <p className="text-xs text-muted-foreground">Added over time</p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="cursor-pointer select-none w-[200px]" onClick={() => handleSort('role')}>
                  Role <SortIcon active={sortKey === 'role'} dir={sortDir} />
                </TableHead>
                <TableHead className="w-24">GL Code</TableHead>
                <TableHead className="w-28">Day Type</TableHead>
                <TableHead className="cursor-pointer select-none text-right w-32" onClick={() => handleSort('billingRate')}>
                  Standard Billing Rate <SortIcon active={sortKey === 'billingRate'} dir={sortDir} />
                </TableHead>
                <TableHead className="cursor-pointer select-none text-right w-28" onClick={() => handleSort('cost')}>
                  Standard Cost <SortIcon active={sortKey === 'cost'} dir={sortDir} />
                </TableHead>
                <TableHead className="cursor-pointer select-none text-right w-28" onClick={() => handleSort('margin')}>
                  Standard Margin <SortIcon active={sortKey === 'margin'} dir={sortDir} />
                </TableHead>
                <TableHead className="text-right w-20">Margin %</TableHead>
                <TableHead className="cursor-pointer select-none w-28" onClick={() => handleSort('category')}>
                  Category <SortIcon active={sortKey === 'category'} dir={sortDir} />
                </TableHead>
                <TableHead className="w-20">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((row, idx) => {
                const margin = row.billingRate - row.cost
                const marginPct = row.billingRate > 0 ? ((margin / row.billingRate) * 100).toFixed(0) : '0'

                return (
                  <GroupedStandardRow
                    key={row.role}
                    row={row}
                    margin={margin}
                    marginPct={marginPct}
                    showGroupHeader={groupHeaderIndices.has(idx)}
                  />
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  )
}

function GroupedStandardRow({ row, margin, marginPct, showGroupHeader }: {
  row: StandardRate; margin: number; marginPct: string; showGroupHeader: boolean
}) {
  return (
    <>
      {showGroupHeader && (
        <TableRow className="bg-muted/40">
          <TableCell colSpan={9} className="py-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {categoryLabels[row.category] ?? row.category}
            </span>
          </TableCell>
        </TableRow>
      )}
      <TableRow className="group hover:bg-muted/50">
        <TableCell className="font-medium">{row.role}</TableCell>
        <TableCell>
          <Input readOnly value={row.glCode} className="h-7 w-20 text-sm bg-transparent" />
        </TableCell>
        <TableCell>
          <Select defaultValue={row.dayType}>
            <SelectTrigger size="sm" className="h-7 w-24 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="8-hr day">8-hr day</SelectItem>
              <SelectItem value="10-hr day">10-hr day</SelectItem>
              <SelectItem value="Hourly">Hourly</SelectItem>
              <SelectItem value="Per Day">Per Day</SelectItem>
            </SelectContent>
          </Select>
        </TableCell>
        <TableCell className="text-right">
          <Input readOnly value={fmt(row.billingRate)} className="h-7 w-24 text-right text-sm bg-transparent ml-auto" />
        </TableCell>
        <TableCell className="text-right">
          <Input readOnly value={fmt(row.cost)} className="h-7 w-24 text-right text-sm bg-transparent ml-auto" />
        </TableCell>
        <TableCell className="text-right text-green-400 font-medium">{fmt(margin)}</TableCell>
        <TableCell className="text-right text-muted-foreground">{marginPct}%</TableCell>
        <TableCell>
          <Badge variant="secondary" className="text-[10px]">{row.category}</Badge>
        </TableCell>
        <TableCell>
          <Badge variant="outline" className="border-green-500/30 text-green-400 text-xs">Active ✓</Badge>
        </TableCell>
      </TableRow>
    </>
  )
}

// ── Client MSA Rate Card View ────────────────────────────────────────────────

function ClientView({ clientKey, search }: { clientKey: string; search: string }) {
  const config = clientConfigs[clientKey]
  const [sortKey, setSortKey] = useState<ClientSortKey>('clientRole')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [costStructure, setCostStructure] = useState('corporate')

  const filtered = useMemo(() => {
    if (!config) return []
    const term = search.toLowerCase()
    const matched = config.rates.filter(
      (r) => r.clientRole.toLowerCase().includes(term) || r.dsRole.toLowerCase().includes(term)
    )
    return [...matched].sort((a, b) => {
      let aVal: string | number
      let bVal: string | number
      switch (sortKey) {
        case 'clientRole': aVal = a.clientRole.toLowerCase(); bVal = b.clientRole.toLowerCase(); break
        case 'billingRate': aVal = a.billingRate; bVal = b.billingRate; break
        case 'cost': aVal = a.cost; bVal = b.cost; break
        case 'margin': aVal = a.billingRate - a.cost; bVal = b.billingRate - b.cost; break
        case 'source': aVal = a.source; bVal = b.source; break
      }
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
      }
      return sortDir === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number)
    })
  }, [config, search, sortKey, sortDir])

  function handleSort(key: ClientSortKey) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('asc') }
  }

  if (!config) return null

  return (
    <>
      {/* Client Header Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-6 gap-6">
            <div>
              <p className="text-xs text-muted-foreground">Client</p>
              <p className="text-sm font-semibold">{config.shortLabel}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">MSA Effective</p>
              <p className="text-sm font-semibold">{config.msaDate}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pass-Through Markup</p>
              <p className="text-sm font-semibold">{config.passThrough}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Agency Fee</p>
              <p className="text-sm font-semibold">{config.agencyFee}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Rates Defined</p>
              <p className="text-sm font-semibold">{config.rateCount} <span className="text-muted-foreground font-normal">({config.customCount} custom)</span></p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Last Updated</p>
              <p className="text-sm font-semibold">{config.lastUpdated}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Client Rate Table */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="cursor-pointer select-none w-[190px]" onClick={() => handleSort('clientRole')}>
                  Role (Client Nomenclature) <SortIcon active={sortKey === 'clientRole'} dir={sortDir} />
                </TableHead>
                <TableHead className="w-[170px]">DriveShop Standard Role</TableHead>
                <TableHead className="w-24">GL Code</TableHead>
                <TableHead className="w-24">Day Type</TableHead>
                <TableHead className="cursor-pointer select-none text-right w-32" onClick={() => handleSort('billingRate')}>
                  Client Billing Rate <SortIcon active={sortKey === 'billingRate'} dir={sortDir} />
                </TableHead>
                <TableHead className="cursor-pointer select-none text-right w-28" onClick={() => handleSort('cost')}>
                  DriveShop Cost <SortIcon active={sortKey === 'cost'} dir={sortDir} />
                </TableHead>
                <TableHead className="cursor-pointer select-none text-right w-20" onClick={() => handleSort('margin')}>
                  Margin <SortIcon active={sortKey === 'margin'} dir={sortDir} />
                </TableHead>
                <TableHead className="text-right w-20">Margin %</TableHead>
                <TableHead className="cursor-pointer select-none w-24" onClick={() => handleSort('source')}>
                  Source <SortIcon active={sortKey === 'source'} dir={sortDir} />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((row) => {
                const margin = row.billingRate - row.cost
                const marginPct = row.billingRate > 0 ? ((margin / row.billingRate) * 100).toFixed(0) : '0'
                const isMsa = row.source === 'msa'
                return (
                  <TableRow key={row.clientRole} className="group hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-1.5">
                        {row.clientRole}
                        {isMsa && <Lock className="h-3 w-3 text-muted-foreground/40" />}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      <span className="text-muted-foreground/60 mr-1">→</span> {row.dsRole}
                    </TableCell>
                    <TableCell>
                      <Input readOnly value={row.glCode} className="h-7 w-20 text-sm bg-transparent" />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{row.dayType}</TableCell>
                    <TableCell className="text-right">
                      <Input
                        readOnly
                        value={fmt(row.billingRate)}
                        className={`h-7 w-24 text-right text-sm ml-auto ${isMsa ? 'bg-transparent opacity-70' : 'bg-transparent'}`}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Input readOnly value={fmt(row.cost)} className="h-7 w-24 text-right text-sm bg-transparent ml-auto" />
                    </TableCell>
                    <TableCell className="text-right text-green-400 font-medium">{fmt(margin)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{marginPct}%</TableCell>
                    <TableCell><SourceBadge source={row.source} /></TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          <div className="mt-3 border-t border-border pt-3">
            <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
              <Plus className="h-3.5 w-3.5" />
              Add Rate to Client Card
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Rate Card Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Rate Card Settings — {config.label}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-x-12 gap-y-5">
            <div>
              <p className="mb-1.5 text-xs font-medium text-muted-foreground">Pass-Through Cost Markup</p>
              <Input readOnly value={config.passThrough} className="h-8 w-32 text-sm bg-muted/30 cursor-default" />
            </div>
            <div>
              <p className="mb-1.5 text-xs font-medium text-muted-foreground">Agency Fee</p>
              <Input readOnly value={config.agencyFee} className="h-8 w-32 text-sm bg-muted/30 cursor-default" />
            </div>
            <div>
              <p className="mb-1.5 text-xs font-medium text-muted-foreground">Default Day Type</p>
              <Select defaultValue="10-hr day">
                <SelectTrigger size="sm" className="h-8 w-40 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="8-hr day">8-hr day</SelectItem>
                  <SelectItem value="10-hr day">10-hr day</SelectItem>
                  <SelectItem value="Hourly">Hourly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <p className="mb-1.5 text-xs font-medium text-muted-foreground">Cost Structure</p>
              <div className="flex items-center gap-2">
                <Button
                  variant={costStructure === 'corporate' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCostStructure('corporate')}
                  className="gap-1.5"
                >
                  <Building2 className="h-3.5 w-3.5" />
                  Corporate
                </Button>
                <Button
                  variant={costStructure === 'office' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCostStructure('office')}
                  className="gap-1.5"
                >
                  <Building2 className="h-3.5 w-3.5" />
                  Office
                </Button>
              </div>
            </div>
            <div>
              <p className="mb-1.5 text-xs font-medium text-muted-foreground">Rate Card Owner</p>
              <Select defaultValue="am">
                <SelectTrigger size="sm" className="h-8 w-48 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="am">Account Manager</SelectItem>
                  <SelectItem value="director">Director</SelectItem>
                  <SelectItem value="vp">VP Operations</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <p className="mb-1.5 text-xs font-medium text-muted-foreground">Last MSA Review</p>
              <p className="text-sm font-medium pt-1.5">{config.lastUpdated}</p>
            </div>
          </div>
          <div className="mt-6 flex items-center gap-3 rounded-lg border border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
            <ShieldCheck className="h-4 w-4 shrink-0" />
            Rate card changes require AM-level approval. All changes are version-tracked with full audit trail.
          </div>
        </CardContent>
      </Card>

      {/* Audit Badge */}
      <p className="text-xs text-muted-foreground text-right">
        Last modified by Tatiana Z. on {config.lastUpdated}
      </p>
    </>
  )
}

// ── Main Page ────────────────────────────────────────────────────────────────

export function RateCardManagementPage() {
  const [selected, setSelected] = useState<ClientKey>('standard')
  const [search, setSearch] = useState('')

  return (
    <div className="space-y-4">
      <ConceptBanner />

      <div className="pb-2 border-b border-border">
        <h1 className="text-2xl font-bold tracking-tight">Rate Card Management</h1>
        <p className="text-muted-foreground">
          Manage DriveShop standard rates and client-specific pricing
        </p>
      </div>

      {/* Client Rate Card Selector */}
      <ClientSelectorCards selected={selected} onSelect={setSelected} />

      {/* Search + Add */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search roles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          {selected === 'standard' ? 'Add New Rate' : 'Add Rate to Client Card'}
        </Button>
      </div>

      {/* View: Standard or Client */}
      {selected === 'standard' ? (
        <StandardView search={search} />
      ) : (
        <ClientView clientKey={selected} search={search} />
      )}
    </div>
  )
}
