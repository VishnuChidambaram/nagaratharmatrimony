"use client";

import React from "react";

export default function CancelUpdateModal({ onCancel, onKeep, t }) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2200,
      }}
      onClick={onKeep}
    >
      <div
        style={{
          background: "var(--card-bg)",
          color: "var(--card-text)",
          padding: "30px",
          borderRadius: "12px",
          textAlign: "center",
          maxWidth: "400px",
          width: "90%",
          boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ marginTop: 0 }}>{t("Pending Request")}</h2>
        <p>
          {t(
            "You have an update request pending approval. What would you like to do?"
          )}
        </p>
        <div
          style={{
            display: "flex",
            gap: "10px",
            justifyContent: "center",
            marginTop: "20px",
          }}
        >
          <button
            onClick={onKeep}
            style={{
              padding: "10px 20px",
              background: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            {t("Wait for Approval")}
          </button>
          <button
            onClick={onCancel}
            style={{
              padding: "10px 20px",
              background: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            {t("Cancel Update")}
          </button>
        </div>
      </div>
    </div>
  );
}
