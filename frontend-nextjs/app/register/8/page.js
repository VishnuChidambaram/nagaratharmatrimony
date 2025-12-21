"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { styles, loadFormData, saveFormData, defaultFormData, clearFormData } from "../styles";
import Navigation from "../components/Navigation";
import TamilInput from "@/app/components/TamilInput";
import TamilPopup from "@/app/components/TamilPopup";
import LanguageToggle from "@/app/components/LanguageToggle";
import { t } from "@/app/utils/translations";
import { useLanguage } from "@/app/hooks/useLanguage";
import { API_URL } from "@/app/utils/config";

export default function Step8() {
  const router = useRouter();
  const [form, setForm] = useState(defaultFormData);
  const { language, toggleLanguage } = useLanguage();
  
  
  // Debug logging
  useEffect(() => {
    console.log('Form photos:', form.photos);
    console.log('Photos is array:', Array.isArray(form.photos));
    console.log('Photos length:', form.photos?.length);
    if (form.photos && form.photos.length > 0) {
      console.log('First photo type:', typeof form.photos[0]);
      console.log('First photo:', form.photos[0]);
    }
  }, [form.photos]);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otp, setOtp] = useState("");
  const [emailVerificationError, setEmailVerificationError] = useState("");
  const [showVerificationWarning, setShowVerificationWarning] = useState(false);
  const [otpMessage, setOtpMessage] = useState("");
  const [registrationError, setRegistrationError] = useState("");
  const [userExistsError, setUserExistsError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load form data on client side only to prevent hydration errors
  useEffect(() => {
    loadFormData().then(data => {
      setForm(data);
      setIsLoaded(true);
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
      const timer = setTimeout(() => setRegistrationError(""), 8000);
      return () => clearTimeout(timer);
    }
  }, [registrationError]);

  useEffect(() => {
    if (isLoaded) {
      saveFormData(form);
    }
  }, [form, isLoaded]);

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

  const stepGroups = {
    "Step 1 - Basic Details": [
      "name",
      "gender",
      "password",
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

  const missstepGroups = {
    "Step 1 - Basic Details": [
      "name",
      "gender",
      "password",
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

  const handleSubmit = async () => {
    setRegistrationError(""); // Clear previous errors

    if (!otpVerified) {
      setShowVerificationWarning(true);
      setTimeout(() => {
        setShowVerificationWarning(false);
      }, 4000);
      return;
    }

    // Check if user already exists
    const userExists = await checkUserExists();
    if (userExists) {
      // Clear the error message after 5 seconds
      setTimeout(() => {
        setUserExistsError("");
      }, 4000);
      return; // Stop registration if user exists
    }

    // Create a copy of form data
    const transformedForm = { ...form };
    
    const formData = new FormData();
    for (const key in transformedForm) {
      if (transformedForm[key] !== undefined && transformedForm[key] !== null) {
        if (key === "photos" && Array.isArray(transformedForm[key])) {
          // Handle multiple photos
          transformedForm[key].forEach(photo => {
            formData.append("photo", photo);
          });
        } else if (key !== "photo") { // Skip old photo field
          formData.append(key, transformedForm[key]);
        }
      }
    }
    try {
      const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        await clearFormData();
        window.dispatchEvent(new CustomEvent('show-notification', { 
          detail: { message: 'Registration Successful! Please Login.', type: 'success' } 
        }));
        
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setRegistrationError(data.message || "Registration failed");
      }
    } catch (e) {
      setRegistrationError("Failed to submit registration");
    }
  };

  const handleSendOtp = async () => {
    // First, validate all fields are filled
    setRegistrationError(""); // Clear previous errors
    
    const missingFieldsByStep = {};
    
    Object.entries(missstepGroups).forEach(([stepName, fields]) => {
      const stepMissingFields = [];
      
      if (fields === "chart") {
        allPlanets.forEach(p => {
          const rasiVal = form[p.key];
          const amsamVal = form["amsam_" + p.key];
          
          if (!rasiVal || (typeof rasiVal === 'string' && rasiVal.trim() === "")) {
            stepMissingFields.push(p.key);
          }
          if (!amsamVal || (typeof amsamVal === 'string' && amsamVal.trim() === "")) {
            stepMissingFields.push("amsam_" + p.key);
          }
        });
      } else if (Array.isArray(fields)) {
        fields.forEach(field => {
          const val = form[field];
          // Handle photos array separately
          if (field === "photos") {
            if (!val || !Array.isArray(val) || val.length === 0) {
              stepMissingFields.push(field);
            }
          } else if (!val || (typeof val === 'string' && val.trim() === "")) {
            stepMissingFields.push(field);
          }
        });
      }
      
      if (stepMissingFields.length > 0) {
        missingFieldsByStep[stepName] = stepMissingFields;
      }
    });

    if (Object.keys(missingFieldsByStep).length > 0) {
      let errorMessage = "Please complete the following pages:\n\n";
      Object.entries(missingFieldsByStep).forEach(([stepName, fields]) => {
        errorMessage += `${stepName}:\n${fields.join(", ")}\n\n`;
      });
      errorMessage += "Please fill all fields or enter NA";
      setRegistrationError(errorMessage);
      return;
    }

    // Now proceed with OTP sending
    if (!form.email) {
      setEmailVerificationError("Email is required");
      return;
    }
    if (resendCooldown > 0) return;
    setIsSendingOtp(true);

    try {
      const res = await fetch(`${API_URL}/send-email-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: form.email }),
      });
      const data = await res.json();
      if (data.success) {
        setOtpSent(true);
        setResendCooldown(60);
        setEmailVerificationError("");
        setOtpMessage("OTP sended to email");
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
      setEmailVerificationError("Please enter OTP");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/verify-email-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
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

  const checkUserExists = async () => {
    if (!form.email || !form.phone) {
      setUserExistsError("Email and phone are required to check availability");
      return false;
    }

    try {
      const res = await fetch(`${API_URL}/check-user-exists`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: form.email, phone: form.phone }),
      });
      const data = await res.json();
      if (data.exists) {
        setUserExistsError("User with this email or phone already exists");
        return true;
      } else {
        setUserExistsError("");
        return false;
      }
    } catch (e) {
      setUserExistsError("Failed to check user availability");
      return true; // Assume exists on error to prevent registration
    }
  };



  return (
    <>
      <style jsx>{`
        .rasi-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0;
          width: 100%;
          max-width: 400px;
          aspect-ratio: 1;
          margin: 20px auto;
          border: 2px solid var(--input-border);
          box-sizing: border-box;
        }
        .rasi-grid > div, .rasi-cell {
          border: 1px solid var(--input-border);
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
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
        .rasi-grid > div:not(.center-box) {
          border: 1px solid var(--input-border) !important;
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
          
          .rasi-grid {
            max-width: 90% !important;
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
        }
        
        @media (max-width: 480px) {
          h1 {
            font-size: 22px !important;
          }
        }
      `}</style>
      <div style={styles.container}>
      <h1 style={{ fontWeight: 'bold' }}>{t("Register Form", language)}</h1>
      <br/>
      <Navigation current={8} />
      <h1>{t("Step 8 - Preview & Submit", language)}</h1>

      <LanguageToggle language={language} toggleLanguage={toggleLanguage} />

      {language === "ta" && (
        <div style={{ position: "fixed", top: "100px", right: "20px", zIndex: 50 }}>
          <TamilPopup onClose={() => {}} duration={3000} position="relative" />
        </div>
      )}

      <br/>
      <div style={{ textAlign: "left", maxWidth: "794px", width: "100%", margin: "0 auto" }}>
        {Object.keys(stepGroups).map((step) => {
          const fields = stepGroups[step];
          if (fields === "chart") {
            return (
              <div key={step} style={{ marginBottom: 20 }}>
                <h2
                  style={{ borderBottom: "1px solid #ccc", paddingBottom: 5 }}
                >
                  {step}
                </h2>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "20px",
                  }}
                >
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
                    <div>
                      <h3 style={{ textAlign: "center", marginBottom: "10px" }}>{t("Rasi Chart", language)}</h3>
                      <div className="rasi-grid">
                        {renderBox(1)}
                        {renderBox(2)}
                        {renderBox(3)}
                        {renderBox(4)}
                        {renderBox(12)}
                        <div className="center-box">ராசி</div>
                        {renderBox(5)}
                        {renderBox(11)}
                        {renderBox(6)}
                        {renderBox(10)}
                        {renderBox(9)}
                        {renderBox(8)}
                        {renderBox(7)}
                      </div>
                    </div>
                    <div>
                      <h3 style={{ textAlign: "center", marginBottom: "10px" }}>{t("Amsam Chart", language)}</h3>
                      <div className="rasi-grid">
                        {renderAmsamBox(1)}
                        {renderAmsamBox(2)}
                        {renderAmsamBox(3)}
                        {renderAmsamBox(4)}
                        {renderAmsamBox(12)}
                        <div className="center-box">அம்சம்</div>
                        {renderAmsamBox(5)}
                        {renderAmsamBox(11)}
                        {renderAmsamBox(6)}
                        {renderAmsamBox(10)}
                        {renderAmsamBox(9)}
                        {renderAmsamBox(8)}
                        {renderAmsamBox(7)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          }
          const mid = Math.ceil(fields.length / 2);
          const leftFields = fields.slice(0, mid);
          const rightFields = fields.slice(mid);
          return (
            <div key={step} style={{ marginBottom: 20 }}>
              <h2 style={{ borderBottom: "1px solid #ccc", paddingBottom: 5 }}>
                {t(step, language)}
              </h2>
              <div style={{ display: "flex", flexWrap: "wrap" }}>
                <div style={{ flex: "1 1 50%", minWidth: "250px" }}>
                  {leftFields.map((k) => (
                    <div key={k} style={{ padding: 6 }}>
                      <strong>{t(k, language)}:</strong>{" "}
                      {k === "photos" && form[k] && Array.isArray(form[k]) ? (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "5px" }}>
                          {form[k].map((photo, idx) => (
                            <img
                              key={idx}
                              src={
                                typeof photo === "string"
                                  ? photo
                                  : photo?.base64
                                  ? photo.base64
                                  : (photo instanceof File || photo instanceof Blob)
                                  ? URL.createObjectURL(photo)
                                  : ""
                              }
                              alt={`Photo ${idx + 1}`}
                              style={{
                                maxWidth: "100px",
                                maxHeight: "100px",
                                borderRadius: "4px",
                                border: "1px solid var(--input-border)",
                              }}
                            />
                          ))}
                        </div>
                      ) : k === "photo" && form[k] ? (
                        <img
                          src={
                            typeof form[k] === "string"
                              ? form[k]
                              : URL.createObjectURL(form[k])
                          }
                          alt="Photo"
                          style={{
                            maxWidth: "100px",
                            maxHeight: "100px",
                            borderRadius: "4px",
                            border: "1px solid var(--input-border)",
                          }}
                        />
                      ) : (
                        t(String(form[k] || ""), language)
                      )}
                    </div>
                  ))}
                </div>
                <div style={{ flex: "1 1 50%", minWidth: "250px" }}>
                  {rightFields.map((k) => (
                    <div key={k} style={{ padding: 6 }}>
                      <strong>{t(displayNames[k] || k, language)}:</strong>{" "}
                      {k === "photos" && form[k] && Array.isArray(form[k]) ? (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "5px" }}>
                          {form[k].map((photo, idx) => (
                            <img
                              key={idx}
                              src={
                                typeof photo === "string"
                                  ? photo
                                  : photo?.base64
                                  ? photo.base64
                                  : (photo instanceof File || photo instanceof Blob)
                                  ? URL.createObjectURL(photo)
                                  : ""
                              }
                              alt={`Photo ${idx + 1}`}
                              style={{
                                maxWidth: "100px",
                                maxHeight: "100px",
                                borderRadius: "4px",
                                border: "1px solid var(--input-border)",
                              }}
                            />
                          ))}
                        </div>
                      ) : k === "photo" && form[k] ? (
                        <img
                          src={
                            typeof form[k] === "string"
                              ? form[k]
                              : URL.createObjectURL(form[k])
                          }
                          alt="Photo"
                          style={{
                            maxWidth: "100px",
                            maxHeight: "100px",
                            borderRadius: "4px",
                            border: "1px solid var(--input-border)",
                          }}
                        />
                      ) : (
                        t(String(form[k] || ""), language)
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {registrationError && (
        <div style={{ color: "red", marginTop: 20, marginBottom: 10, textAlign: "left", fontSize: "14px", padding: "15px", backgroundColor: "#ffebee", border: "1px solid #f44336", borderRadius: 4, whiteSpace: "pre-line", maxWidth: "800px", margin: "20px auto 10px auto" }}>
          {registrationError}
        </div>
      )}

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
          {t("Please verify your email address before registering.", language)}
        </p>

        {userExistsError && (
          <div style={{ color: "red", marginBottom: 10, fontSize: "20px" }}>
            {userExistsError}
          </div>
        )}
        {otpMessage && (
          <div style={{ color: "green", marginBottom: 10, fontSize: "20px" }}>
            {otpMessage}
          </div>
        )}
        <div style={{ marginBottom: 10, textAlign: "center" }}>
          <label style={{ display: "block", marginBottom: 5 }}>{t("OTP Check", language)}:</label>
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
                  ? "Sending..."
                  : resendCooldown > 0
                  ? `Resend OTP (${resendCooldown}s)`
                  : "Resend OTP"}
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
              placeholder="Enter OTP"
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
          <div style={{ color: "green", fontWeight: "bold" }}>
            ✓ Email verified successfully
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
          Email verification is required before registration
        </div>
      )}

      <div style={styles.formContainer} className="button-container">
        <div style={styles.leftColumn}>
          <button
            style={styles.previousButton1}
            onClick={() => router.push("/register/7")}
          >
            {t("Previous", language)}
          </button>
        </div>
        <div style={styles.rightColumn}>
          <button style={styles.button1} onClick={handleSubmit}>
            {t("Register", language)}
          </button>
        </div>
      </div>
      <p style={{ textAlign: "center", marginTop: "10px" }}>
        {t("Already have an account?", language)}{" "}
        <a
          href="/login"
          style={{
            color: "blue",
            textDecoration: "underline",
            fontSize: "16px",
          }}
        >
          {t("Login", language)}
        </a>
      </p>
    </div>
    </>
  );
}
