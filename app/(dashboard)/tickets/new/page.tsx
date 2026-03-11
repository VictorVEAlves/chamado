import { NewTicketView } from "@/components/tickets/NewTicketView";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDepartmentOpenCounts } from "@/lib/data/tickets";

export default async function NewTicketPage() {
  const counts = await getDepartmentOpenCounts();

  return (
    <div className="space-y-6">
      <Card className="surface-gradient">
        <CardHeader>
          <CardTitle className="text-2xl">Abrir chamado</CardTitle>
          <CardDescription>
            Escolha a área responsável e registre a demanda com prioridade e anexos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NewTicketView counts={counts} />
        </CardContent>
      </Card>
    </div>
  );
}
