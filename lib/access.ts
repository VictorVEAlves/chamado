import type { Profile } from "@/types";

type AccessProfile = Pick<Profile, "role" | "department">;

export function hasGlobalTicketAccess(profile: AccessProfile) {
  return profile.role === "admin" || profile.department === "diretoria";
}

export function hasAdminPanelAccess(profile: AccessProfile) {
  return hasGlobalTicketAccess(profile);
}
