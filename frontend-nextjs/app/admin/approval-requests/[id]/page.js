"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminMenu from "../../AdminMenu";
import { useLanguage } from "../../../hooks/useLanguage";
import { translations } from "../../../utils/translations";
import LanguageToggle from "../../../components/LanguageToggle";
import { API_URL } from "../../../utils/config";
import { getPhotoUrls } from "../../../utils/photoUtils";

export default function ReviewRequest() {
  const { id } = useParams();
  const router = useRouter();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showRejectPopup, setShowRejectPopup] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectSuccessPopup, setShowRejectSuccessPopup] = useState(false);
  const { language, toggleLanguage } = useLanguage();

  // Translation helper function
  const t = (key) => {
    if (language === "ta" && translations[key] && translations[key].ta) {
      return translations[key].ta;
    }
    return key;
  };

  useEffect(() => {
    if (id) fetchRequest();
  }, [id]);

  const fetchRequest = async () => {
    try {
      const res = await fetch(`${API_URL}/api/update-requests/${id}`);
      const data = await res.json();
      if (data.success) {
        console.log("=== DEBUG: Full request data ===");
        console.log("Request ID:", id);
        console.log("Original data photo field:", data.data.original_data?.photo);
        console.log("New data photo field:", data.data.new_data?.photo);
        console.log("================================");
        setRequest(data.data);
      }
    } catch (error) {
      console.error("Error fetching request:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    setShowConfirmPopup(false);
    setProcessing(true);
    try {
      const res = await fetch(`${API_URL}/api/update-requests/${id}/approve`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admin_id: null }), // TODO: Add actual admin ID from auth
      });
      const data = await res.json();
      if (data.success) {
        setShowSuccessPopup(true);
        setTimeout(() => {
          setShowSuccessPopup(false);
          router.push("/admin/approval-requests");
        }, 3000);
      } else {
        setErrorMessage(t("Failed to approve request") + ": " + data.message);
        setShowErrorPopup(true);
      }
    } catch (error) {
      setErrorMessage(t("Error approving request"));
      setShowErrorPopup(true);
      console.error(error);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = () => {
    setShowRejectPopup(true);
  };

  const handleRejectConfirm = async () => {
    setShowRejectPopup(false);

    setProcessing(true);
    try {
      const res = await fetch(`${API_URL}/api/update-requests/${id}/reject`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admin_id: null, reason: rejectReason }), // TODO: Add actual admin ID
      });
      const data = await res.json();
      if (data.success) {
        setShowRejectSuccessPopup(true);
        setTimeout(() => {
          setShowRejectSuccessPopup(false);
          router.push("/admin/approval-requests");
        }, 3000);
      } else {
        setErrorMessage(t("Failed to reject request") + ": " + data.message);
        setShowErrorPopup(true);
      }
    } catch (error) {
      setErrorMessage(t("Error rejecting request"));
      setShowErrorPopup(true);
      console.error(error);
    } finally {
      setProcessing(false);
    }
  };

  const formatFieldName = (key) => {
    const displayNames = {
      affliction: "Dhosam",
      periodType: "DisaiType",
      dosham: "Dosham",
      DasaType: "DasaType",
      dasaRemainYears: "Dasa Remain Years",
      dasaRemainMonths: "Dasa Remain Months",
      dasaRemainDays: "Dasa Remain Days",
    };
    if (displayNames[key]) return displayNames[key];
    const result = key.replace(/([A-Z0-9])/g, " $1").trim();
    return result.charAt(0).toUpperCase() + result.slice(1);
  };

  const formatDate = (value) => {
    if (!value) return "";
    const datePart = String(value).split("T")[0];
    const parts = datePart.split("-");
    if (parts.length === 3) {
      const [year, month, day] = parts;
      return `${day}-${month}-${year}`;
    }
    return value;
  };

  const renderFieldValue = (val, key) => {
    if (key === "photo") {
      // Create a dummy object for getPhotoUrls
      const item = { photo: val };
      const photoUrls = getPhotoUrls(item);
      
      if (photoUrls && photoUrls.length > 0) {
        return (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "5px" }}>
            {photoUrls.map((photoSrc, idx) => (
                <img
                  loading="lazy"
                  key={idx}
                  src={photoSrc}
                  alt={`Photo ${idx + 1}`}
                  style={{
                    maxWidth: "100px",
                    maxHeight: "100px",
                    borderRadius: "4px",
                    border: "1px solid var(--input-border)",
                  }}
                  onError={(e) => {
                    console.error("Failed to load photo:", photoSrc);
                    e.target.style.display = "none";
                  }}
                />
            ))}
          </div>
        );
      }
      return "";
    } else if (key === "dateOfBirth") {
      return formatDate(val);
    }
    
    if (val === null || val === undefined) return <span style={{ fontStyle: "italic", opacity: 0.5 }}>-</span>;
    return String(val);
  };

  // Function to render horoscope charts for Step 5
  const renderHoroscopeCharts = (data, title) => {
    const planetsList = [
      { key: "sooriyan", label: "Sooriyan (சூரியன்)" },
      { key: "chandiran", label: "Chandiran (சந்திரன்)" },
      { key: "sevai", label: "Sevai (செவ்வாய்)" },
      { key: "budhan", label: "Budhan (புதன்)" },
      { key: "viyazhan", label: "Viyazhan (வியாழன்)" },
      { key: "sukkiran", label: "Sukkiran (சுக்கிரன்)" },
      { key: "sani", label: "Sani (சனி)" },
      { key: "rahu", label: "Rahu (ராகு)" },
      { key: "maanthi", label: "Maanthi (மாந்தி)" },
      { key: "kethu", label: "Kethu (கேது)" },
      { key: "lagnam", label: "Lagnam (லக்னம்)" },
    ];

    // Build Rasi chart data
    const localChartData = {};
    planetsList.forEach((planet) => {
      const pos = data[planet.key];
      if (pos && pos >= 1 && pos <= 12) {
        if (!localChartData[pos]) localChartData[pos] = [];
        const tamilLabel = planet.label.split(" (")[1].replace(")", "");
        localChartData[pos].push(tamilLabel);
      }
    });

    // Build Amsam chart data
    const localAmsamChartData = {};
    planetsList.forEach((planet) => {
      const pos = data["amsam_" + planet.key];
      if (pos && pos >= 1 && pos <= 12) {
        if (!localAmsamChartData[pos]) localAmsamChartData[pos] = [];
        const tamilLabel = planet.label.split(" (")[1].replace(")", "");
        localAmsamChartData[pos].push(tamilLabel);
      }
    });

    const renderLocalBox = (pos, sourceData) => {
      const planets = sourceData[pos] || [];
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

    return (
      <div style={{ flex: 1, minWidth: "300px", textAlign: "center" }}>
        <h4 style={{ marginBottom: "20px", fontWeight: "bold", fontSize: "16px", color: "var(--card-text)" }}>{title}</h4>
        
        {/* Rasi Chart */}
        <div style={{ marginBottom: "30px" }}>
          <h5 style={{ marginBottom: "15px", color: "var(--card-text)" }}>{t("Rasi Chart - ராசி")}</h5>
          <div className="rasi-grid">
            {renderLocalBox(1, localChartData)}
            {renderLocalBox(2, localChartData)}
            {renderLocalBox(3, localChartData)}
            {renderLocalBox(4, localChartData)}
            {renderLocalBox(12, localChartData)}
            <div className="center-box">ராசி</div>
            {renderLocalBox(5, localChartData)}
            {renderLocalBox(11, localChartData)}
            {renderLocalBox(6, localChartData)}
            {renderLocalBox(10, localChartData)}
            {renderLocalBox(9, localChartData)}
            {renderLocalBox(8, localChartData)}
            {renderLocalBox(7, localChartData)}
          </div>
        </div>

        {/* Amsam Chart */}
        <div>
          <h5 style={{ marginBottom: "15px", color: "var(--card-text)" }}>{t("Amsam Chart - அம்சம்")}</h5>
          <div className="rasi-grid">
            {renderLocalBox(1, localAmsamChartData)}
            {renderLocalBox(2, localAmsamChartData)}
            {renderLocalBox(3, localAmsamChartData)}
            {renderLocalBox(4, localAmsamChartData)}
            {renderLocalBox(12, localAmsamChartData)}
            <div className="center-box">அம்சம்</div>
            {renderLocalBox(5, localAmsamChartData)}
            {renderLocalBox(11, localAmsamChartData)}
            {renderLocalBox(6, localAmsamChartData)}
            {renderLocalBox(10, localAmsamChartData)}
            {renderLocalBox(9, localAmsamChartData)}
            {renderLocalBox(8, localAmsamChartData)}
            {renderLocalBox(7, localAmsamChartData)}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "var(--card-text)" }}>
        <h2>{t("Loading request...")}</h2>
      </div>
    );
  }

  if (!request) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "var(--card-text)" }}>
        <h2>{t("Request not found")}</h2>
        <button onClick={() => router.push("/admin/approval-requests")} style={{ marginTop: "20px", padding: "10px 20px" }}>
          {t("Back to List")}
        </button>
      </div>
    );
  }

  const { original_data, new_data } = request;

  // Step groups configuration - same as editdetail/8
  const stepGroups = {
    "Step 1 - Basic Details": [
      "name",
      "gender",
      "maritalStatus",
      "fatherName",
      "fatherOccupation",
      "motherName",
      "motherOccupation",
      "brothers",
      "brothersMarried",
      "sisters",
      "sistersMarried",
      "yourTemple",
      "yourDivision",
      "knownLanguages",
      "reference",
      "nativePlace",
      "nativePlaceHouseName",
      "presentResidence",
      "pincode",
      "profileCreatedBy",
      "referredBy",
      "referralDetails1Name",
      "referralDetails1Phone",
      "referralDetails1Address",
      "referralDetails2Name",
      "referralDetails2Phone",
      "referralDetails2Address",
    ],
    "Step 2 - Education & Occupation": [
      "educationQualification",
      "occupationBusiness",
      "workingPlace",
      "workDetails",
      "educationDetails",
      "income",
    ],
    "Step 3 - Physical Attributes": [
      "height",
      "complexion",
      "weight",
      "diet",
      "specialCases",
      "specialCasesDetails",
    ],
    "Step 4 - Astrology Basic Details": [
      "zodiacSign",
      "ascendant",
      "birthStar",
      "dosham",
      "placeOfBirth",
      "dateOfBirth",
      "timeOfBirthHours",
      "timeOfBirthMinutes",
      "timeOfBirthSeconds",
      "DasaType",
      "dasaRemainYears",
      "dasaRemainMonths",
      "dasaRemainDays",
    ],
    "Step 5 - Full Horoscope Chart": [
      "sooriyan",
      "chandiran",
      "sevai",
      "budhan",
      "viyazhan",
      "sukkiran",
      "sani",
      "rahu",
      "maanthi",
      "kethu",
      "lagnam",
      "amsam_sooriyan",
      "amsam_chandiran",
      "amsam_sevai",
      "amsam_budhan",
      "amsam_viyazhan",
      "amsam_sukkiran",
      "amsam_sani",
      "amsam_rahu",
      "amsam_maanthi",
      "amsam_kethu",
      "amsam_lagnam",
    ],
    "Step 6 - Contact Details": [
      "fullStreetAddress",
      "city",
      "state",
      "district",
      "country",
      "postalCode",
      "phone",
      "otherPhone",
      "whatsAppNo",
      "email",
      "photo",
    ],
    "Step 7 - Partner Preference": [
      "educationQualification1",
      "educationDetails1",
      "complexion1",
      "personalPreference1",
      "willingnessToWork1",
      "fromAge",
      "toAge",
      "fromHeight",
      "toHeight",
    ],
  };

  return (
    <>
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideDown {
          from { 
            opacity: 0;
            transform: translate(-50%, -60%);
          }
          to { 
            opacity: 1;
            transform: translate(-50%, -50%);
          }
        }
        @keyframes scaleUp {
          from { transform: scale(0); }
          to { transform: scale(1); }
        }


      .rasi-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        grid-template-rows: repeat(4, 1fr);
        gap: 0;
        width: 100%;
        max-width: 300px;
        aspect-ratio: 1;
        border: 1px solid var(--input-border);
        margin: 0 auto;
        background-color: var(--card-bg);
      }
      .rasi-grid > div {
        border: 1px solid var(--input-border);
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        font-size: 11px;
        color: var(--card-text);
        font-weight: bold;
        min-height: 0; 
        padding: 2px;
        text-align: center;
        word-break: break-word;
      }
      .center-box {
        grid-column: 2 / span 2;
        grid-row: 2 / span 2;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 16px !important;
        background-color: var(--background);
        color: var(--card-text);
      }
      
      /* Mobile responsiveness for the charts */
      @media (max-width: 768px) {
        .comparison-columns {
           flex-direction: column !important;
        }
        .step-label-desktop {
          display: none !important;
        }
        .step-label-mobile {
          display: block !important;
        }
          @media (max-width: 640px) {
            .action-buttons-container {
              flex-wrap: nowrap !important;
              justify-content: space-between !important;
              gap: 10px !important;
            }
            .action-button {
              flex: 1;
              padding: 10px 5px !important;
              font-size: 14px !important;
              white-space: nowrap;
              width: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
            }
          }
    `}</style>
    <style jsx global>{`
      .step-label-mobile {
        display: none;
      }
      
      /* Global override for Rasi Grid to ensure it applies */
      .rasi-grid {
        display: grid !important;
        grid-template-columns: repeat(4, 1fr) !important;
        grid-template-rows: repeat(4, 1fr) !important;
        gap: 0 !important;
        width: 100% !important;
        max-width: 300px !important;
        aspect-ratio: 1 !important;
        border: 1px solid var(--input-border) !important;
        margin: 0 auto !important;
        background-color: var(--card-bg) !important;
      }
      .rasi-grid > div {
        border: 1px solid var(--input-border) !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        position: relative !important;
        font-size: 11px !important;
        color: var(--card-text) !important;
        font-weight: bold !important;
        min-height: 0 !important; 
        padding: 2px !important;
        text-align: center !important;
        word-break: break-word !important;
      }
      .center-box {
        grid-column: 2 / span 2 !important;
        grid-row: 2 / span 2 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        font-weight: bold !important;
        font-size: 16px !important;
        background-color: var(--background) !important;
        color: var(--card-text) !important;
      }


    `}</style>
    <div style={{ padding: "20px", minHeight: "100vh", backgroundColor: "var(--background)" }}>
      {/* Admin Header */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: "20px", 
        paddingBottom: "10px", 
        borderBottom: "1px solid var(--input-border)" 
      }}>
        <h1 style={{ margin: 0, fontSize: "24px", color: "var(--page-text)" }}>{t("Request Details")}</h1>
        <AdminMenu />
      </div>

      {/* Confirmation Popup */}
      {showConfirmPopup && (
        <>
          {/* Overlay */}
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 99998,
            animation: "fadeIn 0.3s ease-out"
          }} onClick={() => setShowConfirmPopup(false)} />
          
          {/* Popup */}
          <div style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "white",
            padding: "40px",
            borderRadius: "12px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
            zIndex: 99999,
            textAlign: "center",
            minWidth: "400px",
            animation: "slideDown 0.3s ease-out"
          }}>
            <div style={{
              width: "80px",
              height: "80px",
              backgroundColor: "#ff9800",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
              animation: "scaleUp 0.5s ease-out"
            }}>
              <span style={{ fontSize: "48px", color: "white" }}>?</span>
            </div>
            <h2 style={{ color: "#333", marginBottom: "10px", fontSize: "24px" }}>{t("Confirm Approval")}</h2>
            <p style={{ color: "#666", marginBottom: "30px", fontSize: "16px" }}>
              {t("Are you sure you want to approve this update request?")}
            </p>
            <div style={{ display: "flex", gap: "15px", justifyContent: "center" }}>
              <button
                onClick={handleApprove}
                style={{
                  padding: "12px 30px",
                  backgroundColor: "#4caf50",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "16px",
                  fontWeight: "bold",
                  cursor: "pointer"
                }}
              >
                {t("✓ Approve")}
              </button>
              <button
                onClick={() => setShowConfirmPopup(false)}
                style={{
                  padding: "12px 30px",
                  backgroundColor: "#f44336",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "16px",
                  fontWeight: "bold",
                  cursor: "pointer"
                }}
              >
                {t("✗ Cancel")}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Success Popup Modal */}
      {showSuccessPopup && (
        <>
          {/* Overlay */}
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 99998,
            animation: "fadeIn 0.3s ease-out"
          }} onClick={() => {
            setShowSuccessPopup(false);
            router.push("/admin/approval-requests");
          }} />
          
          {/* Popup */}
          <div style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "white",
            padding: "40px",
            borderRadius: "12px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
            zIndex: 99999,
            textAlign: "center",
            minWidth: "400px",
            animation: "slideDown 0.3s ease-out"
          }}>
            <div style={{
              width: "80px",
              height: "80px",
              backgroundColor: "#4caf50",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
              animation: "scaleUp 0.5s ease-out"
            }}>
              <span style={{ fontSize: "48px", color: "white" }}>✓</span>
            </div>
            <h2 style={{ color: "#333", marginBottom: "10px", fontSize: "24px" }}>{t("Success!")}</h2>
            <p style={{ color: "#666", marginBottom: "20px", fontSize: "16px" }}>
              {t("Request approved successfully!")}<br/>{t("User data has been updated.")}
            </p>
            <button
              onClick={() => {
                setShowSuccessPopup(false);
                router.push("/admin/approval-requests");
              }}
              style={{
                padding: "10px 30px",
                backgroundColor: "#4caf50",
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontSize: "16px",
                fontWeight: "bold",
                cursor: "pointer"
              }}
            >
              {t("OK")}
            </button>
          </div>
        </>
      )}

      {/* Error Popup Modal */}
      {showErrorPopup && (
        <>
          {/* Overlay */}
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 99998,
            animation: "fadeIn 0.3s ease-out"
          }} onClick={() => setShowErrorPopup(false)} />
          
          {/* Popup */}
          <div style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "white",
            padding: "40px",
            borderRadius: "12px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
            zIndex: 99999,
            textAlign: "center",
            minWidth: "400px",
            animation: "slideDown 0.3s ease-out"
          }}>
            <div style={{
              width: "80px",
              height: "80px",
              backgroundColor: "#f44336",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
              animation: "scaleUp 0.5s ease-out"
            }}>
              <span style={{ fontSize: "48px", color: "white" }}>✗</span>
            </div>
            <h2 style={{ color: "#333", marginBottom: "10px", fontSize: "24px" }}>{t("Error")}</h2>
            <p style={{ color: "#666", marginBottom: "20px", fontSize: "16px" }}>
              {errorMessage}
            </p>
            <button
              onClick={() => setShowErrorPopup(false)}
              style={{
                padding: "10px 30px",
                backgroundColor: "#f44336",
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontSize: "16px",
                fontWeight: "bold",
                cursor: "pointer"
              }}
            >
              {t("OK")}
            </button>
          </div>
        </>
      )}

      {/* Reject Reason Popup Modal */}
      {showRejectPopup && (
        <>
          {/* Overlay */}
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 99998,
            animation: "fadeIn 0.3s ease-out"
          }} onClick={() => setShowRejectPopup(false)} />
          
          {/* Popup */}
          <div style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "white",
            padding: "40px",
            borderRadius: "12px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
            zIndex: 99999,
            textAlign: "center",
            minWidth: "450px",
            animation: "slideDown 0.3s ease-out"
          }}>
            <div style={{
              width: "80px",
              height: "80px",
              backgroundColor: "#f44336",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
              animation: "scaleUp 0.5s ease-out"
            }}>
              <span style={{ fontSize: "48px", color: "white" }}>✗</span>
            </div>
            <h2 style={{ color: "#333", marginBottom: "10px", fontSize: "24px" }}>{t("Reject Request")}</h2>
            <p style={{ color: "#666", marginBottom: "20px", fontSize: "14px" }}>
              {t("Please provide a reason for rejection:")}
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder={t("Enter rejection reason")}
              style={{
                width: "100%",
                minHeight: "100px",
                padding: "10px",
                borderRadius: "6px",
                border: "1px solid #ddd",
                fontSize: "14px",
                marginBottom: "20px",
                fontFamily: "Arial",
                resize: "vertical"
              }}
            />
            <div style={{ display: "flex", gap: "15px", justifyContent: "center" }}>
              <button
                onClick={handleRejectConfirm}
                disabled={processing}
                style={{
                  padding: "12px 30px",
                  backgroundColor: "#f44336",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "16px",
                  fontWeight: "bold",
                  cursor: processing ? "not-allowed" : "pointer",
                  opacity: processing ? 0.6 : 1
                }}
              >
                {processing ? t("Processing...") : t("✗ Reject")}
              </button>
              <button
                onClick={() => {
                  setShowRejectPopup(false);
                  setRejectReason("");
                }}
                disabled={processing}
                style={{
                  padding: "12px 30px",
                  backgroundColor: "#9e9e9e",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "16px",
                  fontWeight: "bold",
                  cursor: processing ? "not-allowed" : "pointer",
                  opacity: processing ? 0.6 : 1
                }}
              >
                {t("Cancel")}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Reject Success Popup Modal */}
      {showRejectSuccessPopup && (
        <>
          {/* Overlay */}
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 99998,
            animation: "fadeIn 0.3s ease-out"
          }} onClick={() => {
            setShowRejectSuccessPopup(false);
            router.push("/admin/approval-requests");
          }} />
          
          {/* Popup */}
          <div style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "white",
            padding: "40px",
            borderRadius: "12px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
            zIndex: 99999,
            textAlign: "center",
            minWidth: "400px",
            animation: "slideDown 0.3s ease-out"
          }}>
            <div style={{
              width: "80px",
              height: "80px",
              backgroundColor: "#f44336",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
              animation: "scaleUp 0.5s ease-out"
            }}>
              <span style={{ fontSize: "48px", color: "white" }}>✓</span>
            </div>
            <h2 style={{ color: "#333", marginBottom: "10px", fontSize: "24px" }}>{t("Request Rejected")}</h2>
            <p style={{ color: "#666", marginBottom: "20px", fontSize: "16px" }}>
              {t("Request rejected successfully!")}<br/>{t("User has been notified.")}
            </p>
            <button
              onClick={() => {
                setShowRejectSuccessPopup(false);
                router.push("/admin/approval-requests");
              }}
              style={{
                padding: "10px 30px",
                backgroundColor: "#f44336",
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontSize: "16px",
                fontWeight: "bold",
                cursor: "pointer"
              }}
            >
              {t("OK")}
            </button>
          </div>
        </>
      )}



      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button
          onClick={() => router.push("/admin/dashboard")}
          style={{
            padding: "8px 16px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "bold"
          }}
        >
          ← {t("Dashboard")}
        </button>
        <button
          onClick={() => router.push("/admin/approval-requests")}
          style={{
            padding: "8px 16px",
            backgroundColor: "var(--card-bg)",
            color: "var(--card-text)",
            border: "1px solid var(--input-border)",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          ← {t("Back to List")}
        </button>
      </div>

      <h1 style={{ color: "var(--card-text)", marginBottom: "10px" }}>
        {t("Review Update Request")} #{id}
      </h1>
      <p style={{ color: "var(--card-text)", opacity: 0.7, marginBottom: "30px" }}>
        {t("Submitted by")} {request.user_email} {t("on")} {new Date(request.created_at).toLocaleString()}
      </p>

      {/* Action Buttons */}
      {/* Action Buttons */}
      <div className="action-buttons-container" style={{ 
        display: "flex", 
        gap: "15px", 
        marginBottom: "30px",
        flexWrap: "wrap",
        justifyContent: "flex-end"
      }}>
        <button
          className="action-button"
          onClick={() => setShowConfirmPopup(true)}
          disabled={processing}
          style={{
            padding: "12px 30px",
            fontSize: "16px",
            backgroundColor: "#4caf50",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontWeight: "bold",
            cursor: processing ? "not-allowed" : "pointer",
            opacity: processing ? 0.6 : 1
          }}
        >
          {processing ? t("Loading...") : t("Approve Request")}
        </button>
        <button
          className="action-button"
          onClick={handleReject}
          disabled={processing}
          style={{
            padding: "12px 30px",
            fontSize: "16px",
            backgroundColor: "#f44336",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontWeight: "bold",
            cursor: processing ? "not-allowed" : "pointer",
            opacity: processing ? 0.6 : 1
          }}
        >
          {processing ? t("Loading...") : t("Reject Request")}
        </button>
      </div>

      {/* Legend - Desktop */}
      <div className="step-label-desktop" style={{
        display: "flex",
        justifyContent: "space-between",
        maxWidth: "1200px",
        margin: "0 auto 20px",
        fontWeight: "bold",
        borderBottom: "2px solid var(--input-border)",
        paddingBottom: "10px"
      }}>
        <div style={{ flex: 1, textAlign: "center", color: "var(--card-text)", opacity: 0.7 }}>
          {t("Original Data")}
        </div>
        <div style={{ flex: 1, textAlign: "center", color: "#22c55e" }}>
          {t("New Data")}
        </div>
      </div>

      {/* Step-wise Comparison */}
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {Object.keys(stepGroups).map((stepName) => {
          const fields = stepGroups[stepName];
          
          // Special rendering for Step 5 - Horoscope Charts
          if (stepName === "Step 5 - Full Horoscope Chart") {
            return (
              <div key={stepName} style={{ 
                marginBottom: 30, 
                borderBottom: "1px solid var(--input-border)", 
                paddingBottom: "20px" 
              }}>
                <h3 style={{ 
                  borderBottom: "1px solid var(--input-border)", 
                  paddingBottom: 5, 
                  marginBottom: "15px",
                  color: "var(--card-text)"
                }}>
                  {t(stepName)}
                </h3>

                <div className="comparison-columns" style={{
                  display: "flex",
                  flexDirection: "row",
                  gap: "20px",
                  justifyContent: "center"
                }}>
                  {/* Before Edit Chart */}
                  <div style={{ flex: 1, borderRight: "1px dashed var(--input-border)", paddingRight: "10px" }}>
                    <div className="step-label-mobile" style={{ 
                      backgroundColor: "var(--input-bg)", 
                      color: "var(--card-text)", 
                      opacity: 0.7,
                      textAlign: "center",
                      fontWeight: "bold",
                      padding: "10px",
                      marginBottom: "10px",
                      borderRadius: "4px",
                      fontSize: "14px",
                      color: "var(--card-text)"
                    }}>
                      {t("Original Data")}
                    </div>
                    {renderHoroscopeCharts(original_data, t("Current Horoscope"))}
                  </div>

                  {/* After Edit Chart */}
                  <div style={{ flex: 1, paddingLeft: "10px" }}>
                    <div className="step-label-mobile" style={{ 
                      backgroundColor: "rgba(34, 197, 94, 0.1)", 
                      color: "#22c55e",
                      textAlign: "center",
                      fontWeight: "bold",
                      padding: "10px",
                      marginBottom: "10px",
                      borderRadius: "4px",
                      fontSize: "14px",
                      color: "var(--card-text)"
                    }}>
                      {t("New Data")}
                    </div>
                    {renderHoroscopeCharts(new_data, t("Requested Horoscope"))}
                  </div>
                </div>
              </div>
            );
          }

          // Regular rendering for other steps
          return (
            <div key={stepName} style={{ 
              marginBottom: 30, 
              borderBottom: "1px solid var(--input-border)", 
              paddingBottom: "20px" 
            }}>
              <h3 style={{ 
                borderBottom: "1px solid var(--input-border)", 
                paddingBottom: 5, 
                marginBottom: "15px",
                color: "var(--card-text)"
              }}>
                {t(stepName)}
              </h3>

              <div className="comparison-columns" style={{
                display: "flex",
                flexDirection: "row",
                gap: "20px"
              }}>
                {/* Before Column */}
                <div style={{ 
                  flex: 1, 
                  minWidth: "300px", 
                  borderRight: "1px dashed var(--input-border)", 
                  paddingRight: "10px" 
                }}>
                  <div className="step-label-mobile" style={{ 
                    backgroundColor: "var(--input-bg)", 
                    color: "var(--card-text)", 
                    opacity: 0.7,
                    textAlign: "center",
                    fontWeight: "bold",
                    padding: "10px",
                    marginBottom: "10px",
                    borderRadius: "4px"
                  }}>
                    {t("Before Edit (Current)")}
                  </div>
                  
                  {fields.map((key) => (
                    <div key={key} style={{ 
                      padding: "8px 0", 
                      borderBottom: "1px solid var(--input-border)" 
                    }}>
                      <strong style={{ 
                        display: "block", 
                        fontSize: "12px", 
                        color: "var(--card-text)", 
                        opacity: 0.7 
                      }}>
                        {t(formatFieldName(key))}:
                      </strong>
                      <div style={{ color: "var(--card-text)", minHeight: "20px" }}>
                        {renderFieldValue(original_data[key], key)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* After Column */}
                <div style={{ flex: 1, minWidth: "300px", paddingLeft: "10px" }}>
                  <div className="step-label-mobile" style={{ 
                    backgroundColor: "rgba(34, 197, 94, 0.1)", 
                    color: "#22c55e",
                    textAlign: "center",
                    fontWeight: "bold",
                    padding: "10px",
                    marginBottom: "10px",
                    borderRadius: "4px"
                  }}>
                    {t("After Edit (Requested)")}
                  </div>
                  
                  {fields.map((key) => {
                    const isChanged = JSON.stringify(original_data[key]) !== JSON.stringify(new_data[key]);
                    
                    return (
                      <div key={key} style={{ 
                        padding: "8px 0", 
                        borderBottom: "1px solid var(--input-border)",
                        backgroundColor: isChanged ? "rgba(34, 197, 94, 0.1)" : "transparent"
                      }}>
                        <strong style={{ 
                          display: "block", 
                          fontSize: "12px", 
                          color: "var(--card-text)", 
                          opacity: 0.7 
                        }}>
                          {t(formatFieldName(key))}:
                        </strong>
                        <div style={{ 
                          color: "var(--card-text)", 
                          fontWeight: isChanged ? "bold" : "normal",
                          minHeight: "20px"
                        }}>
                          {renderFieldValue(new_data[key], key)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
    </>
  );
}
