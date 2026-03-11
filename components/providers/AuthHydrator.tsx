"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import type { Profile } from "@/types";

interface AuthHydratorProps {
  profile: Profile | null;
  unreadCount: number;
}

export function AuthHydrator({
  profile,
  unreadCount,
}: AuthHydratorProps) {
  const setAuthContext = useAuthStore((state) => state.setAuthContext);

  useEffect(() => {
    setAuthContext({ profile, unreadCount });
  }, [profile, setAuthContext, unreadCount]);

  return null;
}
