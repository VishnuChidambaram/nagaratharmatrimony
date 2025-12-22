import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Admin Routes Logic
  if (pathname.startsWith("/admin")) {
    const isAdminLogin = pathname === "/admin/login";
    const adminEmail = request.cookies.get("adminEmail");

    if (isAdminLogin) {
        // Allow access to login page without auto-redirecting
        // Admins must authenticate every time
        return NextResponse.next();
    }

    // Protected Admin Routes (e.g. /admin/dashboard)
    if (!adminEmail) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    
    return NextResponse.next();
  }

  // 2. User Routes Logic
  
  // Define public user routes
  const isPublicUserRoute = 
    pathname === "/" || 
    pathname === "/login" || 
    pathname.startsWith("/register") || 
    pathname === "/forgot-password";

  const userEmail = request.cookies.get("userEmail");

  // If user is authenticated and checks public routes, redirect to dashboard? 
  // (Existing code didn't do this explicitly effectively except for the empty check at line 20, keeping it minimal for now to avoid side effects)
  
  if (!isPublicUserRoute) {
    if (!userEmail) {
      // Redirect to login if not authenticated
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|logo.png).*)"],
};
