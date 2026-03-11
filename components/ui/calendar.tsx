import { ptBR } from "date-fns/locale";
import { DayPicker } from "react-day-picker";
import { cn } from "@/lib/utils";

type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      locale={ptBR}
      className={cn("p-0", className)}
      classNames={{
        months: "flex flex-col gap-4 sm:flex-row",
        month: "space-y-4",
        caption: "flex items-center justify-between px-1",
        caption_label: "text-sm font-medium",
        nav: "flex items-center gap-1",
        nav_button:
          "h-8 w-8 rounded-lg border border-border bg-secondary text-foreground transition hover:bg-secondary/80",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: "w-9 text-xs font-medium text-muted-foreground",
        row: "mt-2 flex w-full",
        cell: "relative h-9 w-9 p-0 text-center text-sm",
        day: "h-9 w-9 rounded-lg p-0 font-normal transition hover:bg-secondary",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
        day_today: "border border-primary text-primary",
        day_outside: "text-muted-foreground opacity-50",
        day_disabled: "text-muted-foreground opacity-40",
        day_range_middle: "bg-secondary text-foreground rounded-none",
        day_hidden: "invisible",
        ...classNames,
      }}
      {...props}
    />
  );
}

export { Calendar };
