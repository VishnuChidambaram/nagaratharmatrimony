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

export default function Step3() {
  const router = useRouter();
  const [form, setForm] = useState(defaultFormData);
  const [error, setError] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const { language, toggleLanguage } = useLanguage();
  
  // Load form data on client side only to prevent hydration errors
  useEffect(() => {
    loadFormData().then(data => {
      setForm(data);
      setIsLoaded(true);
    });
  }, []);
  
  useEffect(() => {
    if (isLoaded) {
      saveFormData(form);
    }
  }, [form, isLoaded]);
  const handle = (e) => {
    if (e.target.name === "specialCases") {
      if (e.target.value === "No") {
        setForm((p) => ({
          ...p,
          [e.target.name]: e.target.value,
          specialCasesDetails: "NA",
        }));
      } else {
        setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
      }
    } else {
      setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    }
  };
  const validate = () => {
    if (!form.height) return "Height is required OR Enter NA for unknown fields";
    if (!form.complexion) return "Complexion is required OR Enter NA for unknown fields";
    if (!form.weight) return "Weight is required OR Enter NA for unknown fields";
    if (!form.diet) return "Diet is required OR Enter NA for unknown fields";
    if (!form.specialCases) return "Special Cases is required OR Enter NA for unknown fields";
    if (!form.specialCasesDetails) return "Special Cases Details is required OR Enter NA for unknown fields";
    return "";
  };

  const next = () => {
    const v = validate();
    if (v) {
      setError(v);
      setTimeout(() => setError(""), 8000);
      return;
    }
    router.push("/register/4");
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
        }
      `}</style>
      <div style={styles.container}>
      <LanguageToggle language={language} toggleLanguage={toggleLanguage} />

      {language === "ta" && (
        <div style={{ position: "fixed", top: "100px", right: "20px", zIndex: 50 }}>
          <TamilPopup onClose={() => {}} duration={3000} position="relative" />
        </div>
      )}
      <h1 style={{ fontWeight: 'bold' }}>{t("Register Form", language)}</h1>
      <br/>
      <Navigation current={3} />
      <h1>{t("Step 3 - Physical Attributes", language)}</h1>
      <br/>
      <div style={styles.formContainer} className="form-container">
        <div style={styles.leftColumn} className="left-column">
          <select
            style={styles.input}
            name="height"
            value={form.height}
            onChange={handle}
          >
            <option value="">{t("Select Height", language)}</option>
            <option value="4'0 (121 cm)">4 ft 0 inch (121 cm)</option>
            <option value="4'1 (124 cm)">4 ft 1 inch (124 cm)</option>
            <option value="4'2 (127 cm)">4 ft 2 inch (127 cm)</option>
            <option value="4'3 (130 cm)">4 ft 3 inch (130 cm)</option>
            <option value="4'4 (132 cm)">4 ft 4 inch (132 cm)</option>
            <option value="4'5 (135 cm)">4 ft 5 inch (135 cm)</option>
            <option value="4'6 (137 cm)">4 ft 6 inch (137 cm)</option>
            <option value="4'7 (140 cm)">4 ft 7 inch (140 cm)</option>
            <option value="4'8 (142 cm)">4 ft 8 inch (142 cm)</option>
            <option value="4'9 (145 cm)">4 ft 9 inch (145 cm)</option>
            <option value="4'10 (147 cm)">4 ft 10 inch (147 cm)</option>
            <option value="4'11 (150 cm)">4 ft 11 inch (150 cm)</option>
            <option value="5'0 (152 cm)">5 ft 0 inch (152 cm)</option>
            <option value="5'1 (155 cm)">5 ft 1 inch (155 cm)</option>
            <option value="5'2 (157 cm)">5 ft 2 inch (157 cm)</option>
            <option value="5'3 (160 cm)">5 ft 3 inch (160 cm)</option>
            <option value="5'4 (162 cm)">5 ft 4 inch (162 cm)</option>
            <option value="5'5 (165 cm)">5 ft 5 inch (165 cm)</option>
            <option value="5'6 (167 cm)">5 ft 6 inch (167 cm)</option>
            <option value="5'7 (170 cm)">5 ft 7 inch (170 cm)</option>
            <option value="5'8 (172 cm)">5 ft 8 inch (172 cm)</option>
            <option value="5'9 (175 cm)">5 ft 9 inch (175 cm)</option>
            <option value="5'10 (177 cm)">5 ft 10 inch (177 cm)</option>
            <option value="5'11 (180 cm)">5 ft 11 inch (180 cm)</option>
            <option value="6'0 (182 cm)">6 ft 0 inch (182 cm)</option>
            <option value="6'1 (185 cm)">6 ft 1 inch (185 cm)</option>
            <option value="6'2 (187 cm)">6 ft 2 inch (187 cm)</option>
            <option value="6'3 (190 cm)">6 ft 3 inch (190 cm)</option>
            <option value="6'4 (192 cm)">6 ft 4 inch (192 cm)</option>
            <option value="6'5 (195 cm)">6 ft 5 inch (195 cm)</option>
            <option value="6'6 (197 cm)">6 ft 6 inch (197 cm)</option>
            <option value="6'7 (200 cm)">6 ft 7 inch (200 cm)</option>
            <option value="6'8 (202 cm)">6 ft 8 inch (202 cm)</option>
            <option value="6'9 (205 cm)">6 ft 9 inch (205 cm)</option>
            <option value="6'10 (207 cm)">6 ft 10 inch (207 cm)</option>
            <option value="6'11 (210 cm)">6 ft 11 inch (210 cm)</option>
            <option value="7'0 (213 cm)">7 ft 0 inch (213 cm)</option>
          </select>
          <select
            style={styles.input}
            name="complexion"
            value={form.complexion}
            onChange={handle}
          >
            <option value="">{t("Select Complexion", language)}</option>
            <option value="Fair red / Bright red (nalla sivappu)">
              {t("Fair red / Bright red (nalla sivappu)", language)}
            </option>
            <option value="Red (sivappu)">{t("Red (sivappu)", language)}</option>
            <option value="Wheatish (maaniram)">{t("Wheatish (maaniram)", language)}</option>
            <option value="Black (karuppu)">{t("Black (karuppu)", language)}</option>
          </select>
          <select
            style={styles.input}
            name="weight"
            value={form.weight}
            onChange={handle}
          >
            <option value="">{t("Select Weight", language)}</option>
            {Array.from({ length: 106 }, (_, i) => 25 + i).map((kg) => (
              <option key={kg} value={`${kg} kg`}>
                {kg} kg
              </option>
            ))}
          </select>
        </div>
        <div style={styles.rightColumn} className="right-column">
          <select
            style={styles.input}
            name="diet"
            value={form.diet}
            onChange={handle}
          >
            <option value="">{t("Select Diet", language)}</option>
            <option value="Vegetarian">{t("Vegetarian", language)}</option>
            <option value="Non-Vegetarian">{t("Non-Vegetarian", language)}</option>
          </select>
          <select
            style={styles.input}
            name="specialCases"
            value={form.specialCases}
            onChange={handle}
          >
            <option value="">{t("Select Special Cases (Disability)", language)}</option>
            <option value="Yes">{t("Yes", language)}</option>
            <option value="No">{t("No", language)}</option>
          </select>
          <TamilInput
            isTextArea={true}
            name="specialCasesDetails"
            value={form.specialCasesDetails}
            onChange={handle}
            placeholder={t("Special Cases Details", language)}
            forcedLanguage={language}
            style={styles.input}
          />
        </div>
      </div>
      {error && (
        <p
          style={{
            textAlign: "center",
            marginTop: "10px",
            fontSize: "14px",
            color: "red",
          }}
        >
          {error}
        </p>
      )}
      <div style={styles.formContainer} className="button-container">
        <div style={styles.leftColumn}>
          <button
            style={styles.previousButton1}
            onClick={() => router.push("/register/2")}
          >
            {t("Previous", language)}
          </button>
        </div>
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
