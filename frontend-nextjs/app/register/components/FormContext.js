"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

const defaultData = {
  name: "",
  email: "",
  phone: "",
  maritalStatus: "",
  fatherName: "",
  motherName: "",
  knownLanguages: "",
  yourTemple: "",
  yourDivision: "",
  reference: "",
  profileCreatedBy: "",
  password: "",
  confirmPassword: "",
  gender: "",
  fatherOccupation: "",
  motherOccupation: "",
  nativePlace: "",
  houseNameAddress: "",
  presentResidence: "",
  brothers: "",
  sisters: "",
  referredBy: "",
  referralDetails1Name: "",
  referralDetails1Phone: "",
  referralDetails1Address: "",
  referralDetails2Name: "",
  referralDetails2Phone: "",
  referralDetails2Address: "",
  educationQualification: "",
  otherEducation: "",
  occupationBusiness: "",
  otherOccupation: "",
  workingPlace: "",
  educationDetails: "",
  workDetails: "",
  incomeType: "",
  income: "",
  height: "",
  complexion: "",
  weight: "",
  diet: "",
  specialCases: "",
  specialCasesDetails: "",
  zodiacSign: "",
  ascendant: "",
  birthStar: "",
  Dosham: "",
  placeOfBirth: "",
  dateOfBirthYear: "",
  dateOfBirthMonth: "",
  dateOfBirthDay: "",
  timeOfBirthHours: "",
  timeOfBirthMinutes: "",
  timeOfBirthSeconds: "",
  DisaiType: "",
  disaiRemain: "",
  houses: Array.from({ length: 12 }, () => ""),
  planets: {
    sun: "",
    moon: "",
    mars: "",
    mercury: "",
    jupiter: "",
    venus: "",
    saturn: "",
    rahu: "",
    kethu: "",
  },
  phonePrimary: "",
  phoneAlternate: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  pincode: "",
  country: "",
  prefAgeFrom: "",
  prefAgeTo: "",
  prefHeightFrom: "",
  prefHeightTo: "",
  prefEducation: "",
  prefOccupation: "",
  prefLocation: "",
  updated: "",
};

const FormContext = createContext(null);

export const useForm = () => useContext(FormContext);

export function FormProvider({ children }) {
  const [formData, setFormData] = useState(defaultData);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("registerFormData");
      if (raw) {
        const parsed = JSON.parse(raw);
        setFormData((p) => ({ ...p, ...parsed }));
      }
    } catch (e) {
      console.warn("Failed to load saved form data", e);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem("registerFormData", JSON.stringify(formData));
    } catch (e) {
      console.warn("Failed to save form data", e);
    }
  }, [formData, loaded]);

  const update = (patch) => setFormData((p) => ({ ...p, ...patch }));
  const reset = () => {
    setFormData(defaultData);
    localStorage.removeItem("registerFormData");
  };

  return (
    <FormContext.Provider value={{ formData, update, reset }}>
      {children}
    </FormContext.Provider>
  );
}
