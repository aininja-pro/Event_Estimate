import { Check } from 'lucide-react'
import type { EstimateStatus, SegmentStatus } from '@/types/workflow'

// ── Status definitions ──────────────────────────────────────────────────────

const STATUSES: { key: EstimateStatus; label: string; accent: string }[] = [
  { key: 'pipeline', label: 'Pipeline', accent: 'bg-zinc-400' },
  { key: 'draft', label: 'Draft', accent: 'bg-zinc-500' },
  { key: 'review', label: 'Review', accent: 'bg-amber-500' },
  { key: 'approved', label: 'Approved', accent: 'bg-emerald-600' },
  { key: 'active', label: 'Active', accent: 'bg-sky-600' },
  { key: 'recap', label: 'Recap', accent: 'bg-orange-500' },
  { key: 'complete', label: 'Complete', accent: 'bg-emerald-700' },
]

const STATUS_INDEX = Object.fromEntries(STATUSES.map((s, i) => [s.key, i]))

// ── Component ───────────────────────────────────────────────────────────────

interface EstimateStatusBarProps {
  status: EstimateStatus | SegmentStatus
}

export function EstimateStatusBar({ status: rawStatus }: EstimateStatusBarProps) {
  // Map segment-only 'invoiced' status to 'complete' for the breadcrumb track
  const status: EstimateStatus = rawStatus === 'invoiced' ? 'complete' : rawStatus as EstimateStatus
  const currentIndex = STATUS_INDEX[status] ?? 0
  const currentAccent = STATUSES[currentIndex]?.accent ?? 'bg-zinc-400'

  return (
    <div className="flex items-center gap-0 shrink-0">
      {STATUSES.map((s, i) => {
        const isCurrent = s.key === status
        const isPast = i < currentIndex
        const isFuture = i > currentIndex
        const isLast = i === STATUSES.length - 1

        return (
          <div key={s.key} className="flex items-center">
            {/* Node + inline label */}
            <div className="flex items-center gap-1">
              <div className={`
                relative flex items-center justify-center rounded-full transition-all shrink-0
                ${isCurrent ? `h-2.5 w-2.5 ${currentAccent} ring-[3px] ring-offset-1 ring-zinc-100` : ''}
                ${isPast ? 'h-2 w-2 bg-zinc-300' : ''}
                ${isFuture ? 'h-[7px] w-[7px] border-[1.5px] border-zinc-200 bg-white' : ''}
              `}>
                {isPast && <Check className="h-1.5 w-1.5 text-white" strokeWidth={3} />}
              </div>
              <span className={`
                text-[10px] whitespace-nowrap leading-none
                ${isCurrent ? 'font-semibold text-foreground' : ''}
                ${isPast ? 'font-medium text-zinc-400' : ''}
                ${isFuture ? 'font-normal text-zinc-300' : ''}
              `}>
                {s.label}
              </span>
            </div>

            {/* Connecting line */}
            {!isLast && (
              <div className={`
                w-3 h-[1px] mx-0.5
                ${i < currentIndex ? 'bg-zinc-300' : 'bg-zinc-200'}
              `} />
            )}
          </div>
        )
      })}
    </div>
  )
}
