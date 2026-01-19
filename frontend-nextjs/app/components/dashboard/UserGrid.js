"use client";

import React from "react";
import UserCard from "./UserCard";

export default function UserGrid({
  data, // filtered user list
  view, // "personal", "other", "search"
  t,
  onViewDetail,
  onPrivacy,
  onEdit,
  onRefresh,
  pendingUpdateStatus,
  unlockedUsers,
  setSelectedImage,
  setSelectedImageOwner,
  setIsPrivacyMode,
}) {
  if (data.length === 0) {
    return (
      <div
        style={{
          gridColumn: "1 / -1",
          textAlign: "center",
          padding: "40px",
          backgroundColor: "var(--card-bg)",
          borderRadius: "8px",
          color: "#999",
        }}
      >
        {t("No matching results.")}
      </div>
    );
  }

  return (
    <>
      <div className={`user-grid ${view === "personal" ? "personal-view" : ""}`}>
        {data.map((item) => (
          <UserCard
            key={item.user_id}
            item={item}
            view={view}
            t={t}
            onViewDetail={onViewDetail}
            onPrivacy={onPrivacy}
            onEdit={onEdit}
            onRefresh={onRefresh}
            pendingUpdateStatus={pendingUpdateStatus}
            unlockedUsers={unlockedUsers}
            setSelectedImage={setSelectedImage}
            setSelectedImageOwner={setSelectedImageOwner}
            setIsPrivacyMode={setIsPrivacyMode}
          />
        ))}
      </div>
      <style jsx>{`
        .user-grid {
          display: grid;
          gap: 20px;
          width: 100%;
          margin: 0;
        }
        
        /* Default Mobile: 1 column */
        .user-grid {
          grid-template-columns: 1fr;
          padding: 10px 15px;
        }

        /* Desktop/Tablet (>= 769px) - Enforce 3 columns for non-personal views */
        /* Tablet: 2 Columns */
        @media (min-width: 769px) and (max-width: 1024px) {
          .user-grid:not(.personal-view) {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        /* Desktop: 3 Columns */
        @media (min-width: 1025px) {
          .user-grid:not(.personal-view) {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        /* Personal View Styles */
        .personal-view {
          grid-template-columns: 1fr;
          max-width: 600px;
          margin: 40px auto;
        }
      `}</style>
    </>
  );
}
