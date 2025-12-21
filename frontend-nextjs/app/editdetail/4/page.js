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

export default function EditStep4() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState(defaultFormData);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const { language, toggleLanguage } = useLanguage();

  useEffect(() => {
    loadFormData().then(localData => {
       if (localData.dateOfBirth && localData.dateOfBirth.includes("T")) {
         localData.dateOfBirth = localData.dateOfBirth.split("T")[0];
      }
      // Normalize Astrology Fields
      localData.zodiacSign = normalizeDropdownValue("zodiacSign", localData.zodiacSign);
      localData.ascendant = normalizeDropdownValue("ascendant", localData.ascendant);
      localData.birthStar = normalizeDropdownValue("birthStar", localData.birthStar);
      localData.DasaType = normalizeDropdownValue("DasaType", localData.DasaType);
      
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
    if (!form.zodiacSign) return t("Zodiac Sign is required OR Enter NA for unknown fields.", language);
    if (!form.ascendant) return t("Ascendant is required OR Enter NA for unknown fields.", language);
    if (!form.birthStar) return t("Birth Star is required OR Enter NA for unknown fields.", language);
    if (!form.dosham || (form.dosham.trim() === "" && form.dosham !== "NA"))
      return t("Dosham is required OR Enter NA for unknown fields.", language);
    if (
      !form.placeOfBirth ||
      (form.placeOfBirth.trim() === "" && form.placeOfBirth !== "NA")
    )
      return t("Place of Birth is required OR Enter NA for unknown fields.", language);
    if (!form.dateOfBirth) return t("Date of Birth is required OR Enter NA for unknown fields.", language);
    if (form.dateOfBirth && form.dateOfBirth.split("-")[0].length !== 4)
      return t("Date of Birth Year must be 4 digits.", language);
    const hours = parseInt(form.timeOfBirthHours);
    if (isNaN(hours) || hours < 0 || hours > 23)
      return t("Check Birth Hour 0-23 .", language);
    const minutes = parseInt(form.timeOfBirthMinutes);
    if (isNaN(minutes) || minutes < 0 || minutes > 59)
      return t("Check Birth Minutes 0-59.", language);
    const seconds = parseInt(form.timeOfBirthSeconds);
    if (isNaN(seconds) || seconds < 0 || seconds > 59)
      return t("Check Birth Seconds 0-59.", language);
    if (!form.DasaType) return t("DasaType is required OR Enter NA for unknown fields.", language);
    const validDasaTypes = [
      "சூரிய மகா திசை-Surya Maga Dasa",
      "சந்திர மகா திசை-Chandhira Maga Dasa",
      "செவ்வாய் மகா திசை-Sevvaai Maga Dasa",
      "புதன் மகா திசை-Budhan Maga Dasa",
      "வியாழ மகா திசை-Viyaazha Maga Dasa",
      "சுக்கிர மகா திசை-Sukkran Maga Dasa",
      "சனி மகா திசை-Sani Maga Dasa",
      "ராகு மகா திசை-Raagu Maga Dasa",
      "கேது மகா திசை-Kethu Maga Dasa",
    ];
    if (!validDasaTypes.includes(form.DasaType)) return t("DasaType is required OR Enter NA for unknown fields.", language);
    const years = parseInt(form.dasaRemainYears);
    if (isNaN(years) || years < 0 || years > 20)
      return t("Check Dasa Remain Years 0-20.", language);
    const months = parseInt(form.dasaRemainMonths);
    if (isNaN(months) || months < 0 || months > 11)
      return t("Check Dasa Remain Months 0-11.", language);
    const days = parseInt(form.dasaRemainDays);
    if (isNaN(days) || days < 0 || days > 31)
      return t("Check Dasa Remain Days 0-31.", language);
    return "";
  };

  const next = async () => {
    const v = validate();
    if (v) {
      setError(v);
      setTimeout(() => setError(""), 4000);
      return;
    }
    await saveFormData(form); // Save before navigating
    router.push("/editdetail/5");
  };
  return (
    <>
      <style jsx>{`
      .field-input {
            max-width:300px !important;
            width: 300px !important;
          }
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
          .field-inputrow {
            max-width:90px !important;
            width: 100px !important;
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
      <Navigation current={4} />
      <h1>{t("Step 4 - Astrology Basic Details", language)}</h1>
      <br/>
      <div style={styles.formContainer} className="form-container">
        <div style={styles.leftColumn} className="left-column">
          <div style={styles.fieldRow} className="field-row">
            <label style={styles.fieldLabel} className="field-label">{t("Zodiac Sign / Rasi", language)}:</label>
            <select
              style={styles.fieldInput}
              className="field-input"
              name="zodiacSign"
              value={form.zodiacSign ?? ""}
              onChange={handle}
            >
              <option value="">{t("Select", language)}</option>
              <option value="மேஷம்-Mesham">மேஷம்-Mesham</option>
              <option value="ரிஷபம்-Rishabam">ரிஷபம்-Rishabam</option>
              <option value="மிதுனம்-Mithunam">மிதுனம்-Mithunam</option>
              <option value="கடகம்-Kadagam">கடகம்-Kadagam</option>
              <option value="சிம்மம்-Simmam">சிம்மம்-Simmam</option>
              <option value="கன்னி-Kanni">கன்னி-Kanni</option>
              <option value="துலாம்-Thulam">துலாம்-Thulam</option>
              <option value="விருச்சிகம்-Viruchigam">
                விருச்சிகம்-Viruchigam
              </option>
              <option value="தனுசு-Dhanusu">தனுசு-Dhanusu</option>
              <option value="மகரம்-Magaram">மகரம்-Magaram</option>
              <option value="கும்பம்-Kumbam">கும்பம்-Kumbam</option>
              <option value="மீனம்-Meenam">மீனம்-Meenam</option>
            </select>
          </div>
          <div style={styles.fieldRow} className="field-row">
            <label style={styles.fieldLabel} className="field-label">{t("Ascendant / Lagnam", language)}:</label>
            <select
              style={styles.fieldInput}
              className="field-input"
              name="ascendant"
              value={form.ascendant ?? ""}
              onChange={handle}
            >
              <option value="">{t("Select", language)}</option>
              <option value="மேஷம்-Mesham">மேஷம்-Mesham</option>
              <option value="ரிஷபம்-Rishabam">ரிஷபம்-Rishabam</option>
              <option value="மிதுனம்-Mithunam">மிதுனம்-Mithunam</option>
              <option value="கடகம்-Kadagam">கடகம்-Kadagam</option>
              <option value="சிம்மம்-Simmam">சிம்மம்-Simmam</option>
              <option value="கன்னி-Kanni">கன்னி-Kanni</option>
              <option value="துலாம்-Thulam">துலாம்-Thulam</option>
              <option value="விருச்சிகம்-Viruchigam">
                விருச்சிகம்-Viruchigam
              </option>
              <option value="தனுசு-Dhanusu">தனுசு-Dhanusu</option>
              <option value="மகரம்-Magaram">மகரம்-Magaram</option>
              <option value="கும்பம்-Kumbam">கும்பம்-Kumbam</option>
              <option value="மீனம்-Meenam">மீனம்-Meenam</option>
            </select>
          </div>
          {errors.ascendant && (
            <p style={{ color: "red", fontSize: "12px" }}>{errors.ascendant}</p>
          )}
          <div style={styles.fieldRow} className="field-row">
            <label style={styles.fieldLabel} className="field-label">{t("Birth Star / Natchathiram", language)}:</label>
            <select
              style={styles.fieldInput}
              className="field-input"
              name="birthStar"
              value={form.birthStar ?? ""}
              onChange={handle}
            >
              <option value="">{t("Select", language)}</option>
              <option value="அஸ்வினி-Ashwini">அஸ்வினி-Ashwini</option>
              <option value="பாரணி-Bharani">பாரணி-Bharani</option>
              <option value="கார்த்திகை-Karthigai">கார்த்திகை-Karthigai</option>
              <option value="ரோகிணி-Rohini">ரோகிணி-Rohini</option>
              <option value="மிருகசீரிஷம்-Mirugaseerisham">
                மிருகசீரிஷம்-Mirugaseerisham
              </option>
              <option value="திருவாதிரை-Thiruvathirai">
                திருவாதிரை-Thiruvathirai
              </option>
              <option value="புனர்பூசம்-Punarpoosam">
                புனர்பூசம்-Punarpoosam
              </option>
              <option value="பூசம்-Poosam">பூசம்-Poosam</option>
              <option value="ஆயிலியம்-Ayilyam">ஆயிலியம்-Ayilyam</option>
              <option value="மகம்-Magam">மகம்-Magam</option>
              <option value="பூரம்-Pooram">பூரம்-Pooram</option>
              <option value="உத்திரம்-Uthiram">உத்திரம்-Uthiram</option>
              <option value="ஹஸ்தம்-Hastham">ஹஸ்தம்-Hastham</option>
              <option value="சித்திரை-Chithirai">சித்திரை-Chithirai</option>
              <option value="சுவாதி-Swathi">சுவாதி-Swathi</option>
              <option value="விசாகம்-Visakam">விசாகம்-Visakam</option>
              <option value="அனுஷம்-Anusham">அனுஷம்-Anusham</option>
              <option value="கேட்டை-Kettai">கேட்டை-Kettai</option>
              <option value="மூலம்-Moolam">மூலம்-Moolam</option>
              <option value="புறாடம்-Pooradam">புறாடம்-Pooradam</option>
              <option value="உத்திராடம்-Uthiradam">உத்திராடம்-Uthiradam</option>
              <option value="திருவோணம்-Thiruvonam">திருவோணம்-Thiruvonam</option>
              <option value="அவிட்டம்-Avittam">அவிட்டம்-Avittam</option>
              <option value="சதயம்-Sadhayam">சதயம்-Sadhayam</option>
              <option value="பூரட்டாதி-Poorattathi">பூரட்டாதி-Poorattathi</option>
              <option value="உத்திரட்டாதி-Uthirattathi">
                உத்திரட்டாதி-Uthirattathi
              </option>
              <option value="ரேவதி-Revathi">ரேவதி-Revathi</option>
            </select>
          </div>
          <div style={styles.fieldRow} className="field-row">
            <label style={styles.fieldLabel} className="field-label">{t("Dosham", language)}:</label>
            <TamilInput
              style={styles.fieldInput}
              className="field-input"
              name="dosham"
              value={form.dosham ?? ""}
              onChange={handle}
              placeholder={t("Dosham", language)}
              forcedLanguage={language}
            />
          </div>
          {errors.Dosham && (
            <p style={{ color: "red", fontSize: "12px" }}>{errors.Dosham}</p>
          )}
        </div>
        <div style={styles.rightColumn} className="right-column">
          <div style={styles.fieldRow} className="field-row">
            <label style={styles.fieldLabel} className="field-label">{t("Place of Birth", language)}:</label>
            <TamilInput
              style={styles.fieldInput}
              className="field-input"
              name="placeOfBirth"
              value={form.placeOfBirth ?? ""}
              onChange={handle}
              placeholder={t("Place of Birth", language)}
              forcedLanguage={language}
            />
          </div>
          <div style={styles.fieldRow} className="field-row">
            <label style={styles.fieldLabel} className="field-label">{t("Date of Birth", language)}:</label>
            <input
              style={{...styles.fieldInput, flex: 'initial', width: '200px'}}
              className="field-input"
              type="date"
              name="dateOfBirth"
              value={form.dateOfBirth ?? ""}
              onChange={handle}
              max="9999-12-31"
            />
          </div>
          {errors.dateOfBirth && (
            <p style={{ color: "red", fontSize: "12px", marginLeft: "195px" }}>
              {errors.dateOfBirth}
            </p>
          )}
          <div style={styles.fieldRow} className="field-row">
            <label style={styles.fieldLabel} className="field-label">{t("Time of Birth", language)}:</label>
            <div style={{display: 'flex', gap: '8px'}}>
              <input
                style={{...styles.fieldInput, flex: 'initial', width: '60px'}}
                className="field-inputrow"
                name="timeOfBirthHours"
                value={form.timeOfBirthHours ?? ""}
                onChange={handle}
                placeholder="HH"
                maxLength={2}
              />
              <input
                style={{...styles.fieldInput, flex: 'initial', width: '60px'}}
                className="field-inputrow"
                name="timeOfBirthMinutes"
                value={form.timeOfBirthMinutes ?? ""}
                onChange={handle}
                placeholder="MM"
                maxLength={2}
              />
              <input
                style={{...styles.fieldInput, flex: 'initial', width: '60px'}}
                className="field-inputrow"
                name="timeOfBirthSeconds"
                value={form.timeOfBirthSeconds ?? ""}
                onChange={handle}
                placeholder="SS"
                maxLength={2}
              />
            </div>
          </div>
          <div style={styles.fieldRow} className="field-row">
            <label style={styles.fieldLabel} className="field-label">{t("DasaType", language)}:</label>
            <select
              style={styles.fieldInput}
              className="field-input"
              name="DasaType"
              value={form.DasaType ?? ""}
              onChange={handle}
            >
              <option value="">{t("Select", language)}</option>
              <option value="சூரிய மகா திசை-Surya Maga Dasa">
                சூரிய மகா திசை-Surya Maga Dasa
              </option>
              <option value="சந்திர மகா திசை-Chandhira Maga Dasa">
                சந்திர மகா திசை-Chandhira Maga Dasa
              </option>
              <option value="செவ்வாய் மகா திசை-Sevvaai Maga Dasa">
                Sevvaai Maga Dasa-செவ்வாய் மகா திசை
              </option>
              <option value="புதன் மகா திசை-Budhan Maga Dasa">
                புதன் மகா திசை-Budhan Maga Dasa
              </option>
              <option value="வியாழ மகா திசை-Viyaazha Maga Dasa">
                வியாழ மகா திசை-Viyaazha Maga Dasa
              </option>
              <option value="சுக்கிர மகா திசை-Sukkran Maga Dasa">
                சுக்கிர மகா திசை-Sukkran Maga Dasa
              </option>
              <option value="சனி மகா திசை-Sani Maga Dasa">
                சனி மகா திசை-Sani Maga Dasa
              </option>
              <option value="ராகு மகா திசை-Raagu Maga Dasa">
                ராகு மகா திசை-Raagu Maga Dasa
              </option>
              <option value="கேது மகா திசை-Kethu Maga Dasa">
                கேது மகா திசை-Kethu Maga Dasa
              </option>
            </select>
          </div>
          {errors.DasaType && (
            <p style={{ color: "red", fontSize: "12px" }}>{errors.DasaType}</p>
          )}
          <div style={styles.fieldRow} className="field-row">
            <label style={styles.fieldLabel} className="field-label">{t("Dasa Remain", language)}:</label>
            <div style={{display: 'flex', gap: '8px'}}>
              <input
                style={{...styles.fieldInput, flex: 'initial', width: '60px'}}
                className="field-inputrow"
                name="dasaRemainYears"
                value={form.dasaRemainYears ?? ""}
                onChange={handle}
                placeholder="YY"
                maxLength={2}
              />
              <input
                style={{...styles.fieldInput, flex: 'initial', width: '60px'}}
                className="field-inputrow"
                name="dasaRemainMonths"
                value={form.dasaRemainMonths ?? ""}
                onChange={handle}
                placeholder="MM"
                maxLength={2}
              />
              <input
                style={{...styles.fieldInput, flex: 'initial', width: '60px'}}
                className="field-inputrow"
                name="dasaRemainDays"
                value={form.dasaRemainDays ?? ""}
                onChange={handle}
                placeholder="DD"
                maxLength={2}
              />
            </div>
          </div>
          {errors.dasaRemain && (
            <p style={{ color: "red", fontSize: "12px" }}>
              {errors.dasaRemain}
            </p>
          )}
        </div>
      </div>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div style={styles.formContainer} className="button-container">
        <div style={styles.leftColumn}>
          <button
            style={styles.editDetailPreviousButton}
            onClick={async () => {
               await saveFormData(form); // Save before navigating
               router.push("/editdetail/3");
            }}
          >
            {t("Previous", language)}
          </button>
        </div>
        <div style={styles.rightColumn}>
          <button style={styles.editDetailButton} onClick={next}>
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
