import { type ClassValue, clsx } from "clsx";
import { format, formatDistanceToNowStrict, isValid, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { twMerge } from "tailwind-merge";
import {
  DEPARTMENT_LABELS,
  PRIORITY_COLORS,
  PRIORITY_LABELS,
  STATUS_COLORS,
  STATUS_LABELS,
} from "@/lib/constants";
import type { Department, TicketPriority, TicketStatus } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateTime(value: string | Date) {
  const date = typeof value === "string" ? parseISO(value) : value;
  if (!isValid(date)) return "--";
  return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
}

export function formatDateShort(value: string | Date) {
  const date = typeof value === "string" ? parseISO(value) : value;
  if (!isValid(date)) return "--";
  return format(date, "dd/MM/yyyy", { locale: ptBR });
}

export function formatMonthDay(value: string | Date) {
  const date = typeof value === "string" ? parseISO(value) : value;
  if (!isValid(date)) return "--";
  return format(date, "dd MMM", { locale: ptBR });
}

export function fromNow(value: string | Date) {
  const date = typeof value === "string" ? parseISO(value) : value;
  if (!isValid(date)) return "--";
  return formatDistanceToNowStrict(date, { addSuffix: true, locale: ptBR });
}

export function getStatusLabel(status: TicketStatus) {
  return STATUS_LABELS[status];
}

export function getPriorityLabel(priority: TicketPriority) {
  return PRIORITY_LABELS[priority];
}

export function getDepartmentLabel(department: Department) {
  return DEPARTMENT_LABELS[department];
}

export function getStatusColor(status: TicketStatus) {
  return STATUS_COLORS[status];
}

export function getPriorityColor(priority: TicketPriority) {
  return PRIORITY_COLORS[priority];
}

export function getFileExtension(fileName: string) {
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}

export function isImageFile(fileName: string) {
  return ["jpg", "jpeg", "png"].includes(getFileExtension(fileName));
}

export function isPdfFile(fileName: string) {
  return getFileExtension(fileName) === "pdf";
}

export function slugifyFileName(fileName: string) {
  const extension = getFileExtension(fileName);
  const baseName = fileName.replace(/\.[^/.]+$/, "");
  const slug = baseName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

  return extension ? `${slug}.${extension}` : slug;
}

export function formatTicketId(id: string) {
  return `#${id.slice(0, 8).toUpperCase()}`;
}

export function getPageTitle(pathname: string) {
  if (pathname.startsWith("/tickets/new")) return "Abrir Chamado";
  if (pathname.startsWith("/tickets/")) return "Detalhe do Chamado";
  if (pathname.startsWith("/tickets")) return "Meus Chamados";
  if (pathname.startsWith("/admin")) return "Painel Admin";
  if (pathname.startsWith("/dashboard")) return "Dashboard";
  if (pathname.startsWith("/403")) return "Acesso Restrito";
  return "Fast PDR Tools";
}

export function buildPagination(total: number, page: number, pageSize: number) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return {
    page,
    pageSize,
    total,
    totalPages,
    hasPrevious: page > 1,
    hasNext: page < totalPages,
  };
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((chunk) => chunk[0]?.toUpperCase())
    .join("");
}

export function firstOrNull<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}
