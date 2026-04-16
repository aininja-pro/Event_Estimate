import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

/**
 * Local-midnight ISO conversion — matches `generateDateRange` in
 * `src/lib/schedule-service.ts` so the picker round-trips with the rest of
 * the app's `YYYY-MM-DD` storage convention.
 */
function isoToDate(iso: string | null | undefined): Date | undefined {
  if (!iso) return undefined
  return new Date(iso + "T00:00:00")
}

function dateToIso(d: Date | undefined): string | null {
  if (!d) return null
  return format(d, "yyyy-MM-dd")
}

export interface DatePickerProps {
  value: string | null
  onChange: (value: string | null) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  triggerClassName?: string
  autoFocus?: boolean
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  disabled,
  className,
  triggerClassName,
  autoFocus,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const selected = isoToDate(value)

  function handleSelect(next: Date | undefined) {
    onChange(dateToIso(next))
    if (next) setOpen(false)
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            autoFocus={autoFocus}
            className={cn(
              "h-8 justify-start text-left text-[13px] font-normal",
              !selected && "text-muted-foreground",
              triggerClassName
            )}
          >
            <CalendarIcon className="h-3.5 w-3.5 mr-2 opacity-60" />
            <span className="truncate">
              {selected ? format(selected, "MMM d, yyyy") : placeholder}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            defaultMonth={selected}
            selected={selected}
            onSelect={handleSelect}
            numberOfMonths={1}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
