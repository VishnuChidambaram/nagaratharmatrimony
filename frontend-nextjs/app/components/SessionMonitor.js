"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { API_URL } from "../utils/config";
import { getAuthHeaders } from "../utils/auth-headers";

export default function SessionMonitor() {
  const router = useRouter();
  const pathname = usePathname();
  const intervalRef = useRef(null);

  useEffect(() => {
    // List of public paths where we shouldn't necessarily force logout or check aggressively
    // but check-auth usually returns false on these anyway if not logged in.
    // However, if we ARE logged in (localStorage/cookie), we want to know if it becomes invalid.
    
    // Function to check session
    const checkSession = async () => {
      // 1. Check User Session
      const localEmail = typeof window !== "undefined" ? sessionStorage.getItem("userEmail") : null;
      
      try {
        const res = await fetch(`${API_URL}/check-auth`, {
          credentials: "include",
          headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        });
        const data = await res.json();

        if (data.success) {
           // Backend thinks we are logged in.
           if (!localEmail) {
             // Browser restored cookies, but sessionStorage is empty. 
             // This presumably means a "Browser Close & Reopen".
             // We must force logout to respect "Session End on Close".
             console.log("Session restored by browser but sessionStorage empty. Forcing logout.");
             await fetch(`${API_URL}/logout`, { method: "POST", credentials: "include" });
             window.location.href = "/login";
             return; 
           } else if (data.user && data.user.email && data.user.email !== localEmail) {
             console.log("User mismatch. Logging out for security.");
             sessionStorage.removeItem("userEmail");
             window.location.href = "/login";
           }
        } else {
          // Backend says not logged in.
          if (localEmail) {
            console.log("User session invalid, logging out...");
            sessionStorage.removeItem("userEmail");
            window.dispatchEvent(new CustomEvent('show-notification', { 
              detail: { message: 'Session Expired.', type: 'error' } 
            }));
            window.location.href = "/login";
          }
        }
      } catch (error) {
        console.error("User session check error:", error);
      }

      // 2. Check Admin Session
      const localAdminEmail = typeof window !== "undefined" ? sessionStorage.getItem("adminEmail") : null;
      
      try {
        const res = await fetch(`${API_URL}/check-admin-auth`, {
          credentials: "include",
          headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        });
        const data = await res.json();

        if (data.success) {
           if (!localAdminEmail) {
              // Browser restored cookies, but admin sessionStorage empty. Force Logout.
              console.log("Admin session restored by browser but sessionStorage empty. Forcing logout.");
              await fetch(`${API_URL}/admin/logout`, { method: "POST", credentials: "include" });
              window.location.href = "/admin/login";
              return;
           } else if (data.email && data.email !== localAdminEmail) {
              console.log("Admin mismatch. Logging out for security.");
              sessionStorage.removeItem("adminEmail");
              window.location.href = "/admin/login";
           }
        } else {
           if (localAdminEmail) {
              console.log("Admin session invalid, logging out...");
              sessionStorage.removeItem("adminEmail");
              window.dispatchEvent(new CustomEvent('show-notification', { 
                detail: { message: 'Admin Session Expired.', type: 'error' } 
              }));
              window.location.href = "/admin/login";
           }
        }
      } catch (error) {
        console.error("Admin session check error:", error);
      }
    };

    // Run check immediately on mount (if not on login pages)
    if (pathname !== "/login" && pathname !== "/register" && pathname !== "/admin/login") {
       checkSession();
    }

    // Set interval (e.g., every 10 seconds)
    intervalRef.current = setInterval(checkSession, 10000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [pathname, router]);

  return null;
}
