"use server";

import { revalidatePath } from "next/cache";
import { requireAuthenticatedUser } from "@/lib/data/auth";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { firstOrNull } from "@/lib/utils";
import type { Notification } from "@/types";

export async function getRecentNotificationsAction(limit = 5) {
  const { supabase, user } = await requireAuthenticatedUser();

  const { data, error } = await supabase
    .from("notifications")
    .select("id, user_id, ticket_id, message, read, created_at, ticket:tickets(id, title)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return {
      success: false,
      error: "Nao foi possivel carregar as notificacoes.",
      notifications: [] as Notification[],
    };
  }

  return {
    success: true,
    notifications:
      ((data ?? []).map((item) => ({
        ...item,
        ticket: firstOrNull(item.ticket),
      })) as unknown as Notification[]) ?? [],
  };
}

export async function markAllNotificationsReadAction() {
  const { user } = await requireAuthenticatedUser();
  const admin = createAdminSupabaseClient();

  const { error } = await admin
    .from("notifications")
    .update({ read: true })
    .eq("user_id", user.id)
    .eq("read", false);

  if (error) {
    return {
      success: false,
      error: "Não foi possível marcar as notificações como lidas.",
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/tickets");

  return {
    success: true,
  };
}
