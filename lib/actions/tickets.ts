"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import {
  ACCEPTED_ATTACHMENT_TYPES,
  MAX_ATTACHMENT_SIZE,
  STORAGE_BUCKET,
} from "@/lib/constants";
import { requireAdminUser, requireAuthenticatedUser } from "@/lib/data/auth";
import {
  notifyAssigned,
  notifyNewComment,
  notifyStatusChanged,
} from "@/lib/notifications";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import {
  assignTicketSchema,
  commentSchema,
  createTicketSchema,
  reassignDepartmentSchema,
  updateStatusSchema,
} from "@/lib/validations/ticket.schema";
import { toggleUserActiveSchema } from "@/lib/validations/user.schema";
import { getStatusLabel, slugifyFileName } from "@/lib/utils";
import type { Profile, Ticket } from "@/types";

function normalizeFiles(files: FormDataEntryValue[]) {
  return files.filter((file): file is File => file instanceof File && file.size > 0);
}

function validateFiles(files: File[]) {
  for (const file of files) {
    if (!ACCEPTED_ATTACHMENT_TYPES.includes(file.type as never)) {
      return "Use apenas arquivos JPG, PNG ou PDF.";
    }

    if (file.size > MAX_ATTACHMENT_SIZE) {
      return "Cada arquivo deve ter no maximo 5MB.";
    }
  }

  return null;
}

async function getAccessibleTicket(ticketId: string) {
  const { supabase } = await requireAuthenticatedUser();
  const { data } = await supabase
    .from("tickets")
    .select(
      "id, title, description, status, priority, department, created_by, assigned_to, created_at, updated_at",
    )
    .eq("id", ticketId)
    .maybeSingle();

  return (data as Ticket | null) ?? null;
}

async function getAssignableProfileOrError(
  profileId: string,
  ticketDepartment: Ticket["department"],
) {
  const admin = createAdminSupabaseClient();
  const { data } = await admin
    .from("profiles")
    .select("id, name, role, department, avatar_url, active, created_at")
    .eq("id", profileId)
    .eq("active", true)
    .maybeSingle();

  const assignee = (data as Profile | null) ?? null;

  if (!assignee) {
    return {
      assignee: null,
      error: "Responsavel invalido ou inativo.",
    };
  }

  if (assignee.department !== ticketDepartment) {
    return {
      assignee: null,
      error: "O responsavel precisa pertencer ao mesmo departamento do chamado.",
    };
  }

  return {
    assignee,
    error: null,
  };
}

export async function createTicketAction(formData: FormData) {
  const { user, profile } = await requireAuthenticatedUser();
  const admin = createAdminSupabaseClient();

  const rawFiles = normalizeFiles(formData.getAll("attachments"));
  const validationMessage = validateFiles(rawFiles);
  if (validationMessage) {
    return { success: false, error: validationMessage };
  }

  const parsed = createTicketSchema.safeParse({
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    priority: String(formData.get("priority") ?? "medium"),
    department: String(formData.get("department") ?? profile.department),
    attachments: rawFiles,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Dados invalidos.",
    };
  }

  const { data: ticket, error } = await admin
    .from("tickets")
    .insert({
      title: parsed.data.title,
      description: parsed.data.description,
      priority: parsed.data.priority,
      department: parsed.data.department,
      created_by: user.id,
      status: "pending",
    })
    .select("*")
    .single();

  if (error || !ticket) {
    return {
      success: false,
      error: "Nao foi possivel criar o chamado.",
    };
  }

  if (rawFiles.length) {
    const attachmentRows = [];

    for (const file of rawFiles) {
      const filePath = `${ticket.id}/${randomUUID()}-${slugifyFileName(file.name)}`;
      const { error: uploadError } = await admin.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, Buffer.from(await file.arrayBuffer()), {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        return {
          success: false,
          error: "O chamado foi criado, mas houve falha no upload dos anexos.",
        };
      }

      attachmentRows.push({
        ticket_id: ticket.id,
        file_url: filePath,
        file_name: file.name,
      });
    }

    if (attachmentRows.length) {
      await admin.from("ticket_attachments").insert(attachmentRows);
    }
  }

  revalidatePath("/dashboard");
  revalidatePath("/tickets");
  revalidatePath("/tickets/new");

  return {
    success: true,
    ticketId: ticket.id,
  };
}

export async function createCommentAction(input: { ticketId: string; content: string }) {
  const { profile } = await requireAuthenticatedUser();
  const admin = createAdminSupabaseClient();
  const parsed = commentSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Comentario invalido.",
    };
  }

  const ticket = await getAccessibleTicket(parsed.data.ticketId);
  if (!ticket) {
    notFound();
  }

  const { error } = await admin.from("ticket_comments").insert({
    ticket_id: ticket.id,
    user_id: profile.id,
    content: parsed.data.content,
  });

  if (error) {
    return {
      success: false,
      error: "Nao foi possivel enviar o comentario.",
    };
  }

  await notifyNewComment({
    ticket,
    commentedBy: profile,
  });

  revalidatePath(`/tickets/${ticket.id}`);

  return {
    success: true,
  };
}

export async function changeTicketStatusAction(input: {
  ticketId: string;
  status: string;
}) {
  const { profile } = await requireAuthenticatedUser();
  const admin = createAdminSupabaseClient();
  const parsed = updateStatusSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Status invalido.",
    };
  }

  const ticket = await getAccessibleTicket(parsed.data.ticketId);
  if (!ticket) {
    notFound();
  }

  const canChange = profile.role === "admin" || ticket.assigned_to === profile.id;

  if (!canChange) {
    return {
      success: false,
      error: "Voce nao pode alterar o status deste chamado.",
    };
  }

  if (ticket.status === parsed.data.status) {
    return { success: true };
  }

  const { error } = await admin
    .from("tickets")
    .update({ status: parsed.data.status })
    .eq("id", ticket.id);

  if (error) {
    return {
      success: false,
      error: "Nao foi possivel atualizar o status.",
    };
  }

  await admin.from("ticket_history").insert({
    ticket_id: ticket.id,
    changed_by: profile.id,
    old_status: ticket.status,
    new_status: parsed.data.status,
  });

  await notifyStatusChanged({
    ticket,
    changedBy: profile,
    newStatus: parsed.data.status,
  });

  revalidatePath(`/tickets/${ticket.id}`);
  revalidatePath("/tickets");
  revalidatePath("/dashboard");
  revalidatePath("/admin");

  return {
    success: true,
    message: `Status alterado para ${getStatusLabel(parsed.data.status)}.`,
  };
}

export async function assignTicketAction(input: {
  ticketId: string;
  assignedTo: string | null;
}) {
  const { profile } = await requireAuthenticatedUser();
  const admin = createAdminSupabaseClient();
  const parsed = assignTicketSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Dados de atribuicao invalidos.",
    };
  }

  const ticket = await getAccessibleTicket(parsed.data.ticketId);
  if (!ticket) {
    notFound();
  }

  const canAssign =
    profile.role === "admin" || profile.department === ticket.department;

  if (!canAssign) {
    return {
      success: false,
      error: "A atribuicao de responsavel e permitida apenas para o setor do chamado.",
    };
  }

  let assignee: Profile | null = null;

  if (parsed.data.assignedTo) {
    const assigneeResult = await getAssignableProfileOrError(
      parsed.data.assignedTo,
      ticket.department,
    );

    if (assigneeResult.error) {
      return {
        success: false,
        error: assigneeResult.error,
      };
    }

    assignee = assigneeResult.assignee;
  }

  if ((ticket.assigned_to ?? null) === (assignee?.id ?? null)) {
    return { success: true };
  }

  const { error } = await admin
    .from("tickets")
    .update({ assigned_to: assignee?.id ?? null })
    .eq("id", ticket.id);

  if (error) {
    return {
      success: false,
      error: "Nao foi possivel atualizar o responsavel.",
    };
  }

  if (assignee) {
    await notifyAssigned({
      ticket,
      assignedTo: assignee.id,
      actor: profile,
    });
  }

  revalidatePath(`/tickets/${ticket.id}`);
  revalidatePath("/tickets");
  revalidatePath("/admin");

  return {
    success: true,
    message: assignee ? "Responsavel atualizado." : "Chamado desatribuido.",
  };
}

export async function assignTicketToSelfAction(input: { ticketId: string }) {
  const { profile } = await requireAdminUser();
  return assignTicketAction({
    ticketId: input.ticketId,
    assignedTo: profile.id,
  });
}

export async function reassignDepartmentAction(input: {
  ticketId: string;
  department: string;
}) {
  await requireAdminUser();
  const admin = createAdminSupabaseClient();
  const parsed = reassignDepartmentSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Departamento invalido.",
    };
  }

  const { error } = await admin
    .from("tickets")
    .update({
      department: parsed.data.department,
      assigned_to: null,
    })
    .eq("id", parsed.data.ticketId);

  if (error) {
    return {
      success: false,
      error: "Nao foi possivel atualizar o departamento.",
    };
  }

  revalidatePath("/admin");
  revalidatePath("/tickets");
  revalidatePath(`/tickets/${parsed.data.ticketId}`);

  return {
    success: true,
  };
}

export async function toggleUserActiveAction(input: {
  userId: string;
  active: boolean;
}) {
  await requireAdminUser();
  const admin = createAdminSupabaseClient();
  const parsed = toggleUserActiveSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Usuario invalido.",
    };
  }

  const { error } = await admin
    .from("profiles")
    .update({ active: parsed.data.active })
    .eq("id", parsed.data.userId);

  if (error) {
    return {
      success: false,
      error: "Nao foi possivel atualizar o usuario.",
    };
  }

  revalidatePath("/admin");

  return {
    success: true,
  };
}
