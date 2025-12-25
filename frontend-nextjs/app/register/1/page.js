"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { styles, loadFormData, saveFormData, defaultFormData } from "../styles";
import Navigation from "../components/Navigation";
import TamilInput from "@/app/components/TamilInput";
import TamilPopup from "@/app/components/TamilPopup";
import LanguageToggle from "@/app/components/LanguageToggle";
import { t } from "@/app/utils/translations";
import { useLanguage } from "@/app/hooks/useLanguage";
import { API_URL } from "@/app/utils/config";

export default function Step1() {
  const router = useRouter();
  const [form, setForm] = useState(defaultFormData);
  const [error, setError] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const { language, toggleLanguage } = useLanguage();
  const [showLoginWarning, setShowLoginWarning] = useState(false);
  const [loggedInEmail, setLoggedInEmail] = useState("");

  // Load form data on client side only to prevent hydration errors
  // Load form data on client side only to prevent hydration errors
  useEffect(() => {
    loadFormData().then(data => {
      setForm(data);
      setIsLoaded(true);
    });

    // Check if already logged in
    const checkAuth = async () => {
      try {
        const res = await fetch(`${API_URL}/check-auth`, {
          method: "GET",
          credentials: "include", // Important to send cookies
        });
        const data = await res.json();
        if (data.success && data.user) {
          setLoggedInEmail(data.user.email);
          setShowLoginWarning(true);
        }
      } catch (err) {
        console.error("Auth check failed", err);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (isLoaded) {
      saveFormData(form);
    }
  }, [form, isLoaded]);

  const getDivisionOptions = (temple) => {
    if (temple === "Ilayatrangudi") {
      return [
        "Kazhani Vaasarkkudaiyar",
        "Kinginikkurudaiyar",
        "Okkurudaiyar",
        "Pattanasamiyar",
        "Perusenthrudaiyar",
        "Sirusenthrudaiyar",
        "Perumaruthurudaiyar",
      ];
    } else if (temple === "Mathur") {
      return [
        "Arumbakkur",
        "Kannur",
        "Karuppur",
        "Kulathur",
        "Mannur",
        "Manalur",
        "Uraiyur",
      ];
    } else if (temple === "Vairavan Kovil") {
      return [
        "Kazhani Vaasarkkudaiyar",
        "Maruthenthirapuram",
        "Periya vahuppu",
        "Pilliyar vahuppu",
        "Theyyanar vahuppu",
      ];
    }
    return ["PIRIVU", "NO PIRIVU"];
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => {
      const updatedForm = { ...p, [name]: value };
      if (name === "yourTemple") {
        if (
          [
            "Nemam Kovil",
            "Iluppakudi",
            "Iraniyur",
            "Pillaiyarpatti",
            "Soorakudi",
            "Velangudi",
          ].includes(value)
        ) {
          updatedForm.yourDivision = "NO PIRIVU";
        } else {
          updatedForm.yourDivision = "";
        }
      }
      return updatedForm;
    });
  };

  const nativePlaceOptions = [
    "A. Muthu Pattinam – 630101",
    "A. Siruvayal – 630305",
    "Alavakkottai – 630564",
    "Amarapathiputhur – 630301",
    "Arimalam – 622201",
    "Ariyakkudi – 630202",
    "Athangudi – 630101",
    "Athikadu Thekkur – 630201",
    "Avanipatti – 630205",
    "Chockalingam Pudur – 630101",
    "Chockanatha Puram – 630313",
    "Devakottai – 630302",
    "Kadiapatty – 622505",
    "Kalaiyar Mangalam – 630557",
    "Kallal – 630300",
    "Kalluppatti – 630306",
    "Kanadukathan – 630103",
    "Kandanur – 630104",
    "Kandaramanickam – 630204",
    "Kandavarayan Patti – 630203",
    "Karaikudi – 630001",
    "Kilapungudi – 630552",
    "Kilasaval Patti – 630205",
    "Kollangudi Alagapuri – 630556",
    "Konapet – 622503",
    "Koppanapatti – 622401",
    "Kothamangalam – 630105",
    "Kottaiyur – 630106",
    "Kottaiyur Alagapuri – 630106",
    "Kulipirai – 622402",
    "Kuruvikondan Patti – 622409",
    "Madagupatti – 630553",
    "Mahipalan Patti – 630217",
    "Managiri – 630307",
    "Mangalam – 630554",
    "Melasivapuri – 622403",
    "Mudalai Patti – 622409",
    "Nachandu Patti – 622404",
    "Nachiapuram – 630207",
    "Nataraja Puram – 630550",
    "Nattarasan Kottai – 630556",
    "Nemathan Patti – 630111",
    "Nerkuppai – 622405",
    "O. Siruvayal – 630208",
    "Okkur – 630557",
    "P. Alagapuri – 630205",
    "P. Karungulam – 630204",
    "Paganeri – 630558",
    "Palavangudi – 630208",
    "Pallathur – 630107",
    "Panagudi – 630555",
    "Panaya Patti – 622406",
    "Pattamangalam – 630310",
    "Pillaiyarpatti – 630207",
    "Pudu Patti – 622408",
    "Puduvayal – 630108",
    "Pulangkurichi – 622413",
    "Ramachandra Puram – 622505",
    "Rangiem – 622409",
    "Rayavaram – 622506",
    "Sakkandhi – 630562",
    "Sembanur – 630313",
    "Sevvur – 622417",
    "Shanmuganatha Puram – 630314",
    "Sholapuram – 630557",
    "Siravayal – 630214",
    "Sirukudal Patti – 630215",
    "Thanichavoorani – 630314",
    "Thenipatti – 630211",
    "Ulagam Patti – 622410",
    "V. Lakshimipuram – 622412",
    "Valaya Patti – 622411",
    "Vegu Patti – 622407",
    "Venthan Patti – 622419",
    "Vetriyur – 630321",
    "Virachilai – 622412",
    "Viramathi – 630212",
  ];
  const validate = () => {
    if (!form.name.trim()) return "Name is required OR Enter NA for unknown fields";
    if (!form.gender) return "Gender is required OR Enter NA for unknown fields";
    if (!form.password.trim()) return "Create Password is required OR Enter NA for unknown fields";
    
    // Count letters, numbers, and special characters
    const letters = (form.password.match(/[a-zA-Z]/g) || []).length;
    const numbers = (form.password.match(/[0-9]/g) || []).length;
    const specialChars = (form.password.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g) || []).length;
    
    if (letters < 5) 
      return "Password must contain at least 5 letters";
    if (numbers < 2) 
      return "Password must contain at least 2 numbers";
    if (specialChars < 1) 
      return "Password must contain at least 1 special character";
    
    if (!form.confirmPassword.trim()) return "Confirm Password is required OR Enter NA for unknown fields";
    if (form.password !== form.confirmPassword) return "Passwords must match";
    if (!form.maritalStatus) return "Marital Status is required OR Enter NA for unknown fields";
    if (!form.fatherName.trim()) return "Father Name is required OR Enter NA for unknown fields";
    if (!form.fatherOccupation.trim()) return "Father Occupation is required OR Enter NA for unknown fields";
    if (!form.motherName.trim()) return "Mother Name is required OR Enter NA for unknown fields";
    if (!form.motherOccupation.trim()) return "Mother Occupation is required OR Enter NA for unknown fields";
    if (form.brothers === "") return "Number of Brothers is required OR Enter 0 for unknown fields";
    if (form.sisters === "") return "Number of Sisters is required OR Enter 0 for unknown fields";
    if (!form.yourTemple) return "Your Temple is required OR Enter NA for unknown fields";
    if (!form.yourDivision.trim()) return "Your Division is required OR Enter NA for unknown fields";
    if (!form.knownLanguages.trim()) return "Known Languages is required OR Enter NA for unknown fields";
    if (!form.nativePlace.trim()) return "Native Place is required OR Enter NA for unknown fields";
    if (!form.nativePlaceHouseName.trim())
      return "Native Place House Name is required OR Enter NA for unknown fields";
    if (!form.presentResidence.trim()) return "Present Residence is required OR Enter NA for unknown fields";
    if (!form.pincode.trim()) return "Pincode is required OR Enter NA for unknown fields";
    if (form.pincode !== "NA" && !/^\d{6}$/.test(form.pincode))
      return "Pincode must be a 6-digit number";
    if (!form.profileCreatedBy) return "Profile Created By is required OR Enter NA for unknown fields";
    return "";
  };
  const next = () => {
    const v = validate();
    if (v) {
      setError(v);
      setTimeout(() => setError(""), 4000);
      return;
    }
    router.push("/register/2");
  };
  return (
    <>
      <style jsx>{`
        @media (max-width: 768px) {
          .form-container {
            flex-direction: column !important;
            gap: 5px !important;
          }
          
          .left-column, .right-column {
            min-width: 100% !important;
            margin: 0 !important;
          }
          
          .button-container {
            flex-direction: column !important;
            gap: 10px !important;
          }
          .field-input {
            max-width:300px !important;
            width: 300px !important;
          }
          .button-container button {
            width: 90% !important;
            margin: 10px auto !important;
            max-width: 400px;
          }
        }
        
        @media (max-width: 480px) {
          h1 {
            font-size: 22px !important;
          }
          
          .referral-heading {
            font-size: 14px !important;
          }
        }
      `}</style>
      <div style={styles.container}>
      <LanguageToggle language={language} toggleLanguage={toggleLanguage} />

      {language === "ta" && (
        <div style={{ position: "fixed", top: "100px", right: "20px", zIndex: 50 }}>
          <TamilPopup onClose={() => {}} duration={3000} position="relative" />
        </div>
      )}
      
      {showLoginWarning && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: "var(--card-bg)",
            padding: "20px",
            borderRadius: "8px",
            maxWidth: "400px",
            width: "90%",
            textAlign: "center",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            color: "var(--card-text)"
          }}>
            <h3 style={{ marginBottom: "15px" }}>{t("Already Logged In", language)}</h3>
            <p style={{ marginBottom: "20px" }}>
              {t("You are already logged in as", language)} <strong>{loggedInEmail}</strong>. 
              {t("Please logout to register a new account.", language)}
            </p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button 
                onClick={() => router.push("/dashboard")}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#4CAF50",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                {t("Go to Dashboard", language)}
              </button>
            </div>
          </div>
        </div>
      )}


      <h1 style={{ fontWeight: 'bold' }}>{t("Register Form", language)}</h1>
      <br/>
      <Navigation current={1} />
      
      <h1>{t("Step 1 - Basic Details", language)}</h1>
      <br/>
      <div style={styles.formContainer} className="form-container">
        <div style={styles.leftColumn} className="left-column">
          <TamilInput
            style={styles.input}
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder={t("Name", language)}
            forcedLanguage={language}
          />
          <select
            style={styles.input}
            name="gender"
            value={form.gender}
            onChange={handleChange}
          >
            <option value="">{t("Select Gender", language)}</option>
            <option value="Male">{t("Male", language)}</option>
            <option value="Female">{t("Female", language)}</option>
          </select>
          <div>
            <input
              style={styles.input}
              type="text"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder={t("Create Password", language)}
            />
            {t("Type in English only", language) && (
              <p style={{ fontSize: "12px", color: "#666", marginTop: "5px", marginLeft: "5px" }}>
                {t("Type in English only", language)}
              </p>
            )}
          </div>
          <div>
            <input
              style={styles.input}
              type="text"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder={t("Confirm Password", language)}
            />
            {t("Type in English only", language) && (
              <p style={{ fontSize: "12px", color: "#666", marginTop: "5px", marginLeft: "5px" }}>
                {t("Type in English only", language)}
              </p>
            )}
          </div>
          <select
            style={styles.input}
            name="maritalStatus"
            value={form.maritalStatus}
            onChange={handleChange}
          >
            <option value="">{t("Select Marital Status", language)}</option>
            <option value="unmarried">{t("unmarried", language)}</option>
            <option value="widow">{t("widow", language)}</option>
            <option value="divorced">{t("divorced", language)}</option>
            <option value="widower">{t("widower", language)}</option>
          </select>
          <TamilInput
            style={styles.input}
            name="fatherName"
            value={form.fatherName}
            onChange={handleChange}
            placeholder={t("Father Name", language)}
            forcedLanguage={language}
          />
          <TamilInput
            style={styles.input}
            name="fatherOccupation"
            value={form.fatherOccupation}
            onChange={handleChange}
            placeholder={t("Father Occupation / Business", language)}
            forcedLanguage={language}
          />
          <TamilInput
            style={styles.input}
            name="motherName"
            value={form.motherName}
            onChange={handleChange}
            placeholder={t("Mother Name", language)}
            forcedLanguage={language}
          />
          <TamilInput
            style={styles.input}
            name="motherOccupation"
            value={form.motherOccupation}
            onChange={handleChange}
            placeholder={t("Mother Occupation / Business", language)}
            forcedLanguage={language}
          />
          <select
            style={styles.input}
            name="brothers"
            value={form.brothers}
            onChange={handleChange}
          >
            <option value="">{t("Select Number of Brothers", language)}</option>
            {[...Array(5).keys()].map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
          <select
            style={styles.input}
            name="brothersMarried"
            value={form.brothersMarried}
            onChange={handleChange}
          >
            <option value="">{t("Select Married Number of Brothers", language)}</option>
            {[...Array(5).keys()].map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
          <select
            style={styles.input}
            name="sisters"
            value={form.sisters}
            onChange={handleChange}
          >
            <option value="">{t("Select Number of Sisters", language)}</option>
            {[...Array(5).keys()].map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
          <select
            style={styles.input}
            name="sistersMarried"
            value={form.sistersMarried}
            onChange={handleChange}
          >
            <option value="">{t("Select Married Number of Sisters", language)}</option>
            {[...Array(5).keys()].map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
          <select
            style={styles.input}
            name="yourTemple"
            value={form.yourTemple}
            onChange={handleChange}
          >
            <option value="">{t("Select Your Temple", language)}</option>
            <option value="Nemam Kovil">{t("Nemam Kovil", language)}</option>
            <option value="Ilayatrangudi">{t("Ilayatrangudi", language)}</option>
            <option value="Iluppakudi">{t("Iluppakudi", language)}</option>
            <option value="Iraniyur">{t("Iraniyur", language)}</option>
            <option value="Mathur">{t("Mathur", language)}</option>
            <option value="Pillaiyarpatti">{t("Pillaiyarpatti", language)}</option>
            <option value="Soorakudi">{t("Soorakudi", language)}</option>
            <option value="Vairavan Kovil">{t("Vairavan Kovil", language)}</option>
            <option value="Velangudi">{t("Velangudi", language)}</option>
          </select>
          <select
            style={styles.input}
            name="yourDivision"
            value={form.yourDivision}
            onChange={handleChange}
            disabled={form.yourDivision === "NO PIRIVU"}
          >
            <option value="">{t("Select Your Division", language)}</option>
            {getDivisionOptions(form.yourTemple).map((option, index) => (
              <option key={index} value={option}>
                {t(option, language)}
              </option>
            ))}
          </select>
          <TamilInput
            style={styles.input}
            name="knownLanguages"
            value={form.knownLanguages}
            onChange={handleChange}
            placeholder={t("Known Languages", language)}
            forcedLanguage={language}
          />

        </div>
        <div style={styles.rightColumn} className="right-column">

          <select
            style={styles.input}
            name="nativePlace"
            value={form.nativePlace}
            onChange={handleChange}
          >
            <option value="">{t("Select Native Place", language)}</option>
            {nativePlaceOptions.map((place, index) => (
              <option key={index} value={place}>
                {t(place, language)}
              </option>
            ))}
          </select>
          <TamilInput
            style={styles.input}
            name="nativePlaceHouseName"
            value={form.nativePlaceHouseName}
            onChange={handleChange}
            placeholder={t("Native Place House Name", language)}
            forcedLanguage={language}
          />
          <TamilInput
            style={styles.input}
            name="presentResidence"
            value={form.presentResidence}
            onChange={handleChange}
            placeholder={t("Present Residence", language)}
            forcedLanguage={language}
          />
          <input
            style={styles.input}
            name="pincode"
            value={form.pincode}
            onChange={handleChange}
            placeholder={t("Present Pincode", language)}
          />
          <select
            style={styles.input}
            name="profileCreatedBy"
            value={form.profileCreatedBy}
            onChange={handleChange}
          >
            <option value="">{t("Select Profile Created By", language)}</option>
            <option value="Self">{t("Self", language)}</option>
            <option value="Parents">{t("Parents", language)}</option>
            <option value="Brother">{t("Brother", language)}</option>
            <option value="Sister">{t("Sister", language)}</option>
            <option value="Friend">{t("Friend", language)}</option>
            <option value="Brother in Law">{t("Brother in Law", language)}</option>
            <option value="Sister in Law">{t("Sister in Law", language)}</option>
            <option value="Uncle">{t("Uncle", language)}</option>
            <option value="Mama">{t("Mama", language)}</option>
            <option value="Athtai">{t("Athtai", language)}</option>
            <option value="Chithi">{t("Chithi", language)}</option>
            <option value="Chithtappa">{t("Chithtappa", language)}</option>
            <option value="Periyamma">{t("Periyamma", language)}</option>
            <option value="Periyappa">{t("Periyappa", language)}</option>
          </select>
          <TamilInput
            style={styles.input}
            name="referredBy"
            value={form.referredBy}
            onChange={handleChange}
            placeholder={t("Referred By", language)}
            forcedLanguage={language}
          />
          <TamilInput
            style={styles.input}
            name="reference"
            value={form.reference}
            onChange={handleChange}
            placeholder={t("Reference – NMS Group/Branch No.", language)}
            forcedLanguage={language}
          />
          <h5 style={styles.referralHeading}>{t("Referral Details 1", language)}</h5>
          <TamilInput
            style={styles.input}
            name="referralDetails1Name"
            value={form.referralDetails1Name}
            onChange={handleChange}
            placeholder={t("Referral Name", language)}
            forcedLanguage={language}
          />
          <input
            style={styles.input}
            name="referralDetails1Phone"
            value={form.referralDetails1Phone}
            onChange={handleChange}
            placeholder={t("Referral Phone", language)}
          />
          <TamilInput
            style={styles.input}
            name="referralDetails1Address"
            value={form.referralDetails1Address}
            onChange={handleChange}
            placeholder={t("Referral Address", language)}
            forcedLanguage={language}
          />
          <h4 style={styles.referralHeading2}>{t("Referral Details 2", language)}</h4>
          <TamilInput
            style={styles.input}
            name="referralDetails2Name"
            value={form.referralDetails2Name}
            onChange={handleChange}
            placeholder={t("Referral Name", language)}
            forcedLanguage={language}
          />
          <input
            style={styles.input}
            name="referralDetails2Phone"
            value={form.referralDetails2Phone}
            onChange={handleChange}
            placeholder={t("Referral Phone", language)}
          />
          <TamilInput
            style={styles.input}
            name="referralDetails2Address"
            value={form.referralDetails2Address}
            onChange={handleChange}
            placeholder={t("Referral Address", language)}
            forcedLanguage={language}
          />
        </div>
      </div>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div style={styles.formContainer} className="button-container">
        <div style={styles.leftColumn}></div>
        <div style={styles.rightColumn}>
          <button style={styles.button1} onClick={next}>
            {t("Next", language)}
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
