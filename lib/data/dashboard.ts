import "server-only";

import { startOfMonth, subDays } from "date-fns";
import type { DashboardMetrics, Ticket } from "@/types";
import { requireAuthenticatedUser } from "@/lib/data/auth";
import { getStatusLabel } from "@/lib/utils";

interface ChartBar {
  status: string;
  total: number;
}

export async function getDashboardData() {
  const { supabase } = await requireAuthenticatedUser();
  const now = new Date();
  const last30Days = subDays(now, 30).toISOString();
  const monthStart = startOfMonth(now).toISOString();

  const [
    openResult,
    inProgressResult,
    urgentResult,
    doneThisMonthResult,
    chartResult,
    recentResult,
  ] = await Promise.all([
    supabase
      .from("tickets")
      .select("id", { count: "exact", head: true })
      .neq("status", "done"),
    supabase
      .from("tickets")
      .select("id", { count: "exact", head: true })
      .eq("status", "in_progress"),
    supabase
      .from("tickets")
      .select("id", { count: "exact", head: true })
      .eq("priority", "urgent")
      .neq("status", "done"),
    supabase
      .from("tickets")
      .select("id", { count: "exact", head: true })
      .eq("status", "done")
      .gte("updated_at", monthStart),
    supabase
      .from("tickets")
      .select("status, created_at")
      .gte("created_at", last30Days),
    supabase
      .from("tickets")
      .select("id, title, status, priority, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const recentTickets = ((recentResult.data ?? []) as Ticket[]) ?? [];
  const chartRows =
    ((chartResult.data ?? []) as Array<Pick<Ticket, "status" | "created_at">>) ?? [];

  const metrics: DashboardMetrics = {
    openTotal: openResult.count ?? 0,
    inProgressTotal: inProgressResult.count ?? 0,
    urgentTotal: urgentResult.count ?? 0,
    doneThisMonth: doneThisMonthResult.count ?? 0,
  };

  const statuses: Ticket["status"][] = [
    "pending",
    "analyzing",
    "in_progress",
    "done",
  ];

  const chartData: ChartBar[] = statuses.map((status) => ({
    status: getStatusLabel(status),
    total: chartRows.filter((ticket) => ticket.status === status).length,
  }));

  return { metrics, chartData, recentTickets };
}
