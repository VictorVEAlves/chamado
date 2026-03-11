import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDateTime, getInitials, getStatusLabel } from "@/lib/utils";
import type { TicketHistory } from "@/types";

export function StatusTimeline({ history }: { history: TicketHistory[] }) {
  if (!history.length) {
    return (
      <div className="rounded-[1.5rem] border border-dashed border-border p-5 text-sm text-muted-foreground">
        Nenhuma mudança de status registrada ainda.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {history.map((entry, index) => (
        <div key={entry.id} className="relative flex gap-4">
          {index !== history.length - 1 ? (
            <span className="absolute left-[19px] top-11 h-[calc(100%-1rem)] w-px bg-border" />
          ) : null}
          <Avatar className="mt-0.5 h-10 w-10 border border-border">
            <AvatarImage
              src={entry.user?.avatar_url ?? undefined}
              alt={entry.user?.name ?? "Usuário"}
            />
            <AvatarFallback>{getInitials(entry.user?.name ?? "Usuário")}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <p className="text-sm font-medium">
              {entry.user?.name ?? "Sistema"} alterou para{" "}
              <span className="text-primary">{getStatusLabel(entry.new_status)}</span>
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDateTime(entry.created_at)}
            </p>
            {entry.old_status ? (
              <p className="text-xs text-muted-foreground">
                Antes: {getStatusLabel(entry.old_status)}
              </p>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
