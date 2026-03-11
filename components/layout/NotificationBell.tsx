"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Loader2 } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  getRecentNotificationsAction,
  markAllNotificationsReadAction,
} from "@/lib/actions/notifications";
import { useAuthStore } from "@/store/useAuthStore";
import type { Notification } from "@/types";
import { fromNow } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";

interface NotificationBellProps {
  unreadCount: number;
}

export function NotificationBell({ unreadCount: initialUnreadCount }: NotificationBellProps) {
  const router = useRouter();
  const setUnreadCount = useAuthStore((state) => state.setUnreadCount);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCountLocal] = useState(initialUnreadCount);
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    setUnreadCountLocal(initialUnreadCount);
    setUnreadCount(initialUnreadCount);
    setHasLoaded(false);
    setNotifications([]);
  }, [initialUnreadCount, setUnreadCount]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);

    if (!open || hasLoaded) {
      return;
    }

    startTransition(async () => {
      const result = await getRecentNotificationsAction();

      if (!result.success) {
        toast.error(result.error ?? "Falha ao carregar notificacoes.");
        return;
      }

      setNotifications(result.notifications);
      setHasLoaded(true);
    });
  };

  const handleMarkAllAsRead = () => {
    startTransition(async () => {
      const result = await markAllNotificationsReadAction();
      if (!result.success) {
        toast.error(result.error ?? "Falha ao atualizar notificações.");
        return;
      }

      setNotifications((current) => current.map((item) => ({ ...item, read: true })));
      setUnreadCountLocal(0);
      setUnreadCount(0);
      toast.success("Notificações marcadas como lidas.");
      router.refresh();
    });
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <button
          className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-card/80 transition hover:bg-secondary"
          type="button"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 ? (
            <span className="absolute right-2 top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[360px]">
        <div className="flex items-center justify-between px-2 py-1">
          <DropdownMenuLabel className="px-0 py-0">Notificações</DropdownMenuLabel>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={isPending || unreadCount === 0}
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Marcar todas
          </Button>
        </div>
        <DropdownMenuSeparator />
        <ScrollArea className="max-h-[360px]">
          {isPending && !hasLoaded ? (
            <div className="px-4 py-10 text-center text-sm text-muted-foreground">
              Carregando notificacoes...
            </div>
          ) : notifications.length ? (
            <div className="space-y-1">
              {notifications.map((notification) => (
                <DropdownMenuItem key={notification.id} asChild className="p-0">
                  <Link
                    href={notification.ticket_id ? `/tickets/${notification.ticket_id}` : "#"}
                    className="block w-full rounded-xl p-3"
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`mt-1.5 h-2.5 w-2.5 rounded-full ${
                          notification.read ? "bg-border" : "bg-primary"
                        }`}
                      />
                      <div className="space-y-1">
                        <p className="text-sm leading-6 text-foreground">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {fromNow(notification.created_at)}
                        </p>
                      </div>
                    </div>
                  </Link>
                </DropdownMenuItem>
              ))}
            </div>
          ) : (
            <div className="px-4 py-10 text-center text-sm text-muted-foreground">
              Nenhuma notificação recente.
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
