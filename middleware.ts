/**
 * Next.js Edge middleware — protects /admin/* routes.
 *
 * Strategy:
 *   1. All /admin/* requests require an access_token cookie (path=/, set by
 *      auth.ts after login/refresh). If absent, redirect to /login?next=<path>.
 *   2. /admin/csi/* routes additionally require role = "csi_staff" in the
 *      token payload. Any other role is redirected to /admin/dashboard.
 *
 * Why access_token and not refresh_token:
 *   The backend sets refresh_token with Path=/api/v1/auth, so the browser never
 *   sends it for /admin/* requests. The access_token cookie (Path=/) is visible
 *   to this middleware on every request.
 *
 * The JWT is decoded (not verified — Edge runtime has no secret key) to read
 * the role claim. Full verification happens on the backend per API call.
 * This is an ergonomic UX gate, not a security boundary.
 */

import { NextRequest, NextResponse } from "next/server";

const ACCESS_COOKIE = "access_token";

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get(ACCESS_COOKIE)?.value ?? null;

  // ── No token → redirect to login ─────────────────────────────────────────
  if (!token) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── CSI-staff-only routes ─────────────────────────────────────────────────
  if (pathname.startsWith("/admin/csi")) {
    const payload = decodeJwtPayload(token);
    const role = payload?.role as string | undefined;
    if (role !== "csi_staff") {
      const dashboardUrl = request.nextUrl.clone();
      dashboardUrl.pathname = "/admin/dashboard";
      dashboardUrl.search = "";
      return NextResponse.redirect(dashboardUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
