"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminMenu from "../AdminMenu";
import ConfirmationModal from "../components/ConfirmationModal";
import styles from "./dashboard.module.css";
import { API_URL } from "../../utils/config";
import { getPhotoUrl } from "../../utils/photoUtils";

  // Field Groups matching Registration Pages
  const FIELD_GROUPS = {
    "Basic Details": [
      { key: "user_id", label: "ID", readOnly: true },
      { key: "name", label: "Name" },
      { key: "gender", label: "Gender" },
      { key: "maritalStatus", label: "Marital Status" },
      { key: "fatherName", label: "Father Name" },
      { key: "fatherOccupation", label: "Father Occupation" },
      { key: "motherName", label: "Mother Name" },
      { key: "motherOccupation", label: "Mother Occupation" },
      { key: "brothers", label: "Brothers" },
      { key: "sisters", label: "Sisters" },
      { key: "yourTemple", label: "Your Temple" },
      { key: "yourDivision", label: "Your Division" },
      { key: "knownLanguages", label: "Known Languages" },
      { key: "reference", label: "Reference" },
      { key: "nativePlace", label: "Native Place" },
      { key: "nativePlaceHouseName", label: "Native Place House Name" },
      { key: "presentResidence", label: "Present Residence" },
      { key: "pincode", label: "Pincode" },
      { key: "profileCreatedBy", label: "Profile Created By" },
      { key: "referredBy", label: "Referred By" },
      { key: "referralDetails1Name", label: "Referral 1 Name" },
      { key: "referralDetails1Phone", label: "Referral 1 Phone" },
      { key: "referralDetails1Address", label: "Referral 1 Address" },
      { key: "referralDetails2Name", label: "Referral 2 Name" },
      { key: "referralDetails2Phone", label: "Referral 2 Phone" },
      { key: "referralDetails2Address", label: "Referral 2 Address" },
      { key: "created_at", label: "Registered On", readOnly: true },
    ],
    "Education & Occupation": [
      { key: "educationQualification", label: "Education Qualification" },
      { key: "otherEducation", label: "Other Education" },
      { key: "educationDetails", label: "Education Details" },
      { key: "occupationBusiness", label: "Occupation / Business" },
      { key: "otherOccupation", label: "Other Occupation" },
      { key: "workingPlace", label: "Working Place" },
      { key: "workDetails", label: "Work Details" },
      { key: "income", label: "Income (LPA)" },
    ],
    "Physical Attributes": [
      { key: "height", label: "Height" },
      { key: "complexion", label: "Complexion" },
      { key: "weight", label: "Weight" },
      { key: "diet", label: "Diet" },
      { key: "specialCases", label: "Special Cases" },
      { key: "specialCasesDetails", label: "Special Cases Details" },
    ],
    "Astrology Basic Details": [
      { key: "zodiacSign", label: "Zodiac Sign / Rasi" },
      { key: "ascendant", label: "Ascendant / Lagnam" },
      { key: "birthStar", label: "Birth Star / Natchathiram" },
      { key: "dosham", label: "Dosham" },
      { key: "placeOfBirth", label: "Place of Birth" },
      { key: "dateOfBirth", label: "Date of Birth" },
      { key: "timeOfBirthHours", label: "Time of Birth (Hours)" },
      { key: "timeOfBirthMinutes", label: "Time of Birth (Minutes)" },
      { key: "timeOfBirthSeconds", label: "Time of Birth (Seconds)" },
      { key: "DasaType", label: "Dasa Type" },
      { key: "dasaRemainYears", label: "Dasa Years" },
      { key: "dasaRemainMonths", label: "Dasa Months" },
      { key: "dasaRemainDays", label: "Dasa Days" },
    ],
    "Horoscope Chart": [
       // Note: This step is special (grid), but we list the raw fields here for editing
       { key: "sooriyan", label: "சூரியன்-Sooriyan" },
       { key: "chandiran", label: "சந்திரன்-Chandiran" },
       { key: "sevai", label: "செவ்வாய்-Sevvai" },
       { key: "budhan", label: "புதன்-Budhan" },
       { key: "viyazhan", label: "வியாழன்-Viyazhan" },
       { key: "sukkiran", label: "சுக்கிரன்-Sukkiran" },
       { key: "sani", label: "சனி-Sani" },
       { key: "rahu", label: "ராகு-Rahu" },
       { key: "maanthi", label: "மாந்தி-Maanthi" },
       { key: "kethu", label: "கேது-Kethu" },
       { key: "lagnam", label: "லக்கனம்-Lagnam" },
       // Amsam fields
       { key: "amsam_sooriyan", label: "அம்ஸம் சூரியன்-Amsam Sooriyan" },
       { key: "amsam_chandiran", label: "அம்ஸம் சந்திரன்-Amsam Chandiran" },
       { key: "amsam_sevai", label: "அம்ஸம் செவ்வாய்-Amsam Sevai" },
       { key: "amsam_budhan", label: "அம்ஸம் புதன்-Amsam Budhan" },
       { key: "amsam_viyazhan", label: "அம்ஸம் வியாழன்-Amsam Viyazhan" },
       { key: "amsam_sukkiran", label: "அம்ஸம் சுக்கிரன்-Amsam Sukkiran" },
       { key: "amsam_sani", label: "அம்ஸம் சனி-Amsam Sani" },
       { key: "amsam_rahu", label: "அம்ஸம் ராகு-Amsam Rahu" },
       { key: "amsam_maanthi", label: "அம்ஸம் மாந்தி-Amsam Maanthi" },
       { key: "amsam_kethu", label: "அம்ஸம் கேது-Amsam Kethu" },
       { key: "amsam_lagnam", label: "அம்ஸம் லக்கனம்-Amsam Lagnam" },
    ],
    "Contact Details": [
      { key: "fullStreetAddress", label: "Full Street Address" },
      { key: "city", label: "City" },
      { key: "state", label: "State" },
      { key: "district", label: "District" },
      { key: "country", label: "Country" },
      { key: "postalCode", label: "Postal Code" },
      { key: "phone", label: "Phone" },
      { key: "whatsAppNo", label: "WhatsApp" }, // Checked DB: it's whatsAppNo
      { key: "email", label: "Email" },
      { key: "photo", label: "Photo", readOnly: true },
    ],
    "Partner Preference": [
      { key: "educationQualification1", label: "Partner Education" },
      { key: "educationDetails1", label: "Partner Education Details" },
      { key: "complexion1", label: "Partner Complexion" },
      { key: "personalPreference1", label: "Personal Preference" },
      { key: "willingnessToWork1", label: "Willingness to Work" },
      { key: "fromAge", label: "From Age" },
      { key: "toAge", label: "To Age" },
      { key: "fromHeight", label: "From Height" },
      { key: "toHeight", label: "To Height" },
    ]
  };

  function UserCard({ user, isEditing, editFormData, onEdit, onSave, onCancel, onInputChange, onDelete }) {
    const [activeTab, setActiveTab] = useState("Basic Details");
    const tabNames = Object.keys(FIELD_GROUPS);
  

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
          {isEditing ? (
             <>
               <button onClick={() => onSave(user.email)} className={`${styles.btn} ${styles.btnSave}`}>
                 SAVE
               </button>
               <button onClick={onCancel} className={`${styles.btn} ${styles.btnCancel}`}>
                 CANCEL
               </button>
             </>
          ) : (
            <>
             <button onClick={() => onEdit(user)} className={`${styles.btn} ${styles.btnEdit}`}>
               EDIT
             </button>
             {onDelete && (
               <button 
                 onClick={() => onDelete(user.user_id)} 
                 className={`${styles.btn} ${styles.btnDelete}`}
               >
                 DELETE
               </button>
             )}
            </>
          )}
        </div>
      </div>

      {/* Tabs Layout */}
      {isEditing && (
      <div>
        {/* Tab Navigation */}
        <div className={styles.tabNavigation}>
          {tabNames.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`${styles.tabButton} ${activeTab === tab ? styles.activeTab : ""}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content (Grid) */}
        <div className={styles.tabContent}>
           <div className={styles.gridContainer}>
             {FIELD_GROUPS[activeTab].map((field) => (
               <div key={field.key} className={styles.fieldContainer}>
                 <label className={styles.label}>{field.label}</label>
                 {isEditing && !field.readOnly && field.key !== 'user_id' && field.key !== 'created_at' ? (
                   field.key === 'dateOfBirth' ? (
                     <input
                       type="date"
                       value={editFormData[field.key] ? editFormData[field.key].split('T')[0] : ""}
                       onChange={(e) => onInputChange(e, field.key)}
                       className={styles.inputField}
                     />
                   ) : (
                     <input
                       type="text"
                       value={editFormData[field.key] || ""}
                       onChange={(e) => onInputChange(e, field.key)}
                       className={styles.inputField}
                     />
                   )
                 ) : (
                   <div className={styles.readOnlyField} style={{ background: isEditing && field.readOnly ? "rgba(0,0,0,0.05)" : "transparent" }}>
                     {(() => {
                       if (!user[field.key]) return "-";
                       
                        // Display photo as image
                        if (field.key === "photo") {
                          const photoUrl = getPhotoUrl(user);
                          
                          return photoUrl ? (
                            <img 
                              src={photoUrl}
                              alt="User Photo"
                              style={{ 
                                maxWidth: "150px", 
                                maxHeight: "150px", 
                                borderRadius: "8px",
                                objectFit: "cover",
                                border: "1px solid var(--input-border)",
                                display: "block"
                              }}
                              onError={(e) => {
                                console.error('Image load error for:', e.target.src);
                                e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150"><rect width="150" height="150" fill="%23ddd"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999">No Photo</text></svg>';
                              }}
                            />
                          ) : (
                            <div style={{ 
                              width: "150px", 
                              height: "150px", 
                              border: "1px solid var(--input-border)",
                              borderRadius: "8px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              background: "#f0f0f0",
                              color: "#999"
                            }}>
                              No Photo
                            </div>
                          );
                        }
                       
                       // Format Date of Birth as DD-MM-YYYY
                       if (field.key === "dateOfBirth") {
                         const date = new Date(user[field.key]);
                         const day = String(date.getDate()).padStart(2, '0');
                         const month = String(date.getMonth() + 1).padStart(2, '0');
                         const year = date.getFullYear();
                         return `${day}-${month}-${year}`;
                       }
                       
                       // Format other dates normally
                       if (field.key.includes("created_at") || field.key.includes("Date")) {
                         return new Date(user[field.key]).toLocaleDateString();
                       }
                       
                       return user[field.key];
                     })()}
                   </div>
                 )}
               </div>
             ))}
           </div>
        </div>
      </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const USERS_PER_PAGE = 10;

  useEffect(() => {
    const storedAdminEmail = localStorage.getItem("adminEmail");
    if (!storedAdminEmail) {
      router.push("/admin/login");
    } else {
      fetchUsers();
    }
  }, [router]);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/all-details`);
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

  const handleEditClick = (user) => {
    setEditingId(user.user_id);
    setEditFormData({ ...user });
  };

  const handleCancelClick = () => {
    setEditingId(null);
    setEditFormData({});
  };

  const handleInputChange = (e, key) => {
    setEditFormData({
      ...editFormData,
      [key]: e.target.value,
    });
  };

  const handleSaveClick = async (originalEmail) => {
    try {
      const formData = new FormData();
      Object.keys(editFormData).forEach((key) => {
        if (editFormData[key] !== null && editFormData[key] !== undefined) {
             formData.append(key, editFormData[key]);
        }
      });

      const res = await fetch(`${API_URL}/upload-details/${originalEmail}`, {
        method: "PUT",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setEditingId(null);
        fetchUsers();
      } else {
        alert("Failed to update: " + data.message);
      }
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Error updating user");
    }
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
      });
      const data = await res.json();
      if (data.success) {
        fetchUsers();
      } else {
        alert("Failed to delete user: " + data.message);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Error deleting user");
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
    return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      {/* Fixed Sticky Header */}
      <div className={styles.header}>
        <h1 className={styles.headerTitle}>
          Admin Dashboard
        </h1>
        
        <div className={styles.headerActions}>
          {/* Search Bar */}
          <div className={styles.searchContainer}>
             <input 
               type="text" 
               placeholder="Search..." 
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
          <AdminMenu />
        </div>
      </div>

      {/* Content Area */}
      <div className={styles.contentArea}>
        <div className={styles.statsHeader}>
           <h2 className={styles.statsTitle}>
             {searchQuery ? `Search Results (${filteredUsers.length})` : `Registered Users (${users.length})`}
           </h2>
           <span className={styles.statsCount}>
             Page {currentPage} of {totalPages}
           </span>
        </div>

        <div className={styles.userList}>
          {currentUsers.map((user) => (
             <UserCard
               key={user.user_id}
               user={user}
               isEditing={editingId === user.user_id}
               editFormData={editFormData}
               onEdit={handleEditClick}
               onSave={handleSaveClick}
               onCancel={handleCancelClick}
              onInputChange={handleInputChange}
              onDelete={handleDeleteClick}
            />
          ))}
          {currentUsers.length === 0 && <p style={{textAlign: "center", fontStyle: "italic"}}>No users found.</p>}
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
              Prev
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
              Next
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
        title="Move to Recycle Bin"
        message="Are you sure you want to move this user to the recycle bin? You can restore them later from the Deleted Rows page."
        confirmText="Move to Bin"
        cancelText="Cancel"
        variant="warning"
      />
    </div>
  );
}

