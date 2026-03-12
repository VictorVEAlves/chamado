import type { Session } from "@supabase/supabase-js";

export type UserRole = "user" | "admin";
export type TicketStatus = "pending" | "analyzing" | "in_progress" | "done";
export type TicketPriority = "low" | "medium" | "high" | "urgent";
export type Department =
  | "comercial"
  | "marketing"
  | "comex"
  | "compras"
  | "financeiro"
  | "logistica"
  | "ti"
  | "rh"
  | "diretoria"
  | "barueri"
  | "itajai";

export interface Profile {
  id: string;
  name: string;
  role: UserRole;
  department: Department;
  avatar_url: string | null;
  active: boolean;
  created_at: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  department: Department;
  created_by: string;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  creator?: Pick<Profile, "id" | "name" | "avatar_url" | "department"> | null;
  assignee?: Pick<Profile, "id" | "name" | "avatar_url"> | null;
}

export interface TicketComment {
  id: string;
  ticket_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user?: Pick<Profile, "id" | "name" | "avatar_url"> | null;
}

export interface TicketHistory {
  id: string;
  ticket_id: string;
  changed_by: string | null;
  old_status: TicketStatus | null;
  new_status: TicketStatus;
  created_at: string;
  user?: Pick<Profile, "id" | "name" | "avatar_url"> | null;
}

export interface TicketAttachment {
  id: string;
  ticket_id: string;
  file_url: string;
  file_name: string;
  created_at: string;
  signed_url?: string | null;
}

export interface Notification {
  id: string;
  user_id: string;
  ticket_id: string | null;
  message: string;
  read: boolean;
  created_at: string;
  ticket?: Pick<Ticket, "id" | "title"> | null;
}

export interface TicketFilters {
  search?: string;
  status?: TicketStatus[];
  priority?: TicketPriority[];
  from?: string;
  to?: string;
  page?: number;
}

export type AdminTab = "tickets" | "users";
export type UserActiveFilter = "all" | "active" | "inactive";

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface AdminPageFilters {
  tab: AdminTab;
  ticketsPage: number;
  usersPage: number;
  ticketStatus?: TicketStatus;
  ticketDepartment?: Department;
  userSearch?: string;
  userActive: UserActiveFilter;
}

export interface DashboardMetrics {
  openTotal: number;
  inProgressTotal: number;
  urgentTotal: number;
  doneThisMonth: number;
}

export interface DepartmentCount {
  department: Department;
  open_count: number;
}

export interface AuthContextState {
  session: Session | null;
  profile: Profile | null;
  unreadCount: number;
}

export interface AuthActionResult {
  success: boolean;
  error?: string;
  requiresEmailConfirmation?: boolean;
  email?: string;
}
