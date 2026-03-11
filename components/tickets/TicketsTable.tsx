import Link from "next/link";
import { formatDateShort, formatTicketId } from "@/lib/utils";
import type { Ticket } from "@/types";
import { TicketPriorityBadge } from "@/components/tickets/TicketPriorityBadge";
import { TicketStatusBadge } from "@/components/tickets/TicketStatusBadge";

export function TicketsTable({ tickets }: { tickets: Ticket[] }) {
  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-border">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-[#121212] text-left text-xs uppercase tracking-[0.22em] text-muted-foreground">
            <tr>
              <th className="px-5 py-4">ID</th>
              <th className="px-5 py-4">Título</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Prioridade</th>
              <th className="px-5 py-4">Abertura</th>
              <th className="px-5 py-4">Atualização</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-card/80">
            {tickets.map((ticket) => (
              <tr key={ticket.id} className="transition hover:bg-secondary/50">
                <td className="whitespace-nowrap px-5 py-4 text-muted-foreground">
                  <Link href={`/tickets/${ticket.id}`}>{formatTicketId(ticket.id)}</Link>
                </td>
                <td className="min-w-[280px] px-5 py-4">
                  <Link href={`/tickets/${ticket.id}`} className="block space-y-1">
                    <p className="font-medium">{ticket.title}</p>
                    <p className="line-clamp-1 text-xs text-muted-foreground">
                      {ticket.description}
                    </p>
                  </Link>
                </td>
                <td className="px-5 py-4">
                  <TicketStatusBadge status={ticket.status} />
                </td>
                <td className="px-5 py-4">
                  <TicketPriorityBadge priority={ticket.priority} />
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-muted-foreground">
                  {formatDateShort(ticket.created_at)}
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-muted-foreground">
                  {formatDateShort(ticket.updated_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
