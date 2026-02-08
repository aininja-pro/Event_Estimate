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
import { getExecutiveSummary, getCostAnalysis } from '@/lib/data'
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

const CHART_COLORS = [
  'oklch(0.546 0.245 262.881)', // chart-1 blue
  'oklch(0.696 0.17 162.48)',   // chart-2 emerald
  'oklch(0.398 0.07 227.392)',  // chart-3 slate
  'oklch(0.828 0.189 84.429)',  // chart-4 amber
  'oklch(0.769 0.188 70.08)',   // chart-5 orange
]

const STATUS_COLORS: Record<string, string> = {
  Won: CHART_COLORS[0],
  Lost: CHART_COLORS[2],
  Cancelled: CHART_COLORS[4],
  Pending: CHART_COLORS[3],
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
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={executive.statusDistribution}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ name, percent }) => `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`}
                >
                  {executive.statusDistribution.map((entry) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || CHART_COLORS[0]} />
                  ))}
                </Pie>
                <Tooltip />
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
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={executive.revenueSegmentDistribution}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ name, percent }) => `${(name ?? '').split('(')[0].trim()} ${((percent ?? 0) * 100).toFixed(0)}%`}
                >
                  {executive.revenueSegmentDistribution.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
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
                  <TableRow key={section.name}>
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
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={costs.byStatus}
                  dataKey="totalRevenue"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ name, percent }) => `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`}
                >
                  {costs.byStatus.map((entry) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || CHART_COLORS[0]} />
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

// --- Main Dashboard Page ---

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
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
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground">Bid vs Actual Variance analysis coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="managers">
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground">Event Manager Performance analysis coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
