"use client";
import React, { useState, useEffect } from "react";

export default function NotificationToast() {
  const [notification, setNotification] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 1. Check for flash message from sessionStorage on mount (page reload)
    // We add a small delay to ensure the animation plays nicely after load
    const checkSession = () => {
      if (typeof window !== "undefined") {
        const msg = sessionStorage.getItem("flash_message");
        if (msg) {
          showToast(msg);
          sessionStorage.removeItem("flash_message");
        }
      }
    };

    // Small timeout to allow hydration/mounting
    const timer = setTimeout(checkSession, 100);

    // 2. Listen for custom event 'show-notification' (SPA navigation)
    const handleCustomEvent = (e) => {
      if (e.detail && typeof e.detail === 'object') {
        showToast(e.detail.message, e.detail.type);
      } else if (e.detail) {
        showToast(e.detail);
      }
    };

    window.addEventListener("show-notification", handleCustomEvent);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("show-notification", handleCustomEvent);
    };
  }, []);

  const showToast = (message, type = "success") => {
    setNotification({ message, type });
    setIsVisible(true);

    // Auto hide after 4 seconds
    setTimeout(() => {
      setIsVisible(false);
    }, 4000);

    // Completely clear after animation
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  if (!notification) return null;

  const { type } = notification;

  return (

    <>
      <style jsx>{`
        @keyframes slideInLeft {
          0% {
            opacity: 0;
            transform: translateX(-100vw);
          }
          60% {
            transform: translateX(5%); /* Overshoot slightly */
          }
          80% {
            transform: translateX(-2%);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideOut {
          0% {
            opacity: 1;
            transform: scale(1);
          }
          100% {
            opacity: 0;
            transform: scale(0.9);
          }
        }
        @keyframes drawCheck {
          0% { stroke-dasharray: 100; stroke-dashoffset: 100; }
          100% { stroke-dasharray: 100; stroke-dashoffset: 0; }
        }
        @keyframes drawX {
          0% { stroke-dasharray: 100; stroke-dashoffset: 100; }
          100% { stroke-dasharray: 100; stroke-dashoffset: 0; }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <div
        style={{
          position: "fixed",
          top: "0",
          left: "0",
          width: "100%",
          height: "100%",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            minWidth: "400px",
            maxWidth: "90%",
            background: "rgba(255, 255, 255, 0.95)", // Glass effect base
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            padding: "40px",
            borderRadius: "24px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.6)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: "20px",
            pointerEvents: "auto",
            borderTop: `8px solid ${type === 'error' ? '#ef4444' : type === 'info' ? '#3b82f6' : type === 'loading' ? '#f59e0b' : '#4CAF50'}`,
            animation: isVisible ? "slideInLeft 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) forwards" : "slideOut 0.4s ease-in forwards",
          }}
        >
          <div
            style={{
              width: "80px",
              height: "80px",
              background: `linear-gradient(135deg, ${type === 'error' ? '#ef4444, #dc2626' : type === 'info' ? '#3b82f6, #2563eb' : type === 'loading' ? '#f59e0b, #d97706' : '#4CAF50, #45a049'})`,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "40px",
              flexShrink: 0,
              boxShadow: `0 10px 20px ${type === 'error' ? 'rgba(239, 68, 68, 0.4)' : type === 'info' ? 'rgba(59, 130, 246, 0.4)' : type === 'loading' ? 'rgba(245, 158, 11, 0.4)' : 'rgba(76, 175, 80, 0.4)'}`,
              marginBottom: "10px",
            }}
          >
            {type === 'error' ? (
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" style={{ strokeDasharray: 100, strokeDashoffset: 100, animation: isVisible ? "drawX 0.6s 0.3s ease-out forwards" : "none" }} />
                <line x1="6" y1="6" x2="18" y2="18" style={{ strokeDasharray: 100, strokeDashoffset: 100, animation: isVisible ? "drawX 0.6s 0.3s ease-out forwards" : "none" }} />
              </svg>
            ) : type === 'info' ? (
              <span style={{ fontSize: '40px', fontWeight: 'bold' }}>i</span>
            ) : type === 'loading' ? (
               <div style={{
                 border: "4px solid rgba(255, 255, 255, 0.3)",
                 borderRadius: "50%",
                 borderTop: "4px solid #fff",
                 width: "40px",
                 height: "40px",
                 animation: "spin 1s linear infinite"
               }} />
            ) : (
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" style={{
                  strokeDasharray: 100,
                  strokeDashoffset: 100,
                  animation: isVisible ? "drawCheck 0.6s 0.3s ease-out forwards" : "none"
                }}/>
              </svg>
            )}
          </div>
          <div>
            <h4
              style={{
                margin: 0,
                fontSize: "28px",
                fontWeight: "800",
                color: "#1a1a1a",
                letterSpacing: "-0.5px",
                textTransform: "capitalize",
              }}
            >
              {type || "Success"}
            </h4>
            <p
              style={{
                margin: "12px 0 0 0",
                fontSize: "18px",
                color: "#555",
                lineHeight: "1.5",
                fontWeight: "500",
              }}
            >
              {notification.message}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
