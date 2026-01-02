"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminMenu from "../AdminMenu";
import ConfirmationModal from "../components/ConfirmationModal";
import styles from "../dashboard/dashboard.module.css";
import { useLanguage } from "../../hooks/useLanguage";
import { API_URL } from "../../utils/config";

import { translations } from "../../utils/translations";
import LanguageToggle from "../../components/LanguageToggle";

// Simplified UserCard for List View
function UserCard({ user, onDelete, onEdit, t }) {
  return (
    <div className={styles.userCard}>
      {/* User Header Bar */}
      <div className={styles.userCardHeader}>
        <div className={styles.userInfo}>
          <span className={styles.userName}>#{user.user_id} {user.name}</span>
          <span>{user.email}</span>
          <span>{user.phone}</span>
        </div>
        
        <div className={styles.userActions}>
            <button onClick={() => onEdit(user.user_id)} className={`${styles.btn} ${styles.btnEdit}`}>
              {t("EDIT")}
            </button>
            <button 
                onClick={() => onDelete(user.user_id)} 
                className={`${styles.btn} ${styles.btnDelete}`}
            >
                {t("DELETE")}
            </button>
        </div>
      </div>
    </div>
  );
}

export default function UsersList() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const { language, toggleLanguage } = useLanguage();

  const USERS_PER_PAGE = 10;

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
      fetchUsers();
    }
  }, [router]);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/all-details`, {
        credentials: "include"
      });
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (userId) => {
    router.push(`/admin/users/${userId}`);
  };

  const handleDeleteClick = (userId) => {
    setUserToDelete(userId);
    setModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    try {
      const res = await fetch(`${API_URL}/soft-delete-user/${userToDelete}`, {
        method: "PUT",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        fetchUsers();
      } else {
        alert(data.message || t("Failed to delete user"));
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert(t("Error deleting user"));
    }
    setUserToDelete(null);
  };

  // Search & Pagination Logic
  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase();
    return (
      (user.name && user.name.toLowerCase().includes(query)) ||
      (user.email && user.email.toLowerCase().includes(query)) ||
      (user.phone && user.phone.includes(query))
    );
  });

  const indexOfLastUser = currentPage * USERS_PER_PAGE;
  const indexOfFirstUser = indexOfLastUser - USERS_PER_PAGE;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (isLoading) {
    return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>{t("Loading...")}</div>;
  }

  return (
    <div className={styles.container}>
      {/* Fixed Sticky Header */}
      <div className={styles.header}>
        <div style={{ display: "flex", alignItems: "center" }}>
            <h1 className={styles.headerTitle}>
            {t("Registered Users")}
            </h1>
        </div>
        
        <div className={styles.headerActions}>
           {/* Language Toggle */}
           <div className={styles.langWrapper}>
             <LanguageToggle language={language} toggleLanguage={toggleLanguage} />
           </div>
           
           <button 
              onClick={() => router.push("/admin/dashboard")}
              className={`${styles.btn} ${styles.btnRestore} ${styles.dashboardBtn}`}
              style={{ 
                  marginRight: "0px", // Removed margin as grid gap handles it
                  color: "white",
                  whiteSpace: "nowrap"
               }}
           >
              {t("Go to Dashboard")}
           </button>

          {/* Search Bar */}
          <div className={styles.searchContainer}>
             <input 
               type="text" 
               placeholder={t("Search...")} 
               value={searchQuery}
               onChange={(e) => {
                 setSearchQuery(e.target.value);
                 setCurrentPage(1); // Reset to page 1 on search
               }}
               className={styles.searchInput}
             />
             <svg 
               width="18" 
               height="18" 
               viewBox="0 0 24 24" 
               fill="none" 
               stroke="currentColor" 
               strokeWidth="2" 
               strokeLinecap="round" 
               strokeLinejoin="round"
               className={styles.searchIcon}
             >
               <circle cx="11" cy="11" r="8"></circle>
               <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
             </svg>
          </div>
          
          <div className={styles.menuWrapper}>
             <AdminMenu />
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className={styles.contentArea}>
        <div className={styles.statsHeader}>
           <h2 className={styles.statsTitle}>
             {searchQuery ? `${t("Search Results")} (${filteredUsers.length})` : `${t("Total Users")} (${users.length})`}
           </h2>
           <span className={styles.statsCount}>
             {t("Page")} {currentPage} {t("of")} {totalPages}
           </span>
        </div>

        <div className={styles.userList}>
          {currentUsers.map((user) => (
             <UserCard
               key={user.user_id}
               user={user}
               onEdit={handleEditClick}
               onDelete={handleDeleteClick}
               t={t}
            />
          ))}
          {currentUsers.length === 0 && <p style={{textAlign: "center", fontStyle: "italic"}}>{t("No users found.")}</p>}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button 
              onClick={() => paginate(currentPage - 1)} 
              disabled={currentPage === 1}
              className={styles.paginationButton}
              style={{ opacity: currentPage === 1 ? 0.5 : 1 }}
            >
              {t("Prev")}
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => paginate(i + 1)}
                className={`${styles.paginationButton} ${currentPage === i + 1 ? styles.activePage : ""}`}
              >
                {i + 1}
              </button>
            ))}
            <button 
              onClick={() => paginate(currentPage + 1)} 
              disabled={currentPage === totalPages}
              className={styles.paginationButton}
              style={{ opacity: currentPage === totalPages ? 0.5 : 1 }}
            >
              {t("Next")}
            </button>
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setUserToDelete(null);
        }}  
        onConfirm={confirmDelete}
        title={t("Move to Recycle Bin")}
        message={t("Are you sure you want to move this user to the recycle bin? You can restore them later from the Deleted Rows page.")}
        confirmText={t("Move to Bin")}
        cancelText={t("Cancel")}
        variant="warning"
      />
    </div>
  );
}
