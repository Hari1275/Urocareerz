import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export interface CalendarProps {
  selected?: Date
  onSelect?: (date: Date | undefined) => void
  className?: string
}

export function Calendar({ selected, onSelect, className, ...props }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(() => selected ?? new Date())
  const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
  const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)
  const daysInMonth = endOfMonth.getDate()
  const startDay = startOfMonth.getDay()

  const days: (Date | null)[] = []
  for (let i = 0; i < startDay; i++) days.push(null)
  for (let i = 1; i <= daysInMonth; i++) days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i))

  function handlePrevMonth() {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }
  function handleNextMonth() {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  return (
    <div className={cn("p-4 bg-white rounded shadow w-72", className)} {...props}>
      <div className="flex items-center justify-between mb-2">
        <button onClick={handlePrevMonth} className="p-1 rounded hover:bg-slate-100">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="font-semibold">
          {currentMonth.toLocaleString("default", { month: "long" })} {currentMonth.getFullYear()}
        </span>
        <button onClick={handleNextMonth} className="p-1 rounded hover:bg-slate-100">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-xs text-center mb-1">
        {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => <div key={d} className="font-medium text-slate-500">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, i) => (
          <button
            key={i}
            className={cn(
              "w-8 h-8 rounded flex items-center justify-center",
              date && selected && date.toDateString() === selected.toDateString() && "bg-blue-600 text-white",
              date && !selected && date.toDateString() === new Date().toDateString() && "border border-blue-600",
              !date && "bg-transparent cursor-default"
            )}
            disabled={!date}
            onClick={() => date && onSelect?.(date)}
          >
            {date ? date.getDate() : ""}
          </button>
        ))}
      </div>
    </div>
  )
} 