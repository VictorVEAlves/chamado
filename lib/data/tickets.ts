import "server-only";

import { hasGlobalTicketAccess } from "@/lib/access";
import {
  ADMIN_PAGE_SIZE,
  DEPARTMENT_OPTIONS,
  PRIORITY_OPTIONS,
  STATUS_OPTIONS,
  TICKETS_PAGE_SIZE,
} from "@/lib/constants";
import { requireAdminPanelAccess, requireAuthenticatedUser } from "@/lib/data/auth";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { buildPagination, firstOrNull } from "@/lib/utils";
import type {
  AdminPageFilters,
  AdminTab,
  Department,
  DepartmentCount,
  PaginationState,
  Profile,
  Ticket,
  TicketAttachment,
  TicketComment,
  TicketFilters,
  TicketHistory,
  UserActiveFilter,
} from "@/types";

type SearchParams = Record<string, string | string[] | undefined>;
type DisplayProfile = Pick<Profile, "id" | "name" | "avatar_url" | "department">;
interface NormalizedTicketFilters {
  search?: string;
  status: Ticket["status"][];
  priority: Ticket["priority"][];
  from?: string;
  to?: string;
  page: number;
}

function getSingleSearchParam(value: string | string[] | undefined) {
  return typeof value === "string" ? value : undefined;
}

function normalizePage(value: number | string | undefined, fallback = 1) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function normalizeDate(value: string | undefined) {
  if (!value) return undefined;
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : undefined;
}

function normalizeTicketFilters(searchParams: TicketFilters): NormalizedTicketFilters {
  const search = searchParams.search?.trim() || undefined;
  const status = (searchParams.status ?? []).filter((value): value is Ticket["status"] =>
    STATUS_OPTIONS.includes(value as Ticket["status"]),
  );
  const priority = (searchParams.priority ?? []).filter(
    (value): value is Ticket["priority"] =>
      PRIORITY_OPTIONS.includes(value as Ticket["priority"]),
  );

  return {
    search,
    status,
    priority,
    from: normalizeDate(searchParams.from),
    to: normalizeDate(searchParams.to),
    page: normalizePage(searchParams.page, 1),
  };
}

function normalizeAdminTab(value: string | undefined): AdminTab {
  return value === "users" ? "users" : "tickets";
}

function normalizeUserActive(value: string | undefined): UserActiveFilter {
  if (value === "active" || value === "inactive") {
    return value;
  }

  return "all";
}

function normalizeAdminFilters(searchParams?: SearchParams): AdminPageFilters {
  const ticketStatus = getSingleSearchParam(searchParams?.ticketStatus);
  const ticketDepartment = getSingleSearchParam(searchParams?.ticketDepartment);

  return {
    tab: normalizeAdminTab(getSingleSearchParam(searchParams?.tab)),
    ticketsPage: normalizePage(getSingleSearchParam(searchParams?.ticketsPage), 1),
    usersPage: normalizePage(getSingleSearchParam(searchParams?.usersPage), 1),
    ticketStatus: STATUS_OPTIONS.includes(ticketStatus as Ticket["status"])
      ? (ticketStatus as Ticket["status"])
      : undefined,
    ticketDepartment: DEPARTMENT_OPTIONS.includes(ticketDepartment as Department)
      ? (ticketDepartment as Department)
      : undefined,
    userSearch: getSingleSearchParam(searchParams?.userSearch)?.trim() || undefined,
    userActive: normalizeUserActive(getSingleSearchParam(searchParams?.userActive)),
  };
}

async function getDisplayProfiles(profileIds: Array<string | null | undefined>) {
  const ids = [...new Set(profileIds.filter(Boolean))] as string[];

  if (!ids.length) {
    return new Map<string, DisplayProfile>();
  }

  const admin = createAdminSupabaseClient();
  const { data } = await admin
    .from("profiles")
    .select("id, name, avatar_url, department")
    .in("id", ids);

  return new Map(
    (((data ?? []) as DisplayProfile[]) ?? []).map((profile) => [profile.id, profile]),
  );
}

function emptyPagination(page = 1): PaginationState {
  return buildPagination(0, page, ADMIN_PAGE_SIZE);
}

export async function getDepartmentOpenCounts() {
  await requireAuthenticatedUser();
  const admin = createAdminSupabaseClient();
  const { data } = await admin.rpc("get_department_open_counts");
  return ((data ?? []) as DepartmentCount[]) ?? [];
}

export async function getTicketsPageData(searchParams: TicketFilters) {
  const { supabase } = await requireAuthenticatedUser();
  const filters = normalizeTicketFilters(searchParams);

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

  if (filters.status.length) {
    query = query.in("status", filters.status);
  }

  if (filters.priority.length) {
    query = query.in("priority", filters.priority);
  }

  if (filters.from) {
    query = query.gte("created_at", `${filters.from}T00:00:00.000Z`);
  }

  if (filters.to) {
    query = query.lte("created_at", `${filters.to}T23:59:59.999Z`);
  }

  const fromIndex = (filters.page - 1) * TICKETS_PAGE_SIZE;
  const toIndex = fromIndex + TICKETS_PAGE_SIZE - 1;

  const { data, count } = await query.range(fromIndex, toIndex);

  return {
    filters,
    tickets: ((data ?? []) as Ticket[]) ?? [],
    pagination: buildPagination(count ?? 0, filters.page, TICKETS_PAGE_SIZE),
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
          "id, title, description, status, priority, department, created_by, assigned_to, created_at, updated_at",
        )
        .eq("id", ticketId)
        .maybeSingle(),
      supabase
        .from("ticket_comments")
        .select("id, ticket_id, user_id, content, created_at")
        .eq("ticket_id", ticketId)
        .order("created_at", { ascending: true }),
      supabase
        .from("ticket_history")
        .select("id, ticket_id, changed_by, old_status, new_status, created_at")
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

  const baseTicket = (ticket as Ticket) ?? null;
  const commentRows = ((comments ?? []) as TicketComment[]) ?? [];
  const historyRows = ((history ?? []) as TicketHistory[]) ?? [];
  const attachmentRows = ((attachments ?? []) as TicketAttachment[]) ?? [];

  const profileLookup = await getDisplayProfiles([
    baseTicket.created_by,
    baseTicket.assigned_to,
    ...commentRows.map((comment) => comment.user_id),
    ...historyRows.map((entry) => entry.changed_by),
  ]);

  const { data: signedUrlRows } =
    attachmentRows.length > 0
      ? await admin.storage
          .from("ticket-attachments")
          .createSignedUrls(
            attachmentRows.map((attachment) => attachment.file_url),
            60 * 60,
          )
      : { data: [] as Array<{ path: string; signedUrl: string | null }> };

  const signedUrlMap = new Map(
    (signedUrlRows ?? []).map((row) => [row.path, row.signedUrl]),
  );

  let assignableUsers: Profile[] = [];
  const canAssignResponsibility =
    hasGlobalTicketAccess(profile) || profile.department === baseTicket.department;

  if (canAssignResponsibility) {
    const { data } = await admin
      .from("profiles")
      .select("id, name, role, department, avatar_url, active, created_at")
      .eq("active", true)
      .eq("department", baseTicket.department)
      .order("name", { ascending: true });

    assignableUsers = ((data ?? []) as Profile[]) ?? [];
  }

  return {
    ticket: {
      ...baseTicket,
      creator: profileLookup.get(baseTicket.created_by) ?? null,
      assignee: baseTicket.assigned_to
        ? (profileLookup.get(baseTicket.assigned_to) ?? null)
        : null,
    },
    comments: commentRows.map((comment) => ({
      ...comment,
      user: profileLookup.get(comment.user_id) ?? null,
    })) as TicketComment[],
    history: historyRows.map((entry) => ({
      ...entry,
      user: entry.changed_by ? (profileLookup.get(entry.changed_by) ?? null) : null,
    })) as TicketHistory[],
    attachments: attachmentRows.map((attachment) => ({
      ...attachment,
      signed_url: signedUrlMap.get(attachment.file_url) ?? null,
    })),
    assignableUsers,
  };
}

export async function getAdminPageData(searchParams?: SearchParams) {
  await requireAdminPanelAccess();
  const admin = createAdminSupabaseClient();
  const filters = normalizeAdminFilters(searchParams);

  if (filters.tab === "users") {
    let query = admin
      .from("profiles")
      .select("id, name, role, department, avatar_url, active, created_at", {
        count: "exact",
      })
      .order("name", { ascending: true });

    if (filters.userSearch) {
      query = query.ilike("name", `%${filters.userSearch}%`);
    }

    if (filters.userActive === "active") {
      query = query.eq("active", true);
    }

    if (filters.userActive === "inactive") {
      query = query.eq("active", false);
    }

    const fromIndex = (filters.usersPage - 1) * ADMIN_PAGE_SIZE;
    const toIndex = fromIndex + ADMIN_PAGE_SIZE - 1;
    const { data, count } = await query.range(fromIndex, toIndex);

    return {
      activeTab: filters.tab,
      filters,
      tickets: [] as Ticket[],
      ticketsPagination: emptyPagination(filters.ticketsPage),
      assignableUsers: [] as Profile[],
      users: ((data ?? []) as Profile[]) ?? [],
      usersPagination: buildPagination(count ?? 0, filters.usersPage, ADMIN_PAGE_SIZE),
    };
  }

  let ticketsQuery = admin
    .from("tickets")
    .select(
      "id, title, description, status, priority, department, created_by, assigned_to, created_at, updated_at, creator:profiles!tickets_created_by_fkey(id, name, avatar_url, department), assignee:profiles!tickets_assigned_to_fkey(id, name, avatar_url)",
      { count: "exact" },
    )
    .order("updated_at", { ascending: false });

  if (filters.ticketStatus) {
    ticketsQuery = ticketsQuery.eq("status", filters.ticketStatus);
  }

  if (filters.ticketDepartment) {
    ticketsQuery = ticketsQuery.eq("department", filters.ticketDepartment);
  }

  const fromIndex = (filters.ticketsPage - 1) * ADMIN_PAGE_SIZE;
  const toIndex = fromIndex + ADMIN_PAGE_SIZE - 1;
  const { data: ticketRows, count } = await ticketsQuery.range(fromIndex, toIndex);

  const tickets =
    ((ticketRows ?? []).map((ticket) => ({
      ...ticket,
      creator: firstOrNull(ticket.creator),
      assignee: firstOrNull(ticket.assignee),
    })) as unknown as Ticket[]) ?? [];

  const activeDepartments = [...new Set(tickets.map((ticket) => ticket.department))];
  const { data: assignableUsersData } =
    activeDepartments.length > 0
      ? await admin
          .from("profiles")
          .select("id, name, role, department, avatar_url, active, created_at")
          .eq("active", true)
          .in("department", activeDepartments)
          .order("name", { ascending: true })
      : { data: [] as Profile[] };

  return {
    activeTab: filters.tab,
    filters,
    tickets,
    ticketsPagination: buildPagination(count ?? 0, filters.ticketsPage, ADMIN_PAGE_SIZE),
    assignableUsers: ((assignableUsersData ?? []) as Profile[]) ?? [],
    users: [] as Profile[],
    usersPagination: emptyPagination(filters.usersPage),
  };
}
