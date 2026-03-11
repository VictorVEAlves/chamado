import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { TicketsStatusChart } from "@/components/dashboard/TicketsStatusChart";
import { EmptyState } from "@/components/shared/EmptyState";
import { MetricCard } from "@/components/shared/MetricCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardData } from "@/lib/data/dashboard";
import { formatDateTime, formatTicketId } from "@/lib/utils";
import { TicketPriorityBadge } from "@/components/tickets/TicketPriorityBadge";
import { TicketStatusBadge } from "@/components/tickets/TicketStatusBadge";

export default async function DashboardPage() {
  const { metrics, chartData, recentTickets } = await getDashboardData();

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-4">
        <MetricCard
          title="Total de chamados abertos"
          value={metrics.openTotal}
          accent="#FF6B00"
          hint="Todos os tickets não concluídos."
        />
        <MetricCard
          title="Em progresso"
          value={metrics.inProgressTotal}
          accent="#F59E0B"
          hint="Tickets já em execução."
        />
        <MetricCard
          title="Urgentes"
          value={metrics.urgentTotal}
          accent="#EF4444"
          hint="Demandas críticas e ainda abertas."
        />
        <MetricCard
          title="Concluídos no mês"
          value={metrics.doneThisMonth}
          accent="#10B981"
          hint="Chamados finalizados no mês corrente."
        />
      </section>
      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <TicketsStatusChart data={chartData} />
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Chamados recentes</CardTitle>
            <Button asChild size="sm" variant="ghost">
              <Link href="/tickets">
                Ver todos
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentTickets.length ? (
              <div className="space-y-4">
                {recentTickets.map((ticket) => (
                  <Link
                    key={ticket.id}
                    href={`/tickets/${ticket.id}`}
                    className="block rounded-[1.5rem] border border-border bg-[#111111] p-4 transition hover:border-primary/40"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                        {formatTicketId(ticket.id)}
                      </span>
                      <TicketStatusBadge status={ticket.status} />
                      <TicketPriorityBadge priority={ticket.priority} />
                    </div>
                    <h3 className="mt-3 text-base font-semibold">{ticket.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Aberto em {formatDateTime(ticket.created_at)}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState
                title="Nenhum chamado recente"
                description="Assim que um novo ticket for aberto ele aparecerá aqui."
                ctaHref="/tickets/new"
                ctaLabel="Abrir primeiro chamado"
              />
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
