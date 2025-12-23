"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { styles, loadFormData, saveFormData, defaultFormData } from "../../register/styles";
import Navigation from "../components/Navigation";
import TamilInput from "@/app/components/TamilInput";
import TamilPopup from "@/app/components/TamilPopup";
import LanguageToggle from "@/app/components/LanguageToggle";
import { t } from "@/app/utils/translations";
import { useLanguage } from "@/app/hooks/useLanguage";
import { API_URL } from "@/app/utils/config";

export default function EditStep8() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState(defaultFormData);
  const [originalForm, setOriginalForm] = useState({}); // New state: Original Data
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otp, setOtp] = useState("");
  const [emailVerificationError, setEmailVerificationError] = useState("");
  const [showVerificationWarning, setShowVerificationWarning] = useState(false);
  const [otpMessage, setOtpMessage] = useState("");
  const [registrationError, setRegistrationError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  const [loading, setLoading] = useState(true);
  const [clickedField, setClickedField] = useState(null);
  const { language, toggleLanguage } = useLanguage();

  const handleFieldClick = (field) => {
    setClickedField(field);
    setTimeout(() => setClickedField(null), 3000);
  };

  const WarningMessage = () => (
    <div style={{
      color: "#856404",
      backgroundColor: "#fff3cd",
      borderColor: "#ffeeba",
      padding: "5px",
      borderRadius: "4px",
      marginTop: "5px",
      fontSize: "14px",
      textAlign: "center"
    }}>
      ⚠️ {t("You want to change it? Send email with information", language)}
    </div>
  );

  useEffect(() => {
    // Load data from localStorage. No backend fetch here.
    loadFormData().then(localData => {
      console.log("Step 8: Loading from localStorage:", localData);
      setForm(localData);
      setLoading(false);

      // Fetch original data for comparison
      const email = localStorage.getItem("originalEmail") || localStorage.getItem("lastFetchedEmail") || localData.email;
      if (email) {
          fetch(`${API_URL}/userdetails/${encodeURIComponent(email)}`)
            .then(res => res.json())
            .then(res => {
                console.log("Backend response for original data:", res);
                if(res.success && res.data) {
                    console.log("Setting originalForm with data:", res.data);
                    console.log("originalForm.photos:", res.data.photos);
                    setOriginalForm(res.data);
                }
            })
            .catch(err => console.error("Error fetching original data for comparison:", err));
      }
    });
  }, []);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  useEffect(() => {
    if (emailVerificationError) {
      const timer = setTimeout(() => setEmailVerificationError(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [emailVerificationError]);

  useEffect(() => {
    if (registrationError) {
      const timer = setTimeout(() => setRegistrationError(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [registrationError]);

  useEffect(() => {
    if (!loading) {
      saveFormData(form);
      console.log("Form data updated:", form);
    }
  }, [form, loading]);

  // Helper function to upload file to backend
  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("photo", file);

    const res = await fetch(`${API_URL}/api/upload`, {
      method: "POST",
      body: formData,
    });
    
    const data = await res.json();
    if (data.success && data.paths && data.paths.length > 0) {
      return data.paths[0];
    } else {
      throw new Error(data.message || "Upload failed");
    }
  };

  const handleSubmit = async () => {
    setRegistrationError(""); // Clear previous errors
    if (!otpVerified) {
      setShowVerificationWarning(true);
      setTimeout(() => {
        setShowVerificationWarning(false);
      }, 4000);
      return;
    }

    try {
      // Use the original email to identify the user
      const originalEmail = localStorage.getItem("originalEmail") || form.email;
      
      // Prepare form data (excluding password fields only)
      const submitData = {};
      for (const key in form) {
        if (form[key] !== undefined && form[key] !== null) {
          // Exclude password fields from update request
          if (key === "password" || key === "confirmPassword") continue;
          submitData[key] = form[key];
        }
      }
      
      // Helper to process photo field (single or array)
      const processPhotoField = async (field) => {
          if (field instanceof File) {
              return await uploadFile(field);
          }
          return field;
      };

      // Handle single 'photo' field if it exists and is a File
      if (submitData.photo && submitData.photo instanceof File) {
        console.log("Uploading photo File...");
        const photoPath = await uploadFile(submitData.photo);
        submitData.photo = JSON.stringify([photoPath]);
      } else if (submitData.photo && typeof submitData.photo === 'string' && !submitData.photo.startsWith('[')) {
        // If it's already a string but not in array format, wrap it
        submitData.photo = JSON.stringify([submitData.photo]);
      }
      
      // Handle 'photos' array - this is the primary source for multiple photos
      if (submitData.photos && Array.isArray(submitData.photos)) {
        console.log("Processing photos array with server upload...");
        const photoPromises = submitData.photos.map(async (photo) => {
          if (photo instanceof File) {
            console.log("Uploading file:", photo.name);
            return await uploadFile(photo);
          }
          // Filter out empty objects and invalid values
          if (photo && typeof photo === 'object' && Object.keys(photo).length === 0) {
            return null; // Mark empty objects for removal
          }
          return photo; // Keep existing string paths
        });
        
        const resolvedPhotos = await Promise.all(photoPromises);
        // Filter out null values
        const validPhotos = resolvedPhotos.filter(p => p !== null);
        
        if (validPhotos.length > 0) {
             // Stringify the array and assign to 'photo' field (DB column name)
             submitData.photo = JSON.stringify(validPhotos);
        }
        
        // Remove 'photos' field as it doesn't exist in UserDetail model
        delete submitData.photos;
      }
      
      console.log("=== UPDATE REQUEST DEBUG ===");
      console.log("Photo field in form:", form.photo);
      console.log("Photo field type:", typeof form.photo);
      console.log("Photo field in submitData:", submitData.photo ? (submitData.photo.substring ? submitData.photo.substring(0, 50) + "..." : submitData.photo) : null);
      console.log("Photo included?", submitData.hasOwnProperty('photo'));
      console.log("============================");
      console.log("Submitting Update Request (with photo as base64)");

      // Create update request
      const res = await fetch(`${API_URL}/api/update-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_email: originalEmail,
          new_data: submitData,
        }),
      });

      const data = await res.json();
      if (data.success) {
        // Show toast immediately
        const msg = t("Update request submitted! Waiting for admin approval.", language);
        window.dispatchEvent(new CustomEvent('show-notification', { 
          detail: { message: msg, type: 'success' } 
        }));
        
        localStorage.removeItem("lastFetchedEmail");
        localStorage.removeItem("registerFormData");
        localStorage.removeItem("originalEmail");
        
        // Wait 2 seconds
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      } else {
        setRegistrationError(data.message || t("Failed to submit request", language));
      }
    } catch (e) {
      setRegistrationError(t("Failed to submit update request", language));
      console.error(e);
    }
  };


  const handleSendOtp = async () => {
    if (!form.email) {
      setEmailVerificationError(t("Email is required", language));
      return;
    }
    if (resendCooldown > 0) return;
    setIsSendingOtp(true);

    try {
      const res = await fetch(`${API_URL}/send-email-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });
      const data = await res.json();
      if (data.success) {
        setOtpSent(true);
        setResendCooldown(60);
        setEmailVerificationError("");
        setOtpMessage(t("OTP sended to email", language));
        setTimeout(() => {
          setOtpMessage("");
        }, 2000);
      } else {
        setEmailVerificationError(data.message);
      }
    } catch (e) {
      setEmailVerificationError("Failed to send OTP");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      setEmailVerificationError(t("Please enter OTP", language));
      return;
    }

    try {
      const res = await fetch(`${API_URL}/verify-email-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, otp }),
      });
      const data = await res.json();
      if (data.success) {
        setOtpVerified(true);
        setEmailVerificationError("");
      } else {
        setEmailVerificationError(data.message);
      }
    } catch (e) {
      setEmailVerificationError("Failed to verify OTP");
    }
  };

  const leftPlanets = [
    { key: "sooriyan", label: "Sooriyan (சூரியன்)  " },
    { key: "chandiran", label: "Chandiran (சந்திரன்)" },
    { key: "sevai", label: "Sevvai (செவ்வாய்)" },
    { key: "budhan", label: "Budhan (புதன்)  " },
    { key: "viyazhan", label: "Viyazhan (வியாழன்)" },
    { key: "sukkiran", label: "Sukkiran (சுக்கிரன்)" },
  ];

  const rightPlanets = [
    { key: "sani", label: "Sani (சனி)" },
    { key: "rahu", label: "Rahu (ராகு)" },
    { key: "maanthi", label: "Maanthi (மாந்தி)" },
    { key: "kethu", label: "Kethu (கேது)" },
    { key: "lagnam", label: "Lagnam (லக்னம்)" },
  ];

  const allPlanets = [...leftPlanets, ...rightPlanets];
  const chartData = {};

  allPlanets.forEach((planet) => {
    const pos = form[planet.key];
    if (pos && pos >= 1 && pos <= 12) {
      if (!chartData[pos]) chartData[pos] = [];
      const tamilLabel = planet.label.split(" (")[1].replace(")", "");
      chartData[pos].push(tamilLabel);
    }
  });

  const amsamChartData = {};

  allPlanets.forEach((planet) => {
    const pos = form["amsam_" + planet.key];
    if (pos && pos >= 1 && pos <= 12) {
      if (!amsamChartData[pos]) amsamChartData[pos] = [];
      const tamilLabel = planet.label.split(" (")[1].replace(")", "");
      amsamChartData[pos].push(tamilLabel);
    }
  });



  const renderBox = (pos) => {
    const planets = chartData[pos] || [];
    return (
      <div className="rasi-cell" style={{ border: '1px solid var(--input-border)' }}>
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
        <span style={{ textAlign: "center", width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
          {planets.length > 0 ? planets.join(", ") : ""}
        </span>
      </div>
    );
  };

  const renderAmsamBox = (pos) => {
    const planets = amsamChartData[pos] || [];
    return (
      <div className="rasi-cell" style={{ border: '1px solid var(--input-border)' }}>
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
        <span style={{ textAlign: "center", width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
          {planets.length > 0 ? planets.join(", ") : ""}
        </span>
      </div>
    );
  };

  const displayNames = {
    affliction: "Dhosam",
    periodType: "DisaiType",
    dosham: "Dosham",
    DasaType: "DasaType",
    dasaRemainYears: "Dasa Remain Years",
    dasaRemainMonths: "Dasa Remain Months",
    dasaRemainDays: "Dasa Remain Days",
  };

  const formatFieldName = (key) => {
    if (displayNames[key]) return displayNames[key];
    // Convert camelCase to Title Case
    const result = key.replace(/([A-Z])/g, " $1");
    const finalResult = result.charAt(0).toUpperCase() + result.slice(1);
    return finalResult;
  };

  const formatDate = (value) => {
    if (!value) return "";
    // Handle ISO string or YYYY-MM-DD
    const datePart = String(value).split("T")[0];
    const parts = datePart.split("-");
    if (parts.length === 3) {
      const [year, month, day] = parts;
      return `${day}-${month}-${year}`;
    }
    return value;
  };

  /* Helper to render a single field value safely */
  const renderFieldValue = (data, key) => {
      if (!data) return "";
      const val = data[key];

      if (key === "photos") {
        // Handle photos array - could be File objects or string paths
        if (val && Array.isArray(val) && val.length > 0) {
          return (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "5px" }}>
              {val.map((photo, idx) => {
                let photoSrc = "";
                
                if (typeof photo === "string") {
                  // Server-stored photo path
                  photoSrc = photo.startsWith("http") 
                    ? photo 
                    : `${API_URL}/${photo.replace(/\\/g, "/")}`;
                } else if (photo instanceof File || photo instanceof Blob) {
                  // Newly uploaded photo (File/Blob)
                  photoSrc = URL.createObjectURL(photo);
                }
                
                return photoSrc ? (
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
                      console.error("Failed to load photo:", photo);
                      e.target.style.display = "none";
                    }}
                  />
                ) : null;
              })}
            </div>
          );
        }
        return "";
      } else if (key === "photo" && val) {
         // Single photo field
         let photoSrc = "";
         
         if (typeof val === "string") {
           photoSrc = val.startsWith("http") 
             ? val 
             : `${API_URL}/${val.replace(/\\/g, "/")}`;
         } else if (val instanceof File || val instanceof Blob) {
           photoSrc = URL.createObjectURL(val);
         }
         
         return photoSrc ? (
            <img
              loading="lazy"
              src={photoSrc}
              alt="Photo"
              style={{
                maxWidth: "100px",
                maxHeight: "100px",
                borderRadius: "4px",
                border: "1px solid var(--input-border)",
              }}
              onError={(e) => {
                console.error("Failed to load photo:", val);
                e.target.style.display = "none";
              }}
            />
         ) : "";
      } else if (key === "dateOfBirth") {
          return formatDate(val);
      }
      return t(String(val ?? ""), language);
  };

  /* Helper to get Rasi Name */
  const rasiNames = {
    1: "Mesham (மேஷம்)",
    2: "Rishabam (ரிஷபம்)",
    3: "Midhunam (மிதுனம்)",
    4: "Kadakam (கடகம்)",
    5: "Simmam (சிம்மம்)",
    6: "Kanni (கன்னி)",
    7: "Thulaam (துலாம்)",
    8: "Viruchigam (விருச்சிகம்)",
    9: "Dhanusu (தனுசு)",
    10: "Magaram (மகரம்)",
    11: "Kumbam (கும்பம்)",
    12: "Meenam (மீனம்)"
  };

  const getRasiName = (pos) => {
    if (!pos) return "-";
    return rasiNames[pos] || pos;
  };

  /* Helper to render chart grids only for a given dataset */
  const renderPage5StyleLayout = (data, title) => {
    // Calculate chart data for this specific dataset
    const localChartData = {};
    const localAmsamChartData = {};

    allPlanets.forEach((planet) => {
      const pos = data[planet.key];
      if (pos && pos >= 1 && pos <= 12) {
        if (!localChartData[pos]) localChartData[pos] = [];
        const tamilLabel = planet.label.split(" (")[1].replace(")", "");
        localChartData[pos].push(tamilLabel);
      }
    });

    allPlanets.forEach((planet) => {
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
        <h4 style={{ marginBottom: "20px", fontWeight: "bold", fontSize: "18px", color: "var(--card-text)" }}>{t(title, language)}</h4>
        
        {/* Rasi Chart */}
        <div style={{ marginBottom: "40px" }}>
          <h5 style={{ marginBottom: "15px", color: "var(--card-text)" }}>{t("Rasi Chart", language)}</h5>
          <div className="rasi-grid">
            {renderLocalBox(1, localChartData)}
            {renderLocalBox(2, localChartData)}
            {renderLocalBox(3, localChartData)}
            {renderLocalBox(4, localChartData)}
            {renderLocalBox(12, localChartData)}
            <div className="center-box">{t("Rasi", language)}</div>
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
          <h5 style={{ marginBottom: "15px", color: "var(--card-text)" }}>{t("Amsam Chart", language)}</h5>
          <div className="rasi-grid">
            {renderLocalBox(1, localAmsamChartData)}
            {renderLocalBox(2, localAmsamChartData)}
            {renderLocalBox(3, localAmsamChartData)}
            {renderLocalBox(4, localAmsamChartData)}
            {renderLocalBox(12, localAmsamChartData)}
            <div className="center-box">{t("Amsam", language)}</div>
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

  /* Render both Before and After in Page 5 style side-by-side */
  const renderPage5Comparison = () => {
    return (
      <>
        {/* Mobile View: Stacked with Labels */}
        <div className="step-label-mobile">
          <div style={{ backgroundColor: "var(--input-bg)", color: "var(--card-text)", opacity: 0.7, textAlign: "center", fontWeight: "bold", fontSize: "16px", padding: "10px", marginBottom: "10px", borderRadius: "4px" }}>{t("Before Edit (Original)", language)}</div>
          <div style={{ display: "flex", gap: "40px", flexWrap: "wrap", justifyContent: "space-around" }}>
            {renderPage5StyleLayout(originalForm, "Before Edit (Original)")}
          </div>
          <div style={{ backgroundColor: "rgba(34, 197, 94, 0.1)", color: "#22c55e", textAlign: "center", fontWeight: "bold", fontSize: "16px", padding: "10px", marginTop: "20px", marginBottom: "10px", borderRadius: "4px" }}>{t("After Edit (New)", language)}</div>
          <div style={{ display: "flex", gap: "40px", flexWrap: "wrap", justifyContent: "space-around" }}>
            {renderPage5StyleLayout(form, "After Edit (New)")}
          </div>
        </div>
        {/* Desktop View: Side by Side */}
        <div className="step-label-desktop" style={{ display: "flex", gap: "40px", flexWrap: "wrap", justifyContent: "space-around" }}>
          {renderPage5StyleLayout(originalForm, "Before Edit (Original)")}
          {renderPage5StyleLayout(form, "After Edit (New)")}
        </div>
      </>
    );
  };

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
    "Step 5 - Full Horoscope Chart": "chart",
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
      "photos",
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
      <style>{`
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
          background: var(--card-bg);
          color: var(--card-text);
        }

        .step5-layout {
            display: flex;
            justify-content: space-between;
            gap: 20px;
            flex-wrap: wrap;
        }
        .planet-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid #eee;
        }
        .planet-row:last-child {
            border-bottom: none;
        }
        .planet-row label {
            font-weight: bold;
            flex: 1;
            text-align: left;
            color: var(--card-text);
        }
        .card {
            padding: 20px;
            border: 1px solid var(--input-border);
            border-radius: 12px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
            background: var(--card-bg);
            color: var(--card-text);
            margin-bottom: 20px;
        }
        
        .step-label-mobile {
            display: none;
            text-align: center;
            font-weight: bold;
            font-size: 16px;
            padding: 10px;
            margin-bottom: 10px;
            border-radius: 4px;
        }
        
        .step-label-desktop {
            display: block;
        }

        @media (max-width: 600px) {
          .rasi-grid {
            max-width: 100% !important;
            font-size: 10px !important;
            width: 100% !important;
            margin: 40px auto 0px auto;
          }
          .rasi-grid > div {
            padding: 3px !important;
            font-size: 10px !important;
            min-height: 60px !important;
          }
          .center-box {
            font-size: 14px !important;
          }
        }

        @media (max-width: 768px) {
          .button-container {
            flex-direction: column !important;
            gap: 10px !important;
          }
          .button-container button {
            width: 90% !important;
            margin: 10px auto !important;
            max-width: 400px;
          }
          .field-row {
            flex-direction: column !important;
            align-items: center !important;
            gap: 5px !important;
          }
          .field-label {
            text-align: left !important;
            min-width: 300px !important;
            max-width: 300px !important;
            width: 300px !important;
            margin: 0 auto !important;
          }
          .field-input {
            max-width:300px !important;
            width: 300px !important;
            margin: 5px auto !important;
          }

          .email-verification-row {
            flex-direction: column !important;
            gap: 10px !important;
          }
          
          .email-verification-row input,
          .email-verification-row button {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
          }
          
          .step-label-mobile {
            display: block !important;
          }
          
          .step-label-desktop {
            display: none !important;
          }
        }
        
        @media (max-width: 480px) {
          h1 {
            font-size: 22px !important;
          }
        }
      `}</style>
      <div style={styles.container}>
      {language === "ta" && (
        <div style={{ position: "fixed", top: "100px", right: "20px", zIndex: 50 }}>
          </div>
      )}

      <h1 style={{ fontWeight: 'bold' }}>{t("Edit Details", language)}</h1>
      <br/>
      <Navigation current={8} />
      <h1>{t("Step 8 - Preview & Submit", language)}</h1>
      <br/>
      
      {/* Legend / Header for Comparison - Desktop Only */}
      <div className="step-label-desktop" style={{ display: "flex", justifyContent: "space-between", maxWidth: "1000px", margin: "0 auto 20px auto", fontWeight: "bold", borderBottom: "2px solid var(--input-border)", paddingBottom: "10px" }}>
          <div style={{ flex: 1, textAlign: "center", color: "var(--card-text)", opacity: 0.7 }}>{t("Before Edit (Original)", language)}</div>
          <div style={{ flex: 1, textAlign: "center", color: "#22c55e" }}>{t("After Edit (New)", language)}</div>
      </div>

      <div style={{ textAlign: "left", maxWidth: "1000px", width: "100%", margin: "0 auto" }}>
        {Object.keys(stepGroups).map((step) => {
          const fields = stepGroups[step];
          
          if (fields === "chart") {
             return (
                 <div key={step} style={{ marginBottom: 30, borderBottom: "1px solid var(--input-border)", paddingBottom: "20px" }}>
                    <h3 style={{ borderBottom: "1px solid var(--input-border)", paddingBottom: 5, marginBottom: "15px", textAlign: "center", color: "var(--card-text)" }}>{step}</h3>
                    {/* Render Page 5 Style Comparison */}
                    {renderPage5Comparison()}
                 </div>
             );
          }

          return (
            <div key={step} style={{ marginBottom: 30, borderBottom: "1px solid var(--input-border)", paddingBottom: "20px" }}>
              <h3 style={{ borderBottom: "1px solid var(--input-border)", paddingBottom: 5, marginBottom: "15px", color: "var(--card-text)" }}>
                {t(step, language)}
              </h3>
              
              <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
                 {/* Left Column: Before Edit */}
                 <div style={{ flex: 1, minWidth: "300px", borderRight: "1px dashed var(--input-border)", paddingRight: "10px" }}>
                    <div className="step-label-mobile" style={{ backgroundColor: "var(--input-bg)", color: "var(--card-text)", opacity: 0.7 }}>{t("Before Edit (Original)", language)}</div>
                    {fields.map((k) => (
                        <div key={k} style={{ padding: "8px 0", borderBottom: "1px solid var(--input-border)" }}>
                             <strong style={{ display: "block", fontSize: "12px", color: "var(--card-text)", opacity: 0.7 }}>{language === "ta" && t(k, "ta") !== k ? t(k, "ta") : formatFieldName(k)}:</strong>
                             <div style={{ color: "var(--card-text)", minHeight: "20px" }}>
                                 {renderFieldValue(originalForm, k) || <span style={{ fontStyle: "italic", color: "var(--card-text)", opacity: 0.5 }}>-</span>}
                             </div>
                        </div>
                    ))}
                 </div>

                 {/* Right Column: After Edit */}
                 <div style={{ flex: 1, minWidth: "300px", paddingLeft: "10px" }}>
                    <div className="step-label-mobile" style={{ backgroundColor: "rgba(34, 197, 94, 0.1)", color: "#22c55e" }}>{t("After Edit (New)", language)}</div>
                    {fields.map((k) => {
                        const originalVal = JSON.stringify(originalForm[k]);
                        const newVal = JSON.stringify(form[k]);
                        const isChanged = originalVal !== newVal;
                        
                        return (
                            <div key={k} style={{ padding: "8px 0", borderBottom: "1px solid var(--input-border)", backgroundColor: isChanged ? "rgba(34, 197, 94, 0.1)" : "transparent" }}>
                                <strong style={{ display: "block", fontSize: "12px", color: "var(--card-text)", opacity: 0.7 }}>{language === "ta" && t(k, "ta") !== k ? t(k, "ta") : formatFieldName(k)}:</strong>
                                <div style={{ color: "var(--card-text)", fontWeight: isChanged ? "bold" : "normal" }}>
                                    {renderFieldValue(form, k) || <span style={{ fontStyle: "italic", color: "var(--card-text)", opacity: 0.5 }}>-</span>}
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
      {/* Email Verification Section */}
      <div
        style={{
          marginTop: 20,
          padding: 20,
          border: "1px solid var(--input-border)",
          borderRadius: 4,
        }}
      >
        <h3>{t("Email Verification", language)}</h3>
        <p style={{ marginBottom: 10 }}>
          {t("Please verify your email address before updating details.", language)}
        </p>

        {otpMessage && (
          <div style={{ color: "green", marginBottom: 10, fontSize: "20px" }}>
            {otpMessage}
          </div>
        )}
        <div style={{ marginBottom: 10, textAlign: "center" }}>
          <label style={{ display: "block", marginBottom: 5 }}>{t("Email", language)}:</label>
            <div
            className="email-verification-row"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "20px",
            }}
          >
            <TamilInput
              name="email"
              value={form.email || ""}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              style={styles.input241}
              placeholder={t("Enter your email", language)}
              forcedLanguage={language === "ta" ? "ta" : "en"}
            />
            {!otpSent && (
              <button
                style={styles.input123}
                onClick={handleSendOtp}
                disabled={!form.email || isSendingOtp}
              >
                {isSendingOtp ? t("Sending...", language) : t("Send OTP", language)}
              </button>
            )}
            {otpSent && !otpVerified && (
              <button
                style={{
                  ...styles.input123,
                  backgroundColor: "#6c757d",
                }}
                onClick={handleSendOtp}
                disabled={resendCooldown > 0 || isSendingOtp}
              >
                {isSendingOtp
                  ? t("Sending...", language)
                  : resendCooldown > 0
                  ? `${t("Resend OTP", language)} (${resendCooldown}s)`
                  : t("Resend OTP", language)}
              </button>
            )}
            </div>
          </div>


        {otpSent && !otpVerified && (
             <div
              className="email-verification-row"
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              gap: "20px",
                marginBottom: 5,
              }}
            >
            <TamilInput
              name="otp"
              placeholder={t("Enter OTP", language)}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              style={styles.input241}
              maxLength={4}
              forcedLanguage={language === "ta" ? "ta" : "en"}
            />
              <button style={styles.input123} onClick={handleVerifyOtp}>
                {t("Verify OTP", language)}
              </button>
            </div>
        )}

        {otpVerified && (
          <div
            style={{ color: "green", fontWeight: "bold", textAlign: "center" }}
          >
            {t("✓ Email verified successfully", language)}
          </div>
        )}

        {emailVerificationError && (
          <div style={{ color: "red", marginTop: 10 }}>
            {emailVerificationError}
          </div>
        )}
      </div>

      {showVerificationWarning && (
        <div
          style={{
            textAlign: "center",
            marginTop: 20,
            padding: 10,
            backgroundColor: "#ffebee",
            border: "1px solid #f44336",
            borderRadius: 4,
            color: "#c62828",
            fontWeight: "bold",
          }}

        >
          {t("Email verification is required before updating", language)}
        </div>
      )}


      {registrationError && (
        <div style={{ color: "red", marginTop: 10, textAlign: "center" }}>
          {registrationError}
        </div>
      )}

      <div style={styles.formContainer} className="button-container">
        <div style={styles.leftColumn}>
          <button
            style={styles.previousButton1}
            onClick={async () => {
              await saveFormData(form); // Save before navigating
              router.push("/editdetail/7");
            }}
          >
            {t("Previous", language)}
          </button>
        </div>
        <div style={styles.rightColumn}>
          <button style={styles.button1} onClick={handleSubmit}>
            {t("Update", language)}
          </button>
        </div>
      </div>
      <div style={{ textAlign: "center", marginTop: "20px", marginBottom: "20px" }}>
        {t("Go To Dashboard", language)} <span style={{ color: "blue", cursor: "pointer", textDecoration: "underline" }} onClick={() => router.push("/dashboard")}>{t("ClickHere", language)}</span>
      </div>
    </div>
    </>
  );
}
