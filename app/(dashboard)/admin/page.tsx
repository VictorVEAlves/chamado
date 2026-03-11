import { AdminPanel } from "@/components/admin/AdminPanel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminPageData } from "@/lib/data/tickets";

export default async function AdminPage() {
  const { tickets, users } = await getAdminPageData();

  return (
    <div className="space-y-6">
      <Card className="surface-gradient">
        <CardHeader>
          <CardTitle className="text-2xl">Painel Admin</CardTitle>
          <CardDescription>
            Gerencie chamados de todos os departamentos e ative ou desative usuários.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AdminPanel tickets={tickets} users={users} />
        </CardContent>
      </Card>
    </div>
  );
}
