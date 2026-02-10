import { useState } from 'react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { getExecutiveSummary, getCostAnalysis, getVarianceData, getManagerData } from '@/lib/data'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
} from 'recharts'

const executive = getExecutiveSummary()
const costs = getCostAnalysis()
const variance = getVarianceData()
const managers = getManagerData()

const CHART_COLORS = [
  'oklch(0.546 0.245 262.881)', // chart-1 blue
  'oklch(0.696 0.17 162.48)',   // chart-2 emerald
  'oklch(0.398 0.07 227.392)',  // chart-3 slate
  'oklch(0.828 0.189 84.429)',  // chart-4 amber
  'oklch(0.769 0.188 70.08)',   // chart-5 orange
  'oklch(0.627 0.265 303.9)',   // chart-6 violet
  'oklch(0.645 0.246 16.439)',  // chart-7 rose
  'oklch(0.72 0.191 22.216)',   // chart-8 coral
  'oklch(0.588 0.158 241.966)', // chart-9 cyan
]

const STATUS_COLORS: Record<string, string> = {
  Invoiced: CHART_COLORS[0],
  Recap: CHART_COLORS[1],
  Unknown: CHART_COLORS[3],
  Cancelled: CHART_COLORS[4],
  Duplicate: CHART_COLORS[2],
  'Billed In FMS': CHART_COLORS[5],
}

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

function formatMonth(month: string): string {
  const [year, m] = month.split('-')
  const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${names[parseInt(m, 10) - 1]} '${year.slice(2)}`
}

// --- Executive Summary Tab ---

function ExecutiveSummaryTab() {
  const monthlyData = executive.eventsByMonth.map((d) => ({
    ...d,
    label: formatMonth(d.month),
  }))

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Events</p>
            <p className="text-2xl font-bold">{executive.totalEvents.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Revenue</p>
            <p className="text-2xl font-bold">{formatCurrency(executive.totalRevenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Avg Event Size</p>
            <p className="text-2xl font-bold">{formatCurrency(executive.avgEventSize)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Events with Recap</p>
            <p className="text-2xl font-bold">{executive.eventsWithRecap.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Clients & Top Offices */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Clients by Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={executive.topClientsByRevenue}
                layout="vertical"
                margin={{ left: 80, right: 20, top: 5, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tickFormatter={formatCurrency} />
                <YAxis type="category" dataKey="name" width={75} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => formatDollar(Number(value))} />
                <Bar dataKey="totalRevenue" fill={CHART_COLORS[0]} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Offices by Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={executive.topOfficesByVolume}
                layout="vertical"
                margin={{ left: 90, right: 20, top: 5, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={85} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill={CHART_COLORS[1]} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Event Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Event Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={monthlyData} margin={{ left: 10, right: 10, top: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10 }}
                interval={11}
              />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="right" orientation="right" tickFormatter={formatCurrency} tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(value, name) =>
                  name === 'Revenue' ? formatDollar(Number(value)) : Number(value).toLocaleString()
                }
              />
              <Legend />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="count"
                stroke={CHART_COLORS[0]}
                fill={CHART_COLORS[0]}
                fillOpacity={0.2}
                name="Event Count"
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="revenue"
                stroke={CHART_COLORS[1]}
                fill={CHART_COLORS[1]}
                fillOpacity={0.2}
                name="Revenue"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Status & Revenue Segment Pies */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={executive.statusDistribution}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="45%"
                  outerRadius={90}
                  label={({ name, percent }) => {
                    const pct = (percent ?? 0) * 100
                    if (pct < 2) return ''
                    return `${name ?? ''} ${pct.toFixed(0)}%`
                  }}
                  labelLine={false}
                >
                  {executive.statusDistribution.map((entry) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || CHART_COLORS[2]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => Number(value).toLocaleString()} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Segment Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={(() => {
                    const total = executive.revenueSegmentDistribution.reduce((s, d) => s + d.count, 0)
                    const major: typeof executive.revenueSegmentDistribution = []
                    let otherCount = 0
                    let otherRevenue = 0
                    for (const d of executive.revenueSegmentDistribution) {
                      if (d.count / total >= 0.02) major.push(d)
                      else { otherCount += d.count; otherRevenue += d.totalRevenue }
                    }
                    if (otherCount > 0) major.push({ name: 'Other', count: otherCount, totalRevenue: otherRevenue })
                    return major
                  })()}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="45%"
                  outerRadius={90}
                  label={({ name, percent }) => {
                    const pct = (percent ?? 0) * 100
                    if (pct < 3) return ''
                    const short = (name ?? '').replace(' – Affiliate', '').replace('Auto Media Event', 'AME')
                    return `${short} ${pct.toFixed(0)}%`
                  }}
                  labelLine={false}
                >
                  {(() => {
                    const total = executive.revenueSegmentDistribution.reduce((s, d) => s + d.count, 0)
                    const colors: string[] = []
                    let ci = 0
                    for (const d of executive.revenueSegmentDistribution) {
                      if (d.count / total >= 0.02) colors.push(CHART_COLORS[ci++ % CHART_COLORS.length])
                    }
                    if (executive.revenueSegmentDistribution.some(d => d.count / total < 0.02)) {
                      colors.push(CHART_COLORS[2]) // slate for "Other"
                    }
                    return colors.map((c, i) => <Cell key={i} fill={c} />)
                  })()}
                </Pie>
                <Tooltip formatter={(value) => Number(value).toLocaleString()} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// --- Cost Analysis Tab ---

function CostAnalysisTab() {
  const sortedSections = [...costs.sectionAggregates].sort((a, b) => b.totalBid - a.totalBid)

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Events</p>
            <p className="text-2xl font-bold">{costs.totalEvents.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Events with Bid & Recap</p>
            <p className="text-2xl font-bold">{costs.filesBidAndRecap.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Cost Sections</p>
            <p className="text-2xl font-bold">{costs.sectionAggregates.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Grand Total Distribution & Section Usage */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Grand Total Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={costs.grandTotalRanges} margin={{ left: 10, right: 10, top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Section Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={costs.sectionSummary.sections}
                layout="vertical"
                margin={{ left: 160, right: 20, top: 5, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tickFormatter={(v) => `${v}%`} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={155}
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => v.length > 25 ? v.slice(0, 22) + '...' : v}
                />
                <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
                <Bar dataKey="percentOfEvents" fill={CHART_COLORS[1]} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Section Aggregates Table */}
      <Card>
        <CardHeader>
          <CardTitle>Section Cost Aggregates</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Section Name</TableHead>
                <TableHead className="text-right">Total Bid ($)</TableHead>
                <TableHead className="text-right">Total Actual ($)</TableHead>
                <TableHead className="text-right">Avg Bid ($)</TableHead>
                <TableHead className="text-right">Avg Actual ($)</TableHead>
                <TableHead className="text-right">Events</TableHead>
                <TableHead className="text-right">Recaps</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedSections.map((section) => {
                const overBudget = section.avgActual !== null && section.avgActual > section.avgBid
                return (
                  <TableRow key={section.name} className="even:bg-muted/50">
                    <TableCell className="font-medium">
                      {section.name}
                      {overBudget && (
                        <span className="ml-2 inline-block h-2 w-2 rounded-full bg-red-500" title="Avg actual exceeds avg bid" />
                      )}
                    </TableCell>
                    <TableCell className="text-right">{formatDollar(section.totalBid)}</TableCell>
                    <TableCell className="text-right">{formatDollar(section.totalActual)}</TableCell>
                    <TableCell className="text-right">{formatDollar(section.avgBid)}</TableCell>
                    <TableCell className={`text-right ${overBudget ? 'text-red-500 font-medium' : ''}`}>
                      {section.avgActual !== null ? formatDollar(section.avgActual) : '—'}
                    </TableCell>
                    <TableCell className="text-right">{section.eventCount.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{section.recapCount.toLocaleString()}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Revenue by Status Pie */}
      <div className="flex justify-center">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>Revenue by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={costs.byStatus}
                  dataKey="totalRevenue"
                  nameKey="name"
                  cx="50%"
                  cy="45%"
                  outerRadius={90}
                  label={({ name, percent }) => {
                    const pct = (percent ?? 0) * 100
                    if (pct < 2) return ''
                    return `${name ?? ''} ${pct.toFixed(0)}%`
                  }}
                  labelLine={false}
                >
                  {costs.byStatus.map((entry) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || CHART_COLORS[2]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatDollar(Number(value))} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// --- Bid vs Actual Variance Tab ---

function VarianceTab() {
  const { summary, bySection, byClient, byOffice, events } = variance

  const top15Clients = [...byClient]
    .sort((a, b) => Math.abs(b.avgVariancePct) - Math.abs(a.avgVariancePct))
    .slice(0, 15)

  function varianceColor(pct: number): string {
    return pct >= 0 ? 'text-red-500' : 'text-emerald-600'
  }

  function formatVariancePct(pct: number): string {
    const sign = pct >= 0 ? '+' : ''
    return `${sign}${pct.toFixed(1)}%`
  }

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Events with Recap Data</p>
            <p className="text-2xl font-bold">{summary.count.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Average Variance</p>
            <p className={`text-2xl font-bold ${varianceColor(summary.avgVariancePct)}`}>
              {formatVariancePct(summary.avgVariancePct)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Median Variance</p>
            <p className={`text-2xl font-bold ${varianceColor(summary.medianVariancePct)}`}>
              {formatVariancePct(summary.medianVariancePct)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Variance by Section */}
      <Card>
        <CardHeader>
          <CardTitle>Variance by Section</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={bySection}
              layout="vertical"
              margin={{ left: 180, right: 20, top: 5, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tickFormatter={(v) => `${Number(v).toFixed(0)}%`} />
              <YAxis
                type="category"
                dataKey="name"
                width={175}
                tick={{ fontSize: 11 }}
                tickFormatter={(v: string) => v.length > 28 ? v.slice(0, 25) + '...' : v}
              />
              <Tooltip formatter={(value) => `${Number(value).toFixed(2)}%`} />
              <Bar dataKey="avgVariancePct" radius={[0, 4, 4, 0]}>
                {bySection.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={entry.avgVariancePct >= 0 ? '#ef4444' : '#059669'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Client & Office Variance */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Variance by Client (Top 15)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={top15Clients}
                layout="vertical"
                margin={{ left: 130, right: 20, top: 5, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tickFormatter={(v) => `${Number(v).toFixed(0)}%`} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={125}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip formatter={(value) => `${Number(value).toFixed(2)}%`} />
                <Bar dataKey="avgVariancePct" radius={[0, 4, 4, 0]}>
                  {top15Clients.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={entry.avgVariancePct >= 0 ? '#ef4444' : '#059669'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Variance by Office</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={byOffice}
                layout="vertical"
                margin={{ left: 120, right: 20, top: 5, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tickFormatter={(v) => `${Number(v).toFixed(0)}%`} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={115}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip formatter={(value) => `${Number(value).toFixed(2)}%`} />
                <Bar dataKey="avgVariancePct" radius={[0, 4, 4, 0]}>
                  {byOffice.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={entry.avgVariancePct >= 0 ? '#ef4444' : '#059669'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top 50 Variance Events */}
      <Card>
        <CardHeader>
          <CardTitle>Top 50 Variance Events</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event Name</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Office</TableHead>
                <TableHead className="text-right">Bid ($)</TableHead>
                <TableHead className="text-right">Actual ($)</TableHead>
                <TableHead className="text-right">Variance ($)</TableHead>
                <TableHead className="text-right">Variance (%)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((evt, i) => (
                <TableRow key={i} className="even:bg-muted/50">
                  <TableCell className="font-medium">{evt.event_name}</TableCell>
                  <TableCell>{evt.client}</TableCell>
                  <TableCell>{evt.lead_office}</TableCell>
                  <TableCell className="text-right">{formatDollar(evt.grandTotalBid)}</TableCell>
                  <TableCell className="text-right">{formatDollar(evt.grandTotalActual)}</TableCell>
                  <TableCell className={`text-right font-medium ${varianceColor(evt.variance)}`}>
                    {evt.variance >= 0 ? '+' : ''}{formatDollar(evt.variance)}
                  </TableCell>
                  <TableCell className={`text-right font-medium ${varianceColor(evt.variancePct)}`}>
                    {formatVariancePct(evt.variancePct)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

// --- Event Manager Performance Tab ---

function ManagerPerformanceTab() {
  const [sort, setSort] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'eventCount',
    direction: 'desc',
  })

  const totalManagers = managers.length
  const totalEvents = managers.reduce((sum, m) => sum + m.eventCount, 0)
  const accuracyValues = managers.filter((m) => m.avgBidAccuracy !== null).map((m) => m.avgBidAccuracy!)
  const avgBidAccuracy = accuracyValues.length > 0
    ? accuracyValues.reduce((sum, v) => sum + v, 0) / accuracyValues.length
    : 0

  function handleSort(key: string) {
    setSort((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: 'desc' },
    )
  }

  const sortedManagers = [...managers].sort((a, b) => {
    const aVal = a[sort.key as keyof typeof a] ?? 0
    const bVal = b[sort.key as keyof typeof b] ?? 0
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sort.direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
    }
    return sort.direction === 'asc'
      ? (aVal as number) - (bVal as number)
      : (bVal as number) - (aVal as number)
  })

  function accuracyColor(accuracy: number | null): string {
    if (accuracy === null) return ''
    if (accuracy > 1.08) return 'text-red-500'
    if (accuracy > 1.05) return 'text-amber-500'
    return 'text-emerald-600'
  }

  function sortIndicator(key: string): string {
    if (sort.key !== key) return ''
    return sort.direction === 'asc' ? ' \u25B2' : ' \u25BC'
  }

  const revenueChartData = [...managers]
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .map((m) => ({ name: m.name.split(' ')[1] || m.name, totalRevenue: m.totalRevenue, fullName: m.name }))

  const eventsChartData = [...managers]
    .sort((a, b) => b.eventCount - a.eventCount)
    .map((m) => ({ name: m.name.split(' ')[1] || m.name, eventCount: m.eventCount, fullName: m.name }))

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Managers</p>
            <p className="text-2xl font-bold">{totalManagers}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Events Managed</p>
            <p className="text-2xl font-bold">{totalEvents.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Average Bid Accuracy</p>
            <p className="text-2xl font-bold">{(avgBidAccuracy * 100).toFixed(1)}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Manager Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle>Manager Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead className="cursor-pointer select-none" onClick={() => handleSort('name')}>
                  Name{sortIndicator('name')}
                </TableHead>
                <TableHead className="text-right cursor-pointer select-none" onClick={() => handleSort('eventCount')}>
                  Events{sortIndicator('eventCount')}
                </TableHead>
                <TableHead className="text-right cursor-pointer select-none" onClick={() => handleSort('totalRevenue')}>
                  Total Revenue ($){sortIndicator('totalRevenue')}
                </TableHead>
                <TableHead className="text-right cursor-pointer select-none" onClick={() => handleSort('avgEventSize')}>
                  Avg Event Size ($){sortIndicator('avgEventSize')}
                </TableHead>
                <TableHead className="text-right cursor-pointer select-none" onClick={() => handleSort('clientsServed')}>
                  Clients Served{sortIndicator('clientsServed')}
                </TableHead>
                <TableHead className="text-right cursor-pointer select-none" onClick={() => handleSort('recapEventCount')}>
                  Recap Events{sortIndicator('recapEventCount')}
                </TableHead>
                <TableHead className="text-right cursor-pointer select-none" onClick={() => handleSort('avgBidAccuracy')}>
                  Bid Accuracy{sortIndicator('avgBidAccuracy')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedManagers.map((mgr, i) => (
                <TableRow key={mgr.name} className="even:bg-muted/50">
                  <TableCell>{i + 1}</TableCell>
                  <TableCell className="font-medium">{mgr.name}</TableCell>
                  <TableCell className="text-right">{mgr.eventCount}</TableCell>
                  <TableCell className="text-right">{formatDollar(mgr.totalRevenue)}</TableCell>
                  <TableCell className="text-right">{formatDollar(mgr.avgEventSize)}</TableCell>
                  <TableCell className="text-right">{mgr.clientsServed}</TableCell>
                  <TableCell className="text-right">{mgr.recapEventCount}</TableCell>
                  <TableCell className="text-right">
                    {mgr.avgBidAccuracy !== null ? (
                      <Badge variant="outline" className={accuracyColor(mgr.avgBidAccuracy)}>
                        {(mgr.avgBidAccuracy * 100).toFixed(1)}%
                      </Badge>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Revenue & Events Bar Charts */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Manager</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart
                data={revenueChartData}
                margin={{ left: 10, right: 10, top: 5, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  angle={-45}
                  textAnchor="end"
                />
                <YAxis tickFormatter={formatCurrency} />
                <Tooltip
                  formatter={(value) => formatDollar(Number(value))}
                  labelFormatter={(_label, payload) => {
                    const item = payload?.[0]?.payload as { fullName?: string } | undefined
                    return item?.fullName ?? ''
                  }}
                />
                <Bar dataKey="totalRevenue" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Events by Manager</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart
                data={eventsChartData}
                margin={{ left: 10, right: 10, top: 5, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  angle={-45}
                  textAnchor="end"
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(_label, payload) => {
                    const item = payload?.[0]?.payload as { fullName?: string } | undefined
                    return item?.fullName ?? ''
                  }}
                />
                <Bar dataKey="eventCount" fill={CHART_COLORS[1]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// --- Main Dashboard Page ---

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-border">
        <h1 className="text-2xl font-bold tracking-tight">Historical Intelligence Dashboard</h1>
        <p className="text-muted-foreground">
          Analyze historical event estimates and performance data across 1,659 events.
        </p>
      </div>

      <Tabs defaultValue="executive">
        <TabsList>
          <TabsTrigger value="executive">Executive Summary</TabsTrigger>
          <TabsTrigger value="costs">Cost Analysis</TabsTrigger>
          <TabsTrigger value="variance">Bid vs Actual</TabsTrigger>
          <TabsTrigger value="managers">Event Managers</TabsTrigger>
        </TabsList>

        <TabsContent value="executive">
          <ExecutiveSummaryTab />
        </TabsContent>

        <TabsContent value="costs">
          <CostAnalysisTab />
        </TabsContent>

        <TabsContent value="variance">
          <VarianceTab />
        </TabsContent>

        <TabsContent value="managers">
          <ManagerPerformanceTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
