"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { styles, loadFormData, saveFormData, defaultFormData } from "../../register/styles";
import Navigation from "../components/Navigation";
import "./../editdetail.css";
import LanguageToggle from "@/app/components/LanguageToggle";
import TamilPopup from "@/app/components/TamilPopup";
import { t } from "@/app/utils/translations";
import { useLanguage } from "@/app/hooks/useLanguage";
import TamilInput from "@/app/components/TamilInput";

import { normalizeDropdownValue } from "@/app/utils/normalization";

export default function EditStep7() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState(defaultFormData);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const { language, toggleLanguage } = useLanguage();
  const heightOptions = Array.from({ length: 31 }, (_, i) => {
    const height = 4.0 + i * 0.1;
    return { value: height.toFixed(1), label: height.toFixed(1) };
  });

  useEffect(() => {
    loadFormData().then(localData => {
       // Normalize Partner Preference Dropdowns
       localData.educationQualification1 = normalizeDropdownValue("educationQualification", localData.educationQualification1);
       localData.willingnessToWork1 = normalizeDropdownValue("willingnessToWork", localData.willingnessToWork1);
       localData.complexion1 = normalizeDropdownValue("complexion", localData.complexion1);
       
      setForm(localData);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!loading) {
      saveFormData(form);
    }
  }, [form, loading]);
  const handle = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  const validate = () => {
    if (!form.educationQualification1)
      return t("Education Qualification is required OR Enter NA for unknown fields", language);
    if (!form.educationDetails1 || !form.educationDetails1.trim())
      return t("Education Details is required OR Enter NA for unknown fields", language);
    if (!form.complexion1) return t("Complexion is required OR Enter NA for unknown fields", language);
    if (!form.personalPreference1 || !form.personalPreference1.trim())
      return t("Personal Preference is required OR Enter NA for unknown fields", language);
    if (!form.willingnessToWork1)
      return t("Willingness to Work After Marriage is required OR Enter NA for unknown fields", language);
    if (
      form.fromAge != 0 &&
      (!form.fromAge ||
        isNaN(form.fromAge) ||
        form.fromAge < 22 ||
        form.fromAge > 60)
    )
      return t("From Age must be a number between 22 and 60 OR Enter 0 for unknown fields", language);
    if (
      form.toAge != 0 &&
      (!form.toAge || isNaN(form.toAge) || form.toAge < 22 || form.toAge > 60)
    )
      return t("To Age must be a number between 22 and 60 OR Enter 0 for unknown fields", language);
    if (
      form.fromAge != 0 &&
      form.toAge != 0 &&
      parseInt(form.fromAge) > parseInt(form.toAge)
    )
      return t("From Age must be less than or equal to To Age", language);
    if (!form.fromHeight) return t("From Height is required OR Enter NA for unknown fields", language);
    if (!form.toHeight) return t("To Height is required OR Enter NA for unknown fields", language);
    if (
      form.fromHeight &&
      form.toHeight &&
      parseFloat(form.fromHeight) > parseFloat(form.toHeight)
    )
      return t("From Height must be less than or equal to To Height", language);
    return "";
  };
  const next = () => {
    const v = validate();
    if (v) {
      setError(v);
      setTimeout(() => setError(""), 4000);
      return;
    }
    router.push("/editdetail/8");
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
      <Navigation current={7} />
      <h1>{t("Step 7 - Partner Preference", language)}</h1>
      <br/>
      <div className="edit-form-container">
        <div className="edit-left-column">
          <div className="edit-field-row">
            <label className="edit-field-label">{t("Education Qualification", language)}:</label>
            <select
              className="edit-field-input"
              name="educationQualification1"
              value={form.educationQualification1 ?? ""}
              onChange={handle}
            >
              <option value="">{t("Select", language)}</option>
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
          </div>
          <div className="edit-field-row">
            <label className="edit-field-label">{t("Education Details", language)}:</label>
            <TamilInput
              isTextArea={true}
              className="edit-field-input"
              name="educationDetails1"
              value={form.educationDetails1 ?? ""}
              onChange={(e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }))}
              placeholder={t("Education Details", language)}
              forcedLanguage={language}
            />
          </div>
          <div className="edit-field-row">
            <label className="edit-field-label">{t("Complexion", language)}:</label>
            <select
              className="edit-field-input"
              name="complexion1"
              value={form.complexion1 ?? ""}
              onChange={handle}
            >
              <option value="">{t("Select", language)}</option>
              <option value="Fair red / Bright red (nalla sivappu)">
                {t("Fair red / Bright red (nalla sivappu)", language)}
              </option>
              <option value="Red (sivappu)">{t("Red (sivappu)", language)}</option>
              <option value="Wheatish (maaniram)">{t("Wheatish (maaniram)", language)}</option>
              <option value="Black (karuppu)">{t("Black (karuppu)", language)}</option>
            </select>
          </div>
          <div className="edit-field-row">
            <label className="edit-field-label">{t("Personal Preference", language)}:</label>
            <TamilInput
              isTextArea={true}
              className="edit-field-input"
              name="personalPreference1"
              value={form.personalPreference1 ?? ""}
              onChange={(e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }))}
              placeholder={t("Personal Preference", language)}
              forcedLanguage={language}
            />
          </div>
        </div>
        <div className="edit-right-column">
          <div className="edit-field-row">
            <label className="edit-field-label">{t("Willingness to Work", language)}:</label>
            <select
              className="edit-field-input"
              name="willingnessToWork1"
              value={form.willingnessToWork1 ?? ""}
              onChange={handle}
            >
              <option value="">{t("Select", language)}</option>
              <option value="Yes">{t("Yes", language)}</option>
              <option value="No">{t("No", language)}</option>
            </select>
          </div>
          <div className="edit-field-row">
            <label className="edit-field-label">{t("Age Range (From - To)", language)}:</label>
            <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
              <input
                className="edit-field-input-small"
                type="number"
                name="fromAge"
                value={form.fromAge ?? ""}
                onChange={handle}
                min="22"
                max="60"
                placeholder={t("From", language)}
              />
              <span>-</span>
              <input
                className="edit-field-input-small"
                type="number"
                name="toAge"
                value={form.toAge ?? ""}
                onChange={handle}
                min="22"
                max="60"
                placeholder={t("To", language)}
              />
            </div>
          </div>
          <div className="edit-field-row">
            <label className="edit-field-label">{t("Height Range (From - To)", language)}:</label>
            <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
              <select
                className="edit-field-input-small"
                style={{width: '95px !important', maxWidth: '95px !important'}}
                name="fromHeight"
                value={form.fromHeight ?? ""}
                onChange={handle}
              >
                <option value="">{t("From", language)}</option>
                {heightOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <span>-</span>
              <select
                className="edit-field-input-small"
                style={{width: '95px !important', maxWidth: '95px !important'}}
                name="toHeight"
                value={form.toHeight ?? ""}
                onChange={handle}
              >
                <option value="">{t("To", language)}</option>
                {heightOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div className="edit-button-container">
        <button
          className="edit-detail-previous-button"
          onClick={async () => {
            await saveFormData(form); // Save before navigating
            router.push("/editdetail/6");
          }}
        >
          {t("Previous", language)}
        </button>
        <button
          className="edit-detail-button"
          onClick={async () => {
            const v = validate();
            if (v) {
              setError(v);
              setTimeout(() => setError(""), 4000);
              return;
            }
            await saveFormData(form); // Save before navigating
            router.push("/editdetail/8");
          }}
        >
          {t("Next", language)}
        </button>
      </div>

      <div style={{ textAlign: "center", marginTop: "20px", marginBottom: "20px" }}>
        {t("Go To Dashboard", language)} <span style={{ color: "blue", cursor: "pointer", textDecoration: "underline" }} onClick={() => router.push("/dashboard")}>{t("ClickHere", language)}</span>
      </div>
    </div>
    </>
  );
}
