import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hasSupabaseConfig, getSupabaseConfig } from "./config";
import type { Database } from "@/lib/database.types";
import type { UserRole } from "@/lib/types";

const protectedRouteRoles: Array<{ prefix: string; roles: UserRole[] }> = [
  { prefix: "/admin", roles: ["admin"] },
  { prefix: "/pms", roles: ["admin", "engine"] },
  { prefix: "/voyages", roles: ["admin", "deck", "engine"] },
];

function redirectWithPath(request: NextRequest, pathname: string, search = "") {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = search;
  return NextResponse.redirect(url);
}

export async function updateSession(request: NextRequest) {
  const isAuthRoute = request.nextUrl.pathname.startsWith("/login");

  if (!hasSupabaseConfig()) {
    if (!isAuthRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({
    request,
  });
  const { url, anonKey } = getSupabaseConfig();

  const supabase = createServerClient<Database>(
    url!,
    anonKey!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options));
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isProtectedRoute = !isAuthRoute && !request.nextUrl.pathname.startsWith("/auth");

  if (!user && isProtectedRoute) {
    return redirectWithPath(request, "/login");
  }

  if (user && isAuthRoute) {
    return redirectWithPath(request, "/dashboard");
  }

  if (user) {
    const routeRule = protectedRouteRoles.find((route) => request.nextUrl.pathname.startsWith(route.prefix));

    if (routeRule) {
      const result = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
      const data = result.data as { role: UserRole } | null;
      const role = data?.role;

      if (!role || !routeRule.roles.includes(role)) {
        return redirectWithPath(request, "/dashboard", "?error=unauthorized");
      }
    }
  }

  return supabaseResponse;
}
