"use client";

import { useRouter } from "next/navigation";
import { Loader2, UserCheck } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import {
  assignTicketAction,
  changeTicketStatusAction,
} from "@/lib/actions/tickets";
import {
  DEPARTMENT_LABELS,
  STATUS_OPTIONS,
  UNASSIGNED_ASSIGNEE_VALUE,
} from "@/lib/constants";
import { formatDateTime, getStatusLabel } from "@/lib/utils";
import type { Profile, Ticket, TicketHistory } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { TicketPriorityBadge } from "@/components/tickets/TicketPriorityBadge";
import { TicketStatusBadge } from "@/components/tickets/TicketStatusBadge";
import { StatusTimeline } from "@/components/tickets/StatusTimeline";

interface TicketDetailSidebarProps {
  ticket: Ticket;
  history: TicketHistory[];
  profile: Profile;
  assignableUsers: Profile[];
}

export function TicketDetailSidebar({
  ticket,
  history,
  profile,
  assignableUsers,
}: TicketDetailSidebarProps) {
  const router = useRouter();
  const [isStatusPending, startStatusTransition] = useTransition();
  const [isAssignPending, startAssignTransition] = useTransition();
  const canChangeStatus =
    profile.role === "admin" || ticket.assigned_to === profile.id;
  const canAssignResponsibility =
    profile.role === "admin" || profile.department === ticket.department;

  const handleStatusChange = (status: string) => {
    startStatusTransition(async () => {
      const result = await changeTicketStatusAction({
        ticketId: ticket.id,
        status,
      });

      if (!result.success) {
        toast.error(result.error ?? "Nao foi possivel atualizar o status.");
        return;
      }

      toast.success(result.message ?? "Status atualizado.");
      router.refresh();
    });
  };

  const handleAssign = (value: string) => {
    const assignedTo =
      value === UNASSIGNED_ASSIGNEE_VALUE ? null : value;

    startAssignTransition(async () => {
      const result = await assignTicketAction({
        ticketId: ticket.id,
        assignedTo,
      });

      if (!result.success) {
        toast.error(result.error ?? "Nao foi possivel atualizar o responsavel.");
        return;
      }

      toast.success(result.message ?? "Responsavel atualizado.");
      router.refresh();
    });
  };

  const assignValue = ticket.assigned_to ?? UNASSIGNED_ASSIGNEE_VALUE;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informacoes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="grid gap-4">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                Status atual
              </p>
              <TicketStatusBadge status={ticket.status} />
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                Prioridade
              </p>
              <TicketPriorityBadge priority={ticket.priority} />
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                Departamento
              </p>
              <p>{DEPARTMENT_LABELS[ticket.department]}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                Aberto por
              </p>
              <p>{ticket.creator?.name ?? "Usuario"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                Responsavel
              </p>
              <p>{ticket.assignee?.name ?? "Ainda nao atribuido"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                Data de abertura
              </p>
              <p>{formatDateTime(ticket.created_at)}</p>
            </div>
          </div>
          <Separator />
          {canAssignResponsibility ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                <UserCheck className="h-4 w-4" />
                Definir responsavel
              </div>
              {assignableUsers.length ? (
                <Select
                  value={assignValue}
                  onValueChange={handleAssign}
                  disabled={isAssignPending}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um responsavel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={UNASSIGNED_ASSIGNEE_VALUE}>
                      Sem responsavel
                    </SelectItem>
                    {assignableUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nenhum usuario ativo disponivel para este departamento.
                </p>
              )}
              {isAssignPending ? (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Atualizando responsavel...
                </div>
              ) : null}
            </div>
          ) : null}
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
              Alterar status
            </p>
            {canChangeStatus ? (
              <Select
                defaultValue={ticket.status}
                onValueChange={handleStatusChange}
                disabled={isStatusPending}
              >
                <SelectTrigger>
                  <SelectValue placeholder={getStatusLabel(ticket.status)} />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status} value={status}>
                      {getStatusLabel(status)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm text-muted-foreground">
                Apenas admins ou o responsavel atribuido podem alterar o status.
              </p>
            )}
            {isStatusPending ? (
              <Button disabled variant="secondary" className="w-full">
                <Loader2 className="h-4 w-4 animate-spin" />
                Atualizando status...
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Historico de status</CardTitle>
        </CardHeader>
        <CardContent>
          <StatusTimeline history={history} />
        </CardContent>
      </Card>
    </div>
  );
}
