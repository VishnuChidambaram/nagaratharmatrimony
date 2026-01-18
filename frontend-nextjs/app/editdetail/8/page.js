"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadFormData, saveFormData, defaultFormData } from "../../register/styles";
import Navigation from "../components/Navigation";
import TamilInput from "@/app/components/TamilInput";
import { t } from "@/app/utils/translations";
import { useLanguage } from "@/app/hooks/useLanguage";
import { API_URL } from "@/app/utils/config";
import { getAuthHeaders } from "@/app/utils/auth-headers";
import Image from "next/image";
import "./../editdetail.css";

export default function EditStep8() {
  const router = useRouter();
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
  const { language } = useLanguage();

  const handleFieldClick = (field) => {
    setClickedField(field);
    setTimeout(() => setClickedField(null), 3000);
  };

  const WarningMessage = () => (
    <div style={{
      width: "80%",
      backgroundColor: "#fff3cd",
      color: "#856404",
      padding: "8px 12px",
      borderRadius: "5px",
      border: "1px solid #ffc107",
      marginTop: "5px",
      marginBottom: "5px",
      marginLeft: "auto",
      marginRight: "auto",
      fontWeight: "500",
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
      const email = sessionStorage.getItem("originalEmail") || sessionStorage.getItem("lastFetchedEmail") || localData.email;
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
      const originalEmail = sessionStorage.getItem("originalEmail") || form.email;
      
      // Prepare form data (excluding password fields only)
      const submitData = {};
      for (const key in form) {
        if (form[key] !== undefined && form[key] !== null) {
          // Exclude password fields from update request
          if (key === "password" || key === "confirmPassword") continue;
          submitData[key] = form[key];
        }
      }
      


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
        headers: { 
          "Content-Type": "application/json",
          ...getAuthHeaders()
        },
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
        
        sessionStorage.removeItem("lastFetchedEmail");
        sessionStorage.removeItem("registerFormData");
        sessionStorage.removeItem("originalEmail");
        
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
    } catch {
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
    } catch {
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





  const displayNames = {
    // Step 1
    name: "Name",
    gender: "Gender",
    maritalStatus: "Marital Status",
    fatherName: "Father Name",
    fatherOccupation: "Father Occupation",
    motherName: "Mother Name",
    motherOccupation: "Mother Occupation",
    brothers: "Number of Brothers",
    brothersMarried: "Married Number of Brothers",
    sisters: "Number of Sisters",
    sistersMarried: "Married Number of Sisters",
    yourTemple: "Your Temple",
    yourDivision: "Your Division",
    knownLanguages: "Known Languages",
    reference: "Reference",
    nativePlace: "Native Place",
    nativePlaceHouseName: "Native Place House Name",
    presentResidence: "Present Residence",
    pincode: "Pincode",
    profileCreatedBy: "Profile Created By",
    referredBy: "Referred By",
    referralDetails1Name: "Referral 1 Name",
    referralDetails1Phone: "Referral 1 Phone",
    referralDetails1Email: "Referral 1 Email",
    referralDetails2Name: "Referral 2 Name",
    referralDetails2Phone: "Referral 2 Phone",
    referralDetails2Email: "Referral 2 Email",

    // Step 2
    educationQualification: "Education Qualification",
    otherEducation: "Other Education",
    occupationBusiness: "Occupation / Business",
    otherOccupation: "Other Occupation",
    workingPlace: "Working Place",
    workDetails: "Work Details",
    educationDetails: "Education Details",
    income: "Income",

    // Step 3
    height: "Height",
    complexion: "Complexion",
    weight: "Weight",
    diet: "Diet",
    specialCases: "Special Cases (Disability)",
    specialCasesDetails: "Special Cases Details",

    // Step 4
    zodiacSign: "Zodiac Sign",
    ascendant: "Ascendant",
    birthStar: "Birth Star",
    dosham: "Dosham",
    placeOfBirth: "Place of Birth",
    dateOfBirth: "Date of Birth",
    timeOfBirthHours: "Time of Birth (Hours)",
    timeOfBirthMinutes: "Time of Birth (Minutes)",
    timeOfBirthSeconds: "Time of Birth (Seconds)",
    DasaType: "Dasa Type",
    dasaRemainYears: "Dasa Years",
    dasaRemainMonths: "Dasa Months",
    dasaRemainDays: "Dasa Days",

    // Step 6
    fullStreetAddress: "Full Street Address",
    city: "City",
    state: "State",
    district: "District",
    country: "Country",
    postalCode: "Postal Code",
    phone: "Phone",
    otherPhone: "Other Phone",
    whatsAppNo: "WhatsApp No",
    email: "Email",
    photos: "Photos",

    // Step 7
    educationQualification1: "Partner Education",
    otherEducation1: "Partner Other Education",
    educationDetails1: "Partner Education Details",
    complexion1: "Partner Complexion",
    personalPreference1: "Personal Preference",
    willingnessToWork1: "Willingness to Work After Marriage",
    fromAge: "From Age",
    toAge: "To Age",
    fromHeight: "From Height",
    toHeight: "To Height",

    // Old/Legacy
    affliction: "Dhosam",
    periodType: "DisaiType",
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
                  <Image
                    key={idx}
                    src={photoSrc}
                    alt={`Photo ${idx + 1}`}
                    width={100}
                    height={100}
                    style={{
                      borderRadius: "4px",
                      border: "1px solid var(--input-border)",
                      objectFit: "cover"
                    }}
                    onError={(e) => {
                      console.error("Failed to load photo:", photo);
                      // Fallback or hide
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
            <Image
              src={photoSrc}
              alt="Photo"
              width={100}
              height={100}
              style={{
                borderRadius: "4px",
                border: "1px solid var(--input-border)",
                objectFit: "cover"
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

    return (
      <div className="horoscope-preview-item">
        <h4 className="horoscope-preview-title">{t(title, language)}</h4>
        
        {/* Rasi Chart */}
        <div className="horoscope-chart-section">
          <h5 className="horoscope-chart-label">{t("Rasi Chart", language)}</h5>
          <div className="rasi-grid preview-rasi-grid">
            {renderLocalBox(1, localChartData)}
            {renderLocalBox(2, localChartData)}
            {renderLocalBox(3, localChartData)}
            {renderLocalBox(4, localChartData)}
            {renderLocalBox(12, localChartData)}
            <div className="center-box preview-center-box">{t("Rasi", language)}</div>
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
        <div className="horoscope-chart-section">
          <h5 className="horoscope-chart-label">{t("Amsam Chart", language)}</h5>
          <div className="rasi-grid preview-rasi-grid">
            {renderLocalBox(1, localAmsamChartData)}
            {renderLocalBox(2, localAmsamChartData)}
            {renderLocalBox(3, localAmsamChartData)}
            {renderLocalBox(4, localAmsamChartData)}
            {renderLocalBox(12, localAmsamChartData)}
            <div className="center-box preview-center-box">{t("Amsam", language)}</div>
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
        {/* Unified View: Side-by-Side (Parallel) with Labels */}
      <div className="page5-comparison-container">
        <div className="comparison-column-original">
           <div className="comparison-header-original">{t("Before Edit (Original)", language)}</div>
           <div className="comparison-charts-wrapper">
             {renderPage5StyleLayout(originalForm, "")}
           </div>
        </div>
        <div className="comparison-column-new">
           <div className="comparison-header-new">{t("After Edit (New)", language)}</div>
           <div className="comparison-charts-wrapper">
             {renderPage5StyleLayout(form, "")}
           </div>
        </div>
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
      "referralDetails1Email",
      "referralDetails2Name",
      "referralDetails2Phone",
      "referralDetails2Email",
    ],
    "Step 2 - Education & Occupation": [
      "educationQualification",
      "otherEducation",
      "occupationBusiness",
      "otherOccupation",
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
      "otherEducation1",
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

  const shouldShowField = (k, data) => {
    if (!data) return true;
    if (k === "otherEducation") return data.educationQualification === "Others";
    if (k === "otherOccupation") return data.occupationBusiness === "Other";
    if (k === "otherEducation1") return data.educationQualification1 === "Others";
    if (k === "specialCasesDetails") return data.specialCases === "Yes";
    return true;
  };

  return (
    <>
      <div className="edit-detail-container">
      {language === "ta" && (
        <div style={{ position: "fixed", top: "100px", right: "20px", zIndex: 50 }}>
          </div>
      )}

      <h1 style={{ fontWeight: 'bold' }}>{t("Edit Form", language)} </h1>
      <br/>
      <Navigation current={8} />
      <h1 >{t("Step 8 - Preview & Submit", language)}</h1>
      <br/>
      
      {/* Legend / Header for Comparison - Desktop Only */}
      <div className="step-label-desktop-preview">
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
              {renderPage5Comparison()}
            </div>
          );
        }

        return (
          <div key={step} style={{ marginBottom: 30, borderBottom: "1px solid var(--input-border)", paddingBottom: "20px" }}>
            <h3 style={{ borderBottom: "1px solid var(--input-border)", paddingBottom: 5, marginBottom: "15px", color: "var(--card-text)" }}>
              {t(step, language)}
            </h3>
            
            <div className="preview-comparison-row">
              {/* Left Column: Before Edit */}
              <div className="comparison-column-original preview-column">
                <div className="step-label-mobile comparison-header-original">{t("Before Edit (Original)", language)}</div>
                <div className="preview-fields-container">
                  {fields.filter(k => shouldShowField(k, originalForm) || shouldShowField(k, form)).map((k) => (
                    <div key={k} className="preview-field-row">
                      <strong className="preview-field-label">{t(displayNames[k] || k, language)}:</strong>
                      <div className="preview-field-value">
                        {renderFieldValue(originalForm, k) || <span className="preview-empty-value">-</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
    
              {/* Right Column: After Edit */}
              <div className="comparison-column-new preview-column">
                <div className="step-label-mobile comparison-header-new">{t("After Edit (New)", language)}</div>
                <div className="preview-fields-container">
                  {fields.filter(k => shouldShowField(k, originalForm) || shouldShowField(k, form)).map((k) => {
                    const originalVal = JSON.stringify(originalForm[k]);
                    const newVal = JSON.stringify(form[k]);
                    const isChanged = originalVal !== newVal;
                    
                    return (
                      <div key={k} className={`preview-field-row ${isChanged ? 'field-changed' : ''}`}>
                        <strong className="preview-field-label">{t(displayNames[k] || k, language)}:</strong>
                        <div className={`preview-field-value ${isChanged ? 'value-changed' : ''}`}>
                          {renderFieldValue(form, k) || <span className="preview-empty-value">-</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
      {/* Email Verification Section */}
      <div
        className="edit-verification-section"
        style={{
          marginTop: 20,
          padding: 20,
          border: "1px solid var(--input-border)",
          borderRadius: 8,
          background: "var(--card-bg-elevated, transparent)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
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
            <div className="email-verification-row edit-verification-container">
              <TamilInput
                className="edit-field-input preview-email-input"
                name="email"
                value={form.email || ""}
                readOnly
                onClick={() => handleFieldClick("email")}
                title={t("You want to change it? Send email with information", language)}
                placeholder={t("Enter your email", language)}
                forcedLanguage={language === "ta" ? "ta" : "en"}
              />
              {!otpSent && (
                <button
                  className="edit-detail-button edit-send-otp-button"
                  onClick={handleSendOtp}
                  disabled={!form.email || isSendingOtp}
                >
                  {isSendingOtp ? t("Sending...", language) : t("Send OTP", language)}
                </button>
              )}
              {otpSent && !otpVerified && (
                <button
                  className="edit-otp-button"
                  onClick={handleSendOtp}
                  disabled={resendCooldown > 0 || isSendingOtp}
                >
                  {resendCooldown > 0
                    ? `${t("Resend OTP in", language)} ${resendCooldown}s`
                    : isSendingOtp
                    ? t("Sending...", language)
                    : t("Send OTP", language)}
                </button>
              )}
            </div>
            {/* Warning Message on New Line */}
            {clickedField === "email" && (
              <div style={{ marginTop: "10px" }}>
                <WarningMessage />
              </div>
            )}
          </div>


        {otpSent && !otpVerified && (
            <div className="email-verification-row edit-verification-container">
              <TamilInput
                name="otp"
                placeholder={t("Enter OTP", language)}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="edit-field-input preview-otp-input"
                maxLength={4}
                forcedLanguage={language === "ta" ? "ta" : "en"}
              />
              <button 
                className="edit-otp-button"
                onClick={handleVerifyOtp}
              >
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

      <div className="edit-page8-button-container">
        <button
          className="edit-page8-previous-button"
          onClick={async () => {
            await saveFormData(form); // Save before navigating
            router.push("/editdetail/7");
          }}
        >
          {t("Previous", language)}
        </button>
        <button className="edit-page8-update-button" onClick={handleSubmit}>
          {t("Update", language)}
        </button>
      </div>
      <div style={{ textAlign: "center", marginTop: "20px", marginBottom: "20px" }}>
        {t("Go To Dashboard", language)} <span style={{ color: "blue", cursor: "pointer", textDecoration: "underline" }} onClick={() => router.push("/dashboard")}>{t("ClickHere", language)}</span>
      </div>
    </div>
    </>
  );
}
