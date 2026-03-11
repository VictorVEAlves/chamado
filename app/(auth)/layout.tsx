import type { ReactNode } from "react";
import { Clock3, Shield, Ticket } from "lucide-react";
import { APP_NAME } from "@/lib/constants";

const heroFeatures = [
  {
    icon: Ticket,
    text: "Chamados por departamento",
  },
  {
    icon: Clock3,
    text: "Historico completo de status",
  },
  {
    icon: Shield,
    text: "Acesso por area, sem vazamento",
  },
];

export default function AuthLayout({ children }: { children: ReactNode }) {
  const currentYear = new Date().getFullYear();

  return (
    <main className="min-h-screen bg-[#111111] md:grid md:grid-cols-2">
      <section className="auth-hero-enter relative hidden min-h-screen overflow-hidden bg-[#0F0F0F] text-white md:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,107,0,0.15),transparent_38%)]" />
        <div className="relative flex h-full flex-col px-8 py-8 lg:px-12 lg:py-10 xl:px-16">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FF6B00] text-sm font-semibold text-white shadow-[0_18px_48px_rgba(255,107,0,0.18)]">
              FP
            </div>
            <div className="space-y-0.5">
              <p className="text-sm font-semibold">{APP_NAME}</p>
              <p className="text-xs uppercase tracking-[0.24em] text-[#888888]">
                Chamados Internos
              </p>
            </div>
          </div>

          <div className="flex flex-1 items-center justify-center">
            <div className="max-w-[460px] space-y-10 text-center">
              <div className="space-y-4">
                <h1 className="text-[clamp(2rem,3vw,2.75rem)] font-extrabold leading-[1.1] tracking-[-0.02em]">
                  Chamados internos sem ruido.
                </h1>
                <p className="text-base leading-[1.6] text-[#888888]">
                  Abra, acompanhe e resolva solicitacoes por area. Tudo em um lugar.
                </p>
              </div>

              <ul className="space-y-4">
                {heroFeatures.map((feature) => {
                  const Icon = feature.icon;

                  return (
                    <li key={feature.text} className="flex items-center justify-center gap-4">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF6B00]/12 text-[#FF6B00]">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="text-sm font-medium text-white/92">
                        {feature.text}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <p className="text-center text-xs tracking-[0.18em] text-[#666666]">
            (c) {currentYear} {APP_NAME}
          </p>
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center bg-[#111111] px-6 py-10 sm:px-10">
        <div className="auth-form-enter w-full max-w-[400px]">{children}</div>
      </section>
    </main>
  );
}
