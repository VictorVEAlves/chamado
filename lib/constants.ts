import type { Department, TicketPriority, TicketStatus } from "@/types";

export const APP_NAME = "Fast PDR Tools";
export const TICKETS_PAGE_SIZE = 10;
export const ADMIN_PAGE_SIZE = 25;
export const MAX_ATTACHMENT_SIZE = 5 * 1024 * 1024;
export const ACCEPTED_ATTACHMENT_TYPES = [
  "image/jpeg",
  "image/png",
  "application/pdf",
] as const;
export const STORAGE_BUCKET = "ticket-attachments";
export const UNASSIGNED_ASSIGNEE_VALUE = "__unassigned__";

export const DEPARTMENT_OPTIONS: Department[] = [
  "comercial",
  "marketing",
  "comex",
  "compras",
  "financeiro",
  "logistica",
  "ti",
  "rh",
  "diretoria",
  "barueri",
  "itajai",
];

export const STATUS_OPTIONS: TicketStatus[] = [
  "pending",
  "analyzing",
  "in_progress",
  "done",
];

export const PRIORITY_OPTIONS: TicketPriority[] = [
  "low",
  "medium",
  "high",
  "urgent",
];

export const STATUS_LABELS: Record<TicketStatus, string> = {
  pending: "Pendente",
  analyzing: "Em análise",
  in_progress: "Em progresso",
  done: "Concluído",
};

export const PRIORITY_LABELS: Record<TicketPriority, string> = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
  urgent: "Urgente",
};

export const DEPARTMENT_LABELS: Record<Department, string> = {
  comercial: "Comercial",
  marketing: "Marketing",
  comex: "Comex",
  compras: "Compras",
  financeiro: "Financeiro",
  logistica: "Logística",
  ti: "TI",
  rh: "RH",
  diretoria: "Diretoria",
  barueri: "Barueri",
  itajai: "Itajaí",
};

export const STATUS_COLORS: Record<TicketStatus, string> = {
  pending: "#6B7280",
  analyzing: "#3B82F6",
  in_progress: "#F59E0B",
  done: "#10B981",
};

export const PRIORITY_COLORS: Record<TicketPriority, string> = {
  low: "#6B7280",
  medium: "#3B82F6",
  high: "#F59E0B",
  urgent: "#EF4444",
};
