import { useState, useMemo } from 'react'
import {
  Card,
  CardContent,
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
import { Input } from '@/components/ui/input'
import { getRateCard } from '@/lib/data'
import { Search, SearchX, ChevronDown, ChevronUp } from 'lucide-react'
import type { RateCardRole, RateRange } from '@/types/rate-card'

const roles = getRateCard()
const maxOccurrences = Math.max(...roles.map((r) => r.occurrences))

type SortKey = 'role' | 'occurrences' | 'unitRateAvg' | 'costRateAvg'
type SortDirection = 'asc' | 'desc'

function formatRate(value: number): string {
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function formatRateRange(range: RateRange): string {
  if (range.min === range.max) return formatRate(range.min)
  return `${formatRate(range.min)} - ${formatRate(range.max)}`
}

function getSortValue(role: RateCardRole, key: SortKey): string | number {
  switch (key) {
    case 'role':
      return role.role.toLowerCase()
    case 'occurrences':
      return role.occurrences
    case 'unitRateAvg':
      return role.unit_rate_range.avg
    case 'costRateAvg':
      return role.cost_rate_range.avg
  }
}

function SortIndicator({
  columnKey,
  sortKey,
  sortDirection,
}: {
  columnKey: SortKey
  sortKey: SortKey
  sortDirection: SortDirection
}) {
  if (sortKey !== columnKey) return null
  return sortDirection === 'asc' ? (
    <ChevronUp className="inline h-4 w-4 ml-1" />
  ) : (
    <ChevronDown className="inline h-4 w-4 ml-1" />
  )
}

function RangeBar({ range, label }: { range: RateRange; label: string }) {
  const scale = range.max * 1.1
  const minPct = (range.min / scale) * 100
  const maxPct = (range.max / scale) * 100
  const avgPct = (range.avg / scale) * 100
  const medianPct = (range.median / scale) * 100

  return (
    <div>
      <p className="text-sm font-medium mb-2">{label}</p>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Min</span>
            <span className="font-medium">{formatRate(range.min)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Max</span>
            <span className="font-medium">{formatRate(range.max)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Average</span>
            <span className="font-medium">{formatRate(range.avg)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Median</span>
            <span className="font-medium">{formatRate(range.median)}</span>
          </div>
        </div>
        <div className="relative h-6 bg-muted rounded">
          <div
            className="absolute top-0 h-full bg-primary/20 rounded"
            style={{ left: `${minPct}%`, width: `${maxPct - minPct}%` }}
          />
          <div
            className="absolute top-0 h-full w-0.5 bg-primary"
            style={{ left: `${avgPct}%` }}
            title={`Avg: ${formatRate(range.avg)}`}
          />
          <div
            className="absolute top-0 h-full w-0.5 bg-primary/60"
            style={{ left: `${medianPct}%`, borderLeft: '1px dashed' }}
            title={`Median: ${formatRate(range.median)}`}
          />
          <div className="absolute -bottom-5 flex justify-between w-full text-[10px] text-muted-foreground px-0.5">
            <span>{formatRate(range.min)}</span>
            <span>{formatRate(range.max)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export function RateCardPage() {
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('occurrences')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [expandedRole, setExpandedRole] = useState<string | null>(null)

  const filteredRoles = useMemo(() => {
    const term = search.toLowerCase()
    let filtered = roles.filter((r) => r.role.toLowerCase().includes(term))

    filtered = [...filtered].sort((a, b) => {
      const aVal = getSortValue(a, sortKey)
      const bVal = getSortValue(b, sortKey)
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
      }
      return sortDirection === 'asc'
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number)
    })

    return filtered
  }, [search, sortKey, sortDirection])

  const totalRoles = roles.length
  const mostUsedRole = roles.reduce((a, b) => (a.occurrences > b.occurrences ? a : b))
  const otVariantCount = roles.filter((r) => r.has_ot_variant).length

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDirection('desc')
    }
  }

  function toggleExpand(roleName: string) {
    setExpandedRole((prev) => (prev === roleName ? null : roleName))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Historical Rate Analysis</h1>
        <p className="text-muted-foreground">
          {totalRoles} unique roles and rate ranges extracted from 1,659 historical estimates.
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search roles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Roles</p>
            <p className="text-2xl font-bold">{totalRoles}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Most Used Role</p>
            <p className="text-2xl font-bold">{mostUsedRole.role}</p>
            <p className="text-sm text-muted-foreground">{mostUsedRole.occurrences} occurrences</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Roles with OT Variant</p>
            <p className="text-2xl font-bold">{otVariantCount}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => handleSort('role')}
                >
                  Role Name
                  <SortIndicator columnKey="role" sortKey={sortKey} sortDirection={sortDirection} />
                </TableHead>
                <TableHead>GL Codes</TableHead>
                <TableHead
                  className="cursor-pointer select-none text-right"
                  onClick={() => handleSort('occurrences')}
                >
                  Occurrences
                  <SortIndicator columnKey="occurrences" sortKey={sortKey} sortDirection={sortDirection} />
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none text-right"
                  onClick={() => handleSort('unitRateAvg')}
                >
                  Unit Rate Range
                  <SortIndicator columnKey="unitRateAvg" sortKey={sortKey} sortDirection={sortDirection} />
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none text-right"
                  onClick={() => handleSort('costRateAvg')}
                >
                  Cost Rate Range
                  <SortIndicator columnKey="costRateAvg" sortKey={sortKey} sortDirection={sortDirection} />
                </TableHead>
                <TableHead className="text-center">OT</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRoles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-40 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <SearchX className="h-8 w-8 text-muted-foreground/50" />
                      <p className="text-muted-foreground">No roles match &ldquo;{search}&rdquo;</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredRoles.map((role) => {
                  const isExpanded = expandedRole === role.role
                  return (
                    <RoleRow
                      key={role.role}
                      role={role}
                      isExpanded={isExpanded}
                      onToggle={() => toggleExpand(role.role)}
                      maxOccurrences={maxOccurrences}
                    />
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function RoleRow({
  role,
  isExpanded,
  onToggle,
  maxOccurrences,
}: {
  role: RateCardRole
  isExpanded: boolean
  onToggle: () => void
  maxOccurrences: number
}) {
  const occurrencePct = (role.occurrences / maxOccurrences) * 100

  return (
    <>
      <TableRow
        className="cursor-pointer even:bg-muted/50 hover:bg-muted/70 transition-colors"
        onClick={onToggle}
        tabIndex={0}
        role="button"
        aria-expanded={isExpanded}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onToggle()
          }
        }}
      >
        <TableCell className="font-medium">{role.role}</TableCell>
        <TableCell>
          <div className="flex gap-1 flex-wrap">
            {role.gl_codes.map((code) => (
              <Badge key={code} variant="outline">{code}</Badge>
            ))}
          </div>
        </TableCell>
        <TableCell className="text-right">
          <div>
            <span>{role.occurrences}</span>
            <div className="mt-1 h-[4px] w-full rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary/20"
                style={{ width: `${occurrencePct}%` }}
              />
            </div>
          </div>
        </TableCell>
        <TableCell className="text-right">
          <div>
            <span className="text-sm">{formatRateRange(role.unit_rate_range)}</span>
            <p className="text-xs text-muted-foreground">avg: {formatRate(role.unit_rate_range.avg)}</p>
          </div>
        </TableCell>
        <TableCell className="text-right">
          <div>
            <span className="text-sm">{formatRateRange(role.cost_rate_range)}</span>
            <p className="text-xs text-muted-foreground">avg: {formatRate(role.cost_rate_range.avg)}</p>
          </div>
        </TableCell>
        <TableCell className="text-center">
          {role.has_ot_variant && <Badge variant="secondary">OT</Badge>}
        </TableCell>
        <TableCell>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </TableCell>
      </TableRow>
      {isExpanded && (
        <TableRow className="bg-muted/30">
          <TableCell colSpan={7} className="border-l-4 border-primary p-6">
            <div className="grid grid-cols-2 gap-8 mb-4">
              <RangeBar range={role.unit_rate_range} label="Unit Rate Details" />
              <RangeBar range={role.cost_rate_range} label="Cost Rate Details" />
            </div>
            <div className="mt-8 flex items-center gap-4 text-sm text-muted-foreground">
              <span>Found in <span className="font-medium text-foreground">{role.occurrences}</span> events</span>
              <span className="text-border">|</span>
              <span>GL: {role.gl_codes.join(', ')}</span>
              <span className="text-border">|</span>
              <span>OT Variant: {role.has_ot_variant ? 'Yes' : 'No'}</span>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  )
}
