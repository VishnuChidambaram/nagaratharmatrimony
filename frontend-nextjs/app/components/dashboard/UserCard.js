"use client";

import React, { useState } from "react";
import Image from "next/image";
import { API_URL } from "@/app/utils/config";
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
}) {
  const [currentUserEmail] = useState(() =>
    typeof window !== "undefined" ? sessionStorage.getItem("userEmail") : null
  );

  const isOwnCard =
    currentUserEmail &&
    item.email &&
    currentUserEmail.toLowerCase() === item.email.toLowerCase();

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
        }}
      >
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
                item.photoPassword &&
                item.photoPassword.length > 0 &&
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

      {/* Details Section */}
      <div style={{ flex: 1, marginBottom: "15px", fontSize: "14px" }}>
        <div style={{ marginBottom: "8px" }}>
          <span style={{ color: "var(--card-text)", opacity: 0.7, fontWeight: "500", fontSize: "13px" }}>
            {t("Email")}:
          </span>{" "}
          <span style={{ color: "var(--card-text)" }}>{item.email}</span>
        </div>
        <div style={{ marginBottom: "8px" }}>
          <span style={{ color: "var(--card-text)", opacity: 0.7, fontWeight: "500", fontSize: "13px" }}>
            {t("Phone")}:
          </span>{" "}
          <span style={{ color: "var(--card-text)" }}>{item.phone}</span>
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
            if (onViewDetail) onViewDetail(item);
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
