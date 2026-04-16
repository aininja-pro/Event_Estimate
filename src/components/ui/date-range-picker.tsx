import * as React from "react"
import { format } from "date-fns"
import type { DateRange } from "react-day-picker"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

/**
 * ISO date helpers — match the local-midnight convention used elsewhere
 * (see `generateDateRange` in `src/lib/schedule-service.ts`). Native HTML date
 * inputs return `YYYY-MM-DD` strings, and we keep the same shape on the wire
 * so existing call sites and DB columns are unchanged.
 */
function isoToDate(iso: string | null | undefined): Date | undefined {
  if (!iso) return undefined
  return new Date(iso + "T00:00:00")
}

function dateToIso(d: Date | undefined): string | null {
  if (!d) return null
  return format(d, "yyyy-MM-dd")
}

export interface DateRangeValue {
  from: string | null
  to: string | null
}

export interface DateRangePickerProps {
  value: DateRangeValue
  onChange: (value: DateRangeValue) => void
  placeholder?: string
  disabled?: boolean
  numberOfMonths?: number
  className?: string
  triggerClassName?: string
}

export function DateRangePicker({
  value,
  onChange,
  placeholder = "Select dates",
  disabled,
  numberOfMonths = 2,
  className,
  triggerClassName,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false)

  // Local draft — lets the user click around inside the popover before
  // committing. We only bubble up via `onChange` when the user presses Done.
  const [draft, setDraft] = React.useState<DateRange | undefined>(undefined)

  const committed: DateRange | undefined = React.useMemo(() => {
    const from = isoToDate(value.from)
    const to = isoToDate(value.to)
    if (!from && !to) return undefined
    return { from, to }
  }, [value.from, value.to])

  // Reset the draft to the committed value every time the popover opens so
  // the user can always recover from an in-progress selection.
  React.useEffect(() => {
    if (open) setDraft(committed)
  }, [open, committed])

  function handleSelect(next: DateRange | undefined) {
    setDraft(next)
  }

  function handleDone() {
    const from = dateToIso(draft?.from)
    const to = dateToIso(draft?.to)
    onChange({ from, to })
    setOpen(false)
  }

  function handleClear() {
    setDraft(undefined)
  }

  const label = React.useMemo(() => {
    if (committed?.from && committed?.to) {
      return `${format(committed.from, "MMM d")} – ${format(committed.to, "MMM d, yyyy")}`
    }
    if (committed?.from) {
      return `${format(committed.from, "MMM d, yyyy")} – …`
    }
    return placeholder
  }, [committed, placeholder])

  const draftLabel = React.useMemo(() => {
    if (draft?.from && draft?.to) {
      const sameDay = draft.from.getTime() === draft.to.getTime()
      if (sameDay) return format(draft.from, "MMM d, yyyy")
      return `${format(draft.from, "MMM d")} – ${format(draft.to, "MMM d, yyyy")}`
    }
    if (draft?.from) {
      return `${format(draft.from, "MMM d, yyyy")} – select end`
    }
    return "Select start and end dates"
  }, [draft])

  const hasSelection = Boolean(draft?.from)

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            className={cn(
              "h-8 justify-start text-left text-[13px] font-normal",
              !committed?.from && "text-muted-foreground",
              triggerClassName
            )}
          >
            <CalendarIcon className="h-3.5 w-3.5 mr-2 opacity-60" />
            <span className="truncate">{label}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            defaultMonth={draft?.from ?? committed?.from}
            selected={draft}
            onSelect={handleSelect}
            numberOfMonths={numberOfMonths}
          />
          <div className="flex items-center justify-between gap-2 border-t border-slate-200 px-3 py-2">
            <span className="text-[12px] text-muted-foreground truncate">
              {draftLabel}
            </span>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClear}
                disabled={!hasSelection}
                className="h-7 text-[12px]"
              >
                Clear
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleDone}
                className="h-7 text-[12px]"
              >
                Done
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
