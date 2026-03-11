import { Badge } from "@/components/ui/badge";
import type { TicketPriority } from "@/types";
import { getPriorityColor, getPriorityLabel } from "@/lib/utils";

export function TicketPriorityBadge({ priority }: { priority: TicketPriority }) {
  const color = getPriorityColor(priority);
  return (
    <Badge
      className="border"
      style={{
        borderColor: `${color}45`,
        backgroundColor: `${color}1f`,
        color,
      }}
    >
      {getPriorityLabel(priority)}
    </Badge>
  );
}
