"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { STATUS_COLORS } from "@/lib/constants";

interface TicketsStatusChartProps {
  data: Array<{
    status: string;
    total: number;
  }>;
}

const orderedColors = [
  STATUS_COLORS.pending,
  STATUS_COLORS.analyzing,
  STATUS_COLORS.in_progress,
  STATUS_COLORS.done,
];

export function TicketsStatusChart({ data }: TicketsStatusChartProps) {
  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>Chamados por status</CardTitle>
        <CardDescription>Últimos 30 dias dentro do escopo do usuário.</CardDescription>
      </CardHeader>
      <CardContent className="h-[320px] min-w-0">
        <div className="h-full w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%" minWidth={280} minHeight={320}>
            <BarChart data={data}>
              <CartesianGrid stroke="#2A2A2A" vertical={false} />
              <XAxis
                dataKey="status"
                tick={{ fill: "#888888", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: "#888888", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.03)" }}
                contentStyle={{
                  backgroundColor: "#111111",
                  borderColor: "#2A2A2A",
                  borderRadius: 16,
                  color: "#FFFFFF",
                }}
              />
              <Bar dataKey="total" radius={[14, 14, 4, 4]}>
                {data.map((entry, index) => (
                  <Cell
                    key={`${entry.status}-${index}`}
                    fill={orderedColors[index] ?? "#FF6B00"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
