import * as React from "react";
import { Calendar } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Button } from "./button";
import { cn } from "@/lib/utils";
import { format, isValid, parseISO } from "date-fns";

export interface DateRange {
  from: Date | null;
  to: Date | null;
}

interface DatePickerWithRangeProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  className?: string;
  minDate?: Date;
  maxDate?: Date;
}

export const DatePickerWithRange: React.FC<DatePickerWithRangeProps> = ({
  value,
  onChange,
  className = "",
  minDate,
  maxDate,
}) => {
  const [open, setOpen] = React.useState(false);
  const [from, setFrom] = React.useState<Date | null>(value.from || null);
  const [to, setTo] = React.useState<Date | null>(value.to || null);

  React.useEffect(() => {
    setFrom(value.from || null);
    setTo(value.to || null);
  }, [value]);

  const handleDateChange = (date: Date) => {
    if (!from || (from && to)) {
      setFrom(date);
      setTo(null);
      onChange({ from: date, to: null });
    } else if (from && !to) {
      if (date < from) {
        setFrom(date);
        setTo(null);
        onChange({ from: date, to: null });
      } else {
        setTo(date);
        onChange({ from, to: date });
        setOpen(false);
      }
    }
  };

  const displayValue =
    from && to
      ? `${format(from, "MMM d, yyyy")} - ${format(to, "MMM d, yyyy")}`
      : from
      ? format(from, "MMM d, yyyy")
      : "Select date range";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !from && "text-muted-foreground",
            className
          )}
        >
          <Calendar className="mr-2 h-4 w-4" />
          {displayValue}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-4 w-auto min-w-[320px]" align="start">
        <div className="flex flex-col gap-2">
          <input
            type="date"
            className="border rounded px-2 py-1"
            value={from ? format(from, "yyyy-MM-dd") : ""}
            min={minDate ? format(minDate, "yyyy-MM-dd") : undefined}
            max={maxDate ? format(maxDate, "yyyy-MM-dd") : undefined}
            onChange={e => {
              const date = parseISO(e.target.value);
              setFrom(isValid(date) ? date : null);
              onChange({ from: isValid(date) ? date : null, to });
            }}
          />
          <input
            type="date"
            className="border rounded px-2 py-1"
            value={to ? format(to, "yyyy-MM-dd") : ""}
            min={from ? format(from, "yyyy-MM-dd") : undefined}
            max={maxDate ? format(maxDate, "yyyy-MM-dd") : undefined}
            onChange={e => {
              const date = parseISO(e.target.value);
              setTo(isValid(date) ? date : null);
              onChange({ from, to: isValid(date) ? date : null });
            }}
            disabled={!from}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
};
