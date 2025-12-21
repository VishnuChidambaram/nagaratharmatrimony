"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminMenu from "../AdminMenu";
import { useLanguage } from "../../hooks/useLanguage";
import { translations } from "../../utils/translations";
import LanguageToggle from "../../components/LanguageToggle";
import { API_URL } from "../../utils/config";

export default function ApprovalRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { language, toggleLanguage } = useLanguage();

  // Translation helper function
  const t = (key) => {
    if (language === "ta" && translations[key] && translations[key].ta) {
      return translations[key].ta;
    }
    return key;
  };

  useEffect(() => {
    fetchRequests();
    
    // Auto-sync: Poll for new requests every 10 seconds
    const interval = setInterval(fetchRequests, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await fetch(`${API_URL}/api/update-requests`, {
        credentials: "include"
      });
      const data = await res.json();
      if (data.success) {
        setRequests(data.data);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h2>{t("Loading requests...")}</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", minHeight: "100vh", backgroundColor: "var(--background)" }}>
      {/* Admin Header */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: "20px", 
        paddingBottom: "10px", 
        borderBottom: "1px solid var(--input-border)" 
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <AdminMenu />
          <h1 style={{ margin: 0, fontSize: "24px", color: "var(--page-text)" }}>{t("Pending Update Requests")}</h1>
        </div>
        {/* Actions: Go to Dashboard + Language Toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            onClick={() => router.push("/admin/dashboard")}
            style={{
              backgroundColor: "#16a34a",
              color: "white",
              border: "none",
              padding: "8px 12px",
              borderRadius: "6px",
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            {t("Go to Dashboard")}
          </button>
          <LanguageToggle language={language} toggleLanguage={toggleLanguage} />
        </div>
      </div>


      <p style={{ color: "var(--card-text)", opacity: 0.7, marginBottom: "30px" }}>
        {requests.length} {requests.length === 1 ? t("request") : t("requests")} {t("awaiting review")}
      </p>

      {requests.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "60px 20px",
          backgroundColor: "var(--card-bg)",
          borderRadius: "12px",
          border: "1px solid var(--input-border)"
        }}>
          <h2 style={{ color: "var(--card-text)", marginBottom: "10px" }}>{t("No Pending Requests")}</h2>
          <p style={{ color: "var(--card-text)", opacity: 0.6 }}>{t("All update requests have been reviewed")}</p>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "20px",
          marginTop: "20px"
        }}>
          {requests.map((req) => (
            <div
              key={req.request_id}
              onClick={() => router.push(`/admin/approval-requests/${req.request_id}`)}
              style={{
                border: "1px solid var(--input-border)",
                borderRadius: "12px",
                padding: "24px",
                cursor: "pointer",
                backgroundColor: "var(--card-bg)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                transition: "all 0.2s ease",
                position: "relative"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
              }}
            >
              <div style={{
                position: "absolute",
                top: "12px",
                right: "12px",
                backgroundColor: "#ff9800",
                color: "white",
                padding: "4px 12px",
                borderRadius: "12px",
                fontSize: "12px",
                fontWeight: "bold"
              }}>
                {t("PENDING")}
              </div>

              <h3 style={{ color: "var(--card-text)", marginBottom: "16px", marginTop: "0" }}>
                {t("Request #")}{req.request_id}
              </h3>

              <div style={{ marginBottom: "8px" }}>
                <strong style={{ color: "var(--card-text)", opacity: 0.7 }}>{t("ID:")}</strong>
                <span style={{ color: "var(--card-text)", marginLeft: "8px" }}>{req.user_id}</span>
              </div>

              <div style={{ marginBottom: "8px" }}>
                <strong style={{ color: "var(--card-text)", opacity: 0.7 }}>{t("Name:")}</strong>
                <span style={{ color: "var(--card-text)", marginLeft: "8px" }}>
                  {req.new_data?.name || "N/A"}
                </span>
              </div>

              <div style={{ marginBottom: "8px" }}>
                <strong style={{ color: "var(--card-text)", opacity: 0.7 }}>{t("Email:")}</strong>
                <span style={{ color: "var(--card-text)", marginLeft: "8px" }}>{req.user_email}</span>
              </div>

              <div style={{ marginBottom: "12px" }}>
                <strong style={{ color: "var(--card-text)", opacity: 0.7 }}>{t("Phone:")}</strong>
                <span style={{ color: "var(--card-text)", marginLeft: "8px" }}>
                  {req.new_data?.phone || "N/A"}
                </span>
              </div>

              <div style={{ paddingTop: "12px", borderTop: "1px solid var(--input-border)" }}>
                <small style={{ color: "var(--card-text)", opacity: 0.6 }}>
                  {t("Submitted:")} {new Date(req.created_at).toLocaleString()}
                </small>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
