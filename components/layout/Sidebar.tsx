"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ClipboardList,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  PlusSquare,
  ShieldCheck,
} from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { logoutAction } from "@/lib/actions/auth";
import { getDepartmentLabel, getInitials } from "@/lib/utils";
import type { Profile } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface SidebarProps {
  profile: Profile;
}

const baseLinks = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/tickets",
    label: "Meus Chamados",
    icon: ClipboardList,
  },
  {
    href: "/tickets/new",
    label: "Abrir Chamado",
    icon: PlusSquare,
  },
];

function isLinkActive(pathname: string, href: string) {
  if (href === "/tickets") {
    return (
      pathname === "/tickets" ||
      (pathname.startsWith("/tickets/") && !pathname.startsWith("/tickets/new"))
    );
  }

  if (href === "/tickets/new") {
    return pathname === "/tickets/new";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar({ profile }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const links =
    profile.role === "admin"
      ? [
          ...baseLinks,
          {
            href: "/admin",
            label: "Painel Admin",
            icon: ShieldCheck,
          },
        ]
      : baseLinks;

  const handleLogout = () => {
    startTransition(async () => {
      const result = await logoutAction();
      if (!result.success) {
        toast.error(result.error ?? "Falha ao encerrar a sessão.");
        return;
      }

      toast.success("Sessão encerrada.");
      router.push("/login");
      router.refresh();
    });
  };

  const content = (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-6 py-7">
        <Link href="/dashboard" className="inline-flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-glow">
            FP
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
              Fast PDR
            </p>
            <p className="text-lg font-semibold">Chamados Internos</p>
          </div>
        </Link>
      </div>
      <nav className="flex-1 space-y-2 px-4 py-6">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = isLinkActive(pathname, link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMobileOpen(false)}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-glow"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border p-4">
        <div className="surface-gradient rounded-[1.5rem] p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border border-border">
              <AvatarImage src={profile.avatar_url ?? undefined} alt={profile.name} />
              <AvatarFallback>{getInitials(profile.name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{profile.name}</p>
              <p className="truncate text-xs uppercase tracking-[0.22em] text-muted-foreground">
                {getDepartmentLabel(profile.department)}
              </p>
            </div>
          </div>
          <Button
            className="mt-4 w-full"
            variant="secondary"
            onClick={handleLogout}
            disabled={isPending}
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
            Sair
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden h-screen w-[292px] shrink-0 border-r border-border bg-[#0d0d0d] lg:block">
        {content}
      </aside>
      <div className="fixed bottom-6 right-6 z-40 lg:hidden">
        <Dialog open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <DialogTrigger asChild>
            <Button size="icon" className="h-14 w-14 rounded-full">
              <Menu className="h-5 w-5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm p-0">
            <DialogTitle className="sr-only">Navegação</DialogTitle>
            {content}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
