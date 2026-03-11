import { z } from "zod";
import {
  ACCEPTED_ATTACHMENT_TYPES,
  DEPARTMENT_OPTIONS,
  MAX_ATTACHMENT_SIZE,
  PRIORITY_OPTIONS,
  STATUS_OPTIONS,
} from "@/lib/constants";

const fileSchema = z.custom<File>((value) => value instanceof File, {
  message: "Arquivo invalido.",
});

export const createTicketSchema = z.object({
  title: z
    .string()
    .min(10, "O titulo deve ter pelo menos 10 caracteres.")
    .max(120, "O titulo deve ter no maximo 120 caracteres."),
  description: z
    .string()
    .min(20, "A descricao deve ter pelo menos 20 caracteres.")
    .max(3000, "A descricao deve ter no maximo 3000 caracteres."),
  priority: z.enum(PRIORITY_OPTIONS),
  department: z.enum(DEPARTMENT_OPTIONS),
  attachments: z.array(fileSchema).superRefine((files, ctx) => {
    files.forEach((file, index) => {
      if (!ACCEPTED_ATTACHMENT_TYPES.includes(file.type as never)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Use apenas JPG, PNG ou PDF.",
          path: [index],
        });
      }

      if (file.size > MAX_ATTACHMENT_SIZE) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Cada arquivo deve ter no maximo 5MB.",
          path: [index],
        });
      }
    });
  }),
});

export const ticketFiltersSchema = z.object({
  search: z.string().trim().optional(),
  status: z.array(z.enum(STATUS_OPTIONS)).optional(),
  priority: z.array(z.enum(PRIORITY_OPTIONS)).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
});

export const commentSchema = z.object({
  ticketId: z.string().uuid("Chamado invalido."),
  content: z
    .string()
    .trim()
    .min(1, "Digite um comentario.")
    .max(2000, "O comentario deve ter no maximo 2000 caracteres."),
});

export const updateStatusSchema = z.object({
  ticketId: z.string().uuid("Chamado invalido."),
  status: z.enum(STATUS_OPTIONS),
});

export const reassignDepartmentSchema = z.object({
  ticketId: z.string().uuid("Chamado invalido."),
  department: z.enum(DEPARTMENT_OPTIONS),
});

export const assignTicketSchema = z.object({
  ticketId: z.string().uuid("Chamado invalido."),
  assignedTo: z.string().uuid("Responsavel invalido.").nullable(),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type TicketFiltersInput = z.infer<typeof ticketFiltersSchema>;
export type CommentInput = z.infer<typeof commentSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
export type ReassignDepartmentInput = z.infer<typeof reassignDepartmentSchema>;
export type AssignTicketInput = z.infer<typeof assignTicketSchema>;
