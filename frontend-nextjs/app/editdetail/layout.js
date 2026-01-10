"use client";

import { Suspense, useEffect, useState } from "react";
import { API_URL } from "@/app/utils/config";
import { getAuthHeaders } from "@/app/utils/auth-headers";
import { useRouter } from "next/navigation";

export default function EditDetailLayout({ children }) {
  const [isPending, setIsPending] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkStatus = async () => {
      const email = typeof window !== 'undefined' ? sessionStorage.getItem("userEmail") : null;
      if (!email) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API_URL}/api/update-requests/user/${email}`, {
          credentials: "include",
          headers: { ...getAuthHeaders() }
        });
        const data = await res.json();
        if (data.success && data.hasPending) {
          setIsPending(true);
        }
      } catch (err) {
        console.error("Error checking pending status:", err);
      } finally {
        setLoading(false);
      }
    };
    checkStatus();
  }, []);

  if (loading) {
     return (
        <div style={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            height: "100vh",
            background: "var(--container-bg)",
            color: "var(--card-text)"
        }}>
            <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "40px", marginBottom: "15px" }}>⌛</div>
                <p>Checking Status...</p>
            </div>
        </div>
     );
  }

  if (isPending) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        textAlign: "center",
        padding: "40px",
        background: "var(--container-bg)",
        color: "var(--card-text)"
      }}>
        <div style={{ 
            background: "var(--card-bg)", 
            padding: "40px", 
            borderRadius: "16px", 
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            maxWidth: "500px",
            width: "100%"
        }}>
            <div style={{ fontSize: "60px", marginBottom: "20px" }}>🕒</div>
            <h2 style={{ marginBottom: "15px", color: "#f39c12" }}>Update Pending Approval</h2>
            <p style={{ lineHeight: "1.6", marginBottom: "25px", opacity: 0.9 }}>
                You already have a profile update request waiting for admin approval. 
                You cannot make further changes until the current request is processed or cancelled from the dashboard.
            </p>
            <button 
              onClick={() => router.push("/dashboard")}
              style={{
                width: "100%",
                padding: "14px",
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "bold",
                cursor: "pointer",
                transition: "background 0.3s"
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = "#218838"}
              onMouseOut={(e) => e.target.style.backgroundColor = "#28a745"}
            >
              Back to Dashboard
            </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "var(--container-bg)",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      <Suspense fallback={<div style={{ textAlign: "center", padding: "40px" }}>Loading...</div>}>
        {children}
      </Suspense>
    </div>
  );
}
