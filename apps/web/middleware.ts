import { NextRequest, NextResponse } from "next/server";

const publicPaths = ["/auth", "/api/auth", "/"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isStaticAsset = /\.[^/]+$/.test(pathname);

  // Skip auth for public paths, static files, and API proxy
  if (
    publicPaths.some((p) => pathname === p || pathname.startsWith(p + "/")) ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    isStaticAsset
  ) {
    // If user is already logged in and hits the landing page, send to dashboard
    if (pathname === "/") {
      const sessionCookie =
        request.cookies.get("__Secure-better-auth.session_token") ||
        request.cookies.get("better-auth.session_token");
      if (sessionCookie) {
        return NextResponse.redirect(new URL("/photos", request.url));
      }
    }
    return NextResponse.next();
  }

  // Check for session cookie (Better Auth uses __Secure- prefix in prod)
  const sessionCookie =
    request.cookies.get("__Secure-better-auth.session_token") ||
    request.cookies.get("better-auth.session_token");

  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
