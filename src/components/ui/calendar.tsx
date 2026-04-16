import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-2", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-4",
        month: "flex flex-col gap-3",
        month_caption: "flex justify-center pt-1 relative items-center w-full",
        caption_label: "text-[13px] font-medium",
        nav: "flex items-center gap-1 absolute inset-x-0 top-0 justify-between px-1",
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "size-7 p-0 opacity-70 hover:opacity-100"
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "size-7 p-0 opacity-70 hover:opacity-100"
        ),
        month_grid: "w-full border-collapse space-y-1",
        weekdays: "flex",
        weekday:
          "text-muted-foreground rounded-md w-8 font-normal text-[11px] uppercase tracking-wider",
        week: "flex w-full mt-1",
        day: cn(
          "relative p-0 text-center text-[13px] focus-within:relative focus-within:z-20",
          "[&:has([aria-selected])]:bg-slate-100",
          "[&:has([aria-selected].day-range-end)]:rounded-r-md",
          "[&:has([aria-selected].day-range-start)]:rounded-l-md",
          "first:[&:has([aria-selected])]:rounded-l-md",
          "last:[&:has([aria-selected])]:rounded-r-md"
        ),
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "size-8 p-0 font-normal aria-selected:opacity-100 hover:bg-slate-100 rounded-md"
        ),
        range_start:
          "day-range-start aria-selected:bg-slate-900 aria-selected:text-white rounded-l-md",
        range_end:
          "day-range-end aria-selected:bg-slate-900 aria-selected:text-white rounded-r-md",
        selected:
          "bg-slate-900 text-white hover:bg-slate-900 hover:text-white focus:bg-slate-900 focus:text-white rounded-md",
        today: "bg-slate-100 text-foreground font-semibold",
        outside:
          "day-outside text-muted-foreground/50 aria-selected:text-muted-foreground/70",
        disabled: "text-muted-foreground/40 opacity-50",
        range_middle:
          "aria-selected:bg-slate-100 aria-selected:text-foreground rounded-none",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, ...rest }) =>
          orientation === "left" ? (
            <ChevronLeft className="size-4" {...rest} />
          ) : (
            <ChevronRight className="size-4" {...rest} />
          ),
      }}
      {...props}
    />
  )
}

export { Calendar }
