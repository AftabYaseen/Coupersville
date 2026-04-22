import { NextResponse } from "next/server";
import { createMiddlewareClient } from "@/lib/supabase/middleware";

// Routes that never require auth
const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/accept-invite",
];

// Routes only super_admin may access
const SUPER_ADMIN_ROUTES = ["/super-admin"];

// Routes only management (or above) may access
const MANAGEMENT_ROUTES = [
  "/management-dashboard",
  "/activity-logs",
  "/reports",
  "/guards",
  "/supervisors",
  "/user-roles",
  "/company-settings",
];

function isPublic(pathname) {
  return PUBLIC_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(r + "/")
  );
}

function isSuperAdminRoute(pathname) {
  return SUPER_ADMIN_ROUTES.some((r) => pathname.startsWith(r));
}

function isManagementRoute(pathname) {
  return MANAGEMENT_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(r + "/")
  );
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Static assets and Next internals - skip
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const response = NextResponse.next({ request });
  const supabase = createMiddlewareClient(request, response);

  // Refresh session - this keeps the cookie alive
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Public route - no auth needed
  if (isPublic(pathname)) {
    // If the user is already logged in and hits /login or /register,
    // redirect them to the app
    if (user && (pathname === "/login" || pathname === "/register")) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile) {
        const dest = dashboardForRole(profile.role);
        return NextResponse.redirect(new URL(dest, request.url));
      }
    }
    return response;
  }

  // Protected route - must be authenticated
  if (!user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Fetch profile for role checks
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_active, company_id")
    .eq("id", user.id)
    .single();

  // No profile or deactivated account
  if (!profile || !profile.is_active) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Super admin route guard
  if (isSuperAdminRoute(pathname) && profile.role !== "super_admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Management route guard
  if (
    isManagementRoute(pathname) &&
    !["super_admin", "management"].includes(profile.role)
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

function dashboardForRole(role) {
  switch (role) {
    case "super_admin": return "/super-admin";
    case "management":  return "/management-dashboard";
    default:            return "/dashboard";
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
