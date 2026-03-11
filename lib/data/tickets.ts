import "server-only";

import { TICKETS_PAGE_SIZE } from "@/lib/constants";
import { requireAdminUser, requireAuthenticatedUser } from "@/lib/data/auth";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { ticketFiltersSchema } from "@/lib/validations/ticket.schema";
import { buildPagination, firstOrNull } from "@/lib/utils";
import type {
  DepartmentCount,
  Profile,
  Ticket,
  TicketAttachment,
  TicketComment,
  TicketFilters,
  TicketHistory,
} from "@/types";

export async function getDepartmentOpenCounts() {
  await requireAuthenticatedUser();
  const admin = createAdminSupabaseClient();
  const { data } = await admin.rpc("get_department_open_counts");
  return ((data ?? []) as DepartmentCount[]) ?? [];
}

export async function getTicketsPageData(searchParams: TicketFilters) {
  const { supabase } = await requireAuthenticatedUser();
  const filters = ticketFiltersSchema.parse({
    search: searchParams.search,
    status: searchParams.status,
    priority: searchParams.priority,
    from: searchParams.from,
    to: searchParams.to,
    page: searchParams.page ?? 1,
  });

  let query = supabase
    .from("tickets")
    .select(
      "id, title, description, status, priority, department, created_by, assigned_to, created_at, updated_at",
      { count: "exact" },
    )
    .order("updated_at", { ascending: false });

  if (filters.search) {
    query = query.or(
      `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`,
    );
  }

  if (filters.status?.length) {
    query = query.in("status", filters.status);
  }

  if (filters.priority?.length) {
    query = query.in("priority", filters.priority);
  }

  if (filters.from) {
    query = query.gte("created_at", `${filters.from}T00:00:00.000Z`);
  }

  if (filters.to) {
    query = query.lte("created_at", `${filters.to}T23:59:59.999Z`);
  }

  const page = filters.page ?? 1;
  const fromIndex = (page - 1) * TICKETS_PAGE_SIZE;
  const toIndex = fromIndex + TICKETS_PAGE_SIZE - 1;

  const { data, count } = await query.range(fromIndex, toIndex);

  return {
    filters,
    tickets: ((data ?? []) as Ticket[]) ?? [],
    pagination: buildPagination(count ?? 0, page, TICKETS_PAGE_SIZE),
  };
}

export async function getTicketDetails(ticketId: string) {
  const { supabase, profile } = await requireAuthenticatedUser();
  const admin = createAdminSupabaseClient();

  const [{ data: ticket }, { data: comments }, { data: history }, { data: attachments }] =
    await Promise.all([
      supabase
        .from("tickets")
        .select(
          "id, title, description, status, priority, department, created_by, assigned_to, created_at, updated_at, creator:profiles!tickets_created_by_fkey(id, name, avatar_url, department), assignee:profiles!tickets_assigned_to_fkey(id, name, avatar_url)",
        )
        .eq("id", ticketId)
        .maybeSingle(),
      supabase
        .from("ticket_comments")
        .select(
          "id, ticket_id, user_id, content, created_at, user:profiles(id, name, avatar_url)",
        )
        .eq("ticket_id", ticketId)
        .order("created_at", { ascending: true }),
      supabase
        .from("ticket_history")
        .select(
          "id, ticket_id, changed_by, old_status, new_status, created_at, user:profiles(id, name, avatar_url)",
        )
        .eq("ticket_id", ticketId)
        .order("created_at", { ascending: false }),
      supabase
        .from("ticket_attachments")
        .select("id, ticket_id, file_url, file_name, created_at")
        .eq("ticket_id", ticketId)
        .order("created_at", { ascending: true }),
    ]);

  if (!ticket) {
    return null;
  }

  const attachmentRows = ((attachments ?? []) as TicketAttachment[]) ?? [];
  const signedAttachments = await Promise.all(
    attachmentRows.map(async (attachment) => {
      const { data } = await admin.storage
        .from("ticket-attachments")
        .createSignedUrl(attachment.file_url, 60 * 60);

      return {
        ...attachment,
        signed_url: data?.signedUrl ?? null,
      };
    }),
  );

  let assignableUsers: Profile[] = [];
  const canAssignResponsibility =
    profile.role === "admin" || profile.department === ticket.department;

  if (canAssignResponsibility) {
    const { data } = await admin
      .from("profiles")
      .select("*")
      .eq("active", true)
      .eq("department", ticket.department)
      .order("name", { ascending: true });

    assignableUsers = ((data ?? []) as Profile[]) ?? [];
  }

  return {
    ticket: {
      ...((ticket as unknown as Ticket) ?? {}),
      creator: firstOrNull((ticket as { creator?: Ticket["creator"][] }).creator),
      assignee: firstOrNull((ticket as { assignee?: Ticket["assignee"][] }).assignee),
    },
    comments: ((comments ?? []).map((comment) => ({
      ...comment,
      user: firstOrNull(comment.user),
    })) as unknown as TicketComment[]) ?? [],
    history: ((history ?? []).map((entry) => ({
      ...entry,
      user: firstOrNull(entry.user),
    })) as unknown as TicketHistory[]) ?? [],
    attachments: signedAttachments,
    assignableUsers,
  };
}

export async function getAdminPageData() {
  await requireAdminUser();
  const admin = createAdminSupabaseClient();

  const [{ data: tickets }, { data: users }] = await Promise.all([
    admin
      .from("tickets")
      .select(
        "id, title, description, status, priority, department, created_by, assigned_to, created_at, updated_at, creator:profiles!tickets_created_by_fkey(id, name, avatar_url, department), assignee:profiles!tickets_assigned_to_fkey(id, name, avatar_url)",
      )
      .order("updated_at", { ascending: false }),
    admin.from("profiles").select("*").order("name", { ascending: true }),
  ]);

  return {
    tickets: ((tickets ?? []).map((ticket) => ({
      ...ticket,
      creator: firstOrNull(ticket.creator),
      assignee: firstOrNull(ticket.assignee),
    })) as unknown as Ticket[]) ?? [],
    users: ((users ?? []) as Profile[]) ?? [],
  };
}
