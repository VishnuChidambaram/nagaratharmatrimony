"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { API_URL } from "@/app/utils/config";
import { getAuthHeaders } from "@/app/utils/auth-headers";
import { getPhotoUrl, getPhotoUrls } from "@/app/utils/photoUtils";

export default function UserCard({
  item,
  view, // "personal", "other", "search" (affects styling)
  t,
  onViewDetail,
  onPrivacy,
  onEdit, // function(item)
  onRefresh, // callback to refetch data after photo update
  pendingUpdateStatus,
  unlockedUsers = [],
  setSelectedImage,
  setSelectedImageOwner,
  setIsPrivacyMode,
  onToggleShortlist,
  isShortlisted,
}) {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [contactRequestStatus, setContactRequestStatus] = useState(null); // null | 'pending' | 'approved' | 'rejected'
  const [requestLoading, setRequestLoading] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentUserEmail(sessionStorage.getItem("userEmail"));
    }
  }, []);

  // Compute isOwnCard before hooks that depend on it
  const isOwnCard =
    currentUserEmail &&
    item.email &&
    currentUserEmail.toLowerCase() === item.email.toLowerCase();

  // Check existing contact request status for non-own cards
  useEffect(() => {
    if (isOwnCard || !item.user_id || !currentUserEmail) return;
    const checkStatus = async () => {
      try {
        const res = await fetch(`${API_URL}/api/contact-requests/status/${item.user_id}`, {
          credentials: "include",
          headers: { ...getAuthHeaders() },
        });
        const data = await res.json();
        if (data.success) setContactRequestStatus(data.status);
      } catch {}
    };
    checkStatus();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.user_id, isOwnCard]);

  const handleRequestContact = async (e) => {
    e.stopPropagation();
    if (requestLoading || contactRequestStatus) return;
    setRequestLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/contact-requests/send`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ target_user_id: item.user_id }),
      });
      const data = await res.json();
      if (data.success) {
        setContactRequestStatus("pending");
      } else {
        setContactRequestStatus(data.status || "pending");
      }
    } catch {
      // silent
    } finally {
      setRequestLoading(false);
    }
  };

  const allPhotos = getPhotoUrls(item);
  const mainPhoto = getPhotoUrl(item, "https://via.placeholder.com/80");

  const handlePhotoSelect = async (selectedPhotoUrl) => {
    if (!isOwnCard) return;

    // Reorder photos: move selected to front
    const newPhotos = [
      selectedPhotoUrl,
      ...allPhotos.filter((p) => p !== selectedPhotoUrl),
    ];

    const toRelative = (url) => {
      if (url.startsWith(`${API_URL}/`)) {
        return url.replace(`${API_URL}/`, "");
      }
      return url;
    };

    const photoPathsToSave = newPhotos.map(toRelative);

    try {
      const response = await fetch(`${API_URL}/upload-details/${item.email}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          photo: JSON.stringify(photoPathsToSave),
        }),
      });
      const result = await response.json();
      if (result.success) {
        if (onRefresh) onRefresh();
      } else {
        alert("Failed to update photo: " + result.message);
      }
    } catch (e) {
      console.error("Error updating photo", e);
      alert("Error updating photo");
    }
  };

  return (
    <div
      className="user-card"
      style={{
        border:
          view === "personal" ? "2px solid #28a745" : "1px solid var(--input-border)",
        borderRadius: "12px",
        padding: view === "personal" ? "30px" : "20px",
        backgroundColor: "var(--card-bg)",
        boxShadow:
          view === "personal"
            ? "0 10px 25px rgba(40,167,69,0.15)"
            : "0 4px 8px rgba(0,0,0,0.1)",
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.2s, box-shadow 0.2s",
        cursor: "pointer",
        margin: "15px",
      }}
    >
      {/* Header with Image and Basic Info */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "15px",
          position: "relative",
        }}
      >
        {!isOwnCard && onToggleShortlist && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              onToggleShortlist(item.user_id);
            }}
            style={{
              position: "absolute",
              top: "-5px",
              right: "-5px",
              background: "white",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              cursor: "pointer",
              transition: "transform 0.2s",
              zIndex: 10,
              color: isShortlisted ? "#ff4757" : "#ced4da",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.2)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            {isShortlisted ? "❤️" : "🤍"}
          </div>
        )}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginRight: "15px",
          }}
        >
          <Image
            src={mainPhoto}
            alt={item.name}
            width={80}
            height={80}
            style={{
              borderRadius: "50%",
              objectFit: "cover",
              cursor: "pointer",
              border: isOwnCard ? "2px solid #28a745" : "none",
              filter:
                item.hasPhotoPassword &&
                !isOwnCard &&
                !unlockedUsers.includes(item.email)
                  ? "blur(8px)"
                  : "none",
            }}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedImage(mainPhoto);
              setSelectedImageOwner(item);
              setIsPrivacyMode(false);
            }}
          />
          {isOwnCard && allPhotos.length > 1 && (
            <div
              style={{
                display: "flex",
                gap: "5px",
                marginTop: "5px",
                flexWrap: "wrap",
                maxWidth: "100px",
              }}
            >
              {allPhotos.slice(1).map((photo, idx) => (
                <Image
                  key={idx}
                  src={photo}
                  alt="thumb"
                  width={30}
                  height={30}
                  style={{
                    borderRadius: "50%",
                    objectFit: "cover",
                    cursor: "pointer",
                    opacity: 0.7,
                    filter: "none",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImage(photo);
                    setSelectedImageOwner(item);
                    handlePhotoSelect(photo);
                    setIsPrivacyMode(false);
                  }}
                  onMouseEnter={(e) => (e.target.style.opacity = 1)}
                  onMouseLeave={(e) => (e.target.style.opacity = 0.7)}
                />
              ))}
            </div>
          )}
        </div>
        <div style={{ flex: 1 }}>
          {isOwnCard && (
            <>
              <div
                style={{
                  display: "inline-block",
                  background:
                    "linear-gradient(135deg, #28a745 0%, #20c997 100%)",
                  color: "white",
                  fontSize: "14px",
                  fontWeight: "bold",
                  padding: "8px 16px",
                  borderRadius: "25px",
                  marginBottom: "8px",
                  boxShadow:
                    "0 4px 15px rgba(40, 167, 69, 0.4), 0 0 20px rgba(40, 167, 69, 0.2)",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  border: "2px solid rgba(255, 255, 255, 0.3)",
                  animation: "pulse 2s ease-in-out infinite",
                }}
              >
                {t("✨ It's You ✨")}
              </div>
              {pendingUpdateStatus && (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onEdit) onEdit(); // Trigger edit/cancel modal
                  }}
                  style={{
                    display: "inline-block",
                    marginLeft: "10px",
                    background:
                      "linear-gradient(135deg, #ff9800 0%, #ff5722 100%)",
                    color: "white",
                    fontSize: "12px",
                    fontWeight: "bold",
                    padding: "6px 12px",
                    borderRadius: "20px",
                    marginBottom: "8px",
                    boxShadow: "0 2px 8px rgba(255, 152, 0, 0.4)",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    border: "2px solid rgba(255, 255, 255, 0.3)",
                    cursor: "pointer",
                  }}
                  title={t("Click to manage request")}
                >
                  🕒 {t("Update Pending")}
                </div>
              )}
            </>
          )}
          <h3
            style={{
              margin: "0 0 5px 0",
              color: "var(--card-text)",
              fontSize: "17px",
              fontWeight: "500",
            }}
          >
            {item.name}
          </h3>
          <p
            style={{
              margin: "0",
              color: "var(--card-text)",
              opacity: 0.7,
              fontSize: "13px",
            }}
          >
            ID: {item.user_id}
          </p>

          {/* Heritage Badges */}
          <div
            style={{
              display: "flex",
              gap: "8px",
              marginTop: "10px",
              flexWrap: "wrap",
            }}
          >
            {item.yourTemple && (
              <span
                className="heritage-badge"
                style={{
                  background: "linear-gradient(45deg, #FF6B6B, #EE5D5D)",
                  color: "white",
                  padding: "4px 10px",
                  borderRadius: "12px",
                  fontSize: "11px",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                }}
              >
                🏛️ {item.yourTemple}
              </span>
            )}
            {item.yourDivision && (
              <span
                className="heritage-badge"
                style={{
                  background: "linear-gradient(45deg, #4ECDC4, #556270)",
                  color: "white",
                  padding: "4px 10px",
                  borderRadius: "12px",
                  fontSize: "11px",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                }}
              >
                🌿 {item.yourDivision}
              </span>
            )}
          </div>
        </div>
      </div>

      {!isOwnCard && item.matchScore !== undefined && (
        <div 
          style={{ position: 'relative', width: 'fit-content', margin: '0 auto 5px' }}
          onMouseEnter={() => setShowBreakdown(true)}
          onMouseLeave={() => setShowBreakdown(false)}
          onClick={(e) => {
            e.stopPropagation();
            setShowBreakdown(!showBreakdown);
          }}
        >
          <div
            style={{
              padding: "5px 12px",
              background: "linear-gradient(135deg, #ffd700 0%, #ffa500 100%)",
              color: "#333",
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: "900",
              boxShadow: "0 4px 10px rgba(255, 215, 0, 0.3)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              whiteSpace: "nowrap",
              border: "1px solid rgba(255, 255, 255, 0.5)",
              animation: "pulse 2s ease-in-out infinite",
              cursor: "help",
            }}
          >
            <span style={{ fontSize: "14px" }}>🔥</span> {item.matchScore.toFixed(1)}% {t("Match")}
          </div>

          {showBreakdown && item.matchBreakdown && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: "50%",
                transform: "translateX(-50%)",
                background: "rgba(255, 255, 255, 0.98)",
                backdropFilter: "blur(15px)",
                border: "1px solid #ffd700",
                borderRadius: "12px",
                padding: "15px",
                zIndex: 9999,
                width: "220px",
                boxShadow: "0 15px 35px rgba(0,0,0,0.3)",
                fontSize: "13px",
                color: "#333",
                animation: "cardFadeIn 0.3s ease-out",
                marginTop: "10px"
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h4 style={{ margin: "0 0 8px 0", borderBottom: "1px solid #eee", paddingBottom: "4px", fontSize: "13px", color: "#ffa500" }}>
                {t("Match Breakdown")}
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {Object.entries(item.matchBreakdown).filter(([, val]) => val > 0).map(([key, val]) => (
                  <div key={key} style={{ display: 'flex', justifyContent: 'space-between', opacity: val > 0 ? 1 : 0.5 }}>
                    <span style={{ textTransform: 'capitalize' }}>
                      {t(key)}
                    </span>
                    <span style={{ fontWeight: 'bold' }}>+{val.toFixed(1)}</span>
                  </div>
                ))}
                <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '2px solid #eee', display: 'flex', justifyContent: 'space-between', fontWeight: '900', color: '#28a745' }}>
                  <span>{t("Total")}</span>
                  <span>{item.matchScore.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}


      {/* Details Section */}
      <div style={{ flex: 1, marginBottom: "15px", fontSize: "14px" }}>
        <div style={{ marginBottom: "8px" }}>
          <span style={{ color: "var(--card-text)", opacity: 0.7, fontWeight: "500", fontSize: "13px" }}>
            {t("Email")}:
          </span>{" "}
          <span style={{ color: "var(--card-text)" }}>
            {isOwnCard || contactRequestStatus === "approved" ? item.email : "🔒 " + t("Hidden")}
          </span>
        </div>
        <div style={{ marginBottom: "8px" }}>
          <span style={{ color: "var(--card-text)", opacity: 0.7, fontWeight: "500", fontSize: "13px" }}>
            {t("Phone")}:
          </span>{" "}
          <span style={{ color: "var(--card-text)" }}>
            {isOwnCard || contactRequestStatus === "approved" ? item.phone : "🔒 " + t("Hidden")}
          </span>
        </div>
        <div style={{ marginBottom: "8px" }}>
          <span style={{ color: "var(--card-text)", opacity: 0.7, fontWeight: "500", fontSize: "13px" }}>
            {t("Qualification")}:
          </span>{" "}
          <span style={{ color: "var(--card-text)" }}>
            {item.educationQualification || "N/A"}
          </span>
        </div>
        <div style={{ marginBottom: "8px" }}>
          <span style={{ color: "var(--card-text)", opacity: 0.7, fontWeight: "500", fontSize: "13px" }}>
            {t("Work Details")}:
          </span>{" "}
          <span
            style={{
              color: "var(--card-text)",
              display: "inline",
              marginLeft: "5px",
              lineHeight: "1.4",
            }}
            title={item.workDetails || ""}
          >
            {item.workDetails && item.workDetails.length > 100
              ? `${item.workDetails.substring(0, 100)}...`
              : item.workDetails || "N/A"}
          </span>
        </div>
      </div>

      {/* Actions Section */}
      <div className="card-actions">
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onViewDetail) onViewDetail({ ...item, contactRequestStatus });
          }}
          className="action-btn view-btn"
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "#28a745";
          }}
        >
          {t("More Detail")}
        </button>
        {isOwnCard && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              const photos = getPhotoUrls(item);
              const mainPhoto =
                photos.length > 0 ? photos[0] : "https://via.placeholder.com/80";
              setSelectedImage(mainPhoto);
              setSelectedImageOwner(item);
              if (onPrivacy) onPrivacy();
            }}
            className="action-btn privacy-btn"
          >
            {t("Privacy")}
          </button>
        )}
        {isOwnCard && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onEdit) onEdit();
            }}
            className="action-btn edit-btn"
            style={{
              backgroundColor: pendingUpdateStatus ? "#6c757d" : "#ffc107",
              color: pendingUpdateStatus ? "white" : "#000",
            }}
            title={
              pendingUpdateStatus ? t("Pending Approval") : t("Edit Profile")
            }
          >
            {t("Edit Profile")}
          </button>
        )}
        {isOwnCard && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              window.dispatchEvent(new CustomEvent("show-delete-account-modal"));
            }}
            className="action-btn delete-btn"
            style={{
              backgroundColor: "#dc3545",
              color: "white",
              fontWeight: "bold",
            }}
          >
            {t("Delete Account")}
          </button>
        )}
        {!isOwnCard && (() => {
          const statusConfig = {
            pending:  { label: t("Requested"), bg: "#f59e0b", color: "white" },
            approved: { label: t("Approved"),  bg: "#28a745", color: "white" },
            rejected: { label: t("Rejected"),   bg: "#6c757d", color: "white" },
          };
          const cfg = contactRequestStatus ? statusConfig[contactRequestStatus] : null;
          return (
            <button
              onClick={handleRequestContact}
              className="action-btn"
              disabled={!!contactRequestStatus || requestLoading}
              style={{
                backgroundColor: cfg ? cfg.bg : "#6f42c1",
                color: cfg ? cfg.color : "white",
                cursor: contactRequestStatus ? "default" : "pointer",
                opacity: requestLoading ? 0.7 : 1,
              }}
              title={t("Request contact details")}
            >
              {requestLoading ? "..." : cfg ? cfg.label : "📞 " + t("Request Contact")}
            </button>
          );
        })()}
      </div>

      <style jsx>{`
        .card-actions {
          border-top: 1px solid var(--input-border);
          padding-top: 15px;
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .action-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 6px 12px;
          border: none;
          border-radius: 4px;
          fontSize: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
          flex: 1; /* Allow equal width */
          white-space: nowrap;
          min-width: 0;
        }

        .view-btn {
          background-color: #28a745;
          color: white;
        }

        .privacy-btn {
          background-color: #007bff;
          color: white;
        }

        /* Mobile Adjustments */
        @media (max-width: 768px) {
          .card-actions {
            flex-wrap: nowrap; /* Enforce single line */
            gap: 5px;
          }

          .action-btn {
            padding: 6px 4px;
            font-size: 11px;
          }
        }
      `}</style>
    </div>
  );
}
