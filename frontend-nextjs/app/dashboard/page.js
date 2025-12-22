"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "../hooks/useLanguage";
import { translations } from "../utils/translations";
import LanguageToggle from "../components/LanguageToggle";
import { API_URL } from "../utils/config";
import { getPhotoUrl, getPhotoUrls } from "../utils/photoUtils";


export default function Dashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null); // New state for user detail modal
  const [selectedImageOwner, setSelectedImageOwner] = useState(null); // Track owner of the selected image
  const [imagePasswordInput, setImagePasswordInput] = useState("");
  const [unlockedUsers, setUnlockedUsers] = useState([]); // Changed: Track list of unlocked emails
  const [newPhotoPassword, setNewPhotoPassword] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [notification, setNotification] = useState(null); // New: Notification state

  const [pendingUpdateStatus, setPendingUpdateStatus] = useState(false); // Track if user has pending update
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [pendingRequestId, setPendingRequestId] = useState(null);
  const [isPrivacyMode, setIsPrivacyMode] = useState(false); // New: Track if modal is in privacy mode
  const [showPrivacyConfirm, setShowPrivacyConfirm] = useState(false); // New: Confirm privacy toggle off

  const { language, toggleLanguage } = useLanguage();

  // Translation helper function
  const t = (key) => {
    if (language === "ta" && translations[key] && translations[key].ta) {
      return translations[key].ta;
    }
    return key;
  };

  // New: Poll for notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      const email = localStorage.getItem("userEmail");
      if (email) {
        try {
          const res = await fetch(`${API_URL}/api/notifications/${email}`, {
            credentials: "include"
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

    fetchNotifications(); // Fetch on mount
    const interval = setInterval(fetchNotifications, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const handleDismissNotification = async () => {
    if (notification) {
      try {
        await fetch(`${API_URL}/api/notifications/${notification.notification_id}/read`, {
          method: "PUT",
          credentials: "include"
        });
        setNotification(null);
      } catch (error) {
        console.error("Error dismissing notification:", error);
      }
    }
  };

  // Auto-hide error messages after 2 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 2000);

      // Cleanup function to clear timeout if component unmounts or error changes
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    // Check if user is logged in
    const userEmail = localStorage.getItem("userEmail");
    if (!userEmail) {
      window.location.href = "/login";
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch all details from the database
        const response = await fetch(`${API_URL}/all-details`, {
          credentials: "include"
        });
        const result = await response.json();
        if (result.success) {
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
    };

    const checkPendingUpdate = async () => {
      try {
        const res = await fetch(`${API_URL}/api/update-requests/user/${userEmail}`, {
          credentials: "include"
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
    };

    fetchData();
    checkPendingUpdate();
    
    // Check pending status every 15 seconds
    const interval = setInterval(checkPendingUpdate, 15000);
    return () => clearInterval(interval);
  }, []);

  const filteredData = data.filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      (item.name && item.name.toLowerCase().includes(term)) ||
      (item.email && item.email.toLowerCase().includes(term)) ||
      (item.phone && item.phone.toLowerCase().includes(term)) ||
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


  const handleCancelUpdate = async () => {
    if (!pendingRequestId) return;

    try {
      const res = await fetch(`${API_URL}/api/update-requests/${pendingRequestId}`, {
        method: "DELETE",
        credentials: "include"
      });
      const data = await res.json();

      if (data.success) {
        setPendingUpdateStatus(false);
        setPendingRequestId(null);
        setShowCancelModal(false);
        setNotification({
          type: "success",
          message: t("Update request cancelled successfully."),
          notification_id: Date.now() // temporary ID
        });
        // Clear notification after 3 seconds
        setTimeout(() => setNotification(null), 3000);
      } else {
        alert(data.message || t("Failed to cancel request"));
      }
    } catch (error) {
      console.error("Error cancelling request:", error);
      alert(t("Error cancelling request"));
    }
  };

  const handleSetPhotoPassword = async () => {
    if (!selectedImageOwner || !newPhotoPassword) return;

    try {
      const formData = new FormData();
      formData.append("photoPassword", newPhotoPassword);
      
      const response = await fetch(`${API_URL}/upload-details/${selectedImageOwner.email}`, {
        method: "PUT",
        credentials: "include",
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        setNotification({
             type: "success",
             message: t("Photo password set successfully!"),
             notification_id: Date.now()
        });
        setTimeout(() => setNotification(null), 3000);

        setNewPhotoPassword("");
        setSelectedImageOwner({...selectedImageOwner, photoPassword: newPhotoPassword});
         setData(prevData => prevData.map(u => u.email === selectedImageOwner.email ? {...u, photoPassword: newPhotoPassword} : u));
         
         // Close the modal
         setSelectedImage(null);
         setIsPrivacyMode(false);
         setImagePasswordInput("");
         // setIsImageUnlocked(false); // No longer needed
      } else {
        setNotification({
             type: "error",
             message: t("Failed to set password: ") + result.message,
             notification_id: Date.now()
        });
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (error) {
       console.error("Error setting password:", error);
       setNotification({
             type: "error",
             message: t("Error setting password"),
             notification_id: Date.now()
        });
        setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleRemovePhotoPassword = async () => {
    if (!selectedImageOwner) return;

    try {
      const formData = new FormData();
      formData.append("photoPassword", ""); // Send empty password to clear it
      
      const response = await fetch(`${API_URL}/upload-details/${selectedImageOwner.email}`, {
        method: "PUT",
        credentials: "include",
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        // Update local state to reflect removal
        setSelectedImageOwner({...selectedImageOwner, photoPassword: ""});
        setData(prevData => prevData.map(u => u.email === selectedImageOwner.email ? {...u, photoPassword: ""} : u));
        setNewPhotoPassword(""); // Clear input
        
        setNotification({
             type: "success",
             message: t("Privacy turned off successfully"),
             notification_id: Date.now()
        });
        setTimeout(() => setNotification(null), 3000);
      } else {
        setNotification({
             type: "error",
             message: t("Failed to remove password: ") + result.message,
             notification_id: Date.now()
        });
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (error) {
       console.error("Error removing password:", error);
       setNotification({
             type: "error",
             message: t("Error removing password"),
             notification_id: Date.now()
        });
        setTimeout(() => setNotification(null), 3000);
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "var(--page-bg)",
        color: "var(--page-text)",
        fontFamily: '"Arial", sans-serif',
      }}
    >
      {/* Language Toggle */}
     {/* Cancel Update Modal */}
      {showCancelModal && (
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
          onClick={() => setShowCancelModal(false)}
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
            <p>{t("You have an update request pending approval. What would you like to do?")}</p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "20px" }}>
              <button
                onClick={() => setShowCancelModal(false)}
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
                onClick={handleCancelUpdate}
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
      )}
      {/* Notification Banner */}
      {notification && (
        <div style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          backgroundColor: notification.type === 'success' ? "#4caf50" : "#f44336",
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
          animation: "slideIn 0.3s ease-out"
        }}>
          <span style={{ flex: 1 }}>{notification.message}</span>
          <button
            onClick={handleDismissNotification}
            style={{
              marginLeft: "15px",
              background: "none",
              border: "none",
              color: "white",
              fontSize: "24px",
              cursor: "pointer",
              padding: "0 5px",
              lineHeight: "1"
            }}
            title={t("Dismiss")}
          >
            ×
          </button>
        </div>
      )}
      <style jsx>{`
        .scrollable-content {
          flex: 1;
          overflow: auto;
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE and Edge */
          max-height: calc(100vh - 80px); /* Fixed height for scrolling */
          padding-bottom: 10px;
        }
        .scrollable-content::-webkit-scrollbar {
          display: none; /* Chrome, Safari, and Opera */
        }
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 4px 15px rgba(40, 167, 69, 0.4), 0 0 20px rgba(40, 167, 69, 0.2);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 6px 20px rgba(40, 167, 69, 0.6), 0 0 30px rgba(40, 167, 69, 0.4);
          }
        }
        .modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          padding: 10px;
        }
        .modal-content {
          max-width: 90%;
          max-height: 90%;
          position: relative;
          background: var(--card-bg);
          border-radius: 12px;
          padding: 20px;
          overflow-y: auto;
        }
        .modal-close {
          position: absolute;
          top: 10px;
          right: 10px;
          background: #ff4444;
          color: white;
          border: none;
          padding: 8px 12px;
          cursor: pointer;
          border-radius: 4px;
          font-size: 14px;
          z-index: 10;
        }
        .detail-row {
          margin-bottom: 10px;
        }
        .detail-label {
          font-weight: bold;
          color: var(--card-text);
          opacity: 0.7;
          margin-right: 8px;
        }
        .detail-value {
          color: var(--card-text);
        }
        .detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        /* Mobile responsive styles */
        @media (max-width: 768px) {
          .modal {
            padding: 5px !important;
            align-items: flex-start !important;
            overflow-y: auto !important;
          }
          .modal-content {
            max-width: 100% !important;
            max-height: none !important;
            min-height: 100% !important;
            width: 100% !important;
            padding: 15px !important;
            padding-top: 50px !important;
            margin: 0 !important;
            border-radius: 8px !important;
          }
          .modal-close {
            position: fixed !important;
            top: 15px !important;
            right: 15px !important;
            padding: 10px 15px !important;
            font-size: 16px !important;
            z-index: 1001 !important;
          }

          /* Force all grid containers to single column */
          .modal-content div[style*="grid"] {
            grid-template-columns: 1fr !important;
          }

          .detail-row {
            margin-bottom: 8px !important;
            font-size: 14px !important;
          }
          .detail-label {
            display: block !important;
            margin-bottom: 2px !important;
            font-size: 13px !important;
          }
          .detail-value {
            display: block !important;
            font-size: 14px !important;
            word-break: break-word !important;
          }
          .detail-grid {
            grid-template-columns: 1fr !important;
            gap: 8px !important;
          }

          /* Horoscope charts responsive */
          .rasi-grid {
            max-width: 100% !important;
            font-size: 10px !important;
          }
          .rasi-grid > div {
            min-height: 60px !important;
            font-size: 10px !important;
            padding: 3px !important;
          }
          .center-box {
            font-size: 14px !important;
          }

          /* Typography adjustments */
          .modal-content h2 {
            font-size: 20px !important;
            margin-top: 5px !important;
          }
          .modal-content h3 {
            font-size: 16px !important;
          }
          .modal-content h4 {
            font-size: 14px !important;
          }

          /* Image size for mobile */
          .modal-content img:not(.profile-photo) {
            max-width: 100% !important;
            height: auto !important;
          }

          /* Profile photo stays circular */
          .modal-content .profile-photo {
            width: 100px !important;
            height: 100px !important;
            border-radius: 50% !important;
            object-fit: cover !important;
          }

          /* Dashboard Header Mobile Styles */
          .dashboard-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            justify-content: flex-start !important;
            height: auto !important;
            min-height: 100px !important;
            padding: 15px !important;
            gap: 12px;
            position: sticky !important;
            top: 0 !important;
            z-index: 200 !important;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15) !important;
          }

          .dashboard-header h1 {
            font-size: 20px !important;
            width: 100%;
            margin: 0 !important;
          }

          .dashboard-header input[type="text"] {
            width: 100% !important;
            max-width: 100% !important;
            font-size: 14px !important;
            padding: 10px 12px 10px 40px !important;
          }

          /* Ensure content doesn't hide under sticky header on mobile */
          .scrollable-content {
            margin-top: 0 !important;
          }

          /* User Badge Mobile Styles */
          .user-badge {
            font-size: 11px !important;
            padding: 6px 12px !important;
            letter-spacing: 0.5px !important;
          }

          /* Card Grid Mobile Adjustments */
          .dashboard-grid {
            grid-template-columns: 1fr !important;
            padding: 10px 15px !important;
            gap: 15px !important;
          }
        }
      `}</style>

      {/* Fixed Header */}
      <div
        className="dashboard-header"
        style={{
          position: "sticky",
          top: 0,
          background: "var(--page-bg)",
          height: "60px",
          borderBottom: "1px solid var(--input-border)",
          zIndex: 200,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingLeft: "20px",
          paddingRight: "20px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: "24px",
            color: "var(--page-text)",
            fontWeight: "bold",
          }}
        >
          {t("Dashboard")}
        </h1>
        <input
          type="text"
          placeholder={t("Search")}
          value={searchTerm}
          onChange={(e) => {
            const value = e.target.value;
            setSearchTerm(value);
            localStorage.setItem("searchTerm", value);
          }}
          style={{
            padding: "8px 12px 8px 40px",
            borderRadius: "6px",
            border: "1px solid var(--input-border)",
            backgroundColor: "var(--card-bg)",
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='11' cy='11' r='8'%3E%3C/circle%3E%3Cpath d='m21 21-4.35-4.35'%3E%3C/path%3E%3C/svg%3E\")",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "10px center",
            color: "var(--page-text)",
            fontSize: "16px",
            width: "250px",
            outline: "none",
          }}
        />
      </div>

      {/* Scrollable Content Area */}
      <div className="scrollable-content">
        {/* Loading/Error States */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <p style={{ fontSize: "18px" }}>{t("Loading data...")}</p>
          </div>
        ) : error ? (
          <div
            style={{
              textAlign: "center",
              padding: "40px",
              backgroundColor: "#fee",
              borderRadius: "8px",
            }}
          >
            <p style={{ fontSize: "18px", color: "#c00" }}>{error}</p>
          </div>
        ) : (
          /* Grid Container */
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
              gap: "20px",
              width: "100%",
              padding: "10px 20px",
            }}
          >
            {filteredData.length === 0 ? (
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
                {data.length === 0
                  ? t("No details uploaded yet.")
                  : t("No matching results.")}
              </div>
            ) : (
              filteredData.map((item) => (
                <div
                  key={item.user_id}
                  style={{
                    border: "1px solid var(--input-border)",
                    borderRadius: "12px",
                    padding: "20px",
                    backgroundColor: "var(--card-bg)",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                    display: "flex",
                    flexDirection: "column",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 6px 12px rgba(0,0,0,0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 8px rgba(0,0,0,0.1)";
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
                    {(() => {
                        const userEmail = localStorage.getItem("userEmail");
                        const isOwnCard = userEmail && item.email === userEmail;

                        const allPhotos = getPhotoUrls(item);
                        const mainPhoto = getPhotoUrl(item, "https://via.placeholder.com/80");

                        const handlePhotoSelect = async (selectedPhotoUrl) => {
                            if (!isOwnCard) return;

                            // Reorder photos: move selected to front
                            const newPhotos = [selectedPhotoUrl, ...allPhotos.filter(p => p !== selectedPhotoUrl)];
                            
                            // Convert back to relative paths for saving if needed, but our backend handles full URLs gracefully 
                            // or distinct relative paths? Actually backend expects "uploads/..." usually.
                            // But we are sending back what we got. 
                            // Let's check what we receive. We receive full localhost URLs here.
                            // We should strip the domain to be safe and clean, or just send relative paths.
                            // But wait, the backend just saves the string text.
                            // Better convert back to relative paths to match backend storage format.
                            const toRelative = (url) => {
                                if (url.startsWith(`${API_URL}/`)) {
                                    return url.replace(`${API_URL}/`, "");

                                }
                                return url;
                            };

                            const photoPathsToSave = newPhotos.map(toRelative);

                            // Optimistic update (optional, but good)
                            // We can't easily update 'data' state deeply here without a re-fetch or complex reducer.
                            // So let's just trigger the API value and then re-fetch.
                            
                            try {
                                const response = await fetch(`${API_URL}/upload-details/${item.email}`, {
                                    method: "PUT",
                                    headers: {
                                        "Content-Type": "application/json"
                                    },
                                    credentials: "include",
                                    body: JSON.stringify({
                                        photo: JSON.stringify(photoPathsToSave)
                                    })
                                });
                                const result = await response.json();
                                if (result.success) {
                                    // Refresh data to show change
                                     const fetchData = async () => {
                                        try {
                                            const res = await fetch(`${API_URL}/all-details`, {
                                                credentials: "include"
                                            });
                                            const data = await res.json();
                                            if (data.success) {
                                                setData(data.data);
                                            }
                                        } catch (e) { console.error(e); }
                                    };
                                    fetchData();
                                } else {
                                    alert("Failed to update photo: " + result.message);
                                }
                            } catch (e) {
                                console.error("Error updating photo", e);
                                alert("Error updating photo");
                            }
                        };

                        return (
                            <div style={{ display: 'flex', flexDirection: 'column', marginRight: "15px" }}>
                                <img
                                  src={mainPhoto}
                                  alt={item.name}
                                  style={{
                                    width: "80px",
                                    height: "80px",
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                    cursor: "pointer",
                                    border: isOwnCard ? "2px solid #28a745" : "none",
                                    filter: (item.photoPassword && item.photoPassword.length > 0 && !isOwnCard && !unlockedUsers.includes(item.email)) ? "blur(8px)" : "none"
                                  }}
                                    onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedImage(mainPhoto);
                                    setSelectedImageOwner(item);
                                    // setIsImageUnlocked(false);
                                    setIsPrivacyMode(false);
                                  }}
                                />
                                {isOwnCard && allPhotos.length > 1 && (
                                    <div style={{ display: 'flex', gap: '5px', marginTop: '5px', flexWrap: 'wrap', maxWidth: '100px' }}>
                                        {allPhotos.slice(1).map((photo, idx) => (
                                            <img 
                                                key={idx}
                                                src={photo}
                                                alt="thumb"
                                                style={{
                                                    width: "30px",
                                                    height: "30px",
                                                    borderRadius: "50%",
                                                    objectFit: "cover",
                                                    cursor: "pointer",
                                                    opacity: 0.7,
                                                    filter: "none"
                                                }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedImage(photo);
                                                    setSelectedImageOwner(item);
                                                    setIsImageUnlocked(false);
                                                    handlePhotoSelect(photo);
                                                    setIsPrivacyMode(false);
                                                }}
                                                onMouseEnter={(e) => e.target.style.opacity = 1}
                                                onMouseLeave={(e) => e.target.style.opacity = 0.7}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })()}
                    <div style={{ flex: 1 }}>
                    {localStorage.getItem("userEmail") === item.email && (
                      <>
                        <div style={{
                          display: "inline-block",
                          background: "linear-gradient(135deg, #28a745 0%, #20c997 100%)",
                          color: "white",
                          fontSize: "14px",
                          fontWeight: "bold",
                          padding: "8px 16px",
                          borderRadius: "25px",
                          marginBottom: "8px",
                          boxShadow: "0 4px 15px rgba(40, 167, 69, 0.4), 0 0 20px rgba(40, 167, 69, 0.2)",
                          textTransform: "uppercase",
                          letterSpacing: "1px",
                          border: "2px solid rgba(255, 255, 255, 0.3)",
                          animation: "pulse 2s ease-in-out infinite",
                        }}>
                          {t("✨ It's You ✨")}
                        </div>
                        {pendingUpdateStatus && (
                          <div 
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowCancelModal(true);
                            }}
                            style={{
                              display: "inline-block",
                              marginLeft: "10px",
                              background: "linear-gradient(135deg, #ff9800 0%, #ff5722 100%)",
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
                          fontSize: "18px",
                        }}
                      >
                        {item.name}
                      </h3>
                      <p
                        style={{
                          margin: "0",
                          color: "var(--card-text)",
                          opacity: 0.7,
                          fontSize: "14px",
                        }}
                      >
                        ID: {item.user_id}
                      </p>
                    </div>
                  </div>

                  {/* Details Section */}
                  <div style={{ flex: 1, marginBottom: "15px" }}>
                    <div style={{ marginBottom: "8px" }}>
                        <strong
                            style={{ color: "var(--card-text)", opacity: 0.7 }}
                          >
                            {t("Email")}:
                          </strong>{" "}
                      <span style={{ color: "var(--card-text)" }}>
                        {item.email}
                      </span>
                    </div>
                    <div style={{ marginBottom: "8px" }}>
                        <strong
                            style={{ color: "var(--card-text)", opacity: 0.7 }}
                          >
                            {t("Phone")}:
                          </strong>{" "}
                      <span style={{ color: "var(--card-text)" }}>
                        {item.phone}
                      </span>
                    </div>
                    <div style={{ marginBottom: "8px" }}>
                        <strong
                            style={{ color: "var(--card-text)", opacity: 0.7 }}
                          >
                            {t("Qualification")}:
                          </strong>{" "}
                      <span style={{ color: "var(--card-text)" }}>
                        {item.educationQualification || "N/A"}
                      </span>
                    </div>
                    <div style={{ marginBottom: "8px" }}>
                        <strong
                            style={{ color: "var(--card-text)", opacity: 0.7 }}
                          >
                            {t("Work Details")}:
                          </strong>{" "}
                      <span
                        style={{
                          color: "var(--card-text)",
                          display: "block",
                          marginTop: "4px",
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
                  <div
                    style={{
                      borderTop: "1px solid var(--input-border)",
                      paddingTop: "15px",
                      display: "flex",
                      gap: "10px",
                      flexWrap: "wrap",
                    }}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedUser(item);
                      }}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        padding: "6px 12px",
                        backgroundColor: "#28a745",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        fontSize: "12px",
                        fontWeight: "500",
                        cursor: "pointer",
                        transition: "background-color 0.2s",
                      }}

                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = "#28a745";
                      }}
                    >
                      {t("More Detail")}
                    </button>
                    {localStorage.getItem("userEmail") === item.email && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const photos = getPhotos(item);
                            const mainPhoto = photos.length > 0 ? photos[0] : "https://via.placeholder.com/80";
                            setSelectedImage(mainPhoto);
                            setSelectedImageOwner(item);
                            setIsPrivacyMode(true);
                          }}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            padding: "6px 12px",
                            backgroundColor: "#007bff",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            fontSize: "12px",
                            fontWeight: "500",
                            cursor: "pointer",
                            transition: "background-color 0.2s",
                          }}
                        >
                           {t("Privacy")}
                        </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}



        {/* User Detail Modal */}
        {selectedUser && (
          <div className="modal" onClick={() => setSelectedUser(null)} style={{ zIndex: 1000 }}>
            <div
              className="modal-content"
              onClick={(e) => {
                // Check if the click was on an anchor tag or its children
                let targetElement = e.target;
                while (targetElement && targetElement !== e.currentTarget) {
                  if (targetElement.tagName === "A") {
                    // Stop propagation for anchor tags to prevent modal close
                    e.stopPropagation();
                    return;
                  }
                  targetElement = targetElement.parentElement;
                }
                // Stop propagation for all other clicks to prevent modal close
                e.stopPropagation();
              }}
              style={{
                width: "800px",
                maxWidth: "95%",
                maxHeight: "90vh",
                overflowY: "auto",
              }}
            >
              <button
                className="modal-close"
                onClick={() => setSelectedUser(null)}
              >
                ✕ {t("Close")}
              </button>

              <h2
                style={{
                  marginTop: "10px",
                  color: "var(--card-text)",
                  fontWeight: "bold",
                  textAlign: "center",
                  marginBottom: "20px",
                }}
              >
                {t("Details")}
              </h2>

              {/* Image */}
              {(() => {
                  const imageUrl = getPhotoUrl(selectedUser);

                  if (imageUrl) {
                      return (
                        <div style={{ textAlign: "center", marginBottom: "20px" }}>
                          <img
                            className="profile-photo"
                            src={imageUrl}
                            alt={selectedUser.name}
                            style={{
                              width: "120px",
                              height: "120px",
                              borderRadius: "50%",
                              objectFit: "cover",
                              border: "2px solid var(--input-border)",
                              cursor: "pointer",
                              filter: (selectedUser.photoPassword && selectedUser.photoPassword.length > 0 && selectedUser.email !== localStorage.getItem("userEmail") && !unlockedUsers.includes(selectedUser.email)) ? "blur(10px)" : "none"
                            }}
                            onClick={() => {
                                setSelectedImage(imageUrl);
                                setSelectedImageOwner(selectedUser);
                                // setIsImageUnlocked(false);
                                setIsPrivacyMode(false);
                            }}
                          />
                        </div>
                      );
                  }
                  return null;
              })()}

              <div style={{ display: "grid", gap: "20px" }}>
                {/* Step 1: Basic Details */}
                <div>
                  <h3
                    style={{
                      borderBottom: "1px solid #eee",
                      paddingBottom: "5px",
                      marginBottom: "10px",
                      color: "#28a745",
                    }}
                  >
                    {t("Basic Details")}
                  </h3>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "10px",
                    }}
                  >
                    <div className="detail-row">
                      <span className="detail-label">{t("Name")}:</span>{" "}
                      <span className="detail-value">{selectedUser.name}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">{t("Gender")}:</span>{" "}
                      <span className="detail-value">
                        {selectedUser.gender}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">{t("Marital Status")}:</span>{" "}
                      <span className="detail-value">
                        {selectedUser.maritalStatus}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">{t("Languages")}:</span>{" "}
                      <span className="detail-value">
                        {selectedUser.knownLanguages}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">{t("Father Name")}:</span>{" "}
                      <span className="detail-value">
                        {selectedUser.fatherName}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">{t("Father Occupation")}:</span>{" "}
                      <span className="detail-value">
                        {selectedUser.fatherOccupation}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">{t("Mother Name")}:</span>{" "}
                      <span className="detail-value">
                        {selectedUser.motherName}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">{t("Mother Occupation")}:</span>{" "}
                      <span className="detail-value">
                        {selectedUser.motherOccupation}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">{t("Brothers")}:</span>{" "}
                      <span className="detail-value">
                        {selectedUser.brothers}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">{t("Sisters")}:</span>{" "}
                      <span className="detail-value">
                        {selectedUser.sisters}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">{t("Temple")}:</span>{" "}
                      <span className="detail-value">
                        {selectedUser.yourTemple}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">{t("Division")}:</span>{" "}
                      <span className="detail-value">
                        {selectedUser.yourDivision}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">{t("Native Place")}:</span>{" "}
                      <span className="detail-value">
                        {selectedUser.nativePlace}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">{t("Native House Name")}:</span>{" "}
                      <span className="detail-value">
                        {selectedUser.nativePlaceHouseName}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">{t("Present Residence")}:</span>{" "}
                      <span className="detail-value">
                        {selectedUser.presentResidence}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">{t("Profile Created By")}:</span>{" "}
                      <span className="detail-value">
                        {selectedUser.profileCreatedBy}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">{t("Referred By")}:</span>{" "}
                      <span className="detail-value">
                        {selectedUser.referredBy}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">{t("Reference")}:</span>{" "}
                      <span className="detail-value">
                        {selectedUser.reference}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Step 2: Education & Occupation */}
                <div>
                  <h3
                    style={{
                      borderBottom: "1px solid #eee",
                      paddingBottom: "5px",
                      marginBottom: "10px",
                      color: "#28a745",
                    }}
                  >
                    {t("Education & Occupation")}
                  </h3>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "10px",
                    }}
                  >
                    <div className="detail-row">
                      <span className="detail-label">{t("Qualification")}:</span>{" "}
                      <span className="detail-value">
                        {selectedUser.educationQualification}
                      </span>
                    </div>
                    {selectedUser.otherEducation && (
                      <div className="detail-row">
                        <span className="detail-label">{t("Other Education")}:</span>{" "}
                        <span className="detail-value">
                          {selectedUser.otherEducation}
                        </span>
                      </div>
                    )}
                    <div className="detail-row">
                      <span className="detail-label">{t("Occupation")}:</span>{" "}
                      <span className="detail-value">
                        {selectedUser.occupationBusiness}
                      </span>
                    </div>
                    {selectedUser.otherOccupation && (
                      <div className="detail-row">
                        <span className="detail-label">{t("Other Occupation")}:</span>{" "}
                        <span className="detail-value">
                          {selectedUser.otherOccupation}
                        </span>
                      </div>
                    )}
                    <div className="detail-row">
                      <span className="detail-label">{t("Working Place")}:</span>{" "}
                      <span className="detail-value">
                        {selectedUser.workingPlace}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">{t("Income")}:</span>{" "}
                      <span className="detail-value">
                        {selectedUser.income} LPA
                      </span>
                    </div>
                    <div
                      className="detail-row"
                      style={{ gridColumn: "1 / -1" }}
                    >
                      <span className="detail-label">{t("Work Details")}:</span>{" "}
                      <span className="detail-value">
                        {selectedUser.workDetails}
                      </span>
                    </div>
                    <div
                      className="detail-row"
                      style={{ gridColumn: "1 / -1" }}
                    >
                      <span className="detail-label">{t("Education Details")}:</span>{" "}
                      <span className="detail-value">
                        {selectedUser.educationDetails}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Step 3: Physical Attributes */}
                <div>
                  <h3
                    style={{
                      borderBottom: "1px solid #eee",
                      paddingBottom: "5px",
                      marginBottom: "10px",
                      color: "#28a745",
                    }}
                  >
                    {t("Physical Attributes")}
                  </h3>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "10px",
                    }}
                  >
                    <div className="detail-row">
                      <span className="detail-label">{t("Height")}:</span>{" "}
                      <span className="detail-value">
                        {selectedUser.height}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">{t("Weight")}:</span>{" "}
                      <span className="detail-value">
                        {selectedUser.weight}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">{t("Complexion")}:</span>{" "}
                      <span className="detail-value">
                        {selectedUser.complexion}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">{t("Diet")}:</span>{" "}
                      <span className="detail-value">{selectedUser.diet}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">{t("Special Cases")}:</span>{" "}
                      <span className="detail-value">
                        {selectedUser.specialCases}
                      </span>
                    </div>
                    {selectedUser.specialCases === "Yes" && (
                      <div className="detail-row">
                        <span className="detail-label">{t("Details")}:</span>{" "}
                        <span className="detail-value">
                          {selectedUser.specialCasesDetails}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Step 4: Astrology Basic Details */}
                <div>
                  <h3
                    style={{
                      borderBottom: "1px solid #eee",
                      paddingBottom: "5px",
                      marginBottom: "10px",
                      color: "#28a745",
                    }}
                  >
                    {t("Astrology Details")}
                  </h3>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "10px",
                    }}
                  >
                    <div className="detail-row">
                      <span className="detail-label">{t("Zodiac Sign")}:</span>{" "}
                      <span className="detail-value">
                        {selectedUser.zodiacSign}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">{t("Ascendant")}:</span>{" "}
                      <span className="detail-value">
                        {selectedUser.ascendant}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">{t("Birth Star")}:</span>{" "}
                      <span className="detail-value">
                        {selectedUser.birthStar}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">{t("Dosham")}:</span>{" "}
                      <span className="detail-value">
                        {selectedUser.dosham}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">{t("Place of Birth")}:</span>{" "}
                      <span className="detail-value">
                        {selectedUser.placeOfBirth}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">{t("Date of Birth")}:</span>{" "}
                      <span className="detail-value">
                        {selectedUser.dateOfBirth}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">{t("Time of Birth")}:</span>{" "}
                      <span className="detail-value">
                        {selectedUser.timeOfBirthHours}:
                        {selectedUser.timeOfBirthMinutes}:
                        {selectedUser.timeOfBirthSeconds}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">{t("Dasa Type")}:</span>{" "}
                      <span className="detail-value">
                        {selectedUser.DasaType}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">{t("Dasa Balance")}:</span>{" "}
                      <span className="detail-value">
                        {selectedUser.dasaRemainYears}Y{" "}
                        {selectedUser.dasaRemainMonths}M{" "}
                        {selectedUser.dasaRemainDays}D
                      </span>
                    </div>
                  </div>
                </div>

                {/* Step 5: Horoscope Chart (Visual Grid) */}
                <div>
                  <h3
                    style={{
                      borderBottom: "1px solid #eee",
                      paddingBottom: "5px",
                      marginBottom: "10px",
                      color: "#28a745",
                    }}
                  >
                    {t("Horoscope Positions")}
                  </h3>

                  {/* Styles for the chart grid */}
                  <style>
                    {`
                      .rasi-grid {
                        display: grid;
                        grid-template-columns: repeat(4, 1fr);
                        gap: 2px;
                        width: 100%;
                        max-width: 400px;
                        aspect-ratio: 1;
                        margin: 20px auto;
                        border: 1px solid var(--input-border);
                      }
                      .rasi-grid > div {
                        border: 1px solid var(--input-border);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background: var(--card-bg);
                        color: var(--card-text);
                        text-align: center;
                        padding: 5px;
                        font-size: 12px;
                        min-height: 80px;
                        position: relative;
                      }
                      .center-box {
                        grid-column: 2 / span 2;
                        grid-row: 2 / span 2;
                        font-weight: bold;
                        font-size: 18px;
                        background: var(--container-bg) !important;
                        color: var(--card-text);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                      }
                    `}
                  </style>

                  {(() => {
                    const leftPlanets = [
                      { key: "sooriyan", label: "சூரியன்-Sooriyan" },
                      { key: "chandiran", label: "சந்திரன்-Chandiran" },
                      { key: "sevai", label: "செவ்வாய்-Sevvai" },
                      { key: "budhan", label: "புதன்-Budhan" },
                      { key: "viyazhan", label: "வியாழன்-Viyazhan" },
                      { key: "sukkiran", label: "சுக்கிரன்-Sukkiran" },
                    ];

                    const rightPlanets = [
                      { key: "sani", label: "சனி-Sani" },
                      { key: "rahu", label: "ராகு-Rahu" },
                      { key: "maanthi", label: "மாந்தி-Maanthi" },
                      { key: "kethu", label: "கேது-Kethu" },
                      { key: "lagnam", label: "லக்னம்-Lagnam" },
                    ];

                    const allPlanets = [...leftPlanets, ...rightPlanets];

                    // Prepare Rasi Data
                    const chartData = {};
                    allPlanets.forEach((planet) => {
                      const pos = selectedUser[planet.key];
                      if (pos && pos >= 1 && pos <= 12) {
                        if (!chartData[pos]) chartData[pos] = [];
                        const tamilLabel = planet.label.split("-")[0];
                        chartData[pos].push(tamilLabel);
                      }
                    });

                    // Prepare Amsam Data
                    const amsamChartData = {};
                    allPlanets.forEach((planet) => {
                      const pos = selectedUser["amsam_" + planet.key];
                      if (pos && pos >= 1 && pos <= 12) {
                        if (!amsamChartData[pos]) amsamChartData[pos] = [];
                        const tamilLabel = planet.label.split("-")[0];
                        amsamChartData[pos].push(tamilLabel);
                      }
                    });

                    const renderBox = (pos, data, title) => {
                      if (pos === "center")
                        return <div className="center-box">{title}</div>;
                      const planets = data[pos] || [];
                      return (
                        <div>
                          <span
                            style={{
                              position: "absolute",
                              fontSize: "10px",
                              color: "var(--card-text)",
                              opacity: 0.5,
                              top: "2px",
                              left: "2px",
                            }}
                          >
                            {pos}
                          </span>
                          {planets.length > 0 ? planets.join(", ") : ""}
                        </div>
                      );
                    };

                    // Helper to render a full grid
                    const renderGrid = (data, title) => (
                      <div className="rasi-grid">
                        {renderBox(1, data)}
                        {renderBox(2, data)}
                        {renderBox(3, data)}
                        {renderBox(4, data)}

                        {renderBox(12, data)}
                        {renderBox("center", data, title)}
                        {renderBox(5, data)}

                        {renderBox(11, data)}
                        {renderBox(6, data)}

                        {renderBox(10, data)}
                        {renderBox(9, data)}
                        {renderBox(8, data)}
                        {renderBox(7, data)}
                      </div>
                    );

                    return (
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "20px",
                        }}
                      >
                        <div>
                          <h4
                            style={{
                              textAlign: "center",
                              marginBottom: "10px",
                            }}
                          >
                            {t("Rasi Chart")}
                          </h4>
                          {renderGrid(chartData, "ராசி")}
                        </div>
                        <div>
                          <h4
                            style={{
                              textAlign: "center",
                              marginBottom: "10px",
                            }}
                          >
                            {t("Amsam Chart")}
                          </h4>
                          {renderGrid(amsamChartData, "அம்சம்")}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Step 6: Contact Details */}
                <div>
                  <h3
                    style={{
                      borderBottom: "1px solid #eee",
                      paddingBottom: "5px",
                      marginBottom: "10px",
                      color: "#28a745",
                    }}
                  >
                    {t("Contact Details")}
                  </h3>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "10px",
                    }}
                  >
                    <div
                      className="detail-row"
                      style={{ gridColumn: "1 / -1" }}
                    >
                      <span className="detail-label">{t("Address")}:</span>{" "}
                      <span className="detail-value">
                        {selectedUser.fullStreetAddress}, {selectedUser.city},{" "}
                        {selectedUser.district}, {selectedUser.state},{" "}
                        {selectedUser.country} - {selectedUser.postalCode}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">{t("Phone")}:</span>{" "}
                      <span className="detail-value">{selectedUser.phone}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">{t("WhatsApp")}:</span>{" "}
                      <span className="detail-value">
                        {selectedUser.whatsAppNo}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">{t("Email")}:</span>{" "}
                      <span className="detail-value">{selectedUser.email}</span>
                    </div>
                  </div>
                </div>

                {/* Step 7: Partner Preference */}
                <div>
                  <h3
                    style={{
                      borderBottom: "1px solid #eee",
                      paddingBottom: "5px",
                      marginBottom: "10px",
                      color: "#28a745",
                    }}
                  >
                    {t("Partner Preference")}
                  </h3>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "10px",
                    }}
                  >
                    <div className="detail-row">
                      <span className="detail-label">{t("Qualification")}:</span>{" "}
                      <span className="detail-value">
                        {t(selectedUser.educationQualification1)}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">{t("Complexion")}:</span>{" "}
                      <span className="detail-value">
                        {t(selectedUser.complexion1)}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">{t("Work After Marriage")}:</span>{" "}
                      <span className="detail-value">
                        {t(selectedUser.willingnessToWork1)}
                      </span>
                    </div>
                    <div className="detail-row">
                       <span className="detail-label">{t("Age Range")}:</span>{" "}
                      <span className="detail-value">
                        {selectedUser.fromAge} - {selectedUser.toAge}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">{t("Height Range")}:</span>{" "}
                      <span className="detail-value">
                        {selectedUser.fromHeight} - {selectedUser.toHeight}
                      </span>
                    </div>
                    <div
                      className="detail-row"
                      style={{ gridColumn: "1 / -1" }}
                    >
                      <span className="detail-label">{t("Education Details")}:</span>{" "}
                      <span className="detail-value">
                        {t(selectedUser.educationDetails1)}
                      </span>
                    </div>
                    <div
                      className="detail-row"
                      style={{ gridColumn: "1 / -1" }}
                    >
                      <span className="detail-label">{t("Personal Preference")}:</span>{" "}
                      <span className="detail-value">
                        {t(selectedUser.personalPreference1)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Links */}
                {/* All Photos Section */}
                <div>
                  <h3
                    style={{
                      borderBottom: "1px solid #eee",
                      paddingBottom: "5px",
                      marginBottom: "10px",
                      color: "#28a745",
                    }}
                  >
                    {t("All Photos")}
                  </h3>
                   {(() => {
                    const allPhotos = getPhotoUrls(selectedUser);

                        if (allPhotos.length > 0) {
                            const userEmail = localStorage.getItem("userEmail");
                            // Case insensitive check for ownership
                            const isOwn = userEmail && selectedUser.email && userEmail.toLowerCase() === selectedUser.email.toLowerCase();
                            const isProtected = selectedUser.photoPassword && selectedUser.photoPassword.length > 0 && !isOwn && !unlockedUsers.includes(selectedUser.email);
                            return (
                                <div style={{ 
                                  display: "flex", 
                                  flexWrap: "wrap",
                                  gap: "15px",
                                  marginTop: "10px"
                                }}>
                                  {allPhotos.map((photoUrl, index) => (
                                    <img 
                                      key={index}
                                      src={photoUrl}
                                      alt={`User Photo ${index + 1}`}
                                      style={{ 
                                        width: "230px", 
                                        height: "230px", 
                                        borderRadius: "8px",
                                        objectFit: "cover",
                                        border: "1px solid var(--input-border)",
                                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                        cursor: "pointer",
                                        filter: isProtected ? "blur(10px)" : "none"
                                      }}
                                       onClick={() => {
                                        setSelectedImage(photoUrl);
                                        setSelectedImageOwner(selectedUser);
                                        // setIsImageUnlocked(false);
                                        setIsPrivacyMode(false);
                                      }}
                                    />
                                  ))}
                                </div>
                            );
                        } else {
                            return <p style={{ color: "#999", fontStyle: "italic" }}>No photos available.</p>;
                        }
                   })()}
                </div>
                {selectedUser.pdfPath && (
                  <div className="detail-row">
                    <span className="detail-label">PDF:</span>
                    <a
                      href={`${API_URL}/${selectedUser.pdfPath.replace(
                        /\\/g,
                        "/"
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#007bff", textDecoration: "none" }}
                    >
                      View PDF
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>


      
        {/* Image Modal - Rendered last to be on top */}
        {selectedImage && (() => {
            const userEmail = localStorage.getItem("userEmail");
            const isOwner = selectedImageOwner && userEmail && 
                           (selectedImageOwner.email.toLowerCase() === userEmail.toLowerCase());
            const hasPassword = selectedImageOwner && selectedImageOwner.photoPassword;
            // Blur if password exists AND user is NOT owner AND image is NOT unlocked
            const isBlur = hasPassword && !isOwner && !unlockedUsers.includes(selectedImageOwner.email);

            return (
          <div 
            className="modal" 
            onClick={() => {
                setSelectedImage(null);
                setImagePasswordInput("");
                // setIsImageUnlocked(false);
                setNewPhotoPassword("");
                setSelectedImageOwner(null); // Clear owner on close
                setIsPrivacyMode(false);
            }} 
            style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                zIndex: 2200 
            }}
          >
            <div
              style={{
                position: 'relative',
                width: 'auto',
                maxWidth: '90%',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                zIndex: 2201,
                background: "transparent",
                overflowY: "auto", // Allow scrolling if content is tall
                padding: "20px"
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {isPrivacyMode && (
                <button
                  className="modal-close"
                  onClick={() => {
                      setSelectedImage(null);
                      setImagePasswordInput("");
                      // setIsImageUnlocked(false);
                      setNewPhotoPassword("");
                      setSelectedImageOwner(null);
                      setIsPrivacyMode(false);
                  }}
                  style={{
                    position: "fixed", // Fixed so it doesn't scroll away
                    top: "20px",
                    right: "20px",
                    background: "white",
                    color: "black",
                    zIndex: 2202,
                    cursor: "pointer",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.2)"
                  }}
                >
                  ✕ {t("Close")}
                </button>
              )}
              
              <div style={{ position: 'relative', marginBottom: isOwner ? "20px" : "0" }}>
                  {!isPrivacyMode && (
                    <>
                      <img
                    src={selectedImage}
                    alt="Full size"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "70vh", // Reduced to make room for inputs
                      borderRadius: "8px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
                      backgroundColor: "white",
                      display: "block",
                      filter: isBlur ? "blur(20px)" : "none",
                      transition: "filter 0.3s ease"
                    }}
                  />
                  
                  {isBlur && (
                      <div style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          background: 'rgba(0,0,0,0.6)',
                          padding: '20px',
                          borderRadius: '8px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px',
                          alignItems: 'center',
                          width: '80%'
                      }}>
                          <h3 style={{ color: 'white', margin: 0, textAlign: "center" }}>{t("Password Protected")}</h3>
                          <input 
                            type="password"
                            placeholder="Enter Password"
                            value={imagePasswordInput}
                            onChange={(e) => setImagePasswordInput(e.target.value)}
                            style={{ padding: '8px', borderRadius: '4px', border: 'none', width: '100%' }}
                          />
                          <button 
                            onClick={() => {
                                if (imagePasswordInput === selectedImageOwner.photoPassword) {
                                    setUnlockedUsers(prev => [...prev, selectedImageOwner.email]);
                                } else {
                                    alert(t("Incorrect Password"));
                                }
                            }}
                            style={{
                                padding: '8px 16px',
                                background: '#28a745',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                width: '100%'
                            }}
                          >
                            {t("Unlock")}
                          </button>
                      </div>
                  )}
                    </>
                  )}
              </div>

              {isOwner && isPrivacyMode && (
                  <div style={{
                      background: 'var(--card-bg)',
                      padding: '20px',
                      borderRadius: '8px',
                      display: 'flex',
                      flexDirection: "column",
                      gap: '10px',
                      alignItems: 'center',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                      width: "100%",
                      maxWidth: "300px"
                  }}>
                      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '15px'}}>
                          <span style={{fontWeight: 'bold', color: 'var(--card-text)'}}>{t("Privacy Protection")}</span>
                          <label className="switch" style={{position: 'relative', display: 'inline-block', width: '50px', height: '26px'}}>
                              <input 
                                  type="checkbox" 
                                  checked={!!(selectedImageOwner.photoPassword && selectedImageOwner.photoPassword.length > 0)}
                                  onChange={(e) => {
                                      if (!e.target.checked) {
                                          setShowPrivacyConfirm(true);
                                      } else {
                                          // Turning on: ensure input is focused or just let them type
                                          document.getElementById('new-password-input')?.focus();
                                      }
                                  }}
                                  style={{opacity: 0, width: 0, height: 0}}
                              />
                               <span className="slider round" style={{
                                  position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, 
                                  backgroundColor: (selectedImageOwner.photoPassword && selectedImageOwner.photoPassword.length > 0) ? '#28a745' : '#ccc', 
                                  transition: '.4s', borderRadius: '34px'
                              }}>
                                  <span style={{
                                      position: 'absolute', content: '""', height: '18px', width: '18px', left: '4px', bottom: '4px', 
                                      backgroundColor: 'white', transition: '.4s', borderRadius: '50%',
                                      transform: (selectedImageOwner.photoPassword && selectedImageOwner.photoPassword.length > 0) ? 'translateX(24px)' : 'translateX(0)'
                                  }}></span>
                              </span>
                          </label>
                      </div>

                      <span style={{ color: 'var(--card-text)', fontWeight: "bold" }}>{t("Set/Update Photo Password")}</span>
                      <input 
                        id="new-password-input"
                        type="text" 
                        placeholder={t("New Password")}
                        value={newPhotoPassword}
                        onChange={(e) => setNewPhotoPassword(e.target.value)}
                        style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc', width: "100%" }}
                      />
                      <button 
                        onClick={handleSetPhotoPassword}
                        style={{
                            padding: '10px 20px',
                            background: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            width: "100%"
                        }}
                      >
                        {t("Set Password")}
                      </button>
                  </div>
              )}
{showPrivacyConfirm && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2300
        }} onClick={(e) => e.stopPropagation()}>
            <div style={{
                background: 'var(--card-bg)',
                color: 'var(--card-text)',
                padding: '20px',
                borderRadius: '8px',
                width: '300px',
                textAlign: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
            }}>
                <h3 style={{marginTop: 0}}>{t("Turn off privacy?")}</h3>
                <p>{t("This will remove your password and make your photo visible to everyone.")}</p>
                <div style={{display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px'}}>
                    <button 
                        onClick={() => setShowPrivacyConfirm(false)}
                        style={{
                            padding: '8px 16px',
                            background: '#6c757d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        {t("Cancel")}
                    </button>
                    <button 
                         onClick={() => {
                             setShowPrivacyConfirm(false);
                             handleRemovePhotoPassword();
                         }}
                         style={{
                             padding: '8px 16px',
                             background: '#dc3545',
                             color: 'white',
                             border: 'none',
                             borderRadius: '4px',
                             cursor: 'pointer'
                         }}
                    >
                        {t("Yes, Remove")}
                    </button>
                </div>
            </div>
        </div>
      )}

            </div>
          </div>
        );
        })()}

      {/* Footer */}
      <div
        style={{
          height: "50px",
          background: "var(--page-bg)",
          borderTop: "1px solid var(--input-border)",
        }}
      ></div>
    </div>
  );
}
