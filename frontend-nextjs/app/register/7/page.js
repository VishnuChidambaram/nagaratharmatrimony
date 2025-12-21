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

export default function Step7() {
  const router = useRouter();
  const [form, setForm] = useState(defaultFormData);
  const [error, setError] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const { language, toggleLanguage } = useLanguage();
  const heightOptions = Array.from({ length:31 }, (_, i) => {
    const height = 4.0 + i * 0.1;
    return { value: height.toFixed(1), label: height.toFixed(1) };
  });
  
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
  const handle = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const validate = () => {
    if (!form.educationQualification1)
      return "Education Qualification is required OR Enter NA for unknown fields";
    if (!form.educationDetails1 || !form.educationDetails1.trim())
      return "Education Details is required OR Enter NA for unknown fields";
    if (!form.complexion1) return "Complexion is required OR Enter NA for unknown fields";
    if (!form.personalPreference1 || !form.personalPreference1.trim())
      return "Personal Preference is required OR Enter NA for unknown fields";
    if (!form.willingnessToWork1)
      return "Willingness to Work After Marriage is required OR Enter NA for unknown fields";
    if (
      form.fromAge != 0 &&
      (!form.fromAge ||
        isNaN(form.fromAge) ||
        form.fromAge < 22 ||
        form.fromAge > 60)
    )
      return "From Age must be a number between 22 and 60 OR Enter 0 for unknown fields";
    if (
      form.toAge != 0 &&
      (!form.toAge || isNaN(form.toAge) || form.toAge < 22 || form.toAge > 60)
    )
      return "To Age must be a number between 22 and 60 OR Enter 0 for unknown fields";
    if (
      form.fromAge != 0 &&
      form.toAge != 0 &&
      parseInt(form.fromAge) > parseInt(form.toAge)
    )
      return "From Age must be less than or equal to To Age";
    if (!form.fromHeight) return "From Height is required OR Enter NA for unknown fields";
    if (!form.toHeight) return "To Height is required OR Enter NA for unknown fields";
    if (
      form.fromHeight &&
      form.toHeight &&
      parseFloat(form.fromHeight) > parseFloat(form.toHeight)
    )
      return "From Height must be less than or equal to To Height";
    return "";
  };
  const next = () => {
    const v = validate();
    if (v) {
      setError(v);
      setTimeout(() => setError(""), 4000);
      return;
    }
    router.push("/register/8");
  };
  return (
    <>
      <style jsx>{`
        @media (max-width: 768px) {
          .form-row {
            flex-direction: column !important;
          }
          .form-row > div {
            margin: 0 !important;
          }
          .form-row > div:nth-child(2) {
            margin-top: 10px !important;
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
      <h1 style={{ fontWeight: 'bold' }}>{t("Register Form", language)}</h1>
      <br/>
      <Navigation current={7} />
      <h1>{t("Step 7 - Partner Preference", language)}</h1>

      <LanguageToggle language={language} toggleLanguage={toggleLanguage} />

      {language === "ta" && (
        <div style={{ position: "fixed", top: "100px", right: "20px", zIndex: 50 }}>
          <TamilPopup onClose={() => {}} duration={3000} position="relative" />
        </div>
      )}

      <br/>
      <div
        className="form-row"
        style={{ display: "flex", justifyContent: "space-between" }}
      >
        <div style={{ flex: 1, marginRight: 10 }}>
          <select
            name="educationQualification1"
            value={form.educationQualification1 || ""}
            onChange={handle}
            style={styles.select}
          >
            <option value="">{t("Select Education Qualification", language)}</option>
            <option value="Engineering">{t("Engineering", language)}</option>
            <option value="Medicine (Doctor)">{t("Medicine (Doctor)", language)}</option>
            <option value="M.C.A.">{t("M.C.A.", language)}</option>
            <option value="Μ.Β.Α.">{t("Μ.Β.Α.", language)}</option>
            <option value="Law Graduate">{t("Law Graduate", language)}</option>
            <option value="Graduate">{t("Graduate", language)}</option>
            <option value="Graduate with Computer Applications">
              {t("Graduate with Computer Applications", language)}
            </option>
            <option value="Graudate with Teacher Training">
              {t("Graudate with Teacher Training", language)}
            </option>
            <option value="Post Graduate">{t("Post Graduate", language)}</option>
            <option value="Post Graduate with Computer Applications">
              {t("Post Graduate with Computer Applications", language)}
            </option>
            <option value="Post Graduate with Teacher Training">
              {t("Post Graduate with Teacher Training", language)}
            </option>
            <option value="Teacher Training">{t("Teacher Training", language)}</option>
            <option value="B.Pharm">{t("B.Pharm", language)}</option>
            <option value="B.Tech">{t("B.Tech", language)}</option>
            <option value="B.Sc. Nursing">{t("B.Sc. Nursing", language)}</option>
            <option value="D.Pharm">{t("D.Pharm", language)}</option>
            <option value="Diploma">{t("Diploma", language)}</option>
            <option value="Higher Secondary/ S.S.L.C.">
              {t("Higher Secondary/ S.S.L.C.", language)}
            </option>
            <option value="Below S.S.L.C">{t("Below S.S.L.C", language)}</option>
            <option value="Others">{t("Others", language)}</option>
          </select>
          <TamilInput
            isTextArea={true}
            name="educationDetails1"
            value={form.educationDetails1 || ""}
            onChange={handle}
            placeholder={t("Education Details", language)}
            forcedLanguage={language === "ta" ? "ta" : "en"}
            style={styles.textarea}
          />
          <select
            name="complexion1"
            value={form.complexion1 || ""}
            onChange={handle}
            style={styles.select}
          >
            <option value="">{t("Select Complexion", language)}</option>
            <option value="Fair red / Bright red (nalla sivappu)">
              {t("Fair red / Bright red (nalla sivappu)", language)}
            </option>
            <option value="Red (sivappu)">{t("Red (sivappu)", language)}</option>
            <option value="Wheatish (maaniram)">{t("Wheatish (maaniram)", language)}</option>
            <option value="Black (karuppu)">{t("Black (karuppu)", language)}</option>
          </select>

          <TamilInput
            isTextArea={true}
            name="personalPreference1"
            value={form.personalPreference1 || ""}
            onChange={handle}
            placeholder={t("Personal Preference", language)}
            forcedLanguage={language === "ta" ? "ta" : "en"}
            style={styles.textarea}
          />
        </div>
        <div style={{ flex: 1, marginLeft: "10px",}}>
          <label>{t("Willingness to Work After Marriage", language)} </label>
          <select
            name="willingnessToWork1"
            value={form.willingnessToWork1 || ""}
            onChange={handle}
            style={styles.select}
            placeholder="Willingness to Work After Marriage"
          >
            <option value="">{t("Select", language)}</option>
            <option value="Yes">{t("Yes", language)}</option>
            <option value="No">{t("No", language)}</option>
          </select>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' ,marginLeft:'30px'}}>
            <label style={{ width: '120px' }}>{t("From Age", language)}</label>
            <input
              type="number"
              name="fromAge"
              value={form.fromAge || ""}
              onChange={handle}
              style={styles.input1}
              min="22"
              max="60"
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px',marginLeft:'30px' }}>
            <label style={{ width: '120px' }}>{t("To Age", language)}</label>
            <input
              type="number"
              name="toAge"
              value={form.toAge || ""}
              onChange={handle}
              style={styles.input1}
              min="22"
              max="60"
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' ,marginLeft:'30px'}}>
            <label style={{ width: '120px' }}>{t("From Height", language)}</label>
            <select
              name="fromHeight"
              value={form.fromHeight || ""}
              onChange={handle}
              style={styles.input1}
            >
              <option value=""></option>
              {heightOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px',marginLeft:'30px' }}>
            <label style={{ width: '120px' }}>{t("To Height", language)}:</label>
            <select
              name="toHeight"
              value={form.toHeight || ""}
              onChange={handle}
              style={styles.input1}
            >
              <option value=""></option>
              {heightOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div style={styles.formContainer} className="button-container">
        <div style={styles.leftColumn}>
          <button
            style={styles.previousButton1}
            onClick={() => router.push("/register/6")}
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
