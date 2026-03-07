import { jwtVerify } from "jose";
import { type NextRequest, NextResponse } from "next/server";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "default_secret_for_development_only",
);
const SESSION_COOKIE_NAME = "aloumnix-session";

// Define protected and public routes
const PUBLIC_ROUTES = ["/", "/login/school", "/login/alumni"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  // 1. If trying to access a public route
  if (PUBLIC_ROUTES.includes(pathname)) {
    // If trying to access auth routes while already logged in
    if (pathname.startsWith("/login/") && token) {
      try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        if (payload.role === "school") {
          return NextResponse.redirect(
            new URL("/school/dashboard", request.url),
          );
        }
        return NextResponse.redirect(new URL("/alumni/dashboard", request.url));
      } catch (_error) {
        // Token invalid, allow access to login
      }
    }
    return NextResponse.next();
  }

  // 2. All other routes are protected
  if (!token) {
    const loginUrl = new URL("/login/alumni", request.url);
    loginUrl.searchParams.set(
      "redirect_to",
      request.nextUrl.pathname + request.nextUrl.search,
    );
    return NextResponse.redirect(loginUrl);
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

    // If school needs to set password, redirect to /set-password
    if (
      payload.role === "school" &&
      payload.needsPasswordSet &&
      pathname !== "/set-password"
    ) {
      return NextResponse.redirect(new URL("/set-password", request.url));
    }
  } catch (_error) {
    // Invalid token
    const loginUrl = new URL("/login/alumni", request.url);
    loginUrl.searchParams.set(
      "redirect_to",
      request.nextUrl.pathname + request.nextUrl.search,
    );
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
