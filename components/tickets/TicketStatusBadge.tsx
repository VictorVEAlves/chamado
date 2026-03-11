import { Badge } from "@/components/ui/badge";
import type { TicketStatus } from "@/types";
import { getStatusColor, getStatusLabel } from "@/lib/utils";

export function TicketStatusBadge({ status }: { status: TicketStatus }) {
  const color = getStatusColor(status);
  return (
    <Badge
      className="border"
      style={{
        borderColor: `${color}45`,
        backgroundColor: `${color}1f`,
        color,
      }}
    >
      {getStatusLabel(status)}
    </Badge>
  );
}
