import "server-only";

import type { Notification } from "@/types";
import { requireAuthenticatedUser } from "@/lib/data/auth";
import { firstOrNull } from "@/lib/utils";

export async function getRecentNotifications(limit = 5) {
  const { supabase, user } = await requireAuthenticatedUser();

  const [{ data }, { count }] = await Promise.all([
    supabase
      .from("notifications")
      .select("id, user_id, ticket_id, message, read, created_at, ticket:tickets(id, title)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit),
    supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("read", false),
  ]);

  return {
    notifications: ((data ?? []).map((item) => ({
      ...item,
      ticket: firstOrNull(item.ticket),
    })) as unknown as Notification[]) ?? [],
    unreadCount: count ?? 0,
  };
}
