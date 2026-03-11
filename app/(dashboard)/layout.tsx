import type { ReactNode } from "react";
import { AuthHydrator } from "@/components/providers/AuthHydrator";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { requireAuthenticatedUser } from "@/lib/data/auth";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { supabase, profile, user } = await requireAuthenticatedUser();

  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("read", false);

  return (
    <>
      <AuthHydrator
        profile={profile}
        unreadCount={count ?? 0}
      />
      <div className="flex min-h-screen">
        <Sidebar profile={profile} />
        <div className="min-w-0 flex-1">
          <Header unreadCount={count ?? 0} />
          <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </>
  );
}
