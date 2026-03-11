import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Profile } from "@/types";

export const getCurrentAuthContext = cache(async () => {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      supabase,
      user: null,
      profile: null,
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return {
    supabase,
    user,
    profile: (profile as Profile | null) ?? null,
  };
});

export async function requireAuthenticatedUser() {
  const context = await getCurrentAuthContext();

  if (!context.user) {
    redirect("/login");
  }

  if (!context.profile) {
    redirect("/login");
  }

  if (!context.profile.active) {
    redirect("/login?disabled=1");
  }

  return context as {
    supabase: ReturnType<typeof createServerSupabaseClient>;
    user: User;
    profile: Profile;
  };
}

export async function requireAdminUser() {
  const context = await requireAuthenticatedUser();

  if (context.profile.role !== "admin") {
    redirect("/403");
  }

  return context;
}
