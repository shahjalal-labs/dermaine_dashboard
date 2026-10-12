import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const protectedRoutes = ["/admin", "/dashboard", "/profile", "/organization"];

const authRoutes = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-otp",
  "/admin/register",
  "/organization/register",
];

function isTokenExpired(token: string): boolean {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return true;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "=",
    );
    const jsonPayload = atob(padded);
    const decoded = JSON.parse(jsonPayload);
    if (typeof decoded.exp === "number") {
      return Date.now() >= decoded.exp * 1000;
    }
    return false;
  } catch {
    return false;
  }
}

function getRoleFromToken(token?: string): string | null {
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "=",
    );
    const decoded = JSON.parse(atob(padded));
    return (decoded?.role || "").toLowerCase();
  } catch {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const rawToken =
    request.cookies.get("token")?.value ||
    request.cookies.get("accessToken")?.value;
  const isInvalidOrExpired = !rawToken || isTokenExpired(rawToken);

  const isProtectedRoute = protectedRoutes.some(
    (route) =>
      pathname.startsWith(route) &&
      !pathname.startsWith("/admin/register") &&
      !pathname.startsWith("/organization/register"),
  );

  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  if (isProtectedRoute && isInvalidOrExpired) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    const response = NextResponse.redirect(loginUrl);
    if (rawToken) {
      response.cookies.set("token", "", { path: "/", maxAge: 0 });
      response.cookies.set("accessToken", "", { path: "/", maxAge: 0 });
    }
    return response;
  }

  if (isAuthRoute && !isInvalidOrExpired) {
    const role = getRoleFromToken(rawToken);
    const targetDashboard =
      role === "organization" || role === "organizationmember"
        ? "/organization/dashboard"
        : "/admin/dashboard";
    return NextResponse.redirect(new URL(targetDashboard, request.url));
  }

  return NextResponse.next();
}
