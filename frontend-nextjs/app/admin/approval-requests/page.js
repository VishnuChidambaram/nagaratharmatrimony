"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import AdminMenu from "../AdminMenu";
import { useLanguage } from "../../hooks/useLanguage";
import { translations } from "../../utils/translations";
import LanguageToggle from "../../components/LanguageToggle";
import { API_URL } from "../../utils/config";
import { getAuthHeaders } from "../../utils/auth-headers";

export default function ApprovalRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const scrollRef = useRef(null);
  const router = useRouter();
  const { language, toggleLanguage } = useLanguage();

  const USERS_PER_PAGE = 18;

  // Translation helper function
  const t = (key) => {
    if (language === "ta" && translations[key] && translations[key].ta) {
      return translations[key].ta;
    }
    return key;
  };

  const fetchRequests = async () => {
    try {
      const res = await fetch(`${API_URL}/api/update-requests`, {
        headers: getAuthHeaders(),
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

  useEffect(() => {
    fetchRequests();
    
    // Auto-sync: Poll for new requests every 10 seconds
    const interval = setInterval(fetchRequests, 10000);
    return () => clearInterval(interval);
  }, []);

  // Scroll to top when page changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentPage]);

  // Pagination Logic
  const indexOfLastRequest = currentPage * USERS_PER_PAGE;
  const indexOfFirstRequest = indexOfLastRequest - USERS_PER_PAGE;
  const currentRequests = requests.slice(indexOfFirstRequest, indexOfLastRequest);
  const totalPages = Math.ceil(requests.length / USERS_PER_PAGE);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h2>{t("Loading requests...")}</h2>
      </div>
    );
  }

  return (
    <div 
      ref={scrollRef}
      style={{ 
        padding: "20px", 
        height: "100vh", 
        backgroundColor: "var(--background)",
        overflowY: "auto",
        scrollBehavior: "smooth",
        display: "flex",
        flexDirection: "column"
      }}
    >
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
          <AdminMenu />
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
        <div 
          className="approval-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "20px",
            marginTop: "20px"
          }}
        >
          <style jsx>{`
            @media (min-width: 768px) and (max-width: 1024px) {
              .approval-grid {
                grid-template-columns: repeat(2, 1fr) !important;
              }
            }
            .pagination-container {
              display: flex;
              justify-content: center;
              align-items: center;
              gap: 15px;
              margin: 30px auto;
              padding: 20px;
              width: 100%;
            }
            .pagination-button {
              padding: 8px 16px;
              background: var(--card-bg);
              border: 1px solid var(--input-border);
              border-radius: 8px;
              color: var(--page-text);
              cursor: pointer;
              transition: all 0.3s ease;
              font-size: 14px;
              display: flex;
              align-items: center;
              gap: 8px;
            }
            .pagination-button:disabled {
              opacity: 0.5;
              cursor: not-allowed;
            }
            .pagination-pages {
              display: flex;
              gap: 8px;
              align-items: center;
            }
            .page-number {
              width: 35px;
              height: 35px;
              display: flex;
              align-items: center;
              justify-content: center;
              border-radius: 8px;
              border: 1px solid var(--input-border);
              background: var(--card-bg);
              color: var(--page-text);
              cursor: pointer;
              transition: all 0.3s ease;
            }
            .active-page {
              background: #007bff !important;
              color: white !important;
              border-color: #007bff !important;
            }
            .dots {
              color: var(--page-text);
              padding: 0 4px;
            }
            @media (max-width: 768px) {
              .pagination-button span {
                display: none;
              }
              .pagination-container {
                gap: 8px;
                padding: 15px 10px;
                flex-wrap: wrap;
              }
            }
          `}</style>
          {currentRequests.map((req) => (
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

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="pagination-container">
          <button
            className="pagination-button"
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
          >
            ← <span>{t("Previous")}</span>
          </button>

          <div className="pagination-pages">
            {(() => {
              const total = totalPages;
              const curr = currentPage;
              if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => paginate(p)} className={`page-number ${curr === p ? 'active-page' : ''}`}>{p}</button>
              ));

              let pages = [1];
              let start = Math.max(2, curr - 1);
              let end = Math.min(total - 1, curr + 1);

              if (curr <= 3) end = Math.min(4, total - 1);
              if (curr >= total - 2) start = Math.max(2, total - 3);

              if (start > 2) pages.push("...");
              for (let i = start; i <= end; i++) pages.push(i);
              if (end < total - 1) pages.push("...");
              pages.push(total);

              return pages.map((page, index) => (
                <button
                  key={index}
                  onClick={() => typeof page === 'number' ? paginate(page) : null}
                  className={`page-number ${currentPage === page ? "active-page" : ""} ${typeof page !== 'number' ? "dots" : ""}`}
                  disabled={typeof page !== 'number'}
                >
                  {page}
                </button>
              ));
            })()}
          </div>

          <button
            className="pagination-button"
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <span>{t("Next")}</span> →
          </button>
        </div>
      )}
    </div>
  );
}
