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

export default function Step4() {
  const router = useRouter();
  const [form, setForm] = useState(defaultFormData);
  const [errors, setErrors] = useState({});
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
  const handle = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const validate = () => {
    if (!form.zodiacSign) return "Zodiac Sign is required OR Enter NA for unknown fields.";
    if (!form.ascendant) return "Ascendant is required OR Enter NA for unknown fields.";
    if (!form.birthStar) return "Birth Star is required OR Enter NA for unknown fields.";
    if (!form.dosham || (form.dosham.trim() === "" && form.dosham !== "NA"))
      return "Dosham is required OR Enter NA for unknown fields.";
    if (
      !form.placeOfBirth ||
      (form.placeOfBirth.trim() === "" && form.placeOfBirth !== "NA")
    )
      return "Place of Birth is required OR Enter NA for unknown fields.";
    if (!form.dateOfBirth) return "Date of Birth is required OR Enter NA for unknown fields.";
    if (form.dateOfBirth && form.dateOfBirth.split("-")[0].length !== 4)
      return "Date of Birth Year must be 4 digits.";
    const hours = parseInt(form.timeOfBirthHours);
    if (isNaN(hours) || hours < 0 || hours > 23)
      return " Check Birth Hour 0-23 .";
    const minutes = parseInt(form.timeOfBirthMinutes);
    if (isNaN(minutes) || minutes < 0 || minutes > 59)
      return " Check Birth Minutes 0-59.";
    const seconds = parseInt(form.timeOfBirthSeconds);
    if (isNaN(seconds) || seconds < 0 || seconds > 59)
      return "Check Birth Seconds 0-59.";
    if (!form.DasaType) return "DasaType is required OR Enter NA for unknown fields.";
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
    if (!validDasaTypes.includes(form.DasaType)) return "DasaType is required OR Enter NA for unknown fields.";
    const years = parseInt(form.dasaRemainYears);
    if (isNaN(years) || years < 0 || years > 20)
      return "Check Dasa Remain Years 0-20.";
    const months = parseInt(form.dasaRemainMonths);
    if (isNaN(months) || months < 0 || months > 11)
      return "Check Dasa Remain Months 0-11.";
    const days = parseInt(form.dasaRemainDays);
    if (isNaN(days) || days < 0 || days > 31)
      return "Check Dasa Remain Days 0-31.";
    return "";
  };

  const next = () => {
    const v = validate();
    if (v) {
      setError(v);
      setTimeout(() => setError(""), 4000);
      return;
    }
    router.push("/register/5");
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
          
          .small-input {
            width: 40px !important;
            min-width: 30px !important;
            margin-left: 0px !important;
          }

          .date-input {
            margin-left: -15px !important;
            width: 60% !important;
            min-width: 80px !important;
          }
        }
        
        @media (max-width: 480px) {
          h1 {
            font-size: 22px !important;
          }
        }
        
        .date-label {
            margin: 10px 20px 0px 10px;
        } 
        @media (max-width: 768px) {
           .date-label {
             margin: 20px 0px 0px 40px !important;
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
      <Navigation current={4} />
      <h1>{t("Step 4 - Astrology Basic Details", language)}</h1>
      <br/>
      <div style={styles.formContainer} className="form-container">
        <div style={styles.leftColumn} className="left-column">
          <select
            style={styles.input}
            name="zodiacSign"
            value={form.zodiacSign}
            onChange={handle}
          >
            <option value="">{t("Select Zodiac Sign/Rasi", language)}</option>
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
          <select
            style={styles.input}
            name="ascendant"
            value={form.ascendant}
            onChange={handle}
          >
            <option value="">{t("Select Ascendant/Lagnam", language)}</option>
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
          {errors.ascendant && (
            <p style={{ color: "red", fontSize: "12px" }}>{errors.ascendant}</p>
          )}
          <select
            style={styles.input}
            name="birthStar"
            value={form.birthStar}
            onChange={handle}
          >
            <option value="">{t("Select Birth Star/Natchathiram", language)}</option>
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
          <TamilInput
            isTextArea={false}
            name="dosham"
            value={form.dosham}
            onChange={handle}
            placeholder={t("Dosham (தோஷம்)", language)}
            forcedLanguage={language}
            style={styles.input}/>
          {errors.Dosham && (
            <p style={{ color: "red", fontSize: "12px" }}>{errors.Dosham}</p>
          )}
        </div>
        <div style={styles.rightColumn} className="right-column">
          <TamilInput
            isTextArea={false}
            name="placeOfBirth"
            value={form.placeOfBirth}
            onChange={handle}
            placeholder={t("Place of Birth", language)}
            forcedLanguage={language}
            style={styles.input}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              margin: "10px 0",
            }}
          >
            <label
              className="date-label"
              style={{
                margin: "10px 20px 0px 40px",
                fontWeight: "bold",
                whiteSpace: "nowrap",
              }}
            >
              {t("Date of Birth", language)}:
            </label>
            <input
              style={styles.input1}
              className="date-input"
              type="date"
              name="dateOfBirth"
              value={form.dateOfBirth}
              onChange={handle}
              max="9999-12-31"
            />
          </div>
          {errors.dateOfBirth && (
            <p style={{ color: "red", fontSize: "12px", marginLeft: "120px" }}>
              {errors.dateOfBirth}
            </p>
          )}

          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              marginTop: 8,
            }}
          >
            <label style={{ margin: "10px 0px 0px 40px", fontWeight: "bold" }}>
              {t("Time of Birth", language)}: 
            </label>
            <input
              style={styles.smallInput11}
              className="small-input"
              name="timeOfBirthHours"
              value={form.timeOfBirthHours}
              onChange={handle}
              placeholder="HH"
              maxLength={2}
            />
            <input
              style={styles.smallInput1}
              className="small-input"
              name="timeOfBirthMinutes"
              value={form.timeOfBirthMinutes}
              onChange={handle}
              placeholder="MM"
              maxLength={2}
            />
            <input
              style={styles.smallInput1}
              className="small-input"
              name="timeOfBirthSeconds"
              value={form.timeOfBirthSeconds}
              onChange={handle}
              placeholder="SS"
              maxLength={2}
            />
          </div>
          <select
            style={styles.input}
            name="DasaType"
            value={form.DasaType}
            onChange={handle}
          >
            <option value="">{t("Select DasaType", language)}</option>
            <option value="சூரிய மகா திசை-Surya Maga Dasa">
              சூரிய மகா திசை-Surya Maga Dasa
            </option>
            <option value="சந்திர மகா திசை-Chandhira Maga Dasa">
              சந்திர மகா திசை-Chandhira Maga Dasa
            </option>
            <option value="செவ்வாய் மகா திசை-Sevvaai Maga Dasa">
              செவ்வாய் மகா திசை-Sevvaai Maga Dasa
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
          {errors.DasaType && (
            <p style={{ color: "red", fontSize: "12px" }}>{errors.DasaType}</p>
          )}
          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              marginTop: 8,
            }}
          >
            <label style={{ margin: "10px 0px 0px 40px", fontWeight: "bold" }}>
              {t("Dasa Remain", language)}:
            </label>
            <input
              style={styles.smallInput11}
              className="small-input"
              name="dasaRemainYears"
              value={form.dasaRemainYears}
              onChange={handle}
              placeholder="YY"
              maxLength={2}
            />
            <input
              style={styles.smallInput1}
              className="small-input"
              name="dasaRemainMonths"
              value={form.dasaRemainMonths}
              onChange={handle}
              placeholder="MM"
              maxLength={2}
            />
            <input
              style={styles.smallInput1}
              className="small-input"
              name="dasaRemainDays"
              value={form.dasaRemainDays}
              onChange={handle}
              placeholder="DD"
              maxLength={2}
            />
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
            style={styles.previousButton1}
            onClick={() => router.push("/register/3")}
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
