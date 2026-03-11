import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function ForbiddenPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <Card className="surface-gradient w-full max-w-xl">
        <CardContent className="flex flex-col items-center gap-6 py-14 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-destructive/15 text-destructive">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
              Erro 403
            </p>
            <h1 className="text-3xl font-semibold">Acesso restrito</h1>
            <p className="text-muted-foreground">
              Você não tem permissão para visualizar esta área administrativa.
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard">Voltar ao dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
