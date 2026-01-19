"use client";

import React from "react";

export default function NotificationBanner({ notification, onDismiss, t }) {
  if (!notification) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        backgroundColor: notification.type === "success" ? "#4caf50" : "#f44336",
        color: "white",
        padding: "15px 20px",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        zIndex: 2000,
        minWidth: "300px",
        maxWidth: "500px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        animation: "slideIn 0.3s ease-out",
      }}
    >
      <span style={{ flex: 1 }}>{notification.message}</span>
      <button
        onClick={onDismiss}
        style={{
          marginLeft: "15px",
          background: "none",
          border: "none",
          color: "white",
          fontSize: "24px",
          cursor: "pointer",
          padding: "0 5px",
          lineHeight: "1",
        }}
        title={t("Dismiss")}
      >
        ×
      </button>
    </div>
  );
}
