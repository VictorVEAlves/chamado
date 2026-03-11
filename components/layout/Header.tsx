"use client";

import { usePathname } from "next/navigation";
import { getPageTitle } from "@/lib/utils";
import { NotificationBell } from "@/components/layout/NotificationBell";

interface HeaderProps {
  unreadCount: number;
}

export function Header({ unreadCount }: HeaderProps) {
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
            Fast PDR Tools
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        </div>
        <NotificationBell unreadCount={unreadCount} />
      </div>
    </header>
  );
}
