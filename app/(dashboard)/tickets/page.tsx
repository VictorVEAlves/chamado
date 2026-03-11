import { EmptyState } from "@/components/shared/EmptyState";
import { PaginationControls } from "@/components/shared/PaginationControls";
import { TicketsFilters } from "@/components/tickets/TicketsFilters";
import { TicketsTable } from "@/components/tickets/TicketsTable";
import { getTicketsPageData } from "@/lib/data/tickets";
import type { TicketFilters } from "@/types";

interface TicketsPageProps {
  searchParams?: Record<string, string | string[] | undefined>;
}

function parseFilters(searchParams?: Record<string, string | string[] | undefined>): TicketFilters {
  const statusValue = typeof searchParams?.status === "string" ? searchParams.status : "";
  const priorityValue =
    typeof searchParams?.priority === "string" ? searchParams.priority : "";

  return {
    search: typeof searchParams?.search === "string" ? searchParams.search : undefined,
    status: statusValue ? (statusValue.split(",") as TicketFilters["status"]) : undefined,
    priority: priorityValue
      ? (priorityValue.split(",") as TicketFilters["priority"])
      : undefined,
    from: typeof searchParams?.from === "string" ? searchParams.from : undefined,
    to: typeof searchParams?.to === "string" ? searchParams.to : undefined,
    page:
      typeof searchParams?.page === "string"
        ? Number(searchParams.page)
        : undefined,
  };
}

export default async function TicketsPage({ searchParams }: TicketsPageProps) {
  const filters = parseFilters(searchParams);
  const { tickets, pagination, filters: parsedFilters } =
    await getTicketsPageData(filters);

  return (
    <div className="space-y-6">
      <TicketsFilters filters={parsedFilters} />
      {tickets.length ? (
        <>
          <TicketsTable tickets={tickets} />
          <PaginationControls {...pagination} />
        </>
      ) : (
        <EmptyState
          title="Nenhum chamado encontrado"
          description="Ajuste os filtros ou abra um novo chamado para iniciar o fluxo."
          ctaHref="/tickets/new"
          ctaLabel="Abrir chamado"
        />
      )}
    </div>
  );
}
