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
import { normalizeDropdownValue } from "@/app/utils/normalization";

export default function EditStep3() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState(defaultFormData);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const { language, toggleLanguage } = useLanguage();

  useEffect(() => {
    loadFormData().then(localData => {
      // Normalize
      localData.specialCases = normalizeDropdownValue("specialCases", localData.specialCases);
      localData.diet = normalizeDropdownValue("diet", localData.diet);
      localData.complexion = normalizeDropdownValue("complexion", localData.complexion);
      
      // Basic handling for weight/height if they match normalization keys
      // (Note: normalization.js currently doesn't have extensive maps for these, 
      // but adding the call ensures future support if we add them.)
      // localData.weight = normalizeDropdownValue("weight", localData.weight); 
      // localData.height = normalizeDropdownValue("height", localData.height);
      
      setForm(localData);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!loading) {
      saveFormData(form);
    }
  }, [form, loading]);
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
  
  const heightValues = [
    "4'0 (121 cm)", "4'1 (124 cm)", "4'2 (127 cm)", "4'3 (130 cm)", "4'4 (132 cm)", "4'5 (135 cm)", "4'6 (137 cm)", "4'7 (140 cm)", "4'8 (142 cm)", "4'9 (145 cm)", "4'10 (147 cm)", "4'11 (150 cm)",
    "5'0 (152 cm)", "5'1 (155 cm)", "5'2 (157 cm)", "5'3 (160 cm)", "5'4 (162 cm)", "5'5 (165 cm)", "5'6 (167 cm)", "5'7 (170 cm)", "5'8 (172 cm)", "5'9 (175 cm)", "5'10 (177 cm)", "5'11 (180 cm)",
    "6'0 (182 cm)", "6'1 (185 cm)", "6'2 (187 cm)", "6'3 (190 cm)", "6'4 (192 cm)", "6'5 (195 cm)", "6'6 (197 cm)", "6'7 (200 cm)", "6'8 (202 cm)", "6'9 (205 cm)", "6'10 (207 cm)", "6'11 (210 cm)",
    "7'0 (213 cm)"
  ];

  const formatHeightOption = (value) => {
    const parts = value.match(/(\d+)'(\d+) \((.*)\)/);
    if (!parts) return value;
    const ft = parts[1];
    const inch = parts[2];
    const cmPart = parts[3];
    if (language === 'ta') {
      return `${ft} அடி ${inch} அங்குலம் (${cmPart.replace('cm', 'செ.மீ')})`;
    }
    return `${ft} ft ${inch} inch (${cmPart})`;
  };

  const validate = () => {
    if (!form.height) return t("Height is required OR Enter NA for unknown fields", language);
    if (!form.complexion) return t("Complexion is required OR Enter NA for unknown fields", language);
    if (!form.weight) return t("Weight is required OR Enter NA for unknown fields", language);
    if (!form.diet) return t("Diet is required OR Enter NA for unknown fields", language);
    if (!form.specialCases) return t("Special Cases is required OR Enter NA for unknown fields", language);
    if (!form.specialCasesDetails) return t("Special Cases Details is required OR Enter NA for unknown fields", language);
    return "";
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

      <h1 style={{ fontWeight: 'bold' }}>{t("Edit Form", language)} </h1>
      <br/>
      <Navigation current={3} />
      <h1>{t("Step 3 - Physical Attributes", language)}</h1>
      <br/>
      <div style={styles.formContainer} className="form-container">
        <div style={styles.leftColumn} className="left-column">
          <div style={styles.fieldRow} className="field-row">
            <label style={styles.fieldLabel} className="field-label">{t("Height", language)}:</label>
            <select
              style={styles.fieldInput}
              className="field-input"
              name="height"
              value={form.height ?? ""}
              onChange={handle}
            >
              <option value="">{t("Select Height", language)}</option>
              {heightValues.map((h) => (
                <option key={h} value={h}>
                  {formatHeightOption(h)}
                </option>
              ))}
            </select>
          </div>
          <div style={styles.fieldRow} className="field-row">
            <label style={styles.fieldLabel} className="field-label">{t("Complexion", language)}:</label>
            <select
              style={styles.fieldInput}
              className="field-input"
              name="complexion"
              value={form.complexion ?? ""}
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
          </div>
          <div style={styles.fieldRow} className="field-row">
            <label style={styles.fieldLabel} className="field-label">{t("Weight", language)}:</label>
            <select
              style={styles.fieldInput}
              className="field-input"
              name="weight"
              value={form.weight ?? ""}
              onChange={handle}
            >
              <option value="">{t("Select Weight", language)}</option>
              {Array.from({ length: 106 }, (_, i) => 25 + i).map((kg) => (
                <option key={kg} value={`${kg} kg`}>
                  {kg} {language === "ta" ? "கிலோ" : "kg"}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div style={styles.rightColumn} className="right-column">
          <div style={styles.fieldRow} className="field-row">
            <label style={styles.fieldLabel} className="field-label">{t("Diet", language)}:</label>
            <select
              style={styles.fieldInput}
              className="field-input"
              name="diet"
              value={form.diet ?? ""}
              onChange={handle}
            >
              <option value="">{t("Select Diet", language)}</option>
              <option value="Vegetarian">{t("Vegetarian", language)}</option>
              <option value="Non-Vegetarian">{t("Non-Vegetarian", language)}</option>
            </select>
          </div>
          <div style={styles.fieldRow} className="field-row">
            <label style={styles.fieldLabel} className="field-label">{t("Special Cases (Disability)", language)}:</label>
            <select
              style={styles.fieldInput}
              className="field-input"
              name="specialCases"
              value={form.specialCases ?? ""}
              onChange={handle}
            >
              <option value="">{t("Select Special Cases", language)}</option>
              <option value="Yes">{t("Yes", language)}</option>
              <option value="No">{t("No", language)}</option>
            </select>
          </div>
          <div style={styles.fieldRow} className="field-row">
            <label style={styles.fieldLabel} className="field-label">{t("Special Cases Details", language)}:</label>
            <TamilInput
              style={styles.fieldInput}
              className="field-input"
              name="specialCasesDetails"
              value={form.specialCases === "No" ? "NA" : (form.specialCasesDetails ?? "")}
              onChange={handle}
              disabled={form.specialCases === "No"}
              placeholder={t("Special Cases Details", language)}
              forcedLanguage={language}
            />
          </div>
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
            style={styles.editDetailPreviousButton}
            onClick={async () => {
              await saveFormData(form); // Save before navigating
              router.push("/editdetail/2");
            }}
          >
            {t("Previous", language)}
          </button>
        </div>
        <div style={styles.rightColumn}>
          <button
            style={styles.editDetailButton}
            onClick={async () => {
              const v = validate();
              if (v) {
                setError(v);
                setTimeout(() => setError(""), 4000);
                return;
              }
              await saveFormData(form); // Save before navigating
              router.push("/editdetail/4");
            }}
          >
            {t("Next", language)}
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
