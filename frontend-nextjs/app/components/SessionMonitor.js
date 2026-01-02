"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { API_URL } from "../utils/config";
import { getAuthHeaders } from "../utils/auth-headers";

export default function SessionMonitor() {
  const router = useRouter();
  const pathname = usePathname();
  const intervalRef = useRef(null);
  const activityRef = useRef(Date.now()); // Track last activity locally

  useEffect(() => {
    // Activity listeners to reset the timer (but not necessarily the backend session immediately)
    const updateActivity = () => {
      activityRef.current = Date.now();
      
      // Update local storage for the timer component to see
      // We set specific keys for user and admin to keep them independent if needed, 
      // though usually one browser user = one session.
      const userEmail = sessionStorage.getItem("userEmail");
      const adminEmail = sessionStorage.getItem("adminEmail");

      const newExpiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // +10 mins

      if (userEmail) {
        sessionStorage.setItem("sessionExpiresAt", newExpiresAt);
        window.dispatchEvent(new CustomEvent('session-update', { detail: { type: 'user' } }));
      }
      if (adminEmail) {
        sessionStorage.setItem("adminSessionExpiresAt", newExpiresAt);
        window.dispatchEvent(new CustomEvent('session-update', { detail: { type: 'admin' } }));
      }
    };

    // Throttle activity updates to once per second to avoid performance issues
    let activityTimeout;
    const throttledUpdateActivity = () => {
      if (!activityTimeout) {
        activityTimeout = setTimeout(() => {
          updateActivity();
          activityTimeout = null;
        }, 1000);
      }
    };

    window.addEventListener("mousemove", throttledUpdateActivity);
    window.addEventListener("keypress", throttledUpdateActivity);
    window.addEventListener("click", throttledUpdateActivity);
    window.addEventListener("scroll", throttledUpdateActivity);

    // Initial set
    updateActivity();

    // Check Session Function (Runs every 10s)
    const checkSession = async () => {
      const now = Date.now();
      const lastActivity = activityRef.current;
      const inactivityDuration = now - lastActivity;
      const SESSION_TIMEOUT = 10 * 60 * 1000; // 10 minutes

      // If inactive for > 10 minutes, force logout
      if (inactivityDuration > SESSION_TIMEOUT) {
         const userEmail = sessionStorage.getItem("userEmail");
         if (userEmail) {
            console.log("User inactive for > 10 mins. Logging out.");
            await fetch(`${API_URL}/logout`, { method: "POST", credentials: "include" });
            sessionStorage.removeItem("userEmail");
            sessionStorage.removeItem("sessionExpiresAt");
            window.location.href = "/login";
            return;
         }

         const adminEmail = sessionStorage.getItem("adminEmail");
         if (adminEmail) {
            console.log("Admin inactive for > 10 mins. Logging out.");
            await fetch(`${API_URL}/admin/logout`, { method: "POST", credentials: "include" });
            sessionStorage.removeItem("adminEmail");
            sessionStorage.removeItem("adminSessionExpiresAt");
            window.location.href = "/admin/login";
            return;
         }
      }

      // If active (inactivity < 10 mins), verify with backend to keep cookie alive
      // 1. Check User Session
      const localEmail = sessionStorage.getItem("userEmail");
      if (localEmail) {
        try {
          const res = await fetch(`${API_URL}/check-auth`, {
            credentials: "include",
            headers: { "Content-Type": "application/json", ...getAuthHeaders() },
          });
          const data = await res.json();
  
          if (data.success) {
             // Backend session alive. 
             // IMPORTANT: We do NOT update sessionExpiresAt here based on backend response
             // because that would reset the timer even if user is inactive.
             // We rely on updateActivity() to update the timer.
  
             if (data.user && data.user.email && data.user.email !== localEmail) {
               console.log("User mismatch. Logging out.");
               sessionStorage.removeItem("userEmail");
               sessionStorage.removeItem("sessionExpiresAt");
               window.location.href = "/login";
             }
          } else {
             // Backend says invalid
             console.log("User session invalid on backend, logging out...");
             sessionStorage.removeItem("userEmail");
             sessionStorage.removeItem("sessionExpiresAt");
             window.dispatchEvent(new CustomEvent('show-notification', { 
               detail: { message: 'Session Expired.', type: 'error' } 
             }));
             window.location.href = "/login";
          }
        } catch (error) {
          console.error("User session check error:", error);
        }
      }

      // 2. Check Admin Session
      const localAdminEmail = sessionStorage.getItem("adminEmail");
      if (localAdminEmail) {
        try {
          const res = await fetch(`${API_URL}/check-admin-auth`, {
            credentials: "include",
            headers: { "Content-Type": "application/json", ...getAuthHeaders() },
          });
          const data = await res.json();
  
          if (data.success) {
             if (data.email && data.email !== localAdminEmail) {
                console.log("Admin mismatch. Logging out.");
                sessionStorage.removeItem("adminEmail");
                sessionStorage.removeItem("adminSessionExpiresAt");
                window.location.href = "/admin/login";
             }
          } else {
             console.log("Admin session invalid on backend, logging out...");
             sessionStorage.removeItem("adminEmail");
             sessionStorage.removeItem("adminSessionExpiresAt");
             window.dispatchEvent(new CustomEvent('show-notification', { 
               detail: { message: 'Admin Session Expired.', type: 'error' } 
             }));
             window.location.href = "/admin/login";
          }
        } catch (error) {
          console.error("Admin session check error:", error);
        }
      }
    };

    // Run check immediately on mount (if not on login pages)
    if (pathname !== "/login" && pathname !== "/register" && pathname !== "/admin/login") {
       checkSession();
    }

    // Set interval (e.g., every 10 seconds)
    intervalRef.current = setInterval(checkSession, 10000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      window.removeEventListener("mousemove", throttledUpdateActivity);
      window.removeEventListener("keypress", throttledUpdateActivity);
      window.removeEventListener("click", throttledUpdateActivity);
      window.removeEventListener("scroll", throttledUpdateActivity);
      if (activityTimeout) clearTimeout(activityTimeout);
    };
  }, [pathname, router]);

  return null;
}
