import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Next.js Edge Middleware for Real-time Identity & Access Governance
 * Intercepts requests at the network edge before any React components render.
 * Prevents unauthorized access and role crossover (e.g. Student accessing TPO Portal).
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Retrieve session and role cookies
  const sessionToken = request.cookies.get("camptocorp_session")?.value;
  const accessToken = request.cookies.get("camptocorp_access_token")?.value;
  const userRole = request.cookies.get("camptocorp_role")?.value;

  const isAuthenticated = Boolean(sessionToken || accessToken);

  // 1. Guard Student Dashboard & Sub-routes
  if (pathname.startsWith("/dashboard/student")) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("role", "STUDENT");
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Role-Based Boundary: If user is authenticated as TPO, redirect to TPO portal
    if (userRole === "PLACEMENT_OFFICER") {
      return NextResponse.redirect(new URL("/dashboard/tpo", request.url));
    }
  }

  // 2. Guard TPO / Placement Officer Dashboard & Governance
  if (pathname.startsWith("/dashboard/tpo") || pathname.startsWith("/governance")) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("role", "PLACEMENT_OFFICER");
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Role-Based Boundary: If user is authenticated as Student, prevent privilege escalation
    if (userRole === "STUDENT") {
      return NextResponse.redirect(new URL("/dashboard/student", request.url));
    }
  }

  return NextResponse.next();
}

// Enforce middleware strictly on protected dashboard & administrative routes
export const config = {
  matcher: [
    "/dashboard/student/:path*",
    "/dashboard/tpo/:path*",
    "/governance/:path*",
  ],
};
