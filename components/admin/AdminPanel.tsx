"use client";

import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  assignTicketAction,
  changeTicketStatusAction,
  reassignDepartmentAction,
  toggleUserActiveAction,
} from "@/lib/actions/tickets";
import {
  DEPARTMENT_OPTIONS,
  STATUS_OPTIONS,
  UNASSIGNED_ASSIGNEE_VALUE,
} from "@/lib/constants";
import { getDepartmentLabel, getStatusLabel } from "@/lib/utils";
import type { Profile, Ticket } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { TicketPriorityBadge } from "@/components/tickets/TicketPriorityBadge";
import { TicketStatusBadge } from "@/components/tickets/TicketStatusBadge";

interface AdminPanelProps {
  tickets: Ticket[];
  users: Profile[];
}

export function AdminPanel({ tickets, users }: AdminPanelProps) {
  const router = useRouter();
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const wrapTicketAction = (
    ticketId: string,
    action: () => Promise<{ success: boolean; error?: string; message?: string }>,
    successMessage: string,
  ) => {
    setActiveTicketId(ticketId);
    startTransition(async () => {
      const result = await action();
      setActiveTicketId(null);

      if (!result.success) {
        toast.error(result.error ?? "Nao foi possivel atualizar o chamado.");
        return;
      }

      toast.success(result.message ?? successMessage);
      router.refresh();
    });
  };

  const wrapUserAction = (
    userId: string,
    action: () => Promise<{ success: boolean; error?: string }>,
    successMessage: string,
  ) => {
    setActiveUserId(userId);
    startTransition(async () => {
      const result = await action();
      setActiveUserId(null);

      if (!result.success) {
        toast.error(result.error ?? "Nao foi possivel atualizar o usuario.");
        return;
      }

      toast.success(successMessage);
      router.refresh();
    });
  };

  return (
    <Tabs defaultValue="tickets">
      <TabsList>
        <TabsTrigger value="tickets">Chamados</TabsTrigger>
        <TabsTrigger value="users">Usuarios</TabsTrigger>
      </TabsList>
      <TabsContent value="tickets">
        <div className="overflow-hidden rounded-[1.5rem] border border-border">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border text-sm">
              <thead className="bg-[#121212] text-left text-xs uppercase tracking-[0.22em] text-muted-foreground">
                <tr>
                  <th className="px-5 py-4">Titulo</th>
                  <th className="px-5 py-4">Departamento</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Prioridade</th>
                  <th className="px-5 py-4">Criado por</th>
                  <th className="px-5 py-4">Responsavel</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card/80">
                {tickets.map((ticket) => {
                  const rowPending = isPending && activeTicketId === ticket.id;
                  const assignableUsers = users.filter(
                    (user) => user.active && user.department === ticket.department,
                  );

                  return (
                    <tr key={ticket.id}>
                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          <p className="font-medium">{ticket.title}</p>
                          <p className="line-clamp-1 text-xs text-muted-foreground">
                            {ticket.description}
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <Select
                          value={ticket.department}
                          onValueChange={(department) =>
                            wrapTicketAction(
                              ticket.id,
                              () =>
                                reassignDepartmentAction({
                                  ticketId: ticket.id,
                                  department,
                                }),
                              "Departamento atualizado.",
                            )
                          }
                          disabled={rowPending}
                        >
                          <SelectTrigger className="w-[190px]">
                            <SelectValue placeholder={getDepartmentLabel(ticket.department)} />
                          </SelectTrigger>
                          <SelectContent>
                            {DEPARTMENT_OPTIONS.map((department) => (
                              <SelectItem key={department} value={department}>
                                {getDepartmentLabel(department)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-5 py-4">
                        <div className="space-y-2">
                          <TicketStatusBadge status={ticket.status} />
                          <Select
                            value={ticket.status}
                            onValueChange={(status) =>
                              wrapTicketAction(
                                ticket.id,
                                () =>
                                  changeTicketStatusAction({
                                    ticketId: ticket.id,
                                    status,
                                  }),
                                `Status alterado para ${getStatusLabel(
                                  status as Ticket["status"],
                                )}.`,
                              )
                            }
                            disabled={rowPending}
                          >
                            <SelectTrigger className="w-[190px]">
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
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <TicketPriorityBadge priority={ticket.priority} />
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">
                        {ticket.creator?.name ?? "Usuario"}
                      </td>
                      <td className="px-5 py-4">
                        <div className="space-y-2">
                          <Select
                            value={ticket.assigned_to ?? UNASSIGNED_ASSIGNEE_VALUE}
                            onValueChange={(assignedTo) =>
                              wrapTicketAction(
                                ticket.id,
                                () =>
                                  assignTicketAction({
                                    ticketId: ticket.id,
                                    assignedTo:
                                      assignedTo === UNASSIGNED_ASSIGNEE_VALUE
                                        ? null
                                        : assignedTo,
                                  }),
                                "Responsavel atualizado.",
                              )
                            }
                            disabled={rowPending}
                          >
                            <SelectTrigger className="w-[220px]">
                              <SelectValue
                                placeholder={ticket.assignee?.name ?? "Sem responsavel"}
                              />
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
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {rowPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : null}
                            <span>{ticket.assignee?.name ?? "Nao atribuido"}</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </TabsContent>
      <TabsContent value="users">
        <div className="overflow-hidden rounded-[1.5rem] border border-border">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border text-sm">
              <thead className="bg-[#121212] text-left text-xs uppercase tracking-[0.22em] text-muted-foreground">
                <tr>
                  <th className="px-5 py-4">Nome</th>
                  <th className="px-5 py-4">Departamento</th>
                  <th className="px-5 py-4">Perfil</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Acao</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card/80">
                {users.map((user) => {
                  const rowPending = isPending && activeUserId === user.id;
                  return (
                    <tr key={user.id}>
                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          <p className="font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.id}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4">{getDepartmentLabel(user.department)}</td>
                      <td className="px-5 py-4 uppercase text-muted-foreground">
                        {user.role}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                            user.active
                              ? "bg-[#10B981]/15 text-[#10B981]"
                              : "bg-[#EF4444]/15 text-[#EF4444]"
                          }`}
                        >
                          {user.active ? "Ativo" : "Inativo"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <Button
                          variant="secondary"
                          onClick={() =>
                            wrapUserAction(
                              user.id,
                              () =>
                                toggleUserActiveAction({
                                  userId: user.id,
                                  active: !user.active,
                                }),
                              user.active ? "Conta desativada." : "Conta reativada.",
                            )
                          }
                          disabled={rowPending}
                        >
                          {rowPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : null}
                          {user.active ? "Desativar" : "Ativar"}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}
