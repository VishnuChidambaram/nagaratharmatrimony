"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "../hooks/useLanguage";

export default function SessionTimer({ type = "user" }) { // type: "user" | "admin"
  const [timeLeft, setTimeLeft] = useState("");
  const { language } = useLanguage();

  useEffect(() => {
    const updateTimer = () => {
      const storageKey = type === "admin" ? "adminSessionExpiresAt" : "sessionExpiresAt";
      const expiresAt = sessionStorage.getItem(storageKey);

      if (!expiresAt) {
        setTimeLeft("");
        return;
      }

      const now = new Date();
      const expiration = new Date(expiresAt);
      const diff = expiration - now;

      if (diff <= 0) {
        setTimeLeft("00:00");
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);

      setTimeLeft(`${minutes}:${seconds.toString().padStart(2, "0")}`);
    };

    updateTimer(); // Initial call
    const interval = setInterval(updateTimer, 1000);

    // Listen for custom event to update timer immediately when session refreshes
    const handleSessionUpdate = (e) => {
        if (e.detail?.type === type) {
            updateTimer();
        }
    }
    
    window.addEventListener("session-update", handleSessionUpdate);

    return () => {
        clearInterval(interval);
        window.removeEventListener("session-update", handleSessionUpdate);
    };
  }, [type]);

  if (!timeLeft) return null;

  return (
    <div style={{ 
        padding: "8px 12px", 
        fontSize: "13px", 
        color: type === 'admin' ? '#dc3545' : 'var(--menu-text)', // Red for admin to be noticeable, standard for user
        fontWeight: "bold",
        textAlign: "center",
        borderTop: "1px solid var(--menu-border)",
        borderBottom: "1px solid var(--menu-border)",
        background: type === 'admin' ? '#fff3cd' : 'var(--menu-item-bg)',
        marginBottom: "10px"
    }}>
      <span>{language === "ta" ? "அமர்வு முடிவு: " : "Session Expires: "}</span>
      <span style={{ fontFamily: "monospace", fontSize: "14px" }}>{timeLeft}</span>
    </div>
  );
}
