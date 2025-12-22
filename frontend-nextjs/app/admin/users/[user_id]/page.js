"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import AdminMenu from "../../AdminMenu";
import styles from "../../dashboard/dashboard.module.css";
import { useLanguage } from "../../../context/LanguageContext";
import { t } from "../../../utils/translations";
import { API_URL } from "../../../utils/config";
import { getPhotoUrls } from "../../../utils/photoUtils";

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

function UserDetailCard({ user, editFormData, onSave, onCancel, onInputChange }) {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState("Basic Details");
  const tabNames = Object.keys(FIELD_GROUPS);

  return (
    <div className={styles.userCard} style={{width: "100%", maxWidth: "1200px", margin: "0 auto"}}>
      {/* User Header Bar */}
      <div className={styles.userCardHeader}>
        <div className={styles.userInfo}>
          <span className={styles.userName}>#{user.user_id} {user.name}</span>
          <span>{user.email}</span>
          <span>{user.phone}</span>
        </div>
        
        <div className={styles.userActions}>
             <>
               <button onClick={() => onSave(user.email)} className={`${styles.btn} ${styles.btnSave}`}>
                 {t("SAVE", language)}
               </button>
               <button onClick={onCancel} className={`${styles.btn} ${styles.btnCancel}`}>
                 {t("CANCEL", language)}
               </button>
             </>
        </div>
      </div>

      {/* Tabs Layout - Always visible */}
      <div>
        {/* Tab Navigation */}
        <div className={styles.tabNavigation}>
          {tabNames.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`${styles.tabButton} ${activeTab === tab ? styles.activeTab : ""}`}
            >
              {t(tab, language)}
            </button>
          ))}
        </div>

        {/* Tab Content (Grid) */}
        <div className={styles.tabContent}>
           <div className={styles.gridContainer}>
             {FIELD_GROUPS[activeTab].map((field) => (
               <div key={field.key} className={styles.fieldContainer}>
                 <label className={styles.label}>{t(field.label, language)}</label>
                 {/* Always Editable unless explicit readOnly like ID/created_at */}
                 {!field.readOnly && field.key !== 'user_id' && field.key !== 'created_at' ? (
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
                   <div className={styles.readOnlyField} style={{ background: field.readOnly ? "rgba(0,0,0,0.05)" : "transparent" }}>
                     {(() => {
                        if (!user[field.key]) return "-";
                        
                        // Display photo(s)
                        if (field.key === "photo") {
                            const photoUrls = getPhotoUrls(user);
                            
                            return photoUrls.length > 0 ? (
                              <div style={{ display: "flex", gap: "15px", overflowX: "auto", paddingBottom: "10px" }}>
                                {photoUrls.map((photoUrl, index) => (
                                  <img 
                                    key={index}
                                    src={photoUrl}
                                    alt={`User Photo ${index + 1}`}
                                    style={{ width: "150px", height: "150px", objectFit: "cover", borderRadius: "8px", border: "1px solid var(--input-border)" }}
                                  />
                                ))}
                              </div>
                            ) : (
                              <div style={{ width: "150px", height: "150px", border: "1px solid #ddd", display: "flex", alignItems: "center", justifyContent: "center" }}>No Photo</div>
                            );
                        }
                       
                       // Format Date of Birth
                       if (field.key === "dateOfBirth") {
                         const date = new Date(user[field.key]);
                         const day = String(date.getDate()).padStart(2, '0');
                         const month = String(date.getMonth() + 1).padStart(2, '0');
                         const year = date.getFullYear();
                         return `${day}-${month}-${year}`;
                       }
                       
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
    </div>
  );
}

export default function UserDetail() {
  const router = useRouter();
  const { language } = useLanguage();
  const params = useParams();
  const { user_id } = params;
  
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  // Remove isEditing state, implicitly always editing
  const [editFormData, setEditFormData] = useState({});

  useEffect(() => {
    const storedAdminEmail = localStorage.getItem("adminEmail");
    if (!storedAdminEmail) {
      router.push("/admin/login");
    } else if (user_id) {
      fetchUser();
    }
  }, [router, user_id]);

  const fetchUser = async () => {
    try {
      const res = await fetch(`${API_URL}/upload-details/${user_id}`);
      const data = await res.json();
      if (data.success) {
        setUser(data.data);
        setEditFormData({ ...data.data }); // Initialize edit form immediately
      } else {
        alert(t("User not found", language));
        router.push("/admin/users");
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelClick = () => {
    // Redirect to list on cancel
    router.push("/admin/users");
  };

  const handleInputChange = (e, key) => {
    setEditFormData({
      ...editFormData,
      [key]: e.target.value,
    });
  };

  const handleSaveClick = async (email) => {
    try {
      const formData = new FormData();
      Object.keys(editFormData).forEach((key) => {
        if (editFormData[key] !== null && editFormData[key] !== undefined) {
             formData.append(key, editFormData[key]);
        }
      });

      const res = await fetch(`${API_URL}/upload-details/${email}`, {
        method: "PUT",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        // Redirect to list on successful save
        router.push("/admin/users");
      } else {
        alert(t("Failed to update", language) + ": " + data.message);
      }
    } catch (error) {
      console.error("Error updating user:", error);
      alert(t("Failed to update", language));
    }
  };

  if (isLoading) {
    return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>{t("Loading...", language)}</div>;
  }

  if (!user) {
      return <div>{t("User not found", language)}</div>;
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div style={{display: "flex", alignItems: "center", gap: "15px"}}>
            <AdminMenu />
            <h1 className={styles.headerTitle}>
            {t("User Details", language)}
            </h1>
        </div>
        <div className={styles.headerActions}>
             <button 
                onClick={() => router.push("/admin/dashboard")}
                className={`${styles.btn} ${styles.btnRestore}`}
                style={{ 
                    marginRight: "10px",
                    color: "white",
                    whiteSpace: "nowrap"
                 }}
             >
                {t("Go to Dashboard", language)}
             </button>
             <button 
                onClick={() => router.push("/admin/users")} 
                className={styles.btnNav} 
                style={{
                    backgroundColor: "#6c757d", // Grey background for back button
                    color: "white", 
                    border: "none",
                    minWidth: "100px"
                }}
             >
                 ← {t("Back to List", language)}
             </button>
        </div>
      </div>

      {/* Content Area */}
      <div className={styles.contentArea}>
        <UserDetailCard
            user={user}
            editFormData={editFormData}
            onSave={handleSaveClick}
            onCancel={handleCancelClick}
            onInputChange={handleInputChange}
        />
      </div>
    </div>
  );
}
