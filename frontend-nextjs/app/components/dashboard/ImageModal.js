"use client";

import React, { useState } from "react";
import Image from "next/image";

export default function ImageModal({
  selectedImage,
  selectedImageOwner,
  onClose,
  t,
  isPrivacyMode, // If true, this modal is used for setting/removing password
  unlockedUsers, // List of emails
  onUnlock, // (email) => void
  onSetPassword, // (newPassword) => void
  onRemovePassword, // () => void
}) {
  const [imagePasswordInput, setImagePasswordInput] = useState("");
  const [newPhotoPassword, setNewPhotoPassword] = useState("");

  if (!selectedImage && !isPrivacyMode) return null;
  // If in privacy mode, we need selectedImageOwner but maybe not selectedImage? 
  // The original logic tied them together. `selectedImage` triggered the modal.

  const userEmail = typeof window !== "undefined" ? sessionStorage.getItem("userEmail") : null;
  const isOwner =
    selectedImageOwner &&
    userEmail &&
    selectedImageOwner.email.toLowerCase() === userEmail.toLowerCase();
  
  const hasPassword = selectedImageOwner && selectedImageOwner.photoPassword;
  const isBlur =
    hasPassword &&
    !isOwner &&
    !unlockedUsers.includes(selectedImageOwner.email);

  return (
    <div
      className="modal"
      onClick={onClose}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2200,
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0,0,0,0.8)",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "auto",
          maxWidth: "90%",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          zIndex: 2201,
          background: "transparent",
          overflowY: "auto",
          padding: "20px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ position: "relative", marginBottom: isOwner ? "20px" : "0" }}>
          {!isPrivacyMode && selectedImage && (
            <>
              <Image
                src={selectedImage}
                alt="Full size"
                width={800}
                height={600}
                style={{
                  maxWidth: "100%",
                  maxHeight: "70vh",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
                  backgroundColor: "white",
                  display: "block",
                  filter: isBlur ? "blur(20px)" : "none",
                  transition: "filter 0.3s ease",
                  width: "auto",
                  height: "auto",
                }}
              />

              {isBlur && (
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    background: "rgba(0,0,0,0.6)",
                    padding: "20px",
                    borderRadius: "8px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    alignItems: "center",
                    width: "80%",
                  }}
                >
                  <h3 style={{ color: "white", margin: 0, textAlign: "center" }}>
                    {t("Password Protected")}
                  </h3>
                  <input
                    type="password"
                    placeholder="Enter Password"
                    value={imagePasswordInput}
                    onChange={(e) => setImagePasswordInput(e.target.value)}
                    style={{
                      padding: "8px",
                      borderRadius: "4px",
                      border: "none",
                      width: "100%",
                    }}
                  />
                  <button
                    onClick={() => {
                      if (imagePasswordInput === selectedImageOwner.photoPassword) {
                        onUnlock(selectedImageOwner.email);
                      } else {
                        alert(t("Incorrect Password"));
                      }
                    }}
                    style={{
                      padding: "8px 16px",
                      background: "#28a745",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      width: "100%",
                    }}
                  >
                    {t("Unlock")}
                  </button>
                </div>
              )}
            </>
          )}

          {/* Privacy / Set Password Mode */}
          {isOwner && (
            <div
              style={{
                marginTop: "15px",
                background: "var(--card-bg)",
                padding: "15px",
                borderRadius: "8px",
                minWidth: "300px",
                color: "var(--card-text)",
              }}
            >
              {isPrivacyMode ? (
                <>
                  <h3 style={{ marginTop: 0 }}>
                    {hasPassword ? t("Change/Remove Password") : t("Set Photo Password")}
                  </h3>
                  <input
                    type="password"
                    placeholder={t("New Password")}
                    value={newPhotoPassword}
                    onChange={(e) => setNewPhotoPassword(e.target.value)}
                    style={{
                      padding: "10px",
                      borderRadius: "4px",
                      border: "1px solid var(--input-border)",
                      width: "100%",
                      marginBottom: "10px",
                    }}
                  />
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      onClick={() => onSetPassword(newPhotoPassword)}
                      style={{
                        padding: "10px",
                        flex: 1,
                        background: "#007bff",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      {t("Save Password")}
                    </button>
                    {hasPassword && (
                      <button
                        onClick={onRemovePassword}
                        style={{
                          padding: "10px",
                          flex: 1,
                          background: "#dc3545",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                      >
                        {t("Remove Password")}
                      </button>
                    )}
                  </div>
                </>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
