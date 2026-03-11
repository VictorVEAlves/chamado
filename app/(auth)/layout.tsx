import type { ReactNode } from "react";
import { APP_NAME } from "@/lib/constants";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
      <section className="relative hidden overflow-hidden border-r border-border lg:block">
        <div className="absolute inset-0 bg-auth-grid bg-[size:42px_42px] opacity-60" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,107,0,0.16),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.12),transparent_34%)]" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
              {APP_NAME}
            </div>
            <div className="max-w-xl space-y-5">
              <h1 className="text-5xl font-semibold tracking-tight text-balance">
                Centralize demandas internas com um fluxo claro e rastreável.
              </h1>
              <p className="text-lg leading-8 text-muted-foreground">
                Abra chamados por área, acompanhe prioridades, comente no contexto
                certo e mantenha o histórico completo de cada solicitação.
              </p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ["Áreas", "9 departamentos"],
              ["Histórico", "Timeline por status"],
              ["Segurança", "Supabase + RLS"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-[1.5rem] border border-border bg-black/20 p-5"
              >
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                  {label}
                </p>
                <p className="mt-3 text-lg font-semibold">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-lg animate-fade-up">{children}</div>
      </section>
    </main>
  );
}
