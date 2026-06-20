import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_ROLES = ["superadmin", "admin", "catalog_manager", "order_manager", "finance", "support"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession =
    request.cookies.has("dropmart_access") ||
    request.cookies.has("dropmart_refresh");
  const role = request.cookies.get("dropmart_role")?.value;

  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register");
  const isAdminRoute = pathname.startsWith("/admin");
  const isSupplierRoute = pathname.startsWith("/supplier");
  const isDeliveryRoute = pathname.startsWith("/delivery");
  const isAccountRoute = pathname.startsWith("/account");

  if (!hasSession && (isAdminRoute || isSupplierRoute || isDeliveryRoute || isAccountRoute)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (hasSession && role) {
    if (isAuthPage) {
      if (role === "supplier") return NextResponse.redirect(new URL("/supplier", request.url));
      if (ADMIN_ROLES.includes(role)) return NextResponse.redirect(new URL("/admin", request.url));
      if (role === "delivery") return NextResponse.redirect(new URL("/delivery", request.url));
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (isAdminRoute && !ADMIN_ROLES.includes(role)) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (isSupplierRoute && role !== "supplier" && !ADMIN_ROLES.includes(role)) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (isDeliveryRoute && role !== "delivery" && !ADMIN_ROLES.includes(role)) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/supplier/:path*", "/delivery/:path*", "/account/:path*", "/login", "/register/:path*"],
};
