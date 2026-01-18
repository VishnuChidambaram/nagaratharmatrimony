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
import Image from "next/image";

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
    // Step 1
    name: "Name",
    gender: "Gender",
    password: "Password",
    confirmPassword: "Confirm Password",
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
    specialCases: "Special Cases",
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
    photo: "Photo",

    // Step 7
    educationQualification1: "Partner Education",
    otherEducation1: "Other Education",
    educationDetails1: "Partner Education Details",
    complexion1: "Partner Complexion",
    personalPreference1: "Personal Preference",
    willingnessToWork1: "Willingness to Work After Marriage",
    fromAge: "From Age",
    toAge: "To Age",
    fromHeight: "From Height",
    toHeight: "To Height",

    // Other legacy or specific ones
    affliction: "Dhosam",
    periodType: "DisaiType",
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

  const missstepGroups = {
    "Step 1 - Basic Details": [
      "name",
      "gender",
      "password",
      "confirmPassword",
      "maritalStatus",
      "fatherName",
      "yourTemple",
      "presentResidence",
      "pincode",
      "profileCreatedBy",
    ],
    "Step 2 - Education & Occupation": [
      "educationQualification",
      "occupationBusiness",
      "workingPlace",
      "workDetails",
      "educationDetails",
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
    // "Step 5 - Full Horoscope Chart": "chart", // Optional
    "Step 6 - Contact Details": [
      "fullStreetAddress",
      "city",
      "state",
      "district",
      "country",
      "postalCode",
      "phone",
      "whatsAppNo",
      "email",
      // "photos", // Optional
    ],
    "Step 7 - Partner Preference": [
      "educationQualification1",
      "educationDetails1",
      "complexion1",
      "personalPreference1",
      "willingnessToWork1",
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
      console.log("Registration response:", data);
      if (data.success) {
        await clearFormData();
        setForm(defaultFormData);
        window.dispatchEvent(new CustomEvent('show-notification', { 
          detail: { message: 'Registration Successful! Please Login.', type: 'success' } 
        }));
        
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        console.error("Registration failed:", data);
        const errorMsg = data.errors && Array.isArray(data.errors) && data.errors.length > 0
          ? data.errors.join("\n")
          : data.message || "Registration failed";
        
        setRegistrationError(errorMsg);
      }
    } catch (error) {
      console.error("Registration exception:", error);
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
        errorMessage += `${stepName}:\n${fields.map(f => displayNames[f] || f).join(", ")}\n\n`;
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

    // Call Backend Validation before sending OTP
    try {
        const validationRes = await fetch(`${API_URL}/validate-registration`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(form), // Send current form data
        });
        const validationData = await validationRes.json();

        if (!validationData.success) {
            // Validation failed
            if (validationData.errors && Array.isArray(validationData.errors) && validationData.errors.length > 0) {
                setRegistrationError(validationData.errors.join("\n"));
            } else {
                setRegistrationError(validationData.message || "Registration validation failed");
            }
            setIsSendingOtp(false); // Stop here
            return; 
        }

        // If validation success, proceed to send OTP
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
    } catch (error) {
        console.error(error);
        setEmailVerificationError("Failed to validate or send OTP");
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
    } catch {
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
      
      if (!res.ok) {
        console.error("Server returned error:", res.status, res.statusText);
        const errorData = await res.json().catch(() => ({}));
        console.error("Error details:", errorData);
        setUserExistsError(`Server error: ${errorData.message || res.statusText}. You may proceed with registration.`);
        return false; // Allow registration to proceed despite server error
      }
      
      const data = await res.json();
      console.log("User exists check response:", data);
      
      if (data.exists) {
        setUserExistsError("User with this email or phone already exists");
        return true;
      } else {
        setUserExistsError("");
        return false;
      }
    } catch (error) {
      console.error("Failed to check user availability:", error);
      setUserExistsError(`Network error: ${error.message}. You may proceed with registration.`);
      return false; // Allow registration to proceed despite network error
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

        .email-verification-row {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 20px;
          margin-bottom: 5px;
          width: 100%;
          flex-wrap: wrap;
        }

        .edit-send-otp-button-register {
          width: 250px;
          padding: 6px 10px;
          margin: 10px 5px;
          border-radius: 6px;
          border: none;
          background: var(--button-bg);
          color: var(--button-text);
          font-size: 14px;
          cursor: pointer;
          min-height: 36px;
          font-weight: bold;
        }

        .preview-email-input, .preview-otp-input {
          width: 250px !important;
          padding: 6px 10px !important;
          margin: 10px 5px !important;
          border-radius: 6px !important;
          border: 1px solid var(--input-border, #ccc) !important;
          font-size: 14px !important;
          background: var(--input-bg, #fff) !important;
          color: var(--input-text, #000) !important;
          box-sizing: border-box !important;
          display: inline-block !important;
          min-height: 36px !important;
        }
        
        /* Removed tablet-specific horizontal layout for email verification */

        .preview-step-container {
          margin-bottom: 25px;
          background: var(--card-bg);
          border-radius: 8px;
          padding: 15px;
          border: 1px solid var(--input-border, #eee);
        }
        .preview-step-title {
          border-bottom: 2px solid var(--button-bg);
          padding-bottom: 8px;
          margin-bottom: 15px;
          font-size: 1.25rem;
          color: var(--card-text);
          text-align: left;
        }
        .preview-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 0;
        }
        .preview-column {
          flex: 1 1 50%;
          min-width: 300px;
        }
        .preview-field-row {
          padding: 8px 12px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 4px;
          border-bottom: 1px solid rgba(0,0,0,0.05);
        }
        .preview-field-label {
          width: 100%;
          min-width: 0;
          flex-shrink: 0;
          font-size: 15px;
          font-weight: 700;
          color: var(--button-bg);
          text-align: left;
          opacity: 0.9;
        }
        .preview-field-value {
          flex: 1;
          font-size: 15px;
          color: var(--card-text);
          word-break: break-word;
          text-align: left;
          padding-left: 0;
        }

        .preview-photos-container {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 5px;
        }

        /* Center-left alignment for Right Column in Comparison Mode */
        .right-column {
          padding-left: 60px;
        }
        .right-column .preview-field-row {
          align-items: flex-start;
        }
        .right-column .preview-field-label,
        .right-column .preview-field-value {
          text-align: left;
        }
        .right-column .preview-photos-container {
          justify-content: flex-start;
        }

        @media (max-width: 1199px) {
          .preview-field-row {
            padding: 10px 12px;
          }
          .preview-field-label {
            font-size: 14px;
          }
          .preview-field-value {
            font-size: 14px;
          }
          .preview-step-title {
            font-size: 1.1rem;
          }
          
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
        }

        @media (max-width: 600px) {
          .preview-column {
            flex: 1 1 100%;
            min-width: 0;
          }
          .preview-field-row {
            flex-direction: column;
            gap: 4px;
          }
          .preview-field-label {
            width: 100%;
            min-width: 0;
          }
          /* Reset right column specific styles for single column mobile view */
          .right-column {
            padding-left: 0;
          }
          /* Mobile specific adjustments inside the media query */
          .edit-send-otp-button-register, .preview-email-input, .preview-otp-input {
            width: 100% !important;
            max-width: 400px !important;
            margin: 5px auto !important;
            display: block !important;
          }
          
          .rasi-grid {
            max-width: 90% !important;
            font-size: 10px !important;
            margin: 20px auto !important; /* Centering with equal space */
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
      <div style={{ textAlign: "left", maxWidth: "900px", width: "100%", margin: "0 auto", padding: "0 10px" }}>
        {Object.keys(stepGroups).map((step) => {
          const fields = stepGroups[step];
          if (fields === "chart") {
            return (
              <div key={step} className="preview-step-container">
                <h2 className="preview-step-title">{t(step, language)}</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px", justifyContent: 'center' }}>
                  <div>
                    <h3 style={{ textAlign: "center", marginBottom: "15px", fontSize: "16px" }}>{t("Rasi Chart", language)}</h3>
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
                    <h3 style={{ textAlign: "center", marginBottom: "15px", fontSize: "16px" }}>{t("Amsam Chart", language)}</h3>
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
            );
          }
  const shouldShowField = (k, form) => {
    if (k === "otherEducation") return form.educationQualification === "Others";
    if (k === "otherOccupation") return form.occupationBusiness === "Other";
    if (k === "otherEducation1") return form.educationQualification1 === "Others";
    if (k === "specialCasesDetails") return form.specialCases === "Yes";
    return true;
  };

  const mid = Math.ceil(fields.length / 2);
  const leftFields = fields.slice(0, mid);
  const rightFields = fields.slice(mid);

  return (
    <div key={step} className="preview-step-container">
      <h2 className="preview-step-title">{t(step, language)}</h2>
      <div className="preview-grid">
        <div className="preview-column">
          {leftFields.filter(k => shouldShowField(k, form)).map((k) => (
            <div key={k} className="preview-field-row">
              <strong className="preview-field-label">{t(displayNames[k] || k, language)}:</strong>
              <div className="preview-field-value">
                {k === "photos" && form[k] && Array.isArray(form[k]) ? (
                  <div className="preview-photos-container">
                    {form[k].map((photo, idx) => (
                      <Image
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
                        width={100}
                        height={100}
                        style={{
                          borderRadius: "4px",
                          border: "1px solid var(--input-border)",
                          objectFit: "cover"
                        }}
                      />
                    ))}
                  </div>
                ) : k === "photo" && form[k] ? (
                  <Image
                    src={
                      typeof form[k] === "string"
                        ? form[k]
                        : URL.createObjectURL(form[k])
                    }
                    alt="Photo"
                    width={100}
                    height={100}
                    style={{
                      borderRadius: "4px",
                      border: "1px solid var(--input-border)",
                      objectFit: "cover"
                    }}
                  />
                ) : (
                  t(String(form[k] || ""), language)
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="preview-column right-column">
          {rightFields.filter(k => shouldShowField(k, form)).map((k) => (
            <div key={k} className="preview-field-row">
              <strong className="preview-field-label">{t(displayNames[k] || k, language)}:</strong>
              <div className="preview-field-value">
                {k === "photos" && form[k] && Array.isArray(form[k]) ? (
                  <div className="preview-photos-container">
                    {form[k].map((photo, idx) => (
                      <Image
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
                        width={100}
                        height={100}
                        style={{
                          borderRadius: "4px",
                          border: "1px solid var(--input-border)",
                          objectFit: "cover"
                        }}
                      />
                    ))}
                  </div>
                ) : k === "photo" && form[k] ? (
                  <Image
                    src={
                      typeof form[k] === "string"
                        ? form[k]
                        : URL.createObjectURL(form[k])
                    }
                    alt="Photo"
                    width={100}
                    height={100}
                    style={{
                      borderRadius: "4px",
                      border: "1px solid var(--input-border)",
                      objectFit: "cover"
                    }}
                  />
                ) : (
                  t(String(form[k] || ""), language)
                )}
              </div>
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
          <div className="email-verification-row">
            <TamilInput
              name="email"
              value={form.email || ""}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="preview-email-input"
              style={{
                width: '250px',
                padding: '6px 10px',
                borderRadius: '6px',
                border: '2px solid var(--input-border, #ccc)',
                background: 'var(--input-bg, #fff)',
                color: 'var(--input-text, #000)',
                fontSize: '14px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                display: 'inline-block',
                minHeight: '36px'
              }}
              placeholder={t("Enter your email", language)}
              forcedLanguage={language === "ta" ? "ta" : "en"}
            />
            {!otpSent && (
              <button
                className="edit-send-otp-button-register"
                onClick={handleSendOtp}
                disabled={!form.email || isSendingOtp}
                style={{
                  width: '250px',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  background: 'var(--button-bg, #000)',
                  color: 'var(--button-text, #fff)',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  minHeight: '36px',
                  display: 'inline-block'
                }}
              >
                {isSendingOtp ? t("Sending...", language) : t("Send OTP", language)}
              </button>
            )}
            {otpSent && !otpVerified && (
              <button
                className="edit-send-otp-button-register"
                style={{ 
                  backgroundColor: resendCooldown > 0 ? "#6c757d" : "var(--button-bg, #000)",
                  width: '250px',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  color: 'var(--button-text, #fff)',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  minHeight: '36px',
                  display: 'inline-block'
                }}
                onClick={handleSendOtp}
                disabled={resendCooldown > 0 || isSendingOtp}
              >
                {isSendingOtp
                  ? t("Sending...", language)
                  : resendCooldown > 0
                  ? `${t("Resend OTP in", language)} ${resendCooldown}s`
                  : t("Send OTP", language)}
              </button>
            )}
          </div>
        </div>

        {otpSent && !otpVerified && (
          <div className="email-verification-row">
            <TamilInput
              name="otp"
              placeholder={t("Enter OTP", language)}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="preview-otp-input"
              style={{
                width: '250px',
                padding: '6px 10px',
                borderRadius: '6px',
                border: '2px solid var(--input-border, #ccc)',
                background: 'var(--input-bg, #fff)',
                color: 'var(--input-text, #000)',
                fontSize: '14px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                display: 'inline-block',
                minHeight: '36px'
              }}
              maxLength={4}
              forcedLanguage={language === "ta" ? "ta" : "en"}
            />
            <button 
              className="edit-send-otp-button-register" 
              onClick={handleVerifyOtp}
              style={{
                width: '250px',
                padding: '6px 10px',
                borderRadius: '6px',
                border: 'none',
                background: 'var(--button-bg, #000)',
                color: 'var(--button-text, #fff)',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer',
                minHeight: '36px',
                display: 'inline-block'
              }}
            >
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
