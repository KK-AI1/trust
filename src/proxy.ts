import { NextResponse } from "next/server";
import { auth } from "@/auth";

const PUBLIC_PATHS = ["/login"];

export const proxy = auth((req) => {
  const { pathname } = req.nextUrl;
  const isPublicPath =
    PUBLIC_PATHS.some((path) => pathname.startsWith(path)) ||
    pathname.startsWith("/api/auth");

  if (!req.auth && !isPublicPath) {
    return NextResponse.redirect(new URL("/login", req.nextUrl.origin));
  }

  if (req.auth && pathname === "/login") {
    return NextResponse.redirect(new URL("/", req.nextUrl.origin));
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
