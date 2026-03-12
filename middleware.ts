import { NextResponse, type NextRequest } from "next/server";
import { hasAdminPanelAccess } from "@/lib/access";
import { updateSession } from "@/lib/supabase/middleware";

const protectedPrefixes = ["/dashboard", "/tickets", "/admin"];
const authPrefixes = ["/login", "/register"];

export async function middleware(request: NextRequest) {
  const { supabase, response, user } = await updateSession(request);
  const pathname = request.nextUrl.pathname;
  const isProtectedRoute = protectedPrefixes.some((prefix) =>
    pathname.startsWith(prefix),
  );
  const isAuthRoute = authPrefixes.some((prefix) => pathname.startsWith(prefix));
  const isAdminRoute = pathname.startsWith("/admin");

  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectedFrom", pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthRoute && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  if (!user) {
    return response;
  }

  if (isAdminRoute) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("active, role, department")
      .eq("id", user.id)
      .maybeSingle();

    if (profile && !profile.active) {
      await supabase.auth.signOut();
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("disabled", "1");
      return NextResponse.redirect(url);
    }

    if (profile && !hasAdminPanelAccess(profile)) {
      const url = request.nextUrl.clone();
      url.pathname = "/403";
      return NextResponse.rewrite(url, { status: 403 });
    }
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/tickets/:path*", "/admin/:path*", "/login", "/register"],
};
