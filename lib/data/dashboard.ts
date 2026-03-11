import "server-only";

import { isSameMonth, subDays } from "date-fns";
import type { DashboardMetrics, Ticket } from "@/types";
import { requireAuthenticatedUser } from "@/lib/data/auth";
import { firstOrNull, getStatusLabel } from "@/lib/utils";

interface ChartBar {
  status: string;
  total: number;
}

export async function getDashboardData() {
  const { supabase } = await requireAuthenticatedUser();

  const [ticketResult, recentResult] = await Promise.all([
    supabase
      .from("tickets")
      .select("id, title, description, status, priority, department, created_by, assigned_to, created_at, updated_at"),
    supabase
      .from("tickets")
      .select(
        "id, title, description, status, priority, department, created_by, assigned_to, created_at, updated_at, creator:profiles!tickets_created_by_fkey(id, name, avatar_url, department)",
      )
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const tickets = (ticketResult.data ?? []) as Ticket[];
  const recentTickets = ((recentResult.data ?? []).map((ticket) => ({
    ...ticket,
    creator: firstOrNull(ticket.creator),
  })) as unknown as Ticket[]) ?? [];
  const now = new Date();
  const last30Days = subDays(now, 30);

  const metrics: DashboardMetrics = {
    openTotal: tickets.filter((ticket) => ticket.status !== "done").length,
    inProgressTotal: tickets.filter((ticket) => ticket.status === "in_progress").length,
    urgentTotal: tickets.filter(
      (ticket) => ticket.priority === "urgent" && ticket.status !== "done",
    ).length,
    doneThisMonth: tickets.filter(
      (ticket) =>
        ticket.status === "done" && isSameMonth(new Date(ticket.updated_at), now),
    ).length,
  };

  const chartSource = tickets.filter(
    (ticket) => new Date(ticket.created_at).getTime() >= last30Days.getTime(),
  );

  const statuses: Ticket["status"][] = [
    "pending",
    "analyzing",
    "in_progress",
    "done",
  ];

  const chartData: ChartBar[] = statuses.map((status) => ({
    status: getStatusLabel(status),
    total: chartSource.filter((ticket) => ticket.status === status).length,
  }));

  return { metrics, chartData, recentTickets };
}
