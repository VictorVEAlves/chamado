"use client";

import { create } from "zustand";
import type { Session } from "@supabase/supabase-js";
import type { Department, Profile, UserRole } from "@/types";

interface AuthStoreState {
  session: Session | null;
  profile: Profile | null;
  role: UserRole | null;
  department: Department | null;
  unreadCount: number;
  setAuthContext: (payload: {
    session?: Session | null;
    profile: Profile | null;
    unreadCount?: number;
  }) => void;
  clearAuthContext: () => void;
  setUnreadCount: (count: number) => void;
}

export const useAuthStore = create<AuthStoreState>((set) => ({
  session: null,
  profile: null,
  role: null,
  department: null,
  unreadCount: 0,
  setAuthContext: ({ session = null, profile, unreadCount = 0 }) =>
    set({
      session,
      profile,
      role: profile?.role ?? null,
      department: profile?.department ?? null,
      unreadCount,
    }),
  clearAuthContext: () =>
    set({
      session: null,
      profile: null,
      role: null,
      department: null,
      unreadCount: 0,
    }),
  setUnreadCount: (count) => set({ unreadCount: count }),
}));
