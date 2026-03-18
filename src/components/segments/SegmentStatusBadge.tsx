import type { SegmentStatus } from '@/types/workflow'

const BADGE_STYLES: Record<SegmentStatus, string> = {
  pipeline: 'bg-zinc-100 text-zinc-600 border-zinc-200',
  estimate: 'bg-zinc-200 text-zinc-700 border-zinc-300',
  in_review: 'bg-amber-100 text-amber-800 border-amber-300',
  active: 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-300',
  recap: 'bg-violet-100 text-violet-800 border-violet-300',
  invoiced: 'bg-teal-100 text-teal-800 border-teal-300',
  lost: 'bg-red-100 text-red-800 border-red-300',
  cancelled: 'bg-slate-100 text-slate-600 border-slate-300',
}

const BADGE_LABELS: Record<SegmentStatus, string> = {
  pipeline: 'Pipeline',
  estimate: 'Estimate',
  in_review: 'In Review',
  active: 'Active',
  recap: 'Recap',
  invoiced: 'Invoiced',
  lost: 'Lost',
  cancelled: 'Cancelled',
}

export function SegmentStatusBadge({ status }: { status: SegmentStatus }) {
  const style = BADGE_STYLES[status] || 'bg-zinc-200 text-zinc-700 border-zinc-300'
  const label = BADGE_LABELS[status] || status

  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 ml-1 text-[10px] font-semibold uppercase tracking-wider ${style}`}>
      {label}
    </span>
  )
}
