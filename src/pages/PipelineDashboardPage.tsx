import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDashboardData, type DashboardData } from '@/lib/dashboard-service'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { ArrowRight, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

// ---- Helpers ----

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

function getQuarterLabel(): string {
  const now = new Date()
  const q = Math.floor(now.getMonth() / 3) + 1
  return `Q${q} ${now.getFullYear()}`
}

// ---- Status colors (matching SegmentStatusBadge palette) ----

const STATUS_COLORS: Record<string, string> = {
  pipeline: '#a1a1aa',   // zinc-400
  estimate: '#71717a',   // zinc-500
  in_review: '#f59e0b',  // amber-500
  active: '#d946ef',     // fuchsia-500
  recap: '#8b5cf6',      // violet-500
  invoiced: '#14b8a6',   // teal-500
  complete: '#22c55e',   // green-500
  lost: '#ef4444',       // red-500
  cancelled: '#94a3b8',  // slate-400
}

const STATUS_LABELS: Record<string, string> = {
  pipeline: 'Pipeline',
  estimate: 'Estimate',
  in_review: 'In Review',
  active: 'Active',
  recap: 'Recap',
  invoiced: 'Invoiced',
  complete: 'Complete',
  lost: 'Lost',
  cancelled: 'Cancelled',
}

// ---- Summary Card ----

const CARD_ACCENTS = {
  pipeline: { border: 'border-l-blue-400' },
  active: { border: 'border-l-fuchsia-400' },
  in_recap: { border: 'border-l-violet-400' },
  invoiced: { border: 'border-l-teal-400' },
} as const

interface SummaryCardProps {
  label: string
  count: number
  total_revenue: number
  accent: keyof typeof CARD_ACCENTS
}

function SummaryCard({ label, count, total_revenue, accent }: SummaryCardProps) {
  const colors = CARD_ACCENTS[accent]
  return (
    <Card className={`border-l-4 ${colors.border} py-4`}>
      <CardContent className="space-y-1">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          {label}
        </p>
        <p className="text-2xl font-bold tracking-tight">
          {formatCurrency(total_revenue)}
        </p>
        <p className="text-[13px] text-muted-foreground">
          {count} {count === 1 ? 'estimate' : 'estimates'}
        </p>
      </CardContent>
    </Card>
  )
}

// ---- Status Breakdown Chart ----

function StatusBreakdownChart({ data }: { data: DashboardData['status_breakdown'] }) {
  const chartData = data.map(d => ({
    ...d,
    label: STATUS_LABELS[d.status] || d.status,
  }))

  return (
    <Card className="py-4">
      <CardContent>
        <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Status Breakdown
        </p>
        <ResponsiveContainer width="100%" height={Math.max(chartData.length * 44, 120)}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 40, top: 0, bottom: 0 }}>
            <CartesianGrid horizontal={false} stroke="#f0f0f0" />
            <XAxis
              type="number"
              tickFormatter={(v: number) => formatCurrency(v)}
              tick={{ fontSize: 10, fill: '#a1a1aa' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="label"
              width={72}
              tick={{ fontSize: 12, fill: '#71717a' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              formatter={(value: number) => [formatCurrency(value), 'Revenue']}
              labelFormatter={(label: string) => label}
              contentStyle={{ fontSize: 12, borderRadius: 6, border: '1px solid #e4e4e7' }}
            />
            <Bar dataKey="total_revenue" radius={[0, 4, 4, 0]} barSize={24}>
              {chartData.map((entry) => (
                <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || '#a1a1aa'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
          {chartData.map(d => (
            <span key={d.status} className="text-[11px] text-muted-foreground">
              {d.label}: <span className="font-medium text-foreground">{d.count}</span>
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ---- Client Breakdown Table ----

function ClientBreakdownTable({ data }: { data: DashboardData['client_breakdown'] }) {
  return (
    <Card className="py-4">
      <CardContent>
        <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Top Clients by Revenue
        </p>
        {data.length === 0 ? (
          <p className="text-[13px] text-muted-foreground">No active estimates.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-[10px] uppercase tracking-widest">Client</TableHead>
                <TableHead className="text-right text-[10px] uppercase tracking-widest">Estimates</TableHead>
                <TableHead className="text-right text-[10px] uppercase tracking-widest">Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map(d => (
                <TableRow key={d.client_name}>
                  <TableCell className="text-[13px] font-medium">{d.client_name}</TableCell>
                  <TableCell className="text-right text-[13px] text-muted-foreground">{d.count}</TableCell>
                  <TableCell className="text-right text-[13px] font-medium">{formatCurrency(d.total_revenue)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

// ---- Monthly Volume Chart ----

function MonthlyVolumeChart({ data }: { data: DashboardData['monthly_volume'] }) {
  return (
    <Card className="py-4">
      <CardContent>
        <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Monthly Estimate Volume
        </p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ left: 0, right: 8, top: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#f0f0f0" />
            <XAxis
              dataKey="month"
              tickFormatter={(v: string) => v.split(' ')[0]}
              tick={{ fontSize: 10, fill: '#a1a1aa' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 10, fill: '#a1a1aa' }}
              axisLine={false}
              tickLine={false}
              width={28}
            />
            <Tooltip
              formatter={(value: number, name: string) => [
                name === 'count' ? `${value} estimates` : formatCurrency(value),
                name === 'count' ? 'Estimates' : 'Revenue',
              ]}
              labelFormatter={(label: string) => label}
              contentStyle={{ fontSize: 12, borderRadius: 6, border: '1px solid #e4e4e7' }}
            />
            <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

// ---- Recent Activity Feed ----

function formatRelativeTime(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffMs = now - then
  const diffMin = Math.floor(diffMs / 60_000)
  const diffHr = Math.floor(diffMs / 3_600_000)
  const diffDay = Math.floor(diffMs / 86_400_000)

  if (diffMin < 1) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHr < 24) return `${diffHr}h ago`
  if (diffDay === 1) return 'Yesterday'
  if (diffDay < 7) return `${diffDay}d ago`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function RecentActivityFeed({ data, onNavigate }: { data: DashboardData['recent_activity']; onNavigate: (estimateId: string) => void }) {
  return (
    <Card className="py-4">
      <CardContent>
        <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Recent Activity
        </p>
        {data.length === 0 ? (
          <p className="text-[13px] text-muted-foreground">No recent activity.</p>
        ) : (
          <div className="space-y-1">
            {data.map(a => (
              <button
                key={a.id}
                onClick={() => onNavigate(a.estimate_id)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left transition-colors hover:bg-muted/50"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium">
                    {a.estimate_name}
                    <span className="ml-1.5 text-muted-foreground">({a.client_name})</span>
                  </p>
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    {a.from_status && (
                      <>
                        <span className="capitalize">{STATUS_LABELS[a.from_status] || a.from_status}</span>
                        <ArrowRight className="h-3 w-3" />
                      </>
                    )}
                    <span
                      className="font-medium capitalize"
                      style={{ color: STATUS_COLORS[a.to_status || ''] || '#71717a' }}
                    >
                      {STATUS_LABELS[a.to_status || ''] || a.to_status}
                    </span>
                  </div>
                </div>
                <span className="shrink-0 text-[11px] text-muted-foreground">
                  {formatRelativeTime(a.changed_at)}
                </span>
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ---- Loading Skeleton ----

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-muted/60 ${className || ''}`} />
}

function DashboardSkeleton() {
  return (
    <>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="py-4">
            <CardContent className="space-y-3">
              <SkeletonBlock className="h-3 w-20" />
              <SkeletonBlock className="h-7 w-28" />
              <SkeletonBlock className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-[3fr_2fr]">
        <Card className="py-4"><CardContent><SkeletonBlock className="h-[180px] w-full" /></CardContent></Card>
        <Card className="py-4"><CardContent><SkeletonBlock className="h-[180px] w-full" /></CardContent></Card>
      </div>
      <div className="grid gap-4 lg:grid-cols-[3fr_2fr]">
        <Card className="py-4"><CardContent><SkeletonBlock className="h-[220px] w-full" /></CardContent></Card>
        <Card className="py-4"><CardContent><SkeletonBlock className="h-[220px] w-full" /></CardContent></Card>
      </div>
    </>
  )
}

// ---- Empty State ----

function EmptyState() {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <p className="text-[13px] font-medium">No estimates yet</p>
      <p className="mt-1 text-[13px] text-muted-foreground">
        Create your first estimate to see pipeline data here.
      </p>
      <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate('/estimates')}>
        Go to Estimates
      </Button>
    </div>
  )
}

// ---- Error State ----

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Card className="py-6">
      <CardContent className="flex flex-col items-center text-center">
        <p className="text-[13px] font-medium text-muted-foreground">
          Dashboard data temporarily unavailable.
        </p>
        <p className="mt-1 text-[11px] text-muted-foreground">{message}</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
          <RefreshCw className="mr-1.5 h-3 w-3" />
          Try again
        </Button>
      </CardContent>
    </Card>
  )
}

// ---- Page ----

export function PipelineDashboardPage() {
  const navigate = useNavigate()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getDashboardData()
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  function retry() {
    setLoading(true)
    setError(null)
    getDashboardData()
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }

  const isEmpty = data && data.status_breakdown.length === 0

  return (
    <div className="space-y-6 p-6">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Production
        </p>
        <h1 className="text-xl font-semibold">Pipeline Dashboard</h1>
      </div>

      {loading && <DashboardSkeleton />}
      {error && <ErrorState message={error} onRetry={retry} />}
      {!loading && !error && isEmpty && <EmptyState />}

      {!loading && !error && data && !isEmpty && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <SummaryCard
              label="Pipeline"
              count={data.summary.pipeline.count}
              total_revenue={data.summary.pipeline.total_revenue}
              accent="pipeline"
            />
            <SummaryCard
              label="Active"
              count={data.summary.active.count}
              total_revenue={data.summary.active.total_revenue}
              accent="active"
            />
            <SummaryCard
              label="In Recap"
              count={data.summary.in_recap.count}
              total_revenue={data.summary.in_recap.total_revenue}
              accent="in_recap"
            />
            <SummaryCard
              label={`Invoiced ${getQuarterLabel()}`}
              count={data.summary.invoiced_this_quarter.count}
              total_revenue={data.summary.invoiced_this_quarter.total_revenue}
              accent="invoiced"
            />
          </div>

          {/* Status Breakdown + Client Breakdown */}
          <div className="grid gap-4 lg:grid-cols-[3fr_2fr]">
            <StatusBreakdownChart data={data.status_breakdown} />
            <ClientBreakdownTable data={data.client_breakdown} />
          </div>

          {/* Monthly Volume + Recent Activity */}
          <div className="grid gap-4 lg:grid-cols-[3fr_2fr]">
            <MonthlyVolumeChart data={data.monthly_volume} />
            <RecentActivityFeed
              data={data.recent_activity}
              onNavigate={(id) => navigate(`/estimates/${id}`)}
            />
          </div>
        </>
      )}
    </div>
  )
}
