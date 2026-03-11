import { ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MetricCardProps {
  title: string;
  value: number;
  accent: string;
  hint: string;
}

export function MetricCard({ title, value, accent, hint }: MetricCardProps) {
  return (
    <Card className="surface-gradient">
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div
          className="flex h-10 w-10 items-center justify-center rounded-2xl"
          style={{ backgroundColor: `${accent}20`, color: accent }}
        >
          <ArrowUpRight className="h-5 w-5" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold tracking-tight">{value}</div>
        <p className="mt-2 text-sm text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}
