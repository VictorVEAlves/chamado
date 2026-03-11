import { AdminPanel } from "@/components/admin/AdminPanel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminPageData } from "@/lib/data/tickets";

interface AdminPageProps {
  searchParams?: Record<string, string | string[] | undefined>;
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const adminPageData = await getAdminPageData(searchParams);

  return (
    <div className="space-y-6">
      <Card className="surface-gradient">
        <CardHeader>
          <CardTitle className="text-2xl">Painel Admin</CardTitle>
          <CardDescription>
            Gerencie chamados de todos os departamentos e ative ou desative usuarios.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AdminPanel {...adminPageData} />
        </CardContent>
      </Card>
    </div>
  );
}
