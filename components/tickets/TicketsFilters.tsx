"use client";

import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import { CalendarIcon, Search, SlidersHorizontal, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from "@/lib/constants";
import { getPriorityLabel, getStatusLabel } from "@/lib/utils";
import type { TicketFilters } from "@/types";

interface TicketsFiltersProps {
  filters: TicketFilters;
}

export function TicketsFilters({ filters }: TicketsFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(filters.search ?? "");
  const selectedRange = useMemo<DateRange | undefined>(() => {
    if (!filters.from && !filters.to) return undefined;
    return {
      from: filters.from ? new Date(filters.from) : undefined,
      to: filters.to ? new Date(filters.to) : undefined,
    };
  }, [filters.from, filters.to]);

  const commit = useCallback(
    (patch: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(patch).forEach(([key, value]) => {
        if (value) params.set(key, value);
        else params.delete(key);
      });
      params.delete("page");
      const nextQuery = params.toString();
      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname);
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      if (search === (filters.search ?? "")) return;
      commit({ search: search || undefined });
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [commit, filters.search, search]);

  const toggleArrayFilter = (key: "status" | "priority", value: string) => {
    const current = new Set((filters[key] ?? []) as string[]);
    if (current.has(value)) current.delete(value);
    else current.add(value);

    commit({ [key]: current.size ? Array.from(current).join(",") : undefined });
  };

  const clearAll = () => {
    setSearch("");
    router.replace(pathname);
  };

  return (
    <div className="surface-panel rounded-[1.5rem] p-4">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-11"
            placeholder="Buscar por título ou descrição"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
              <CalendarIcon className="h-4 w-4" />
              {filters.from && filters.to
                ? `${format(new Date(filters.from), "dd/MM")} - ${format(new Date(filters.to), "dd/MM")}`
                : "Período"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3">
            <Calendar
              mode="range"
              numberOfMonths={1}
              selected={selectedRange}
              onSelect={(range) =>
                commit({
                  from: range?.from ? format(range.from, "yyyy-MM-dd") : undefined,
                  to: range?.to ? format(range.to, "yyyy-MM-dd") : undefined,
                })
              }
            />
          </PopoverContent>
        </Popover>
        <Button variant="ghost" onClick={clearAll}>
          <X className="h-4 w-4" />
          Limpar filtros
        </Button>
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">
            <SlidersHorizontal className="h-4 w-4" />
            Status
          </div>
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((status) => {
              const selected = filters.status?.includes(status);
              return (
                <Button
                  key={status}
                  type="button"
                  variant={selected ? "default" : "secondary"}
                  size="sm"
                  onClick={() => toggleArrayFilter("status", status)}
                >
                  {getStatusLabel(status)}
                </Button>
              );
            })}
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">
            <SlidersHorizontal className="h-4 w-4" />
            Prioridade
          </div>
          <div className="flex flex-wrap gap-2">
            {PRIORITY_OPTIONS.map((priority) => {
              const selected = filters.priority?.includes(priority);
              return (
                <Button
                  key={priority}
                  type="button"
                  variant={selected ? "default" : "secondary"}
                  size="sm"
                  onClick={() => toggleArrayFilter("priority", priority)}
                >
                  {getPriorityLabel(priority)}
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
