"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import React from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "../hooks/useLanguage";
import { translations } from "../utils/translations";
import { API_URL } from "@/app/utils/config";
import { getAuthHeaders } from "@/app/utils/auth-headers";

// Components
import DashboardHeader from "../components/dashboard/DashboardHeader";
import NotificationBanner from "../components/dashboard/NotificationBanner";
import UserGrid from "../components/dashboard/UserGrid";
import UserDetailModal from "../components/dashboard/UserDetailModal";
import ImageModal from "../components/dashboard/ImageModal";
import CancelUpdateModal from "../components/dashboard/CancelUpdateModal";

export default function Dashboard() {
  const router = useRouter();
  const scrollRef = useRef(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedImageOwner, setSelectedImageOwner] = useState(null);
  const [unlockedUsers, setUnlockedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [notification, setNotification] = useState(null);
  const [shortlistedIds, setShortlistedIds] = useState([]);
  const [suggestedMatches, setSuggestedMatches] = useState([]);

  const [pendingUpdateStatus, setPendingUpdateStatus] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [pendingRequestId, setPendingRequestId] = useState(null);
  const [isPrivacyMode, setIsPrivacyMode] = useState(false);
  const [view, setView] = useState("dashboard"); // dashboard, personal, other, search, shortlist, matches
  const [searchField, setSearchField] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const PROFILES_PER_PAGE = 18;

  const { language } = useLanguage();

  // Translation helper function
  const t = useCallback(
    (key) => {
      if (
        language === "ta" &&
        translations[key] &&
        translations[key].ta
      ) {
        return translations[key].ta;
      }
      return key;
    },
    [language]
  );

  // Poll for notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      const email = sessionStorage.getItem("userEmail");
      if (email) {
        try {
          const res = await fetch(`${API_URL}/api/notifications/${email}`, {
            credentials: "include",
            headers: { ...getAuthHeaders() },
          });
          const data = await res.json();
          if (data.success && data.notifications.length > 0) {
            setNotification(data.notifications[0]);
          } else {
            setNotification(null);
          }
        } catch (error) {
          console.error("Error fetching notifications:", error);
        }
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [t]);

  const handleDismissNotification = async () => {
    if (notification) {
      try {
        await fetch(
          `${API_URL}/api/notifications/${notification.notification_id}/read`,
          {
            method: "PUT",
            credentials: "include",
          }
        );
        setNotification(null);
      } catch (error) {
        console.error("Error dismissing notification:", error);
      }
    }
  };

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Auto-hide error
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/all-details`, {
        credentials: "include",
        headers: { ...getAuthHeaders() },
      });
      const result = await response.json();
      if (result.success) {
        if (result.message === "Authentication required to view all details") {
          sessionStorage.removeItem("userEmail");
          router.push("/login");
          return;
        }
        setData(result.data);
      } else {
        setError(t("Failed to fetch data"));
      }
    } catch (err) {
      setError(t("Error fetching data"));
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [t, router]);

  const fetchShortlist = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/shortlist/ids`, {
        credentials: "include",
        headers: { ...getAuthHeaders() },
      });
      const result = await response.json();
      if (result.success) {
        setShortlistedIds(result.ids || []);
      }
    } catch (err) {
      console.error("Error fetching shortlist:", err);
    }
  }, []);

  const fetchMatches = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/matches/suggested`, {
        credentials: "include",
        headers: { ...getAuthHeaders() },
      });
      const result = await response.json();
      if (result.success) {
        setSuggestedMatches(result.data || []);
      }
    } catch (err) {
      console.error("Error fetching matches:", err);
    }
  }, []);

  const checkPendingUpdate = useCallback(async (email) => {
    try {
      const res = await fetch(`${API_URL}/api/update-requests/user/${email}`, {
        credentials: "include",
        headers: { ...getAuthHeaders() },
      });
      const data = await res.json();
      if (data.success && data.hasPending) {
        setPendingUpdateStatus(true);
        setPendingRequestId(data.request ? data.request.request_id : null);
      } else {
        setPendingUpdateStatus(false);
        setPendingRequestId(null);
      }
    } catch (error) {
      console.error("Error checking pending status:", error);
    }
  }, []);

  useEffect(() => {
    const userEmail = sessionStorage.getItem("userEmail");
    if (!userEmail) {
      router.push("/login");
      return;
    }

    fetchData();
    checkPendingUpdate(userEmail);
    fetchShortlist();
    fetchMatches();

    const interval = setInterval(() => checkPendingUpdate(userEmail), 15000);
    return () => clearInterval(interval);
  }, [fetchData, checkPendingUpdate, fetchMatches, fetchShortlist, router]);

  // Reset page and scroll to top when view or page changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [view, currentPage]);

  // Handle view changes specifically for page reset
  useEffect(() => {
    setCurrentPage(1);
  }, [view]);

  // Reset page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  const currentUserEmail =
    typeof window !== "undefined"
      ? sessionStorage.getItem("userEmail")?.toLowerCase()
      : null;

  const filteredData = data.filter((item) => {
    if (
      currentUserEmail &&
      item.email &&
      item.email.toLowerCase() === currentUserEmail
    ) {
      return false;
    }

    if (!debouncedSearchTerm) {
      // If we are in search view and no term is entered, we return nothing
      // This is handled in the UI rendering part below
      return true;
    }
    const term = debouncedSearchTerm.toLowerCase();

    if (searchField) {
      const value = item[searchField];
      return value && value.toString().toLowerCase().includes(term);
    }

    return (
      (item.name && item.name.toLowerCase().includes(term)) ||
      (item.email && item.email.toLowerCase().includes(term)) ||
      (item.phone && item.phone.toLowerCase().includes(term)) ||
      (item.yourTemple && item.yourTemple.toLowerCase().includes(term)) ||
      (item.yourDivision && item.yourDivision.toLowerCase().includes(term)) ||
      (item.description && item.description.toLowerCase().includes(term)) ||
      (item.educationQualification &&
        item.educationQualification.toLowerCase().includes(term)) ||
      (item.workDetails && item.workDetails.toLowerCase().includes(term)) ||
      (item.user_id && item.user_id.toString().toLowerCase().includes(term)) ||
      (item.created_at && item.created_at.toLowerCase().includes(term)) ||
      (item.imagePath && item.imagePath.toLowerCase().includes(term)) ||
      (item.pdfPath && item.pdfPath.toLowerCase().includes(term))
    );
  });

  const personalData = data.filter(
    (item) => item.email?.toLowerCase() === currentUserEmail
  );
  const otherData = data.filter(
    (item) => item.email?.toLowerCase() !== currentUserEmail
  );
  const shortlistedData = data.filter(
    (item) => shortlistedIds.includes(item.user_id)
  );
  // suggestedMatches state already contains the ranked data with scores

  const allDisplayData = React.useMemo(() => {
    if (view === "personal") return personalData;
    if (view === "other") return otherData;
    if (view === "shortlist") return shortlistedData;
    if (view === "matches") return suggestedMatches;
    if (view === "search") return debouncedSearchTerm ? filteredData : [];
    return filteredData;
  }, [view, personalData, otherData, shortlistedData, suggestedMatches, filteredData, debouncedSearchTerm]);

  const handleCancelUpdate = async () => {
    if (!pendingRequestId) return;

    try {
      const res = await fetch(
        `${API_URL}/api/update-requests/${pendingRequestId}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: { ...getAuthHeaders() },
        }
      );
      const data = await res.json();

      if (data.success) {
        setPendingUpdateStatus(false);
        setPendingRequestId(null);
        setShowCancelModal(false);
        setNotification({
          type: "success",
          message: t("Update request cancelled successfully."),
          notification_id: Date.now(),
        });
        setTimeout(() => setNotification(null), 3000);
      } else {
        alert(data.message || t("Failed to cancel request"));
      }
    } catch (error) {
      console.error("Error cancelling request:", error);
      alert(t("Error cancelling request"));
    }
  };

  const handleToggleShortlist = async (userId) => {
    try {
      const response = await fetch(`${API_URL}/api/shortlist/toggle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        credentials: "include",
        body: JSON.stringify({ shortlisted_user_id: userId }),
      });
      const result = await response.json();
      if (result.success) {
        setShortlistedIds((prev) =>
          result.action === "added"
            ? [...prev, userId]
            : prev.filter((id) => id !== userId)
        );

        setNotification({
          type: "success",
          message:
            result.action === "added"
              ? t("Added to Shortlist")
              : t("Removed from Shortlist"),
          notification_id: Date.now(),
        });
        setTimeout(() => setNotification(null), 2000);
      }
    } catch (error) {
      console.error("Error toggling shortlist:", error);
    }
  };

  const handleSetPhotoPassword = async (newPhotoPassword) => {
    if (!selectedImageOwner || !newPhotoPassword) return;

    try {
      const formData = new FormData();
      formData.append("photoPassword", newPhotoPassword);

      const response = await fetch(
        `${API_URL}/upload-details/${selectedImageOwner.email}`,
        {
          method: "PUT",
          credentials: "include",
          headers: { ...getAuthHeaders() },
          body: formData,
        }
      );

      const result = await response.json();
      if (result.success) {
        setNotification({
          type: "success",
          message: t("Photo password set successfully!"),
          notification_id: Date.now(),
        });
        setTimeout(() => setNotification(null), 3000);

        setSelectedImageOwner({
          ...selectedImageOwner,
          photoPassword: newPhotoPassword,
        });
        setData((prevData) =>
          prevData.map((u) =>
            u.email === selectedImageOwner.email
              ? { ...u, photoPassword: newPhotoPassword }
              : u
          )
        );

        setSelectedImage(null);
        setIsPrivacyMode(false);
      } else {
        setNotification({
          type: "error",
          message: t("Failed to set password: ") + result.message,
          notification_id: Date.now(),
        });
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (error) {
      console.error("Error setting password:", error);
      setNotification({
        type: "error",
        message: t("Error setting password"),
        notification_id: Date.now(),
      });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleRemovePhotoPassword = async () => {
    if (!selectedImageOwner) return;

    try {
      const formData = new FormData();
      formData.append("photoPassword", "");

      const response = await fetch(
        `${API_URL}/upload-details/${selectedImageOwner.email}`,
        {
          method: "PUT",
          credentials: "include",
          headers: { ...getAuthHeaders() },
          body: formData,
        }
      );

      const result = await response.json();
      if (result.success) {
        setSelectedImageOwner({ ...selectedImageOwner, photoPassword: "" });
        setData((prevData) =>
          prevData.map((u) =>
            u.email === selectedImageOwner.email
              ? { ...u, photoPassword: "" }
              : u
          )
        );

        setNotification({
          type: "success",
          message: t("Privacy turned off successfully"),
          notification_id: Date.now(),
        });
        setTimeout(() => setNotification(null), 3000);
      } else {
        setNotification({
          type: "error",
          message: t("Failed to remove password: ") + result.message,
          notification_id: Date.now(),
        });
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (error) {
      console.error("Error removing password:", error);
      setNotification({
        type: "error",
        message: t("Error removing password"),
        notification_id: Date.now(),
      });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleUnlock = (email) => {
    setUnlockedUsers((prev) => [...prev, email]);
  };

  return (
    <div
      style={{
        height: "calc(100vh - 70px)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        background: "var(--page-bg)",
        backgroundImage: `
          radial-gradient(at 0% 0%, hsla(145, 63%, 42%, 0.05) 0, transparent 50%),
          radial-gradient(at 100% 0%, hsla(150, 60%, 50%, 0.05) 0, transparent 50%),
          radial-gradient(at 100% 100%, hsla(160, 50%, 45%, 0.05) 0, transparent 50%),
          radial-gradient(at 0% 100%, hsla(140, 55%, 40%, 0.05) 0, transparent 50%)
        `,
        color: "var(--page-text)",
        fontFamily: '"Outfit", "Inter", sans-serif',
      }}
    >
      {/* Modals */}
      {showCancelModal && (
        <CancelUpdateModal
          onCancel={handleCancelUpdate}
          onKeep={() => setShowCancelModal(false)}
          t={t}
        />
      )}

      {selectedUser && (
        <UserDetailModal
          selectedUser={selectedUser}
          onClose={() => setSelectedUser(null)}
          t={t}
          setSelectedImage={setSelectedImage}
          setSelectedImageOwner={setSelectedImageOwner}
          setIsPrivacyMode={setIsPrivacyMode}
          unlockedUsers={unlockedUsers}
        />
      )}

      <ImageModal
        selectedImage={selectedImage}
        selectedImageOwner={selectedImageOwner}
        onClose={() => {
          setSelectedImage(null);
          setSelectedImageOwner(null);
          setIsPrivacyMode(false);
        }}
        t={t}
        isPrivacyMode={isPrivacyMode}
        unlockedUsers={unlockedUsers}
        onUnlock={handleUnlock}
        onSetPassword={handleSetPhotoPassword}
        onRemovePassword={handleRemovePhotoPassword}
      />

      <NotificationBanner
        notification={notification}
        onDismiss={handleDismissNotification}
        t={t}
      />

      {/* Main Content */}
      <DashboardHeader
        view={view}
        setView={setView}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        searchField={searchField}
        setSearchField={setSearchField}
        t={t}
      />

      <div
        ref={scrollRef}
        className={`scrollable-content ${
          view === "dashboard" ? "no-scroll-desktop" : ""
        }`}
      >
        <style jsx>{`
          .scrollable-content {
            flex: 1;
            overflow: auto;
            scrollbar-width: none;
            -ms-overflow-style: none;
            max-height: calc(100vh - 60px);
            padding-bottom: 5px;
          }

          @media (min-width: 1025px) {
            .no-scroll-desktop {
              /* Remove overflow hidden to allow seeing the second row of cards */
              overflow: auto !important;
            }
          }
          .scrollable-content::-webkit-scrollbar {
            display: none;
          }
          @keyframes pulse {
            0%,
            100% {
              transform: scale(1);
              box-shadow: 0 4px 15px rgba(40, 167, 69, 0.4),
                0 0 20px rgba(40, 167, 69, 0.2);
            }
            50% {
              transform: scale(1.05);
              box-shadow: 0 6px 20px rgba(40, 167, 69, 0.6),
                0 0 30px rgba(40, 167, 69, 0.4);
            }
          }
           @keyframes spinner {
            to { transform: rotate(360deg); }
          }
          .loading-spinner {
            width: 50px;
            height: 50px;
            border: 4px solid rgba(40, 167, 69, 0.1);
            border-left-color: #28a745;
            border-radius: 50%;
            animation: spinner 0.8s linear infinite;
            margin: 0 auto 20px;
          }
          /* Card Hover Effects */
          .dashboard-card,
          .user-card {
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
            backdrop-filter: blur(10px) !important;
            -webkit-backdrop-filter: blur(10px) !important;
            background: rgba(var(--card-bg-rgb), 0.7) !important;
            border: 1px solid #d1d5db !important;
            border-radius: 16px !important;
            animation: cardFadeIn 0.6s ease-out backwards;
            min-height: 300px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
          }

          .dashboard-card:hover,
          .user-card:hover {
            border-color: #28a745 !important;
            box-shadow: 0 20px 40px rgba(40, 167, 69, 0.15),
              0 0 20px rgba(40, 167, 69, 0.05) !important;
            transform: translateY(-8px) scale(1.02) !important;
            background-color: rgba(40, 167, 69, 0.05) !important;
          }

          .dashboard-card:active,
          .user-card:active {
            transform: translateY(-2px) scale(0.98) !important;
            box-shadow: 0 5px 15px rgba(40, 167, 69, 0.1) !important;
          }

          @keyframes cardFadeIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .dashboard-card:nth-child(1) {
            animation-delay: 0.1s;
          }
          .dashboard-card:nth-child(2) {
            animation-delay: 0.2s;
          }
          .dashboard-card:nth-child(3) {
            animation-delay: 0.3s;
          }
          .dashboard-card:nth-child(4) {
            animation-delay: 0.4s;
          }
          .dashboard-card:nth-child(5) {
            animation-delay: 0.5s;
          }

          /* Default (Desktop) Main Grid */
          .main-dashboard-grid {
            display: grid !important;
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 20px !important;
            max-width: 1200px !important;
            margin: 40px auto !important;
          }

          /* Tablet */
          /* Tablet */
          @media (min-width: 769px) and (max-width: 1024px) {
            .main-dashboard-grid {
              grid-template-columns: repeat(2, 1fr) !important;
              gap: 20px !important;
              max-width: 800px !important;
              margin: 30px auto !important;
            }
          }

          /* Mobile */
          @media (max-width: 768px) {
            .main-dashboard-grid {
              display: grid !important;
              grid-template-columns: 1fr !important;
              gap: 12px !important;
              margin: 15px auto !important;
              width: 100% !important;
              padding: 0 15px !important;
            }
            .dashboard-card {
              width: 100% !important;
              padding: 15px !important;
              gap: 8px !important;
              min-height: auto !important;
              margin: 0 !important;
            }
            .dashboard-card div[style*="fontSize: 50px"] {
                font-size: 30px !important;
            }
            .dashboard-card h2 {
                font-size: 16px !important;
            }
            .dashboard-card p {
                font-size: 12px !important;
            }

            /* Mobile Pagination Fixes */
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
              display: none; /* Hide 'Previous'/'Next' text on mobile */
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

          .page-info {
            font-size: 14px;
            color: var(--page-text);
            opacity: 0.8;
            font-weight: 500;
          }
        `}</style>
        {loading ? (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              padding: "40px",
            }}
            data-testid="loading-state"
          >
            <div className="loading-spinner"></div>
            <p
              style={{
                fontSize: "18px",
                color: "var(--page-text)",
                opacity: 0.8,
              }}
            >
              {t("Loading data...")}
            </p>
          </div>
        ) : error ? (
          <div
            style={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "40px",
            }}
            data-testid="error-state"
          >
            <div
              style={{
                background: "rgba(255, 68, 68, 0.1)",
                padding: "30px",
                borderRadius: "16px",
                border: "1px solid rgba(255, 68, 68, 0.2)",
                textAlign: "center",
                maxWidth: "400px",
              }}
            >
              <div style={{ fontSize: "40px", marginBottom: "15px" }}>⚠️</div>
              <p style={{ fontSize: "18px", color: "#ff4444", margin: 0 }}>
                {error}
              </p>
              <button
                onClick={() => fetchData()}
                style={{
                  marginTop: "20px",
                  padding: "10px 20px",
                  background: "#ff4444",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                {t("Retry")}
              </button>
            </div>
          </div>
        ) : (
          <div
            className="dashboard-grid"
            style={{
              padding: "10px 20px",
              width: "100%",
            }}
          >
            {view === "dashboard" ? (
              <div className="main-dashboard-grid">
                <div
                  onClick={() => setView("personal")}
                  className="dashboard-card"
                  style={{ cursor: "pointer" }}
                >
                  <div style={{ fontSize: "50px" }}>👤</div>
                  <h2 style={{ margin: 0, color: "var(--page-text)", fontWeight: "normal", fontSize: "18px" }}>
                    {t("Personal Card")}
                  </h2>
                  <p style={{ opacity: 0.7, fontSize: "13px" }}>
                    {t("View your own profile detail")}
                  </p>
                </div>
                <div
                  onClick={() => setView("other")}
                  className="dashboard-card"
                  style={{ cursor: "pointer" }}
                >
                  <div style={{ fontSize: "50px" }}>👥</div>
                  <h2 style={{ margin: 0, color: "var(--page-text)", fontWeight: "normal", fontSize: "18px" }}>
                    {t("All Other Profiles")}
                  </h2>
                  <p style={{ opacity: 0.7, fontSize: "13px" }}>
                    {t("Browse and find matching profiles")}
                  </p>
                </div>
                <div
                  onClick={() => setView("search")}
                  className="dashboard-card"
                  style={{ cursor: "pointer" }}
                >
                  <div style={{ fontSize: "50px" }}>🔍</div>
                  <h2 style={{ margin: 0, color: "var(--page-text)", fontWeight: "normal", fontSize: "18px" }}>
                    {t("Search Members")}
                  </h2>
                  <p style={{ opacity: 0.7, fontSize: "13px" }}>
                    {t("Search by name, ID, or qualification")}
                  </p>
                </div>
                <div
                  onClick={() => setView("shortlist")}
                  className="dashboard-card"
                  style={{ cursor: "pointer" }}
                >
                  <div style={{ fontSize: "50px" }}>❤️</div>
                  <h2 style={{ margin: 0, color: "var(--page-text)", fontWeight: "normal", fontSize: "18px" }}>
                    {t("My Shortlist")}
                  </h2>
                  <p style={{ opacity: 0.7, fontSize: "13px" }}>
                    {t("View profiles you have saved")}
                  </p>
                </div>
                <div
                  onClick={() => setView("matches")}
                  className="dashboard-card"
                  style={{ cursor: "pointer" }}
                >
                  <div style={{ fontSize: "50px" }}>🤖</div>
                  <h2 style={{ margin: 0, color: "var(--page-text)", fontWeight: "normal", fontSize: "18px" }}>
                    {t("Best Matches")}
                  </h2>
                  <p style={{ opacity: 0.7, fontSize: "13px" }}>
                    {t("Suggested match based on your preference")}
                  </p>
                </div>
              </div>
            ) : (
              <>
                {view === "search" && !searchTerm.trim() ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      padding: "80px 20px",
                      textAlign: "center",
                      background: "rgba(var(--card-bg-rgb), 0.5)",
                      borderRadius: "16px",
                      border: "1px dashed var(--input-border)",
                      margin: "20px auto",
                      maxWidth: "600px"
                    }}
                  >
                    <div style={{ fontSize: "60px", marginBottom: "20px" }}>🔍</div>
                    <h3 style={{ margin: "0 0 10px 0", color: "var(--page-text)" }}>
                      {t("Find Members")}
                    </h3>
                    <p style={{ opacity: 0.7, margin: 0 }}>
                      {t("Please select a field and enter a search term above to find matching profiles.")}
                    </p>
                  </div>
                ) : (
                  <UserGrid
                    data={(() => {
                      const startIndex = (currentPage - 1) * PROFILES_PER_PAGE;
                      return allDisplayData.slice(startIndex, startIndex + PROFILES_PER_PAGE);
                    })()}
                    view={view}
                    t={t}
                    onViewDetail={setSelectedUser}
                    onToggleShortlist={handleToggleShortlist}
                    shortlistedIds={shortlistedIds}
                    onPrivacy={() => setIsPrivacyMode(true)}
                    onEdit={() => {
                      if (pendingUpdateStatus) {
                        setShowCancelModal(true);
                      } else {
                        window.location.href = "/editdetail";
                      }
                    }}
                    onRefresh={fetchData}
                    pendingUpdateStatus={pendingUpdateStatus}
                    unlockedUsers={unlockedUsers}
                    setSelectedImage={setSelectedImage}
                    setSelectedImageOwner={setSelectedImageOwner}
                    setIsPrivacyMode={setIsPrivacyMode}
                  />
                )}

                {(() => {
                  const totalPages = Math.ceil(allDisplayData.length / PROFILES_PER_PAGE);
                  
                  if (totalPages <= 1) return null;

                  return (
                    <div className="pagination-container">
                      <button
                        className="pagination-button"
                        onClick={() => {
                          setCurrentPage((prev) => Math.max(prev - 1, 1));
                        }}
                        disabled={currentPage === 1}
                      >
                        ← <span>{t("Previous")}</span>
                      </button>

                      <div className="pagination-pages">
                        {(() => {
                          const getVisiblePages = (curr, total) => {
                            if (total <= 5)
                              return Array.from({ length: total }, (_, i) => i + 1);

                            let pages = [1];
                            let start = Math.max(2, curr - 1);
                            let end = Math.min(total - 1, curr + 1);

                            if (curr <= 3) {
                              end = Math.min(4, total - 1);
                            }

                            if (curr >= total - 2) {
                              start = Math.max(2, total - 3);
                            }

                            if (start > 2) {
                              pages.push("...");
                            }

                            for (let i = start; i <= end; i++) {
                              pages.push(i);
                            }

                            if (end < total - 1) {
                              pages.push("...");
                            }

                            pages.push(total);
                            return pages;
                          };

                          return getVisiblePages(currentPage, totalPages).map(
                            (page, index) => (
                              <button
                                key={index}
                                onClick={() => {
                                  if (typeof page === "number") {
                                    setCurrentPage(page);
                                  }
                                }}
                                className={`page-number ${
                                  currentPage === page ? "active-page" : ""
                                } ${typeof page !== "number" ? "dots" : ""}`}
                                disabled={typeof page !== "number"}
                              >
                                {page}
                              </button>
                            )
                          );
                        })()}
                      </div>

                      <button
                        className="pagination-button"
                        onClick={() => {
                          setCurrentPage((prev) => Math.min(prev + 1, totalPages));
                        }}
                        disabled={currentPage === totalPages}
                      >
                        <span>{t("Next")}</span> →
                      </button>
                    </div>
                  );
                })()}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
