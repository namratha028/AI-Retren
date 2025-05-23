import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  // Get token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET || "your-fallback-secret-key-for-development",
  })

  const isAuthenticated = !!token

  // Get the pathname
  const { pathname } = request.nextUrl

  // Define protected routes
  const isProtectedRoute =
    pathname === "/" ||
    pathname.startsWith("/api/analysis") ||
    pathname.startsWith("/api/recordings") ||
    pathname.startsWith("/api/personality") ||
    pathname.startsWith("/api/transformation-goal") ||
    pathname.startsWith("/api/practices")

  // Define auth routes
  const isAuthRoute = pathname === "/login" || pathname === "/register"

  // Redirect authenticated users away from auth pages
  if (isAuthenticated && isAuthRoute) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  // Redirect unauthenticated users to login
  if (!isAuthenticated && isProtectedRoute) {
    // Allow API auth check endpoint
    if (pathname === "/api/auth/check") {
      return NextResponse.next()
    }

    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}
