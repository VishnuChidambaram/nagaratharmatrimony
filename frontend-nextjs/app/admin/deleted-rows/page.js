"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import ConfirmationModal from "../components/ConfirmationModal";
import AdminMenu from "../AdminMenu";
import styles from "./deletedRows.module.css";
import { useLanguage } from "../../hooks/useLanguage";
import { API_URL } from "../../utils/config";
import { getAuthHeaders } from "../../utils/auth-headers";

import { translations } from "../../utils/translations";
import LanguageToggle from "../../components/LanguageToggle";

export default function DeletedRows() {
  const router = useRouter();
  const [deletedUsers, setDeletedUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [restoreModalOpen, setRestoreModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const scrollRef = useRef(null);
  const { language, toggleLanguage } = useLanguage();

  const USERS_PER_PAGE = 18;

  // Translation helper function
  const t = (key) => {
    if (language === "ta" && translations[key] && translations[key].ta) {
      return translations[key].ta;
    }
    return key;
  };

  const fetchDeletedUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/deleted-details`, {
        headers: getAuthHeaders(),
        credentials: "include"
      });
      const data = await res.json();
      if (data.success) {
        setDeletedUsers(data.data);
      }
    } catch (error) {
      console.error("Error fetching deleted users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeletedUsers();
  }, []);

  // Scroll to top when page changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentPage]);

  const handleRestore = (userId) => {
    setSelectedUserId(userId);
    setRestoreModalOpen(true);
  };

  const confirmRestore = async () => {
    if (!selectedUserId) return;
    try {
      const res = await fetch(`${API_URL}/restore-user/${selectedUserId}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        credentials: "include"
      });
      const data = await res.json();
      if (data.success) {
        fetchDeletedUsers();
      } else {
        alert(data.message || t("Failed to restore user"));
      }
    } catch (error) {
      console.error("Error restoring user:", error);
      alert(t("Error restoring user"));
    }
    setSelectedUserId(null);
  };

  const handlePermanentDelete = (userId) => {
    setSelectedUserId(userId);
    setDeleteModalOpen(true);
  };

  const confirmPermanentDelete = async () => {
    if (!selectedUserId) return;
    try {
      const res = await fetch(`${API_URL}/delete-user/${selectedUserId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
        credentials: "include"
      });
      const data = await res.json();
      if (data.success) {
        fetchDeletedUsers();
      } else {
        alert(data.message || t("Failed to delete user"));
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert(t("Error deleting user"));
    }
    setSelectedUserId(null);
  };

  // Pagination Logic
  const indexOfLastUser = currentPage * USERS_PER_PAGE;
  const indexOfFirstUser = indexOfLastUser - USERS_PER_PAGE;
  const currentUsers = deletedUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(deletedUsers.length / USERS_PER_PAGE);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (isLoading) {
    return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>{t("Loading...")}</div>;
  }

  return (
    <div className={styles.container} ref={scrollRef}>
      <div className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <h1 className={styles.headerTitle}>{t("Deleted Rows")}</h1>
        </div>
        {/* Actions: Go to Dashboard + Language Toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            onClick={() => router.push("/admin/dashboard")}
            style={{
              backgroundColor: "#16a34a",
              color: "white",
              border: "none",
              padding: "8px 12px",
              borderRadius: "6px",
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            {t("Go to Dashboard")}
          </button>
          <LanguageToggle language={language} toggleLanguage={toggleLanguage} />
          <AdminMenu />
        </div>
      </div>

      <div className={styles.contentArea}>
        <div className={styles.userList}>
          {deletedUsers.length === 0 ? (
            <p style={{ textAlign: "center", fontStyle: "italic", marginTop: "20px" }}>{t("No deleted users found.")}</p>
          ) : (
            currentUsers.map((user) => (
              <div key={user.user_id} className={styles.userCard}>
                <div className={styles.userInfo}>
                  <div style={{ fontWeight: 'bold' }}>#{user.user_id} {user.name}</div>
                  <div>{user.email}</div>
                  <div>{user.phone}</div>
                  <div style={{ fontSize: '0.8em', opacity: 0.7 }}>{t("Deleted:")} {new Date(user.updated_at).toLocaleString()}</div>
                  {user.daysRemaining !== undefined && (
                    <div style={{
                      display: 'inline-block',
                      marginTop: '5px',
                      padding: '3px 10px',
                      borderRadius: '12px',
                      fontSize: '0.8em',
                      fontWeight: 'bold',
                      color: '#fff',
                      background: user.daysRemaining <= 30 ? '#dc3545' : user.daysRemaining <= 90 ? '#fd7e14' : '#28a745',
                    }}>
                      ⏳ {user.daysRemaining} {t("days remaining")}
                    </div>
                  )}
                </div>
                <div className={styles.userActions}>
                  <button 
                    onClick={() => handleRestore(user.user_id)} 
                    className={`${styles.btn} ${styles.btnRestore}`}
                  >
                    {t("RETRIEVE")}
                  </button>
                  <button 
                    onClick={() => handlePermanentDelete(user.user_id)} 
                    className={`${styles.btn} ${styles.btnDelete}`}
                  >
                    {t("DELETE")}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="pagination-container">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="pagination-button"
            >
              ← <span>{t("Previous")}</span>
            </button>

            <div className="pagination-pages">
              {(() => {
                const total = totalPages;
                const curr = currentPage;
                const pages = [];
                if (total <= 5) {
                  for (let i = 1; i <= total; i++) pages.push(i);
                } else {
                  pages.push(1);
                  let start = Math.max(2, curr - 1);
                  let end = Math.min(total - 1, curr + 1);
                  if (curr <= 3) end = Math.min(4, total - 1);
                  if (curr >= total - 2) start = Math.max(2, total - 3);
                  if (start > 2) pages.push("...");
                  for (let i = start; i <= end; i++) pages.push(i);
                  if (end < total - 1) pages.push("...");
                  pages.push(total);
                }

                return pages.map((page, index) => (
                  <button
                    key={index}
                    onClick={() => typeof page === 'number' ? paginate(page) : null}
                    className={`page-number ${curr === page ? "active-page" : ""} ${typeof page !== 'number' ? "dots" : ""}`}
                    disabled={typeof page !== 'number'}
                  >
                    {page}
                  </button>
                ));
              })()}
            </div>

            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="pagination-button"
            >
              <span>{t("Next")}</span> →
            </button>

            <style jsx>{`
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
                background: var(--card-bg);
                border: 1px solid var(--input-border);
                border-radius: 8px;
                color: var(--page-text);
                cursor: pointer;
                transition: all 0.3s ease;
                font-size: 14px;
                display: flex;
                align-items: center;
                gap: 8px;
              }
              .pagination-button:disabled {
                opacity: 0.5;
                cursor: not-allowed;
              }
              .pagination-pages {
                display: flex;
                gap: 8px;
                align-items: center;
              }
              .page-number {
                width: 35px;
                height: 35px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 8px;
                border: 1px solid var(--input-border);
                background: var(--card-bg);
                color: var(--page-text);
                cursor: pointer;
                transition: all 0.3s ease;
              }
              .active-page {
                background: #007bff !important;
                color: white !important;
                border-color: #007bff !important;
              }
              .dots {
                color: var(--page-text);
                padding: 0 4px;
              }
              @media (max-width: 768px) {
                .pagination-button span {
                  display: none;
                }
                .pagination-container {
                  gap: 8px;
                  padding: 15px 10px;
                  flex-wrap: wrap;
                }
              }
            `}</style>
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={restoreModalOpen}
        onClose={() => {
          setRestoreModalOpen(false);
          setSelectedUserId(null);
        }}
        onConfirm={confirmRestore}
        title={t("Restore User")}
        message={t("Are you sure you want to restore this user? They will reappear in the main dashboard.")}
        confirmText={t("Restore")}
        cancelText={t("Cancel")}
        variant="success"
      />

      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedUserId(null);
        }}
        onConfirm={confirmPermanentDelete}
        title={t("Permanent Delete")}
        message={t("⚠️ WARNING: This action will PERMANENTLY delete this user from the database. This CANNOT be undone!")}
        confirmText={t("Delete Forever")}
        cancelText={t("Cancel")}
        variant="danger"
      />
    </div>
  );
}
