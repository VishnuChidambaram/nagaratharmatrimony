"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { styles, loadFormData, saveFormData, defaultFormData } from "../../register/styles";
import Navigation from "../components/Navigation";
import "./../editdetail.css";
import TamilInput from "@/app/components/TamilInput";
import TamilPopup from "@/app/components/TamilPopup";
import LanguageToggle from "@/app/components/LanguageToggle";
import { t } from "@/app/utils/translations";
import { useLanguage } from "@/app/hooks/useLanguage";

import { normalizeDropdownValue } from "@/app/utils/normalization";

export default function EditStep2() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState(defaultFormData);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const { language, toggleLanguage } = useLanguage();

  // Fetch user data from database when component mounts
  useEffect(() => {
    loadFormData().then(localData => {
      // Normalize loaded data
      localData.educationQualification = normalizeDropdownValue("educationQualification", localData.educationQualification);
      localData.occupationBusiness = normalizeDropdownValue("occupationBusiness", localData.occupationBusiness);
      
      setForm(localData);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!loading) {
      saveFormData(form);
    }
  }, [form, loading]);
  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };
  const validate = () => {
    if (!form.educationQualification)
      return t("Education Qualification is required OR Enter NA for unknown fields", language);
    if (form.educationQualification === "Others" && !form.otherEducation.trim())
      return t("Other Education is required OR Enter NA for unknown fields", language);
    if (!form.occupationBusiness) return t("Occupation / Business is required OR Enter NA for unknown fields", language);
    if (form.occupationBusiness === "Other" && !form.otherOccupation.trim())
      return t("Other Occupation is required OR Enter NA for unknown fields", language);
    if (!form.workingPlace.trim()) return t("Working Place is required OR Enter NA for unknown fields", language);
    if (!form.workDetails.trim()) return t("Work Details is required OR Enter NA for unknown fields", language);
    if (!form.educationDetails.trim()) return t("Education Details is required OR Enter NA for unknown fields", language);
    if (form.income != 0 && (!form.income || isNaN(form.income) || form.income < 0))
      return t("Income must be a positive number OR Enter 0 for unknown fields", language);
    if (form.income != 0 && (form.income < 1 || form.income > 90))
      return t("Income must be between 1 and 90 LPA OR Enter 0 for unknown fields", language);
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
    router.push("/editdetail/3");
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
      <Navigation current={2} />
      <h1>{t("Step 2 - Education & Occupation", language)}</h1>
      <br/>
      <div className="edit-form-container">
        <div className="edit-left-column">
          <div className="edit-field-row">
            <label className="edit-field-label">{t("Education Qualification", language)}:</label>
            <select
              className="edit-field-input"
              name="educationQualification"
              value={form.educationQualification ?? ""}
              onChange={handleChange}
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
          </div>
          {form.educationQualification === "Others" && (
            <div className="edit-field-row">
              <label className="edit-field-label">{t("Other Education", language)}:</label>
              <TamilInput
                className="edit-field-input"
                name="otherEducation"
                value={form.otherEducation ?? ""}
                onChange={handleChange}
                placeholder={t("Other Education", language)}
                forcedLanguage={language}
              />
            </div>
          )}
          <div className="edit-field-row">
            <label className="edit-field-label">{t("Education Details", language)}:</label>
            <TamilInput
              className="edit-field-input"
              name="educationDetails"
              value={form.educationDetails ?? ""}
              onChange={handleChange}
              placeholder={t("Education Details", language)}
              forcedLanguage={language}
            />
          </div>
          <div className="edit-field-row">
            <label className="edit-field-label">{t("Occupation / Business", language)}:</label>
            <select
              className="edit-field-input"
              name="occupationBusiness"
              value={form.occupationBusiness ?? ""}
              onChange={handleChange}
            >
              <option value="">{t("Select Occupation / Business", language)}</option>
              <option value="Teacher">{t("Teacher", language)}</option>
              <option value="Doctor">{t("Doctor", language)}</option>
              <option value="Engineer">{t("Engineer", language)}</option>
              <option value="Lawyer">{t("Lawyer", language)}</option>
              <option value="Nurse">{t("Nurse", language)}</option>
              <option value="Police Officer">{t("Police Officer", language)}</option>
              <option value="Accountant">{t("Accountant", language)}</option>
              <option value="Farmer">{t("Farmer", language)}</option>
              <option value="Software Developer">{t("Software Developer", language)}</option>
              <option value="Electrician">{t("Electrician", language)}</option>
              <option value="Plumber">{t("Plumber", language)}</option>
              <option value="Carpenter">{t("Carpenter", language)}</option>
              <option value="Driver">{t("Driver", language)}</option>
              <option value="Shopkeeper">{t("Shopkeeper", language)}</option>
              <option value="Businessman">{t("Businessman", language)}</option>
              <option value="Chef / Cook">{t("Chef / Cook", language)}</option>
              <option value="Waiter">{t("Waiter", language)}</option>
              <option value="Mechanic">{t("Mechanic", language)}</option>
              <option value="Tailor">{t("Tailor", language)}</option>
              <option value="Barber">{t("Barber", language)}</option>
              <option value="Scientist">{t("Scientist", language)}</option>
              <option value="Professor">{t("Professor", language)}</option>
              <option value="Architect">{t("Architect", language)}</option>
              <option value="Banker">{t("Banker", language)}</option>
              <option value="Journalist">{t("Journalist", language)}</option>
              <option value="Photographer">{t("Photographer", language)}</option>
              <option value="Designer">{t("Designer", language)}</option>
              <option value="Marketing Executive">{t("Marketing Executive", language)}</option>
              <option value="Salesman">{t("Salesman", language)}</option>
              <option value="Receptionist">{t("Receptionist", language)}</option>
              <option value="Clerk">{t("Clerk", language)}</option>
              <option value="Manager">{t("Manager", language)}</option>
              <option value="Technician">{t("Technician", language)}</option>
              <option value="Pharmacist">{t("Pharmacist", language)}</option>
              <option value="Dentist">{t("Dentist", language)}</option>
              <option value="Lab Technician">{t("Lab Technician", language)}</option>
              <option value="Security Guard">{t("Security Guard", language)}</option>
              <option value="Real Estate Agent">{t("Real Estate Agent", language)}</option>
              <option value="Cleaner">{t("Cleaner", language)}</option>
              <option value="Mason">{t("Mason", language)}</option>
              <option value="Painter">{t("Painter", language)}</option>
              <option value="Welder">{t("Welder", language)}</option>
              <option value="Pilot">{t("Pilot", language)}</option>
              <option value="Soldier">{t("Soldier", language)}</option>
              <option value="Social Worker">{t("Social Worker", language)}</option>
              <option value="Librarian">{t("Librarian", language)}</option>
              <option value="Event Organizer">{t("Event Organizer", language)}</option>
              <option value="Data Analyst">{t("Data Analyst", language)}</option>
              <option value="Insurance Agent">{t("Insurance Agent", language)}</option>
              <option value="Call Center Executive">{t("Call Center Executive", language)}</option>
              <option value="Civil Engineer">{t("Civil Engineer", language)}</option>
              <option value="Mechanical Engineer">{t("Mechanical Engineer", language)}</option>
              <option value="Electrical Engineer">{t("Electrical Engineer", language)}</option>
              <option value="Software Tester">{t("Software Tester", language)}</option>
              <option value="Web Developer">{t("Web Developer", language)}</option>
              <option value="Graphic Designer">{t("Graphic Designer", language)}</option>
              <option value="Fashion Designer">{t("Fashion Designer", language)}</option>
              <option value="Interior Designer">{t("Interior Designer", language)}</option>
              <option value="Health Inspector">{t("Health Inspector", language)}</option>
              <option value="Physiotherapist">{t("Physiotherapist", language)}</option>
              <option value="Psychologist">{t("Psychologist", language)}</option>
              <option value="Veterinary Doctor">{t("Veterinary Doctor", language)}</option>
              <option value="Firefighter">{t("Firefighter", language)}</option>
              <option value="Immigration Officer">{t("Immigration Officer", language)}</option>
              <option value="Postman">{t("Postman", language)}</option>
              <option value="Delivery Boy">{t("Delivery Boy", language)}</option>
              <option value="Housekeeping Staff">{t("Housekeeping Staff", language)}</option>
              <option value="Cashier">{t("Cashier", language)}</option>
              <option value="Travel Agent">{t("Travel Agent", language)}</option>
              <option value="Tour Guide">{t("Tour Guide", language)}</option>
              <option value="IAS Officer">{t("IAS Officer", language)}</option>
              <option value="IPS Officer">{t("IPS Officer", language)}</option>
              <option value="Judge">{t("Judge", language)}</option>
              <option value="Advocate Assistant">{t("Advocate Assistant", language)}</option>
              <option value="Stenographer">{t("Stenographer", language)}</option>
              <option value="Typist">{t("Typist", language)}</option>
              <option value="HR Executive">{t("HR Executive", language)}</option>
              <option value="HR Manager">{t("HR Manager", language)}</option>
              <option value="Financial Analyst">{t("Financial Analyst", language)}</option>
              <option value="Stock Broker">{t("Stock Broker", language)}</option>
              <option value="Banker Assistant">{t("Banker Assistant", language)}</option>
              <option value="Loan Officer">{t("Loan Officer", language)}</option>
              <option value="Courier Service Staff">{t("Courier Service Staff", language)}</option>
              <option value="Call Technician">{t("Call Technician", language)}</option>
              <option value="AC Mechanic">{t("AC Mechanic", language)}</option>
              <option value="Auto Driver">{t("Auto Driver", language)}</option>
              <option value="Bus Conductor">{t("Bus Conductor", language)}</option>
              <option value="Bus Driver">{t("Bus Driver", language)}</option>
              <option value="Train Ticket Examiner">{t("Train Ticket Examiner", language)}</option>
              <option value="Railway Staff">{t("Railway Staff", language)}</option>
              <option value="Airport Ground Staff">{t("Airport Ground Staff", language)}</option>
              <option value="Cabin Crew">{t("Cabin Crew", language)}</option>
              <option value="Marine Engineer">{t("Marine Engineer", language)}</option>
              <option value="Ship Captain">{t("Ship Captain", language)}</option>
              <option value="Biologist">{t("Biologist", language)}</option>
              <option value="Chemist">{t("Chemist", language)}</option>
              <option value="Geologist">{t("Geologist", language)}</option>
              <option value="Lab Assistant">{t("Lab Assistant", language)}</option>
              <option value="Factory Worker">{t("Factory Worker", language)}</option>
              <option value="Entrepreneur">{t("Entrepreneur", language)}</option>
              <option value="Other">{t("Other", language)}</option>
            </select>
          </div>
          {form.occupationBusiness === "Other" && (
            <div className="edit-field-row">
              <label className="edit-field-label">{t("Other Occupation", language)}:</label>
              <TamilInput
                className="edit-field-input"
                name="otherOccupation"
                value={form.otherOccupation ?? ""}
                onChange={handleChange}
                placeholder={t("Other Occupation", language)}
                forcedLanguage={language}
              />
            </div>
          )}
        </div>
        <div className="edit-right-column">
          <div className="edit-field-row">
            <label className="edit-field-label">{t("Working Place", language)}:</label>
            <TamilInput
              className="edit-field-input"
              name="workingPlace"
              value={form.workingPlace ?? ""}
              onChange={handleChange}
              placeholder={t("Working Place", language)}
              forcedLanguage={language}
            />
          </div>
          <div className="edit-field-row">
            <label className="edit-field-label">{t("Work Details", language)}:</label>
            <TamilInput
              className="edit-field-input"
              name="workDetails"
              value={form.workDetails ?? ""}
              onChange={handleChange}
              placeholder={t("Work Details", language)}
              forcedLanguage={language}
            />
          </div>
          <div className="edit-field-row">
            <label className="edit-field-label">{t("Income (LPA)", language)}:</label>
            <input
              className="edit-field-input"
              type="number"
              name="income"
              value={form.income ?? ""}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>
      {error && <p className="edit-error-text">{error}</p>}
      <div className="edit-button-container">
        <button
          className="edit-detail-previous-button"
          onClick={async () => {
            await saveFormData(form); // Save before navigating
            router.push("/editdetail/1");
          }}
        >
          {t("Previous", language)}
        </button>
        <button className="edit-detail-button" onClick={next}>
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
