"use client";

import React, { useState, useCallback } from "react";
import Image from "next/image";
import { API_URL } from "@/app/utils/config";
import { getAuthHeaders } from "@/app/utils/auth-headers";
import { getPhotoUrl } from "@/app/utils/photoUtils";
import UserCard from "./UserCard";
import UserDetailModal from "./UserDetailModal";

// ==============================================================
// Sub-tab: Received Requests
// ==============================================================
function ReceivedTab({ data, loading, t, onApprove, onReject, onViewDetail }) {
  if (loading) return <LoadingSpinner />;
  if (data.length === 0) {
    return (
      <EmptyState
        icon="📭"
        title={t("No Pending Requests")}
        subtitle={t("You have no pending contact requests.")}
      />
    );
  }
  return (
    <div className="approval-card-grid">
      {data.map((req) => (
        <div key={req.id} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <UserCard
            item={req.requester}
            view="other"
            t={t}
            onViewDetail={() => onViewDetail(req.requester)}
          />
          <div className="approval-actions" style={{ marginTop: 0 }}>
            <button
              className="approval-btn approve-btn"
              onClick={() => onApprove(req.id)}
            >
              ✅ {t("Approve")}
            </button>
            <button
              className="approval-btn reject-btn"
              onClick={() => onReject(req.id)}
            >
              ❌ {t("Reject")}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ==============================================================
// Sub-tab: Sent Requests
// ==============================================================
function SentTab({ data, loading, t, onViewDetail }) {
  if (loading) return <LoadingSpinner />;
  if (data.length === 0) {
    return (
      <EmptyState
        icon="📤"
        title={t("No Sent Requests")}
        subtitle={t("You haven't sent any contact requests yet.")}
      />
    );
  }

  const statusConfig = {
    pending: { color: "#f59e0b", bg: "rgba(245, 158, 11, 0.1)", icon: "🕒", label: "Pending" },
    approved: { color: "#10b981", bg: "rgba(16, 185, 129, 0.1)", icon: "✅", label: "Approved" },
    rejected: { color: "#ef4444", bg: "rgba(239, 68, 68, 0.1)", icon: "❌", label: "Rejected" },
  };

  return (
    <div className="approval-card-grid">
      {data.map((req) => {
        const cfg = statusConfig[req.status] || statusConfig.pending;
        return (
          <div key={req.id} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <UserCard
              item={req.target}
              view="other"
              t={t}
              onViewDetail={() => onViewDetail(req.target)}
            />
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                padding: "8px 14px",
                borderRadius: 8,
                background: cfg.bg,
                color: cfg.color,
                border: `1px solid ${cfg.color}`,
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              {cfg.icon} {t(cfg.label)} - {t("Sent")}: {new Date(req.created_at).toLocaleDateString()}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ==============================================================
// Sub-tab: Approved Contacts (two-way: people I approved + who approved me)
// ==============================================================
function ApprovedTab({ approvedByMe, approvedByOthers, loading, t, onViewDetail, currentPage, setCurrentPage, itemsPerPage }) {
  const [subTab, setSubTab] = useState("by_others"); // "by_me" | "by_others"
  const displayData = subTab === "by_me" ? approvedByMe : approvedByOthers;

  // Reset pagination when sub-tab changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [subTab, setCurrentPage]);

  if (loading) return <LoadingSpinner />;

  const totalPages = Math.ceil(displayData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const slicedData = displayData.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div>
      {/* Mini sub-tabs */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        {[
          { key: "by_others", label: "💬 " + t("They Approved Me") },
          { key: "by_me", label: "🤝 " + t("I Approved") },
        ].map((st) => (
          <button
            key={st.key}
            onClick={() => setSubTab(st.key)}
            style={{
              padding: "8px 18px",
              borderRadius: 20,
              border: subTab === st.key ? "2px solid #28a745" : "1px solid #d1d5db",
              background: subTab === st.key ? "rgba(40,167,69,0.1)" : "transparent",
              color: subTab === st.key ? "#28a745" : "var(--page-text)",
              fontWeight: subTab === st.key ? 700 : 400,
              cursor: "pointer",
              fontSize: 13,
              transition: "all 0.2s",
            }}
          >
            {st.label}
          </button>
        ))}
      </div>

      {displayData.length === 0 ? (
        <EmptyState
          icon="🔒"
          title={t("No Approved Contacts")}
          subtitle={t("Approved contacts will appear here with full contact details.")}
        />
      ) : (
        <>
          <div className="approval-card-grid">
            {slicedData.map((entry) => (
              <ApprovedContactCard key={entry.id} entry={entry} t={t} onViewDetail={onViewDetail} />
            ))}
          </div>
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} t={t} />
        </>
      )}
    </div>
  );
}

function ApprovedContactCard({ entry, t, onViewDetail }) {
  const user = entry.user;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* Treat as approved inside UserCard to unlock details inline as well if supported */}
      <UserCard
        item={{ ...user, contactRequestStatus: "approved" }}
        view="other"
        t={t}
        onViewDetail={() => onViewDetail({ ...user, contactRequestStatus: "approved" })}
      />

      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          padding: "8px 14px",
          borderRadius: 8,
          background: "rgba(16, 185, 129, 0.1)",
          color: "#10b981",
          border: "1px solid #10b981",
          fontWeight: 600,
          fontSize: 14,
        }}
      >
        ✅ {t("Approved")} - {t("Date")}: {new Date(entry.approved_at).toLocaleDateString()}
      </div>


      {/* Extra contact details box for quick access */}
      <div style={{
        background: "rgba(40,167,69,0.06)",
        borderRadius: 8,
        padding: "12px 14px",
        border: "1px solid rgba(40,167,69,0.2)",
        display: "flex",
        flexDirection: "column",
        gap: 6,
        fontSize: 13,
      }}>
        <div style={{ fontWeight: 700, color: "#28a745", marginBottom: 4, fontSize: 12 }}>
          🔓 {t("Contact Details (Unlocked)")}
        </div>
        {user.phone && (
          <div>📞 <a href={`tel:${user.phone}`} style={{ color: "var(--page-text)", textDecoration: "none" }}>{user.phone}</a></div>
        )}
        {user.whatsAppNo && (
          <div>💬 <a href={`https://wa.me/${user.whatsAppNo}`} target="_blank" rel="noopener noreferrer" style={{ color: "#25d366", textDecoration: "none" }}>WhatsApp: {user.whatsAppNo}</a></div>
        )}
        {user.otherPhone && (
          <div>📱 {user.otherPhone}</div>
        )}
        {user.email && (
          <div>✉️ <a href={`mailto:${user.email}`} style={{ color: "var(--page-text)", textDecoration: "none" }}>{user.email}</a></div>
        )}
        {user.fullStreetAddress && (
          <div>📍 {user.fullStreetAddress}{user.city ? `, ${user.city}` : ""}{user.state ? `, ${user.state}` : ""}</div>
        )}
      </div>
    </div>
  );
}

// ==============================================================
// Helper components
// ==============================================================
function Pagination({ currentPage, totalPages, onPageChange, t }) {
  if (totalPages <= 1) return null;

  const getVisiblePages = (curr, total) => {
    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
    let pages = [1];
    let start = Math.max(2, curr - 1);
    let end = Math.min(total - 1, curr + 1);
    if (curr <= 3) end = Math.min(4, total - 1);
    if (curr >= total - 2) start = Math.max(2, total - 3);
    if (start > 2) pages.push("...");
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < total - 1) pages.push("...");
    pages.push(total);
    return pages;
  };

  return (
    <div className="pagination-container">
      <button
        className="pagination-button"
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        disabled={currentPage === 1}
      >
        ← <span>{t("Previous")}</span>
      </button>

      <div className="pagination-pages">
        {getVisiblePages(currentPage, totalPages).map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === "number" && onPageChange(page)}
            disabled={typeof page !== "number"}
            className={`page-number ${currentPage === page ? "active-page" : ""} ${typeof page !== "number" ? "dots" : ""}`}
          >
            {page}
          </button>
        ))}
      </div>

      <button
        className="pagination-button"
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
        disabled={currentPage === totalPages}
      >
        <span>{t("Next")}</span> →
      </button>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
      <div style={{
        width: 40, height: 40,
        border: "4px solid rgba(40,167,69,0.1)",
        borderLeftColor: "#28a745",
        borderRadius: "50%",
        animation: "spin 0.7s linear infinite",
      }} />
    </div>
  );
}

function EmptyState({ icon, title, subtitle }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "60px 20px", textAlign: "center",
      background: "rgba(var(--card-bg-rgb), 0.5)",
      borderRadius: 16, border: "1px dashed var(--input-border)",
      margin: "10px auto", maxWidth: 500,
    }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>{icon}</div>
      <h3 style={{ margin: "0 0 8px 0", color: "var(--page-text)", fontWeight: 500 }}>{title}</h3>
      <p style={{ opacity: 0.6, margin: 0, fontSize: 14 }}>{subtitle}</p>
    </div>
  );
}

// ==============================================================
// Main export: ContactApprovalSection
// ==============================================================
export default function ContactApprovalSection({ t }) {
  const [activeTab, setActiveTab] = useState("received");
  const [received, setReceived] = useState([]);
  const [sent, setSent] = useState([]);
  const [approvedByMe, setApprovedByMe] = useState([]);
  const [approvedByOthers, setApprovedByOthers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [initialized, setInitialized] = useState(false);
  const [selectedUserForModal, setSelectedUserForModal] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 15;

  // Reset page when tab changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  // Fetch all data once
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const headers = { credentials: "include", headers: { ...getAuthHeaders() } };
      const [recRes, sentRes, appByMeRes, appByOthersRes] = await Promise.all([
        fetch(`${API_URL}/api/contact-requests/received`, headers),
        fetch(`${API_URL}/api/contact-requests/sent`, headers),
        fetch(`${API_URL}/api/contact-requests/approved`, headers),
        fetch(`${API_URL}/api/contact-requests/approved-by-others`, headers),
      ]);
      const [recData, sentData, appByMeData, appByOthersData] = await Promise.all([
        recRes.json(), sentRes.json(), appByMeRes.json(), appByOthersRes.json(),
      ]);
      if (recData.success) setReceived(recData.data || []);
      if (sentData.success) setSent(sentData.data || []);
      if (appByMeData.success) setApprovedByMe(appByMeData.data || []);
      if (appByOthersData.success) setApprovedByOthers(appByOthersData.data || []);
    } catch (err) {
      console.error("Error fetching approval data:", err);
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, []);

  // Lazy-load on first render or tab switch
  React.useEffect(() => {
    if (!initialized) fetchAll();
  }, [initialized, fetchAll]);

  const showNotif = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleApprove = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/contact-requests/${id}/approve`, {
        method: "PUT",
        credentials: "include",
        headers: { ...getAuthHeaders() },
      });
      const data = await res.json();
      if (data.success) {
        showNotif(t("Request approved!"));
        setInitialized(false); // re-fetch
      } else {
        showNotif(data.message || t("Failed to approve"), "error");
      }
    } catch {
      showNotif(t("Error approving request"), "error");
    }
  };

  const handleReject = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/contact-requests/${id}/reject`, {
        method: "PUT",
        credentials: "include",
        headers: { ...getAuthHeaders() },
      });
      const data = await res.json();
      if (data.success) {
        showNotif(t("Request rejected"));
        setInitialized(false);
      } else {
        showNotif(data.message || t("Failed to reject"), "error");
      }
    } catch {
      showNotif(t("Error rejecting request"), "error");
    }
  };

  const tabs = [
    { key: "received", label: "📨 " + t("Received"), badge: received.length },
    { key: "sent", label: "📤 " + t("Sent"), badge: sent.length },
    { key: "approved", label: "✅ " + t("Approved"), badge: approvedByMe.length + approvedByOthers.length },
  ];

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "20px 16px" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, color: "var(--page-text)", fontWeight: 500, fontSize: 22, display: "flex", alignItems: "center", gap: 10 }}>
          📋 {t("Contact Approvals")}
        </h2>
        <p style={{ opacity: 0.6, margin: "6px 0 0 0", fontSize: 13 }}>
          {t("Manage requests to share contact details with other members.")}
        </p>
      </div>

      {/* Toast notification */}
      {notification && (
        <div style={{
          position: "fixed", top: 80, right: 20, zIndex: 9999,
          padding: "12px 20px", borderRadius: 12,
          background: notification.type === "error" ? "#ef4444" : "#28a745",
          color: "white", fontWeight: 600, fontSize: 14,
          boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
          animation: "slideIn 0.3s ease-out",
        }}>
          {notification.msg}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, borderBottom: "2px solid var(--input-border)", flexWrap: "wrap" }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: "10px 18px",
              border: "none",
              background: "transparent",
              color: activeTab === tab.key ? "#28a745" : "var(--page-text)",
              borderBottom: activeTab === tab.key ? "3px solid #28a745" : "3px solid transparent",
              fontWeight: activeTab === tab.key ? 700 : 400,
              cursor: "pointer",
              fontSize: 14,
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              gap: 8,
              position: "relative",
              marginBottom: -2,
            }}
          >
            {tab.label}
            {tab.badge > 0 && (
              <span style={{
                background: "#28a745", color: "white",
                borderRadius: "50%", width: 20, height: 20,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 700,
              }}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
        <button
          onClick={() => setInitialized(false)}
          style={{
            marginLeft: "auto", padding: "10px 14px", border: "1px solid #d1d5db",
            borderRadius: 8, background: "transparent", cursor: "pointer",
            color: "var(--page-text)", fontSize: 13, transition: "all 0.2s",
          }}
          title={t("Refresh")}
        >
          🔄
        </button>
      </div>

      {/* Tab Content */}
      {(() => {
        let currentData = [];
        if (activeTab === "received") currentData = received;
        else if (activeTab === "sent") currentData = sent;
        else if (activeTab === "approved") {
          // Flatten approved for pagination if needed, but the tabs have their own logic
          // For now, let's keep the sub-tab logic inside ApprovedTab
        }

        const totalPages = Math.ceil(currentData.length / ITEMS_PER_PAGE);
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const slicedData = currentData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

        if (activeTab === "received") {
          return (
            <>
              <ReceivedTab data={slicedData} loading={loading} t={t} onApprove={handleApprove} onReject={handleReject} onViewDetail={setSelectedUserForModal} />
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} t={t} />
            </>
          );
        }
        if (activeTab === "sent") {
          return (
            <>
              <SentTab data={slicedData} loading={loading} t={t} onViewDetail={setSelectedUserForModal} />
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} t={t} />
            </>
          );
        }
        if (activeTab === "approved") {
          // ApprovedTab handles its own sub-tabs, so we pass pagination logic to it
          return (
            <ApprovedTab 
              approvedByMe={approvedByMe} 
              approvedByOthers={approvedByOthers} 
              loading={loading} 
              t={t} 
              onViewDetail={setSelectedUserForModal}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              itemsPerPage={ITEMS_PER_PAGE}
            />
          );
        }
        return null;
      })()}

      {selectedUserForModal && (
        <UserDetailModal
          selectedUser={selectedUserForModal}
          onClose={() => setSelectedUserForModal(null)}
          t={t}
        />
      )}

      <style jsx>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }



        .approval-card {
          background: rgba(var(--card-bg-rgb), 0.8);
          border: 1px solid var(--input-border);
          border-radius: 14px;
          padding: 18px;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .approval-card:hover {
          border-color: #28a745;
          box-shadow: 0 8px 24px rgba(40,167,69,0.12);
          transform: translateY(-3px);
        }

        .approved-contact-card {
          border-color: rgba(40,167,69,0.3);
        }

        .approval-card-header {
          display: flex;
          gap: 14px;
          align-items: flex-start;
          margin-bottom: 6px;
        }

        .approval-name {
          margin: 0 0 2px 0;
          font-size: 16px;
          font-weight: 500;
          color: var(--page-text);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .approval-sub {
          margin: 0;
          font-size: 12px;
          opacity: 0.6;
          color: var(--page-text);
        }

        .approval-badge {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 11px;
          margin: 2px 4px 2px 0;
        }
        .badge-red { background: #fee2e2; color: #ef4444; }
        .badge-teal { background: #ccfbf1; color: #0d9488; }

        .approval-date {
          margin: 2px 0 0 0;
          font-size: 12px;
          opacity: 0.55;
          color: var(--page-text);
        }

        .approval-actions {
          display: flex;
          gap: 8px;
          margin-top: 12px;
        }

        .approval-btn {
          flex: 1;
          padding: 9px 12px;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .approve-btn {
          background: rgba(40,167,69,0.12);
          color: #28a745;
          border: 1.5px solid #28a745;
        }
        .approve-btn:hover {
          background: #28a745;
          color: white;
        }

        .reject-btn {
          background: rgba(239,68,68,0.1);
          color: #ef4444;
          border: 1.5px solid #ef4444;
        }
        .reject-btn:hover {
          background: #ef4444;
          color: white;
        }

        .approval-card-grid {
          display: grid;
          gap: 20px;
          grid-template-columns: 1fr;
        }

        @media (min-width: 769px) {
          .approval-card-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        /* Pagination Styles */
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
          background: rgba(var(--card-bg-rgb), 0.7);
          border: 1px solid #d1d5db;
          border-radius: 8px;
          color: var(--page-text);
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
          backdrop-filter: blur(10px);
        }

        .pagination-button:hover:not(:disabled) {
          border-color: #28a745;
          background: rgba(40, 167, 69, 0.1);
          transform: translateY(-2px);
        }

        .pagination-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .pagination-pages {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .page-number {
          width: 36px;
          height: 36px;
          display: flex;
          justify-content: center;
          align-items: center;
          border-radius: 8px;
          background: rgba(var(--card-bg-rgb), 0.7);
          border: 1px solid #d1d5db;
          color: var(--page-text);
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 14px;
          backdrop-filter: blur(10px);
        }

        .page-number:hover:not(.active-page):not(.dots) {
          border-color: #28a745;
          background: rgba(40, 167, 69, 0.1);
          transform: translateY(-2px);
        }

        .page-number.active-page {
          background: #28a745;
          color: white;
          border-color: #28a745;
          cursor: default;
        }

        .page-number.dots {
          border: none;
          background: transparent;
          cursor: default;
          width: auto;
          padding: 0 4px;
        }

        @media (max-width: 768px) {
          .pagination-container {
            gap: 8px !important;
            padding: 15px 10px !important;
            margin: 20px auto !important;
            flex-wrap: wrap !important;
          }

          .pagination-button {
            padding: 6px 10px !important;
            font-size: 12px !important;
            gap: 4px !important;
          }

          .pagination-button span {
            display: none;
          }

          .pagination-pages {
            gap: 4px !important;
          }

          .page-number {
            width: 30px !important;
            height: 30px !important;
            font-size: 12px !important;
          }
        }
      `}</style>
    </div>
  );
}
