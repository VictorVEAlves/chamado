import "server-only";

import { getPriorityLabel, getStatusLabel } from "@/lib/utils";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { Profile, Ticket, TicketPriority, TicketStatus } from "@/types";

interface BaseNotificationArgs {
  actorId?: string;
  ticketId: string;
  userIds: string[];
  message: string;
}

export async function createNotifications({
  actorId,
  ticketId,
  userIds,
  message,
}: BaseNotificationArgs) {
  const uniqueRecipients = [...new Set(userIds.filter(Boolean))].filter(
    (userId) => userId !== actorId,
  );

  if (!uniqueRecipients.length) return;

  const admin = createAdminSupabaseClient();
  await admin.from("notifications").insert(
    uniqueRecipients.map((userId) => ({
      user_id: userId,
      ticket_id: ticketId,
      message,
    })),
  );
}

export async function notifyStatusChanged(args: {
  ticket: Ticket;
  changedBy: Profile;
  newStatus: TicketStatus;
}) {
  await createNotifications({
    actorId: args.changedBy.id,
    ticketId: args.ticket.id,
    userIds: [args.ticket.created_by],
    message: `${args.changedBy.name} alterou o status do chamado "${args.ticket.title}" para ${getStatusLabel(args.newStatus)}.`,
  });
}

export async function notifyNewComment(args: {
  ticket: Ticket;
  commentedBy: Profile;
}) {
  await createNotifications({
    actorId: args.commentedBy.id,
    ticketId: args.ticket.id,
    userIds: [args.ticket.created_by, args.ticket.assigned_to ?? ""],
    message: `${args.commentedBy.name} comentou no chamado "${args.ticket.title}".`,
  });
}

export async function notifyAssigned(args: {
  ticket: Ticket;
  assignedTo: string;
  actor: Profile;
}) {
  await createNotifications({
    actorId: args.actor.id,
    ticketId: args.ticket.id,
    userIds: [args.assignedTo],
    message: `${args.actor.name} atribuiu o chamado "${args.ticket.title}" para você.`,
  });
}

export async function notifyPriorityChanged(args: {
  ticket: Ticket;
  actor: Profile;
  priority: TicketPriority;
}) {
  await createNotifications({
    actorId: args.actor.id,
    ticketId: args.ticket.id,
    userIds: [args.ticket.created_by, args.ticket.assigned_to ?? ""],
    message: `${args.actor.name} atualizou a prioridade do chamado "${args.ticket.title}" para ${getPriorityLabel(args.priority)}.`,
  });
}
