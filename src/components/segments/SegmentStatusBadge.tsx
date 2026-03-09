import type { SegmentStatus } from '@/types/workflow'

const BADGE_COLORS: Record<SegmentStatus, string> = {
  draft: 'bg-zinc-400',
  review: 'bg-amber-500',
  approved: 'bg-blue-500',
  active: 'bg-emerald-500',
  recap: 'bg-violet-500',
  invoiced: 'bg-teal-500',
  complete: 'bg-slate-500',
}

const BADGE_LABELS: Record<SegmentStatus, string> = {
  draft: 'Draft',
  review: 'Review',
  approved: 'Approved',
  active: 'Active',
  recap: 'Recap',
  invoiced: 'Invoiced',
  complete: 'Complete',
}

export function SegmentStatusBadge({ status }: { status: SegmentStatus }) {
  const color = BADGE_COLORS[status] || 'bg-zinc-400'
  const label = BADGE_LABELS[status] || status

  return (
    <span className="inline-flex items-center gap-1 ml-1">
      <span className={`inline-block h-1.5 w-1.5 rounded-full ${color}`} />
      <span className="text-[9px] uppercase tracking-wider text-muted-foreground/70 font-medium">
        {label}
      </span>
    </span>
  )
}
