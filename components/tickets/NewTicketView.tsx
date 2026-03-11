"use client";

import {
  BriefcaseBusiness,
  ChartNoAxesColumn,
  Globe2,
  HandCoins,
  Megaphone,
  MonitorCog,
  ShoppingCart,
  Truck,
  Users,
} from "lucide-react";
import { useState } from "react";
import { DEPARTMENT_LABELS, DEPARTMENT_OPTIONS } from "@/lib/constants";
import type { Department, DepartmentCount } from "@/types";
import { TicketCard } from "@/components/tickets/TicketCard";
import { TicketForm } from "@/components/tickets/TicketForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const departmentIcons = {
  comercial: BriefcaseBusiness,
  marketing: Megaphone,
  comex: Globe2,
  compras: ShoppingCart,
  financeiro: HandCoins,
  logistica: Truck,
  ti: MonitorCog,
  rh: Users,
  diretoria: ChartNoAxesColumn,
} as const;

interface NewTicketViewProps {
  counts: DepartmentCount[];
}

export function NewTicketView({ counts }: NewTicketViewProps) {
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(
    null,
  );

  const countMap = counts.reduce<Record<string, number>>((acc, item) => {
    acc[item.department] = item.open_count;
    return acc;
  }, {});

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {DEPARTMENT_OPTIONS.map((department) => {
          const Icon = departmentIcons[department];
          return (
            <TicketCard
              key={department}
              title={DEPARTMENT_LABELS[department]}
              count={countMap[department] ?? 0}
              icon={Icon}
              active={selectedDepartment === department}
              onClick={() => setSelectedDepartment(department)}
            />
          );
        })}
      </div>
      <Dialog
        open={Boolean(selectedDepartment)}
        onOpenChange={(open) => {
          if (!open) setSelectedDepartment(null);
        }}
      >
        <DialogContent>
          {selectedDepartment ? (
            <>
              <DialogHeader>
                <DialogTitle>Novo chamado</DialogTitle>
                <DialogDescription>
                  Preencha os dados e registre a demanda para a área selecionada.
                </DialogDescription>
              </DialogHeader>
              <TicketForm department={selectedDepartment} />
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
