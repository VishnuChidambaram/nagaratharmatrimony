"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminMenu from "../AdminMenu";
import styles from "./dashboard.module.css";
import { useLanguage } from "../../hooks/useLanguage";
import { API_URL } from "@/app/utils/config";
import { getAuthHeaders } from "@/app/utils/auth-headers";

import { translations } from "../../utils/translations";
import LanguageToggle from "../../components/LanguageToggle";

export default function AdminDashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [deletedCount, setDeletedCount] = useState(0);
  const { language, toggleLanguage } = useLanguage();

  // Translation helper function
  const t = (key) => {
    if (language === "ta" && translations[key] && translations[key].ta) {
      return translations[key].ta;
    }
    return key;
  };

  useEffect(() => {
    const storedAdminEmail = sessionStorage.getItem("adminEmail");
    if (!storedAdminEmail) {
      router.push("/admin/login");
    } else {
      setIsLoading(false);
      fetchPendingCount();
      fetchDeletedCount();
    }
  }, [router]);

  const fetchPendingCount = async () => {
    try {
      const res = await fetch(`${API_URL}/api/update-requests?status=pending`, {
        credentials: "include"
      });
      const data = await res.json();
      if (data.success) {
        setPendingCount(data.count);
      }
    } catch (error) {
      console.error("Error fetching pending count:", error);
    }
  };

  const fetchDeletedCount = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/users`, {
        credentials: "include",
        headers: { ...getAuthHeaders() }
      });
      const data = await response.json();
      if (data.success) {
        setDeletedCount(data.data.length);
      }
    } catch (error) {
      console.error("Error fetching deleted count:", error);
    }
  };


  if (isLoading) {
    return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>{t("Loading...")}</div>;
  }

  return (
    <div className={styles.container}>
      {/* Fixed Sticky Header */}
      <div className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <AdminMenu />
          <h1 className={styles.headerTitle}>
            {t("Admin Dashboard")}
          </h1>
       </div>
       </div>

      {/* Content Area */}
      <div className={styles.contentArea}>
         <div style={{ textAlign: "center", marginTop: "30px" }}>
            <h2>{t("Welcome to Admin Dashboard")}</h2>
            <p style={{ marginBottom: "30px" }}>{t("Select an option below to manage the application.")}</p>
            
            <div className={styles.dashboardOptions}>
                <div 
                    className={styles.dashboardCard} 
                    onClick={() => router.push("/admin/users")}
                >
                    <div className={styles.cardIcon}>
                        👥
                    </div>
                    <div className={styles.cardTitle}>{t("Registered Users")}</div>
                    <div className={styles.cardDescription}>{t("Manage All Users")}</div>
                </div>

                <div 
                    className={styles.dashboardCard} 
                    onClick={() => router.push("/admin/approval-requests")}
                >
                    <div className={styles.cardIcon}>
                        ✅
                    </div>
                    <div className={styles.cardTitle}>{t("Approve Data")}</div>
                    <div className={styles.cardDescription}>
                      {t("Wait for approve")}: 
                      <span style={{ 
                        backgroundColor: "#22c55e", 
                        color: "white", 
                        padding: "4px 12px", 
                        borderRadius: "20px", 
                        marginLeft: "8px",
                        fontSize: "1.2em", 
                        fontWeight: "bold",
                        display: "inline-block",
                        verticalAlign: "middle",
                        boxShadow: "0 2px 4px rgba(34, 197, 94, 0.4)"
                      }}>
                        {pendingCount}
                      </span>
                    </div>
                </div>

                <div 
                    className={styles.dashboardCard} 
                    onClick={() => router.push("/admin/deleted-rows")}
                >
                    <div className={styles.cardIcon}>
                        🗑️
                    </div>
                    <div className={styles.cardTitle}>{t("Recycle Bin")}</div>
                    <div className={styles.cardDescription}>
                      {t("Deleted Rows")}:
                      <span style={{ 
                        backgroundColor: "#22c55e", 
                        color: "white", 
                        padding: "4px 12px", 
                        borderRadius: "20px", 
                        marginLeft: "8px",
                        fontSize: "1.2em", 
                        fontWeight: "bold",
                        display: "inline-block",
                        verticalAlign: "middle",
                        boxShadow: "0 2px 4px rgba(34, 197, 94, 0.4)"
                      }}>
                        {deletedCount}
                      </span>
                    </div>
                </div>
            </div>
         </div>
      </div>
    </div>
  );
}
