"use client";

import React from "react";
import Image from "next/image";
import { API_URL } from "@/app/utils/config";
import { getPhotoUrl, getPhotoUrls } from "@/app/utils/photoUtils";

export default function UserDetailModal({
  selectedUser,
  onClose,
  t,
  // Props for image interaction
  setSelectedImage,
  setSelectedImageOwner,
  setIsPrivacyMode,
  unlockedUsers = [],
}) {
  if (!selectedUser) return null;

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

  // Prepare Rasi and Amsam data
  const chartData = {};
  const amsamChartData = {};

  allPlanets.forEach((planet) => {
    // Rasi
    const pos = selectedUser[planet.key];
    if (pos && pos >= 1 && pos <= 12) {
      if (!chartData[pos]) chartData[pos] = [];
      const tamilLabel = planet.label.includes("(") 
        ? planet.label.split("(")[1].replace(")", "").trim() 
        : planet.label;
      chartData[pos].push(tamilLabel);
    }
    // Amsam
    const amsamPos = selectedUser["amsam_" + planet.key];
    if (amsamPos && amsamPos >= 1 && amsamPos <= 12) {
      if (!amsamChartData[amsamPos]) amsamChartData[amsamPos] = [];
      const tamilLabel = planet.label.includes("(") 
        ? planet.label.split("(")[1].replace(")", "").trim() 
        : planet.label;
      amsamChartData[amsamPos].push(tamilLabel);
    }
  });

  const renderBox = (pos, data) => {
    const planets = data[pos] || [];
    return (
      <div className="rasi-cell" key={pos}>
        <span className="box-planets-text">
          {planets.length > 0 ? planets.join(", ") : ""}
        </span>
      </div>
    );
  };

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
    dasaRemain: "Dasa Remain",

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
    photo: "Photos",

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
      "dasaRemain",
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

  const shouldShowField = (k, user) => {
    if (k === "otherEducation") return user.educationQualification === "Others";
    if (k === "otherOccupation") return user.occupationBusiness === "Other";
    if (k === "otherEducation1") return user.educationQualification1 === "Others";
    if (k === "specialCasesDetails") return user.specialCases === "Yes";
    return true;
  };

  return (
    <div
      className="modal"
      onClick={onClose}
      style={{
        zIndex: 2500,
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0,0,0,0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backdropFilter: "blur(10px)",
      }}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#f3f4f6",
          color: "#111827",
          padding: "40px 30px",
          borderRadius: "24px",
          boxShadow: "0 25px 60px rgba(0,0,0,0.4)",
          position: "relative",
          width: "1000px",
          maxWidth: "96%",
          maxHeight: "92vh",
          overflowY: "auto",
        }}
      >
        <button className="modal-close" onClick={onClose} style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          background: "#ef4444",
          color: "white",
          border: "none",
          padding: "8px 16px",
          borderRadius: "10px",
          cursor: "pointer",
          fontWeight: "700",
          zIndex: 100,
          boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)",
        }}>
          ✕ {t("Close")}
        </button>

        {/* Identity Header */}
        <div className="identity-header">
          {(() => {
            const imageUrl = getPhotoUrl(selectedUser);
            return (
              <div className="identity-photo-container">
                <Image
                  src={imageUrl || "/default-avatar.png"}
                  alt={selectedUser.name}
                  width={140}
                  height={140}
                  className="identity-photo"
                  style={{
                    filter:
                      selectedUser.photoPassword &&
                      selectedUser.photoPassword.length > 0 &&
                      selectedUser.email?.toLowerCase() !==
                        sessionStorage.getItem("userEmail")?.toLowerCase() &&
                      !unlockedUsers.includes(selectedUser.email)
                        ? "blur(15px)"
                        : "none",
                  }}
                  onClick={() => {
                    if (imageUrl) {
                      setSelectedImage(imageUrl);
                      setSelectedImageOwner(selectedUser);
                      setIsPrivacyMode(false);
                    }
                  }}
                />
              </div>
            );
          })()}

          <div className="identity-details">
            <h2 className="identity-name">{selectedUser.name}</h2>
            <p className="identity-id">ID: {selectedUser.user_id}</p>
            <div className="identity-badges">
              {selectedUser.yourTemple && <span className="p-badge badge-red">{selectedUser.yourTemple}</span>}
              {selectedUser.yourDivision && <span className="p-badge badge-teal">{selectedUser.yourDivision}</span>}
            </div>
          </div>
        </div>

        <div className="preview-container">
          {Object.entries(stepGroups).map(([stepName, fields]) => {
            if (fields === "chart") {
              return (
                <div key={stepName} className="preview-step-container">
                  <h3 className="preview-step-title">{t(stepName)}</h3>
                  <div className="charts-grid-wrapper">
                    <div>
                      <h4 className="chart-label">{t("Rasi Chart")}</h4>
                      <div className="rasi-grid">
                        {renderBox(1, chartData)}
                        {renderBox(2, chartData)}
                        {renderBox(3, chartData)}
                        {renderBox(4, chartData)}
                        {renderBox(12, chartData)}
                        <div className="center-box">ராசி</div>
                        {renderBox(5, chartData)}
                        {renderBox(11, chartData)}
                        {renderBox(6, chartData)}
                        {renderBox(10, chartData)}
                        {renderBox(9, chartData)}
                        {renderBox(8, chartData)}
                        {renderBox(7, chartData)}
                      </div>
                    </div>
                    <div>
                      <h4 className="chart-label">{t("Amsam Chart")}</h4>
                      <div className="rasi-grid">
                        {renderBox(1, amsamChartData)}
                        {renderBox(2, amsamChartData)}
                        {renderBox(3, amsamChartData)}
                        {renderBox(4, amsamChartData)}
                        {renderBox(12, amsamChartData)}
                        <div className="center-box">அம்சம்</div>
                        {renderBox(5, amsamChartData)}
                        {renderBox(11, amsamChartData)}
                        {renderBox(6, amsamChartData)}
                        {renderBox(10, amsamChartData)}
                        {renderBox(9, amsamChartData)}
                        {renderBox(8, amsamChartData)}
                        {renderBox(7, amsamChartData)}
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
              <div key={stepName} className="preview-step-container">
                <h3 className="preview-step-title">{t(stepName)}</h3>
                <div className="preview-columns-grid">
                  <div className="preview-col">
                    {leftFields.filter(k => shouldShowField(k, selectedUser)).map((k) => (
                      <div key={k} className="preview-row">
                        <span className="preview-label">{t(displayNames[k] || k)}:</span>
                        <div className="preview-value">
                          {k === "dasaRemain" ? (
                            `${selectedUser.dasaRemainYears || 0} Y, ${selectedUser.dasaRemainMonths || 0} M, ${selectedUser.dasaRemainDays || 0} D`
                          ) : (
                            String(selectedUser[k] || "")
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="preview-col">
                    {rightFields.filter(k => shouldShowField(k, selectedUser)).map((k) => (
                      <div key={k} className="preview-row">
                        <span className="preview-label">{t(displayNames[k] || k)}:</span>
                        <div className="preview-value">
                          {k === "dasaRemain" ? (
                            `${selectedUser.dasaRemainYears || 0} Y, ${selectedUser.dasaRemainMonths || 0} M, ${selectedUser.dasaRemainDays || 0} D`
                          ) : (
                            String(selectedUser[k] || "")
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Visual Gallery - At last, 50/50 layout */}
          <div className="preview-step-container">
            <h3 className="preview-step-title">📸 {t("Visual Gallery")}</h3>
            <div className="modern-gallery">
              {getPhotoUrls(selectedUser).map((url, i) => (
                <div key={i} className="gallery-photo-wrapper">
                  <Image 
                    src={url} 
                    layout="fill"
                    alt={`Photo ${i + 1}`} 
                    className="gallery-photo"
                    style={{
                      filter: selectedUser.photoPassword && selectedUser.photoPassword.length > 0 && selectedUser.email?.toLowerCase() !== sessionStorage.getItem("userEmail")?.toLowerCase() && !unlockedUsers.includes(selectedUser.email) ? "blur(18px)" : "none"
                    }}
                    onClick={() => {
                      setSelectedImage(url);
                      setSelectedImageOwner(selectedUser);
                    }}
                  />
                </div>
              ))}
              {getPhotoUrls(selectedUser).length === 0 && (
                <p style={{ gridColumn: "1 / -1", textAlign: "center", color: "#9ca3af", fontStyle: "italic" }}>
                  {t("No photos available.")}
                </p>
              )}
            </div>
          </div>

          {selectedUser.pdfPath && (
            <div className="preview-step-container pdf-section">
                <h3 className="preview-step-title">📄 {t("Horoscope Document")}</h3>
                <a
                  href={`${API_URL}/${selectedUser.pdfPath.replace(/\\/g, "/")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pdf-btn"
                >
                  View Full PDF
                </a>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .p-badge {
          padding: 6px 16px;
          border-radius: 50px;
          font-size: 14px;
          font-weight: 400;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .badge-red { background: #fee2e2; color: #ef4444; border: 1px solid #fecaca; }
        .badge-teal { background: #ccfbf1; color: #0d9488; border: 1px solid #99f6e4; }

        .identity-header {
          display: flex;
          align-items: center;
          gap: 40px;
          margin-bottom: 50px;
          padding: 0 10px;
        }
        .identity-photo-container {
          flex-shrink: 0;
        }
        .identity-photo {
          border-radius: 20px !important;
          object-fit: cover !important;
          border: 4px solid white !important;
          box-shadow: 0 12px 40px rgba(0,0,0,0.12) !important;
          cursor: pointer;
        }
        .identity-details {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .identity-name {
          font-size: 36px;
          font-weight: 500 !important;
          margin: 0;
          color: #111827;
        }
        .identity-id {
          opacity: 0.6;
          font-size: 18px;
          font-weight: 500 !important;
          margin: 0;
          color: #374151;
        }
        .identity-badges {
          display: flex;
          gap: 12px;
          margin-top: 5px;
        }

        .preview-container {
          display: flex;
          flex-direction: column;
          gap: 10px;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif, "Nirmala UI", "Hind Madurai";
        }
        .preview-step-container {
          background: white;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 25px;
          border: 1px solid #d1d5db;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        .preview-step-title {
          font-size: 18px;
          font-weight: 500;
          color: #059669;
          border-bottom: 2px solid #10b981;
          padding-bottom: 8px;
          margin-bottom: 20px;
        }
        .preview-columns-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
        }
        .preview-col {
          display: flex;
          flex-direction: column;
        }
        .preview-row {
          display: flex;
          flex-direction: column;
          margin-bottom: 12px;
          border-bottom: 1px solid #f3f4f6;
          padding-bottom: 8px;
        }
        .preview-label {
          font-size: 13px;
          color: #9ca3af;
          text-transform: uppercase;
          margin-bottom: 4px;
          font-weight: 500;
        }
        .preview-value {
          font-size: 15px;
          color: #1f2937;
          font-weight: 400;
        }

        .charts-grid-wrapper {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
        }
        .chart-label {
          text-align: center;
          margin-bottom: 15px;
          font-weight: 400;
          color: #374151;
        }
        .rasi-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          grid-template-rows: repeat(4, 1fr);
          gap: 0;
          width: 100%;
          max-width: 500px; /* Increased to fill container better */
          aspect-ratio: 1 / 1;
          margin: 0 auto;
          border: 2px solid #d1d5db;
          box-sizing: border-box;
          background: #fff;
        }
        .rasi-grid :global(.rasi-cell) {
          border: 1px solid #d1d5db;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fff;
          width: 100%;
          height: 100%;
          position: relative;
          padding: 4px; /* Reduced padding to let content fit better */
          box-sizing: border-box;
          min-width: 0; /* Ensures cells take equal space regardless of content */
          min-height: 0;
          overflow: hidden; /* Prevents overflow from breaking grid equality */
        }
        .rasi-grid :global(.box-planets-text) {
          font-size: 11px; /* Slightly smaller base for better fit */
          font-weight: 400;
          color: #111827;
          text-align: center;
          line-height: 1.2;
          display: block;
          width: 100%;
          word-break: break-word; /* Allow wrapping within the equal cells */
        }
        .rasi-grid :global(.center-box) {
          grid-column: 2 / span 2;
          grid-row: 2 / span 2;
          font-weight: 400;
          font-size: 20px;
          background: #f9fafb !important;
          color: #111827;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #d1d5db;
          box-sizing: border-box;
          text-align: center;
          font-family: inherit;
        }

        .modern-gallery {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-top: 10px;
        }
        .gallery-photo-wrapper {
          position: relative;
          aspect-ratio: 1;
          border-radius: 12px;
          overflow: hidden;
          background: #f3f4f6;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          cursor: pointer;
        }
        .gallery-photo {
          object-fit: cover;
          transition: transform 0.3s ease;
        }
        .gallery-photo:hover {
          transform: scale(1.05);
        }

        .pdf-section {
          margin-top: 20px;
        }
        .pdf-btn {
          display: inline-block;
          background: #2563eb;
          color: white;
          padding: 10px 24px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 700;
          box-shadow: 0 4px 10px rgba(37, 99, 235, 0.2);
        }

        @media (max-width: 900px) {
          .identity-header {
            flex-direction: column;
            gap: 25px;
            text-align: center;
            margin-bottom: 40px;
          }
          .identity-details {
            align-items: center;
          }
          .identity-badges {
            flex-direction: column;
            align-items: center;
            gap: 8px;
          }
          .identity-name {
            font-size: 28px;
          }
          .identity-photo {
            width: 160px !important;
            height: 160px !important;
            border-radius: 50% !important; /* Circular for mobile as per reference */
          }
          
          .preview-columns-grid { grid-template-columns: 1fr; gap: 20px; }
          .charts-grid-wrapper { 
            grid-template-columns: 1fr; 
            gap: 40px;
            padding: 0 15px; /* Add side margins for charts */
          }
          .rasi-grid {
            width: 100% !important;
            max-width: 450px !important; /* Larger on mobile to fit screen elegantly */
          }
          .rasi-grid :global(.box-planets-text) {
            font-size: 11px !important;
          }
          .rasi-grid :global(.center-box) {
            font-size: 16px !important;
            padding: 4px !important;
          }
          .modern-gallery { grid-template-columns: 1fr; }
          
          .preview-step-container {
            padding: 15px;
            margin-bottom: 20px;
          }
        }
      `}</style>
    </div>
  );
}
