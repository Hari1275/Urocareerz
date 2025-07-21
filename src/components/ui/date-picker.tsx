import * as React from "react"
import { Calendar } from "./calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarIcon } from "lucide-react"
import { format } from "date-fns"

export interface DatePickerProps {
  date: Date | undefined
  onChange: (date: Date | undefined) => void
  placeholder?: string
}

export function DatePicker({ date, onChange, placeholder }: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={"w-full justify-start text-left font-normal"}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "yyyy-MM-dd") : <span className="text-slate-400">{placeholder || "Pick a date"}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar selected={date} onSelect={onChange} />
      </PopoverContent>
    </Popover>
  )
} 