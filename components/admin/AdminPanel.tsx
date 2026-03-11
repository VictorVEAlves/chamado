"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Loader2, Search, X } from "lucide-react";
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
import type {
  AdminPageFilters,
  AdminTab,
  PaginationState,
  Profile,
  Ticket,
} from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PaginationControls } from "@/components/shared/PaginationControls";
import { TicketPriorityBadge } from "@/components/tickets/TicketPriorityBadge";
import { TicketStatusBadge } from "@/components/tickets/TicketStatusBadge";

interface AdminPanelProps {
  activeTab: AdminTab;
  filters: AdminPageFilters;
  tickets: Ticket[];
  ticketsPagination: PaginationState;
  assignableUsers: Profile[];
  users: Profile[];
  usersPagination: PaginationState;
}

const ALL_STATUS_VALUE = "__all_status__";
const ALL_DEPARTMENT_VALUE = "__all_department__";
const ALL_USER_STATUS_VALUE = "__all_user_status__";

export function AdminPanel({
  activeTab,
  filters,
  tickets,
  ticketsPagination,
  assignableUsers,
  users,
  usersPagination,
}: AdminPanelProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const [userSearch, setUserSearch] = useState(filters.userSearch ?? "");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setUserSearch(filters.userSearch ?? "");
  }, [filters.userSearch]);

  const commit = useCallback(
    (patch: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(patch).forEach(([key, value]) => {
        if (value) params.set(key, value);
        else params.delete(key);
      });

      const nextQuery = params.toString();
      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname);
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    if (activeTab !== "users") return;

    const timeout = window.setTimeout(() => {
      if (userSearch === (filters.userSearch ?? "")) return;

      commit({
        tab: "users",
        userSearch: userSearch || undefined,
        usersPage: "1",
      });
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [activeTab, commit, filters.userSearch, userSearch]);

  const handleTabChange = (nextTab: string) => {
    const tab = nextTab === "users" ? "users" : "tickets";

    commit({
      tab,
      ticketsPage: tab === "tickets" ? "1" : undefined,
      usersPage: tab === "users" ? "1" : undefined,
    });
  };

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

  const handleTicketFilterChange = (
    key: "ticketStatus" | "ticketDepartment",
    value: string,
  ) => {
    const normalizedValue =
      value === ALL_STATUS_VALUE || value === ALL_DEPARTMENT_VALUE
        ? undefined
        : value;

    commit({
      tab: "tickets",
      [key]: normalizedValue,
      ticketsPage: "1",
    });
  };

  const handleUserActiveChange = (value: string) => {
    commit({
      tab: "users",
      userSearch: userSearch || undefined,
      userActive: value === ALL_USER_STATUS_VALUE ? undefined : value,
      usersPage: "1",
    });
  };

  const clearTicketFilters = () => {
    commit({
      tab: "tickets",
      ticketStatus: undefined,
      ticketDepartment: undefined,
      ticketsPage: "1",
    });
  };

  const clearUserFilters = () => {
    setUserSearch("");
    commit({
      tab: "users",
      userSearch: undefined,
      userActive: undefined,
      usersPage: "1",
    });
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange}>
      <TabsList>
        <TabsTrigger value="tickets">Chamados</TabsTrigger>
        <TabsTrigger value="users">Usuarios</TabsTrigger>
      </TabsList>
      <TabsContent value="tickets">
        <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[520px]">
            <Select
              value={filters.ticketStatus ?? ALL_STATUS_VALUE}
              onValueChange={(value) => handleTicketFilterChange("ticketStatus", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_STATUS_VALUE}>Todos os status</SelectItem>
                {STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status} value={status}>
                    {getStatusLabel(status)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filters.ticketDepartment ?? ALL_DEPARTMENT_VALUE}
              onValueChange={(value) =>
                handleTicketFilterChange("ticketDepartment", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por departamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_DEPARTMENT_VALUE}>
                  Todos os departamentos
                </SelectItem>
                {DEPARTMENT_OPTIONS.map((department) => (
                  <SelectItem key={department} value={department}>
                    {getDepartmentLabel(department)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {ticketsPagination.total} chamado(s)
            </p>
            <Button variant="ghost" onClick={clearTicketFilters}>
              <X className="h-4 w-4" />
              Limpar filtros
            </Button>
          </div>
        </div>
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
                {tickets.length ? (
                  tickets.map((ticket) => {
                    const rowPending = isPending && activeTicketId === ticket.id;
                    const departmentUsers = assignableUsers.filter(
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
                                {departmentUsers.map((user) => (
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
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-10 text-center text-sm text-muted-foreground"
                    >
                      Nenhum chamado encontrado para os filtros atuais.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="mt-4">
          <PaginationControls {...ticketsPagination} pageParam="ticketsPage" />
        </div>
      </TabsContent>
      <TabsContent value="users">
        <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_220px] xl:min-w-[520px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-11"
                placeholder="Buscar usuario por nome"
                value={userSearch}
                onChange={(event) => setUserSearch(event.target.value)}
              />
            </div>
            <Select
              value={
                filters.userActive === "all"
                  ? ALL_USER_STATUS_VALUE
                  : filters.userActive
              }
              onValueChange={handleUserActiveChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_USER_STATUS_VALUE}>Todos</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="inactive">Inativos</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">{usersPagination.total} usuario(s)</p>
            <Button variant="ghost" onClick={clearUserFilters}>
              <X className="h-4 w-4" />
              Limpar filtros
            </Button>
          </div>
        </div>
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
                {users.length ? (
                  users.map((user) => {
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
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-10 text-center text-sm text-muted-foreground"
                    >
                      Nenhum usuario encontrado para os filtros atuais.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="mt-4">
          <PaginationControls {...usersPagination} pageParam="usersPage" />
        </div>
      </TabsContent>
    </Tabs>
  );
}
