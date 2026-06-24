import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("aptrade-token")?.value;
  const { pathname } = request.nextUrl;

  if (pathname === "/login" || pathname === "/admin/login") {
    return NextResponse.next();
  }

  if (pathname.startsWith("/investidor") && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname.startsWith("/admin") && !token) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/investidor/:path*", "/admin/:path*"],
};
