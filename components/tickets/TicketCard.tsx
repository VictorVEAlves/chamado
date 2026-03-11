import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface TicketCardProps {
  title: string;
  count: number;
  icon: LucideIcon;
  active?: boolean;
  onClick?: () => void;
}

export function TicketCard({
  title,
  count,
  icon: Icon,
  active = false,
  onClick,
}: TicketCardProps) {
  return (
    <button className="w-full text-left" onClick={onClick} type="button">
      <Card
        className={`h-full transition ${
          active
            ? "border-primary shadow-glow"
            : "hover:-translate-y-0.5 hover:border-primary/40"
        }`}
      >
        <CardContent className="flex h-full flex-col gap-5 p-6">
          <div className="flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/12 text-primary">
              <Icon className="h-6 w-6" />
            </div>
            <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground">
              {count} chamados abertos nesta área
            </p>
          </div>
        </CardContent>
      </Card>
    </button>
  );
}
