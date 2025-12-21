"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ConfirmationModal from "../components/ConfirmationModal";
import AdminMenu from "../AdminMenu";
import styles from "./deletedRows.module.css";
import { useLanguage } from "../../hooks/useLanguage";
import { API_URL } from "../../utils/config";

import { translations } from "../../utils/translations";
import LanguageToggle from "../../components/LanguageToggle";

export default function DeletedRows() {
  const router = useRouter();
  const [deletedUsers, setDeletedUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [restoreModalOpen, setRestoreModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const { language, toggleLanguage } = useLanguage();

  // Translation helper function
  const t = (key) => {
    if (language === "ta" && translations[key] && translations[key].ta) {
      return translations[key].ta;
    }
    return key;
  };

  useEffect(() => {
    fetchDeletedUsers();
  }, []);

  const fetchDeletedUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/deleted-details`);
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

  const handleRestore = (userId) => {
    setSelectedUserId(userId);
    setRestoreModalOpen(true);
  };

  const confirmRestore = async () => {
    if (!selectedUserId) return;
    try {
      const res = await fetch(`${API_URL}/restore-user/${selectedUserId}`, {
        method: "PUT",
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

  if (isLoading) {
    return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>{t("Loading...")}</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <AdminMenu />
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
        </div>
      </div>

      <div className={styles.contentArea}>
        <div className={styles.userList}>
          {deletedUsers.length === 0 ? (
            <p style={{ textAlign: "center", fontStyle: "italic", marginTop: "20px" }}>{t("No deleted users found.")}</p>
          ) : (
            deletedUsers.map((user) => (
              <div key={user.user_id} className={styles.userCard}>
                <div className={styles.userInfo}>
                  <div style={{ fontWeight: 'bold' }}>#{user.user_id} {user.name}</div>
                  <div>{user.email}</div>
                  <div>{user.phone}</div>
                  <div style={{ fontSize: '0.8em', opacity: 0.7 }}>{t("Deleted:")} {new Date(user.updated_at).toLocaleString()}</div>
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
