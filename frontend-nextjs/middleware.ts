import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Relaxed Middleware:
  // We defer strictly to Client-Side protection (SessionMonitor) to support Multi-Tab / Multi-User.
  // Since specific user session (sessionStorage) is only known to the client, 
  // the server (Middleware) cannot distinguish between Tab A (User 1) and Tab B (User 2) 
  // if we rely on shared Cookies.
  
  // We allow the request to proceed. 
  // The client-side SessionMonitor will check sessionStorage against the API and redirect if invalid.
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
