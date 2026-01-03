"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { styles, loadFormData, saveFormData, defaultFormData } from "../../register/styles";
import Navigation from "../components/Navigation";
import "./../editdetail.css";
import TamilInput from "@/app/components/TamilInput";
import TamilPopup from "@/app/components/TamilPopup";
import { t } from "@/app/utils/translations";
import { useLanguage } from "@/app/hooks/useLanguage";
import { API_URL } from "@/app/utils/config";
import { normalizeDropdownValue } from "@/app/utils/normalization";

export default function EditStep1() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState(defaultFormData);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const { language, toggleLanguage } = useLanguage();

    // Fetch user data from database when component mounts
    useEffect(() => {
    // 1. Load data from localStorage immediately
    const initializeData = async () => {
      // 1. Load data from localStorage immediately
      const localData = await loadFormData();
      setForm(localData);

      try {
        const emailFromUrl = searchParams.get("email");
        const emailFromStorage = sessionStorage.getItem("userEmail");
        const lastFetchedEmail = sessionStorage.getItem("lastFetchedEmail");
        const email = emailFromUrl || lastFetchedEmail || emailFromStorage;

        if (!email) {
          setLoading(false);
          return;
        }

        // 2. CHECK: Do we already have data for this user?
        const localEmail = (localData.email || "").trim().toLowerCase();
        const targetEmail = email.trim().toLowerCase();

        // FIX: Ensure localData actually has the correct user data (avoid empty forms if cache cleared)
        if (lastFetchedEmail && lastFetchedEmail.toLowerCase() === targetEmail && localEmail === targetEmail) {
           console.log("Step 1: Data already loaded for", email, "- Using Local Storage.");
           setLoading(false);
           return;
        }

        // 3. FETCH: If mismatch or empty, fetch fresh from DB
        console.log("Step 1: Fetching fresh data for", email);
        const response = await fetch(`${API_URL}/userdetails/${encodeURIComponent(email)}`);
        const result = await response.json();

        if (result.success && result.data) {
          const userData = result.data;
          
          // Clean overwrite - we are starting a fresh edits session
          userData.email = userData.email || email;
          delete userData.password;
          delete userData.confirmPassword;

          // Normalize Dropdown Values
          userData.gender = normalizeDropdownValue("gender", userData.gender);
          userData.maritalStatus = normalizeDropdownValue("maritalStatus", userData.maritalStatus);
          userData.profileCreatedBy = normalizeDropdownValue("profileCreatedBy", userData.profileCreatedBy);
          userData.yourTemple = normalizeDropdownValue("yourTemple", userData.yourTemple);
          userData.yourDivision = normalizeDropdownValue("yourDivision", userData.yourDivision);
          userData.nativePlace = normalizeDropdownValue("nativePlace", userData.nativePlace);


          console.log("Step 1: Loaded fresh data:", userData);
          setForm(userData);
          saveFormData(userData); // Seed LocalStorage
          sessionStorage.setItem("lastFetchedEmail", email);
          sessionStorage.setItem("originalEmail", userData.email); // Store original email for update URL
        }


      } catch (err) {
        console.error("Error fetching user data:", err);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [searchParams]);

  useEffect(() => {
    if (!loading) {
      saveFormData(form);
    }
  }, [form, loading]);

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
    "Kandavarayan Patti – 630203",
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
    if (!form.name.trim()) return t("Name is required OR Enter NA for unknown fields", language);
    if (!form.gender) return t("Gender is required OR Enter NA for unknown fields", language);
    if (!form.maritalStatus) return t("Marital Status is required OR Enter NA for unknown fields", language);
    if (!form.fatherName.trim()) return t("Father Name is required OR Enter NA for unknown fields", language);
    if (!form.fatherOccupation.trim()) return t("Father Occupation is required OR Enter NA for unknown fields", language);
    if (!form.motherName.trim()) return t("Mother Name is required OR Enter NA for unknown fields", language);
    if (!form.motherOccupation.trim()) return t("Mother Occupation is required OR Enter NA for unknown fields", language);
    if (form.brothers === "") return t("Number of Brothers is required OR Enter 0 for unknown fields", language);
    if (form.sisters === "") return t("Number of Sisters is required OR Enter 0 for unknown fields", language);
    if (!form.yourTemple) return t("Your Temple is required OR Enter NA for unknown fields", language);
    if (!form.yourDivision.trim()) return t("Your Division is required OR Enter NA for unknown fields", language);
    if (!form.knownLanguages.trim()) return t("Known Languages is required OR Enter NA for unknown fields", language);
    if (!form.nativePlace.trim()) return t("Native Place is required OR Enter NA for unknown fields", language);
    if (!form.nativePlaceHouseName.trim())
      return t("Native Place House Name is required OR Enter NA for unknown fields", language);
    if (!form.presentResidence.trim()) return t("Present Residence is required OR Enter NA for unknown fields", language);
    if (!form.pincode.trim()) return t("Pincode is required OR Enter NA for unknown fields", language);
    if (form.pincode !== "NA" && !/^\d{6}$/.test(form.pincode))
      return t("Pincode must be a 6-digit number", language);
    if (!form.profileCreatedBy) return t("Profile Created By is required OR Enter NA for unknown fields", language);
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
    router.push("/editdetail/2");
  };
  return (
    <>
      {/* Standardized CSS imported above */}
      <div className="edit-detail-container">
      {language === "ta" && (
        <div style={{ position: "fixed", top: "100px", right: "20px", zIndex: 50 }}>
      </div>
      )}

      <h1 style={{ fontWeight: 'bold' }}>{t("Edit Form", language)} </h1>
      <br/>
      <Navigation current={1} />
      <h1>{t("Step 1 - Basic Details", language)}</h1>
      <br/>
      <div className="edit-form-container">
        <div className="edit-left-column">
          <div className="edit-field-row">
            <label className="edit-field-label">{t("Name", language)}:</label>
            <TamilInput
              className="edit-field-input"
              name="name"
              value={form.name ?? ""}
              onChange={handleChange}
              placeholder={t("Name", language)}
              forcedLanguage={language}
            />
          </div>
          <div className="edit-field-row">
            <label className="edit-field-label">{t("Gender", language)}:</label>
            <select
              className="edit-field-input"
              name="gender"
              value={form.gender ?? ""}
              onChange={handleChange}
            >
              <option value="">{t("Select Gender", language)}</option>
              <option value="Male">{t("Male", language)}</option>
              <option value="Female">{t("Female", language)}</option>
            </select>
          </div>
          <div className="edit-field-row">
            <label className="edit-field-label">{t("Marital Status", language)}:</label>
            <select
              className="edit-field-input"
              name="maritalStatus"
              value={form.maritalStatus ?? ""}
              onChange={handleChange}
            >
              <option value="">{t("Select Marital Status", language)}</option>
              <option value="unmarried">{t("unmarried", language)}</option>
              <option value="widow">{t("widow", language)}</option>
              <option value="divorced">{t("divorced", language)}</option>
              <option value="widower">{t("widower", language)}</option>
            </select>
          </div>
          <div className="edit-field-row">
            <label className="edit-field-label">{t("Father Name", language)}:</label>
            <TamilInput
              className="edit-field-input"
              name="fatherName"
              value={form.fatherName ?? ""}
              onChange={handleChange}
              placeholder={t("Father Name", language)}
              forcedLanguage={language}
            />
          </div>
          <div className="edit-field-row">
            <label className="edit-field-label">{t("Father Occupation", language)}:</label>
            <TamilInput
              className="edit-field-input"
              name="fatherOccupation"
              value={form.fatherOccupation ?? ""}
              onChange={handleChange}
              placeholder={t("Father Occupation", language)}
              forcedLanguage={language}
            />
          </div>
          <div className="edit-field-row">
            <label className="edit-field-label">{t("Mother Name", language)}:</label>
            <TamilInput
              className="edit-field-input"
              name="motherName"
              value={form.motherName ?? ""}
              onChange={handleChange}
              placeholder={t("Mother Name", language)}
              forcedLanguage={language}
            />
          </div>
          <div className="edit-field-row">
            <label className="edit-field-label">{t("Mother Occupation", language)}:</label>
            <TamilInput
              className="edit-field-input"
              name="motherOccupation"
              value={form.motherOccupation ?? ""}
              onChange={handleChange}
              placeholder={t("Mother Occupation", language)}
              forcedLanguage={language}
            />
          </div>
          <div className="edit-field-row">
            <label className="edit-field-label">{t("Number of Brothers", language)}:</label>
            <select
              className="edit-field-input"
              name="brothers"
              value={form.brothers ?? ""}
              onChange={handleChange}
            >
              <option value="">{t("Select Number of Brothers", language)}</option>
              {[...Array(5).keys()].map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </div>
          <div className="edit-field-row">
            <label className="edit-field-label">{t("Married Number of Brothers", language)}:</label>
            <select
              className="edit-field-input"
              name="brothersMarried"
              value={form.brothersMarried ?? ""}
              onChange={handleChange}
            >
              <option value="">{t("Select Married Number of Brothers", language)}</option>
              {[...Array(5).keys()].map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </div>
          <div className="edit-field-row">
            <label className="edit-field-label">{t("Number of Sisters", language)}:</label>
            <select
              className="edit-field-input"
              name="sisters"
              value={form.sisters ?? ""}
              onChange={handleChange}
            >
              <option value="">{t("Select Number of Sisters", language)}</option>
              {[...Array(5).keys()].map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </div>
          <div className="edit-field-row">
            <label className="edit-field-label">{t("Married Number of Sisters", language)}:</label>
            <select
              className="edit-field-input"
              name="sistersMarried"
              value={form.sistersMarried ?? ""}
              onChange={handleChange}
            >
              <option value="">{t("Select Married Number of Sisters", language)}</option>
              {[...Array(5).keys()].map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </div>
          <div className="edit-field-row">
            <label className="edit-field-label">{t("Your Temple", language)}:</label>
            <select
              className="edit-field-input"
              name="yourTemple"
              value={form.yourTemple ?? ""}
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
          </div>
          <div className="edit-field-row">
            <label className="edit-field-label">{t("Your Division", language)}:</label>
            <select
              className="edit-field-input"
              name="yourDivision"
              value={form.yourDivision ?? ""}
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
          </div>
          <div className="edit-field-row">
            <label className="edit-field-label">{t("Known Languages", language)}:</label>
            <TamilInput
              className="edit-field-input"
              name="knownLanguages"
              value={form.knownLanguages ?? ""}
              onChange={handleChange}
              placeholder={t("Known Languages", language)}
              forcedLanguage={language}
            />
          </div>

        </div>
        <div className="edit-right-column">
          <div className="edit-field-row">
            <label className="edit-field-label">{t("Native Place", language)}:</label>
            <select
              className="edit-field-input"
              name="nativePlace"
              value={form.nativePlace ?? ""}
              onChange={handleChange}
            >
              <option value="">{t("Select Native Place", language)}</option>
              {nativePlaceOptions.map((place, index) => (
                <option key={index} value={place}>
                  {t(place, language)}
                </option>
              ))}
            </select>
          </div>
          <div className="edit-field-row">
            <label className="edit-field-label">{t("Native Place House Name", language)}:</label>
            <TamilInput
              className="edit-field-input"
              name="nativePlaceHouseName"
              value={form.nativePlaceHouseName ?? ""}
              onChange={handleChange}
              placeholder={t("Native Place House Name", language)}
              forcedLanguage={language}
            />
          </div>
          <div className="edit-field-row">
            <label className="edit-field-label">{t("Present Residence", language)}:</label>
            <TamilInput
              className="edit-field-input"
              name="presentResidence"
              value={form.presentResidence ?? ""}
              onChange={handleChange}
              placeholder={t("Present Residence", language)}
              forcedLanguage={language}
            />
          </div>
          <div className="edit-field-row">
            <label className="edit-field-label">{t("Present Pincode", language)}:</label>
            <input
              className="edit-field-input"
              name="pincode"
              value={form.pincode ?? ""}
              onChange={handleChange}
              placeholder={t("Present Pincode", language)}
            />
          </div>
          <div className="edit-field-row">
            <label className="edit-field-label">{t("Profile Created By", language)}:</label>
            <select
              className="edit-field-input"
              name="profileCreatedBy"
              value={form.profileCreatedBy ?? ""}
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
          </div>
          <div className="edit-field-row">
            <label className="edit-field-label">{t("Referred By", language)}:</label>
            <TamilInput
              className="edit-field-input"
              name="referredBy"
              value={form.referredBy ?? ""}
              onChange={handleChange}
              placeholder={t("Referred By", language)}
              forcedLanguage={language}
            />
          </div>
          <div className="edit-field-row">
            <label className="edit-field-label">{t("Reference", language)}:</label>
            <TamilInput
              className="edit-field-input"
              name="reference"
              value={form.reference ?? ""}
              onChange={handleChange}
              placeholder={t("Reference – NMS Group/Branch No.", language)}
              forcedLanguage={language}
            />
          </div>
          <h5 className="edit-referral-heading">{t("Referral Details 1", language)}</h5>
          <div className="edit-field-row">
            <label className="edit-field-label">{t("Referral Name", language)}:</label>
            <TamilInput
              className="edit-field-input"
              name="referralDetails1Name"
              value={form.referralDetails1Name ?? ""}
              onChange={handleChange}
              placeholder={t("Referral Name", language)}
              forcedLanguage={language}
            />
          </div>
          <div className="edit-field-row">
            <label className="edit-field-label">{t("Referral Phone", language)}:</label>
            <input
              className="edit-field-input"
              name="referralDetails1Phone"
              value={form.referralDetails1Phone ?? ""}
              onChange={handleChange}
              placeholder={t("Referral Phone", language)}
            />
          </div>
          <div className="edit-field-row">
            <label className="edit-field-label">{t("Referral Address", language)}:</label>
            <TamilInput
              className="edit-field-input"
              name="referralDetails1Address"
              value={form.referralDetails1Address ?? ""}
              onChange={handleChange}
              placeholder={t("Referral Address", language)}
              forcedLanguage={language}
            />
          </div>
          <h4 className="edit-referral-heading">{t("Referral Details 2", language)}</h4>
          <div className="edit-field-row">
            <label className="edit-field-label">{t("Referral Name", language)}:</label>
            <TamilInput
              className="edit-field-input"
              name="referralDetails2Name"
              value={form.referralDetails2Name ?? ""}
              onChange={handleChange}
              placeholder={t("Referral Name", language)}
              forcedLanguage={language}
            />
          </div>
          <div className="edit-field-row">
            <label className="edit-field-label">{t("Referral Phone", language)}:</label>
            <input
              className="edit-field-input"
              name="referralDetails2Phone"
              value={form.referralDetails2Phone ?? ""}
              onChange={handleChange}
              placeholder={t("Referral Phone", language)}
            />
          </div>
          <div className="edit-field-row">
            <label className="edit-field-label">{t("Referral Address", language)}:</label>
            <TamilInput
              className="edit-field-input"
              name="referralDetails2Address"
              value={form.referralDetails2Address ?? ""}
              onChange={handleChange}
              placeholder={t("Referral Address", language)}
              forcedLanguage={language}
            />
          </div>
        </div>
      </div>
      {error && <p className="edit-error-text">{error}</p>}
      <div className="edit-button-container">
        <button className="edit-single-button" onClick={next}>
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
