"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "../utils/config";

const styles = {
  container: {
    width: "100%",
    maxWidth: "1200px",
    height: "83vh",
    overflowY: "auto",
    background: "var(--card-bg)",
    boxShadow: "0 0 10px rgba(0,0,0,0.4)",
    textAlign: "center",
    fontFamily: '"Arial", sans-serif',
    color: "var(--card-text)",
    padding: "20px",
    borderRadius: "10px",
    margin: "20px auto",
  },
  title: {
    marginBottom: "10px",
    color: "var(--card-text)",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  formContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  input: {
    width: "90%",
    padding: "12px",
    margin: "10px 0",
    borderRadius: "6px",
    border: "1px solid var(--input-border)",
    background: "var(--input-bg)",
    color: "var(--input-text)",
    fontSize: "16px",
  },
  smallInput: {
    width: "85px",
    padding: "12px",
    margin: "10px 0px 10px 0px",
    borderRadius: "6px",
    border: "1px solid var(--input-border)",
    background: "var(--input-bg)",
    color: "var(--input-text)",
    fontSize: "14px",
  },
  error: {
    color: "var(--error-text)",
    marginTop: "5px",
    fontSize: "14px",
  },
  button: {
    width: "60%",
    padding: "12px 20px",
    margin: "0px 20px  0px 20px ",
    borderRadius: "8px",
    border: "none",
    background: "var(--button-bg)",
    color: "var(--button-text)",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
  button1: {
    width: "600px",
    padding: "12px 20px",
    margin: "10px 30px 0 0",
    borderRadius: "8px",
    border: "none",
    background: "var(--button-bg)",
    color: "var(--button-text)",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
  previousButton: {
    width: "60%",
    padding: "12px 20px",
    margin: "10px  ",
    borderRadius: "8px",
    border: "none",
    background: "#6c757d",
    color: "#fff",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
};

// Suppress hydration warnings for this component
const useHydrated = () => {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);
  return hydrated;
};

export default function RegisterStep({ params }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const step = parseInt(unwrappedParams.step);
  const hydrated = useHydrated();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    maritalStatus: "",
    // dateOfBirth removed from step 1
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
    updated: "",
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
    referralSource: "",
    referralCode: "",
    additionalInfo: "",
    diet: "",
    specialCases: "",
    height: "",
    complexion: "",
    weight: "",
    specialCasesDetails: "",
    educationQualification: "",
    occupationBusiness: "",
    workingPlace: "",
    educationDetails: "",
    workDetails: "",
    income: "",
    incomeType: "",
    otherEducation: "",
    otherOccupation: "",
    zodiacSign: "",
    ascendant: "",
    birthStar: "",
    affliction: "",
    placeOfBirth: "",
    disaiRemain: "",
    sooriyan: "",
    chandiran: "",
    sevai: "",
    budhan: "",
    viyazhan: "",
    sukkiran: "",
    sani: "",
    rahu: "",
    kethu: "",
    maanthi: "",
    lagnam: "",
    selectedRasi: "",
  });
  const [error, setError] = useState("");

  // Helper function to sanitize saved form data to ensure all keys have defined string values
  const sanitizeFormData = (data) => {
    const sanitized = {};
    for (const key in formData) {
      sanitized[key] =
        data && data[key] !== undefined && data[key] !== null
          ? String(data[key])
          : "";
    }
    return sanitized;
  };

  useEffect(() => {
    if (isNaN(step) || step < 1 || step > 7) {
      router.push("/register/1");
      return;
    }
    const savedData = localStorage.getItem("registerFormData");
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      const sanitizedData = sanitizeFormData(parsedData);
      setFormData((prevData) => ({ ...prevData, ...sanitizedData }));
    }
  }, [step, router]);

  if (isNaN(step) || step < 1 || step > 7) {
    return null;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const newData = { ...formData, [name]: value };
    setFormData(newData);
    localStorage.setItem("registerFormData", JSON.stringify(newData));
  };

  const handleTimeOfBirthChange = (e) => {
    const { name, value } = e.target;
    const newData = { ...formData, [name]: value };
    setFormData(newData);
    localStorage.setItem("registerFormData", JSON.stringify(newData));
  };

  const validateForm = () => {
    if (!formData.name.trim()) return "Name is required";
    if (!formData.email.trim()) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) return "Invalid email format";
    if (!formData.password.trim()) return "Password is required";
    if (!formData.confirmPassword.trim()) return "Confirm Password is required";
    if (formData.password !== formData.confirmPassword)
      return "Passwords do not match";
    // Add more validations as needed
    return "";
  };

  const handleNext = () => {
    if (step === 1) {
      const validationError = validateForm();
      if (validationError) {
        setError(validationError);
        return;
      }
      setError("");
    }
    if (step < 8) {
      router.push(`/register/${step + 1}`);
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      router.push(`/register/${step - 1}`);
    }
  };

  const handleRegister = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");

    const res = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    alert(data.message);

    if (data.success) {
      //localStorage.removeItem("registerFormData");
      localStorage.clear();
      router.push("/login");
    }
  };

  const handleStepClick = (newStep) => {
    if (newStep <= 8) {
      router.push(`/register/${newStep}`);
    }
  };

  const rasiNames = [
    "மேஷம்",
    "ரிஷபம்",
    "மிதுனம்",
    "கடகம்",
    "சிம்மம்",
    "கன்னி",
    "துலாம்",
    "விருச்சிகம்",
    "தனுசு",
    "மகரம்",
    "கும்பம்",
    "மீனம்",
  ];

  const getRasi = (house, selectedRasi) => {
    if (!selectedRasi) return house;
    if (house === "rasi") return rasiNames[selectedRasi - 1];
    return rasiNames[(selectedRasi - 1 + house - 1) % 12];
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        background: "var(--page-bg)",
      }}
      className="register-page"
    >
      {/* <nav
        style={{
          width: "100%",
          padding: "10px 20px",
          background: "var(--card-bg)",
          boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2 style={{ color: "var(--card-text)", margin: 0 }}>Registration</h2>
        <div>
          <a
            href="/"
            style={{
              color: "var(--link-color)",
              textDecoration: "none",
              marginRight: "15px",
            }}
          >
            Home
          </a>
          <a
            href="/login"
            style={{
              color: "var(--link-color)",
              textDecoration: "none",
            }}
          >
            Login
          </a>
        </div>
      </nav> */}
      <style>
        {`
          .register-page::-webkit-scrollbar {
            display: none;
          }
          .register-page {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .register-container::-webkit-scrollbar {
            width: 8px;
          }
          .register-container::-webkit-scrollbar-track {
            background: #f1f1f1;
          }
          .register-container::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 4px;
          }
          .register-container::-webkit-scrollbar-thumb:hover {
            background: #555;
          }
          .register-container {
            -ms-overflow-style: auto;
            scrollbar-width: auto;
          }
          .form-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            width: 100%;
          }
          .form-column {
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .navigation {
            display: flex;
            justify-content: center;
            gap: 10px;
            margin-bottom: 20px;
          }
          .nav-step {
            width: 30px;
            height: 30px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            background: var(--input-bg);
            color: var(--input-text);
            border: 2px solid var(--input-border);
            font-size: 12px;
          }
          .nav-step.active {
            background: var(--button-bg);
            color: var(--button-text);
            border-color: var(--button-bg);
          }
          h1 {
            font-size: 24px;
          }
          @media (max-width: 768px) {
            h1 {
              font-size: 18px;
            }
            .form-grid {
              grid-template-columns: 1fr;
            }
            .register-container {
              margin: 20px;
            }
            .formContainer {
              align-items: flex-start;
            }
            button {
              width: 90% !important;
              margin-left: auto;
              margin-right: 0;
            }
          }
        `}
      </style>
      <div style={styles.container} className="register-container">
        <h1 style={styles.title}>Register - Step {step} of 7</h1>
        <div className="navigation">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
            <div
              key={s}
              className={`nav-step ${s === step ? "active" : ""}`}
              onClick={() => handleStepClick(s)}
            >
              {s}
            </div>
          ))}
        </div>
        {step === 1 ? (
          <div style={styles.form}>
            <h2
              style={{
                fontSize: "18px",
                color: "var(--card-text)",
                marginBottom: "20px",
              }}
            >
              Basic Information
            </h2>
            <div className="form-grid">
              <div className="form-column">
                <input
                  style={styles.input}
                  type="text"
                  name="name"
                  placeholder="Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
                <select
                  style={styles.input}
                  name="maritalStatus"
                  value={formData.maritalStatus}
                  onChange={handleInputChange}
                >
                  <option value="">Select Marital Status</option>
                  <option value="unmarried">Unmarried</option>
                  <option value="widow">Widow</option>
                  <option value="divorced">Divorced</option>
                  <option value="widower">Widower</option>
                </select>
                {/* Removed dateOfBirth input from step 1 */}
                <input
                  style={styles.input}
                  type="text"
                  name="fatherName"
                  placeholder="Father Name"
                  value={formData.fatherName}
                  onChange={handleInputChange}
                />
                <input
                  style={styles.input}
                  type="text"
                  name="fatherOccupation"
                  placeholder="Father Occupation / Business"
                  value={formData.fatherOccupation}
                  onChange={handleInputChange}
                />
                <input
                  style={styles.input}
                  type="text"
                  name="motherName"
                  placeholder="Mother Name"
                  value={formData.motherName}
                  onChange={handleInputChange}
                />
                <input
                  style={styles.input}
                  type="text"
                  name="motherOccupation"
                  placeholder="Mother Occupation / Business"
                  value={formData.motherOccupation}
                  onChange={handleInputChange}
                />
                <select
                  style={styles.input}
                  name="brothers"
                  value={formData.brothers}
                  onChange={handleInputChange}
                >
                  <option value="">Select Number of Brothers</option>
                  <option value="0">0</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                  <option value="6">6</option>
                  <option value="7">7</option>
                  <option value="8">8</option>
                  <option value="9">9</option>
                  <option value="10">10</option>
                </select>
                <select
                  style={styles.input}
                  name="sisters"
                  value={formData.sisters}
                  onChange={handleInputChange}
                >
                  <option value="">Select Number of Sisters</option>
                  <option value="0">0</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                  <option value="6">6</option>
                  <option value="7">7</option>
                  <option value="8">8</option>
                  <option value="9">9</option>
                  <option value="10">10</option>
                </select>
                <input
                  style={styles.input}
                  type="text"
                  name="knownLanguages"
                  placeholder="Known Languages"
                  value={formData.knownLanguages}
                  onChange={handleInputChange}
                />
                <select
                  style={styles.input}
                  name="yourTemple"
                  value={formData.yourTemple}
                  onChange={handleInputChange}
                >
                  <option value="">Select Your Temple</option>
                  <option value="Nemam Kovil">Nemam Kovil</option>
                  <option value="Ilayatrangudi">Ilayatrangudi</option>
                  <option value="Iluppakudi">Iluppakudi</option>
                  <option value="Iraniyur">Iraniyur</option>
                  <option value="Mathur">Mathur</option>
                  <option value="Pillaiyarpatti">Pillaiyarpatti</option>
                  <option value="Soorakudi">Soorakudi</option>
                  <option value="Vairavan Koil">Vairavan Koil</option>
                  <option value="Velangudi">Velangudi</option>
                </select>
                <input
                  style={styles.input}
                  type="text"
                  name="yourDivision"
                  placeholder="Your Division"
                  value={formData.yourDivision}
                  onChange={handleInputChange}
                />
                <input
                  style={styles.input}
                  type="text"
                  name="reference"
                  placeholder="Reference – NMS Group/Branch No."
                  value={formData.reference}
                  onChange={handleInputChange}
                />
                <select
                  style={styles.input}
                  name="profileCreatedBy"
                  value={formData.profileCreatedBy}
                  onChange={handleInputChange}
                >
                  <option value="">Select Profile Created By</option>
                  <option value="Self">Self</option>
                  <option value="Parents">Parents</option>
                  <option value="Brother">Brother</option>
                  <option value="Sister">Sister</option>
                  <option value="Friend">Friend</option>
                  <option value="Brother in Law">Brother in Law</option>
                  <option value="Sister in Law">Sister in Law</option>
                  <option value="Uncle">Uncle</option>
                  <option value="Mama">Mama</option>
                  <option value="Athtai">Athtai</option>
                  <option value="Chithi">Chithi</option>
                  <option value="Chithtappa">Chithtappa</option>
                  <option value="Periyamma">Periyamma</option>
                  <option value="Periyappa">Periyappa</option>
                </select>
                <input
                  style={styles.input}
                  type="text"
                  name="referredBy"
                  placeholder="Referred By"
                  value={formData.referredBy}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-column">
                <input
                  style={styles.input}
                  type="password"
                  name="password"
                  placeholder="Create Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
                <input
                  style={styles.input}
                  type="email"
                  name="email"
                  placeholder="EMAIL"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$"
                />
                <select
                  style={styles.input}
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
                <input
                  style={styles.input}
                  type="text"
                  name="nativePlace"
                  placeholder="Native Place with Pincode"
                  value={formData.nativePlace}
                  onChange={handleInputChange}
                />
                <input
                  style={styles.input}
                  type="text"
                  name="houseNameAddress"
                  placeholder="House Name / House Nickname"
                  value={formData.houseNameAddress}
                  onChange={handleInputChange}
                />
                <input
                  style={styles.input}
                  type="text"
                  name="presentResidence"
                  placeholder="Present Residence"
                  value={formData.presentResidence}
                  onChange={handleInputChange}
                />
                <h3
                  style={{
                    margin: "21px 0 20px 0",
                    color: "var(--card-text)",
                    fontSize: "20px",
                  }}
                >
                  Referral Details 1
                </h3>
                <input
                  style={styles.input}
                  type="text"
                  name="referralDetails1Name"
                  placeholder="Referral Name"
                  value={formData.referralDetails1Name}
                  onChange={handleInputChange}
                />
                <input
                  style={styles.input}
                  type="tel"
                  name="referralDetails1Phone"
                  placeholder="Referral Phone"
                  value={formData.referralDetails1Phone}
                  onChange={handleInputChange}
                  maxLength="10"
                />
                <input
                  style={styles.input}
                  type="text"
                  name="referralDetails1Address"
                  placeholder="Referral Address"
                  value={formData.referralDetails1Address}
                  onChange={handleInputChange}
                />
                <h3
                  style={{
                    margin: "10px 0 15px 0",
                    color: "var(--card-text)",
                    fontSize: "20px",
                  }}
                >
                  Referral Details 2
                </h3>
                <input
                  style={styles.input}
                  type="text"
                  name="referralDetails2Name"
                  placeholder="Referral Name"
                  value={formData.referralDetails2Name}
                  onChange={handleInputChange}
                />
                <input
                  style={styles.input}
                  type="tel"
                  name="referralDetails2Phone"
                  placeholder="Referral Phone"
                  value={formData.referralDetails2Phone}
                  onChange={handleInputChange}
                  maxLength="10"
                />
                <input
                  style={styles.input}
                  type="text"
                  name="referralDetails2Address"
                  placeholder="Referral Address"
                  value={formData.referralDetails2Address}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            {error && <p style={styles.error}>{error}</p>}
            <div
              className="button-container"
              style={{
                display: "flex",
                justifyContent: "flex-end",
                width: "100%",
              }}
            >
              {step > 1 && (
                <button style={styles.previousButton} onClick={handlePrevious}>
                  Previous
                </button>
              )}
              <button style={styles.button1} onClick={handleNext}>
                Next
              </button>
            </div>
          </div>
        ) : step === 2 ? (
          <div style={styles.form}>
            <h2
              style={{
                fontSize: "18px",
                color: "var(--card-text)",
                marginBottom: "20px",
              }}
            >
              Education and Occupation
            </h2>
            <div className="form-grid">
              <div className="form-column">
                <select
                  style={styles.input}
                  name="educationQualification"
                  value={formData.educationQualification}
                  onChange={handleInputChange}
                >
                  <option value="">Select Education Qualification</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Medicine (Doctor)">Medicine (Doctor)</option>
                  <option value="M.C.A.">M.C.A.</option>
                  <option value="Μ.Β.Α.">Μ.Β.Α.</option>
                  <option value="Law Graduate">Law Graduate</option>
                  <option value="Graduate">Graduate</option>
                  <option value="Graduate with Computer Applications">
                    Graduate with Computer Applications
                  </option>
                  <option value="Graudate with Teacher Training">
                    Graudate with Teacher Training
                  </option>
                  <option value="Post Graduate">Post Graduate</option>
                  <option value="Post Graduate with Computer Applications">
                    Post Graduate with Computer Applications
                  </option>
                  <option value="Post Graduate with Teacher Training">
                    Post Graduate with Teacher Training
                  </option>
                  <option value="Teacher Training">Teacher Training</option>
                  <option value="B.Pharm">B.Pharm</option>
                  <option value="B.Tech">B.Tech</option>
                  <option value="B.Sc. Nursing">B.Sc. Nursing</option>
                  <option value="D.Pharm">D.Pharm</option>
                  <option value="Diploma">Diploma</option>
                  <option value="Higher Secondary/ S.S.L.C.">
                    Higher Secondary/ S.S.L.C.
                  </option>
                  <option value="Below S.S.L.C">Below S.S.L.C</option>
                  <option value="Others">Others</option>
                </select>
                {formData.educationQualification === "Others" && (
                  <input
                    style={styles.input}
                    type="text"
                    name="otherEducation"
                    placeholder="Specify Other Education"
                    value={formData.otherEducation}
                    onChange={handleInputChange}
                  />
                )}
                <select
                  style={styles.input}
                  name="occupationBusiness"
                  value={formData.occupationBusiness}
                  onChange={handleInputChange}
                >
                  <option value="">Select Occupation / Business</option>
                  <option value="Teacher">Teacher</option>
                  <option value="Doctor">Doctor</option>
                  <option value="Engineer">Engineer</option>
                  <option value="Lawyer">Lawyer</option>
                  <option value="Nurse">Nurse</option>
                  <option value="Police Officer">Police Officer</option>
                  <option value="Accountant">Accountant</option>
                  <option value="Farmer">Farmer</option>
                  <option value="Software Developer">Software Developer</option>
                  <option value="Electrician">Electrician</option>
                  <option value="Plumber">Plumber</option>
                  <option value="Carpenter">Carpenter</option>
                  <option value="Driver">Driver</option>
                  <option value="Shopkeeper">Shopkeeper</option>
                  <option value="Businessman">Businessman</option>
                  <option value="Chef / Cook">Chef / Cook</option>
                  <option value="Waiter">Waiter</option>
                  <option value="Mechanic">Mechanic</option>
                  <option value="Tailor">Tailor</option>
                  <option value="Barber">Barber</option>
                  <option value="Scientist">Scientist</option>
                  <option value="Professor">Professor</option>
                  <option value="Architect">Architect</option>
                  <option value="Banker">Banker</option>
                  <option value="Journalist">Journalist</option>
                  <option value="Photographer">Photographer</option>
                  <option value="Designer">Designer</option>
                  <option value="Marketing Executive">
                    Marketing Executive
                  </option>
                  <option value="Salesman">Salesman</option>
                  <option value="Receptionist">Receptionist</option>
                  <option value="Clerk">Clerk</option>
                  <option value="Manager">Manager</option>
                  <option value="Technician">Technician</option>
                  <option value="Pharmacist">Pharmacist</option>
                  <option value="Dentist">Dentist</option>
                  <option value="Lab Technician">Lab Technician</option>
                  <option value="Security Guard">Security Guard</option>
                  <option value="Real Estate Agent">Real Estate Agent</option>
                  <option value="Cleaner">Cleaner</option>
                  <option value="Mason">Mason</option>
                  <option value="Painter">Painter</option>
                  <option value="Welder">Welder</option>
                  <option value="Pilot">Pilot</option>
                  <option value="Soldier">Soldier</option>
                  <option value="Social Worker">Social Worker</option>
                  <option value="Librarian">Librarian</option>
                  <option value="Event Organizer">Event Organizer</option>
                  <option value="Data Analyst">Data Analyst</option>
                  <option value="Insurance Agent">Insurance Agent</option>
                  <option value="Call Center Executive">
                    Call Center Executive
                  </option>
                  <option value="Civil Engineer">Civil Engineer</option>
                  <option value="Mechanical Engineer">
                    Mechanical Engineer
                  </option>
                  <option value="Electrical Engineer">
                    Electrical Engineer
                  </option>
                  <option value="Software Tester">Software Tester</option>
                  <option value="Web Developer">Web Developer</option>
                  <option value="Graphic Designer">Graphic Designer</option>
                  <option value="Fashion Designer">Fashion Designer</option>
                  <option value="Interior Designer">Interior Designer</option>
                  <option value="Health Inspector">Health Inspector</option>
                  <option value="Physiotherapist">Physiotherapist</option>
                  <option value="Psychologist">Psychologist</option>
                  <option value="Veterinary Doctor">Veterinary Doctor</option>
                  <option value="Firefighter">Firefighter</option>
                  <option value="Immigration Officer">
                    Immigration Officer
                  </option>
                  <option value="Postman">Postman</option>
                  <option value="Delivery Boy">Delivery Boy</option>
                  <option value="Housekeeping Staff">Housekeeping Staff</option>
                  <option value="Cashier">Cashier</option>
                  <option value="Travel Agent">Travel Agent</option>
                  <option value="Tour Guide">Tour Guide</option>
                  <option value="IAS Officer">IAS Officer</option>
                  <option value="IPS Officer">IPS Officer</option>
                  <option value="Judge">Judge</option>
                  <option value="Advocate Assistant">Advocate Assistant</option>
                  <option value="Stenographer">Stenographer</option>
                  <option value="Typist">Typist</option>
                  <option value="HR Executive">HR Executive</option>
                  <option value="HR Manager">HR Manager</option>
                  <option value="Financial Analyst">Financial Analyst</option>
                  <option value="Stock Broker">Stock Broker</option>
                  <option value="Banker Assistant">Banker Assistant</option>
                  <option value="Loan Officer">Loan Officer</option>
                  <option value="Courier Service Staff">
                    Courier Service Staff
                  </option>
                  <option value="Call Technician">Call Technician</option>
                  <option value="AC Mechanic">AC Mechanic</option>
                  <option value="Auto Driver">Auto Driver</option>
                  <option value="Bus Conductor">Bus Conductor</option>
                  <option value="Bus Driver">Bus Driver</option>
                  <option value="Train Ticket Examiner">
                    Train Ticket Examiner
                  </option>
                  <option value="Railway Staff">Railway Staff</option>
                  <option value="Airport Ground Staff">
                    Airport Ground Staff
                  </option>
                  <option value="Cabin Crew">Cabin Crew</option>
                  <option value="Marine Engineer">Marine Engineer</option>
                  <option value="Ship Captain">Ship Captain</option>
                  <option value="Biologist">Biologist</option>
                  <option value="Chemist">Chemist</option>
                  <option value="Geologist">Geologist</option>
                  <option value="Lab Assistant">Lab Assistant</option>
                  <option value="Factory Worker">Factory Worker</option>
                  <option value="Entrepreneur">Entrepreneur</option>
                  <option value="Other">Other</option>
                </select>
                {formData.occupationBusiness === "Other" && (
                  <input
                    style={styles.input}
                    type="text"
                    name="otherOccupation"
                    placeholder="Specify Other Occupation"
                    value={formData.otherOccupation}
                    onChange={handleInputChange}
                  />
                )}
                <input
                  style={styles.input}
                  type="text"
                  name="workingPlace"
                  placeholder="Working Place"
                  value={formData.workingPlace}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-column">
                <input
                  style={styles.input}
                  type="text"
                  name="educationDetails"
                  placeholder="Education Detail / Education History"
                  value={formData.educationDetails}
                  onChange={handleInputChange}
                />
                <input
                  style={styles.input}
                  type="text"
                  name="workDetails"
                  placeholder="Work Details"
                  value={formData.workDetails}
                  onChange={handleInputChange}
                />
                <select
                  style={styles.input}
                  name="incomeType"
                  value={formData.incomeType}
                  onChange={handleInputChange}
                >
                  <option value="">Select Income Type</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Annual">Annual</option>
                </select>
                <input
                  style={styles.input}
                  type="number"
                  name="income"
                  placeholder={
                    formData.incomeType === "Annual"
                      ? "Annual Income (LPA)"
                      : "Monthly Income"
                  }
                  value={formData.income}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            {error && <p style={styles.error}>{error}</p>}
            <div className="button-container">
              {step > 1 && (
                <button style={styles.previousButton} onClick={handlePrevious}>
                  Previous
                </button>
              )}
              <button style={styles.button} onClick={handleNext}>
                Next
              </button>
            </div>
          </div>
        ) : step === 3 ? (
          <div style={styles.form}>
            <h2
              style={{
                fontSize: "18px",
                color: "var(--card-text)",
                marginBottom: "20px",
              }}
            >
              PhysicalAttributes
            </h2>
            <div className="form-grid">
              <div className="form-column">
                <select
                  style={styles.input}
                  name="height"
                  value={formData.height}
                  onChange={handleInputChange}
                >
                  <option value="">Select Height</option>
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
                  value={formData.complexion}
                  onChange={handleInputChange}
                >
                  <option value="">Select Complexion</option>
                  <option value="Fair red / Bright red (nalla sivappu)">
                    Fair red / Bright red (nalla sivappu)
                  </option>
                  <option value="Red (sivappu)">Red (sivappu)</option>
                  <option value="Wheatish (maaniram)">
                    Wheatish (maaniram)
                  </option>
                  <option value="Black (karuppu)">Black (karuppu)</option>
                </select>
                <select
                  style={styles.input}
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                >
                  <option value="">Select Weight</option>
                  {Array.from({ length: 106 }, (_, i) => 25 + i).map((kg) => (
                    <option key={kg} value={`${kg} kg`}>
                      {kg} kg
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-column">
                <select
                  style={styles.input}
                  name="diet"
                  value={formData.diet}
                  onChange={handleInputChange}
                >
                  <option value="">Select Diet</option>
                  <option value="Vegetarian">Vegetarian</option>
                  <option value="Non-Vegetarian">Non-Vegetarian</option>
                </select>
                <select
                  style={styles.input}
                  name="specialCases"
                  value={formData.specialCases}
                  onChange={handleInputChange}
                >
                  <option value="">Select Special Cases (Disability)</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
                <input
                  style={styles.input}
                  type="text"
                  name="specialCasesDetails"
                  placeholder="Special Cases Details"
                  value={formData.specialCasesDetails}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="button-container">
              {step > 1 && (
                <button style={styles.previousButton} onClick={handlePrevious}>
                  Previous
                </button>
              )}
              <button style={styles.button} onClick={handleNext}>
                Next
              </button>
            </div>
          </div>
        ) : step === 4 ? (
          <div style={styles.form}>
            <h2
              style={{
                fontSize: "18px",
                color: "var(--card-text)",
                marginBottom: "20px",
              }}
            >
              Horoscope / Astrology Details
            </h2>
            <div className="form-grid">
              <div className="form-column">
                <select
                  style={styles.input}
                  name="zodiacSign"
                  value={formData.zodiacSign}
                  onChange={handleInputChange}
                >
                  <option value="">Select Zodiac Sign (Rasi)</option>
                  <option value="Mesham">Mesham (மேஷம்)</option>
                  <option value="Rishabam">Rishabam (ரிஷபம்)</option>
                  <option value="Mithunam">Mithunam (மிதுனம்)</option>
                  <option value="Kadagam">Kadagam (கடகம்)</option>
                  <option value="Simmam">Simmam (சிம்மம்)</option>
                  <option value="Kanni">Kanni (கன்னி)</option>
                  <option value="Thulam">Thulam (துலாம்)</option>
                  <option value="Viruchigam">Viruchigam (விருச்சிகம்)</option>
                  <option value="Dhanusu">Dhanusu (தனுசு)</option>
                  <option value="Magaram">Magaram (மகரம்)</option>
                  <option value="Kumbam">Kumbam (கும்பம்)</option>
                  <option value="Meenam">Meenam (மீனம்)</option>
                </select>
                <select
                  style={styles.input}
                  name="ascendant"
                  value={formData.ascendant}
                  onChange={handleInputChange}
                >
                  <option value="">Select Ascendant (Lagnam)</option>
                  <option value="Mesham">Mesham (மேஷம்)</option>
                  <option value="Rishabam">Rishabam (ரிஷபம்)</option>
                  <option value="Mithunam">Mithunam (மிதுனம்)</option>
                  <option value="Kadagam">Kadagam (கடகம்)</option>
                  <option value="Simmam">Simmam (சிம்மம்)</option>
                  <option value="Kanni">Kanni (கன்னி)</option>
                  <option value="Thulam">Thulam (துலாம்)</option>
                  <option value="Viruchigam">Viruchigam (விருச்சிகம்)</option>
                  <option value="Dhanusu">Dhanusu (தனுசு)</option>
                  <option value="Magaram">Magaram (மகரம்)</option>
                  <option value="Kumbam">Kumbam (கும்பம்)</option>
                  <option value="Meenam">Meenam (மீனம்)</option>
                </select>
                <select
                  style={styles.input}
                  name="birthStar"
                  value={formData.birthStar}
                  onChange={handleInputChange}
                >
                  <option value="">Select Birth Star (Natchathiram)</option>
                  <option value="Ashwini">Ashwini (அஸ்வினி)</option>
                  <option value="Bharani">Bharani (பாரணி)</option>
                  <option value="Karthigai">Karthigai (கார்த்திகை)</option>
                  <option value="Rohini">Rohini (ரோகிணி)</option>
                  <option value="Mirugaseerisham">
                    Mirugaseerisham (மிருகசீரிஷம்)
                  </option>
                  <option value="Thiruvathirai">
                    Thiruvathirai (திருவாதிரை)
                  </option>
                  <option value="Punarpoosam">Punarpoosam (புனர்பூசம்)</option>
                  <option value="Poosam">Poosam (பூசம்)</option>
                  <option value="Ayilyam">Ayilyam (ஆயிலியம்)</option>
                  <option value="Magam">Magam (மகம்)</option>
                  <option value="Pooram">Pooram (பூரம்)</option>
                  <option value="Uthiram">Uthiram (உத்திரம்)</option>
                  <option value="Hastham">Hastham (ஹஸ்தம்)</option>
                  <option value="Chithirai">Chithirai (சித்திரை)</option>
                  <option value="Swathi">Swathi (சுவாதி)</option>
                  <option value="Visakam">Visakam (விசாகம்)</option>
                  <option value="Anusham">Anusham (அனுஷம்)</option>
                  <option value="Kettai">Kettai (கேட்டை)</option>
                  <option value="Moolam">Moolam (மூலம்)</option>
                  <option value="Pooradam">Pooradam (புறாடம்)</option>
                  <option value="Uthiradam">Uthiradam (உத்திராடம்)</option>
                  <option value="Thiruvonam">Thiruvonam (திருவோணம்)</option>
                  <option value="Avittam">Avittam (அவிட்டம்)</option>
                  <option value="Sadhayam">Sadhayam (சதயம்)</option>
                  <option value="Poorattathi">Poorattathi (பூரட்டாதி)</option>
                  <option value="Uthirattathi">
                    Uthirattathi (உத்திரட்டாதி)
                  </option>
                  <option value="Revathi">Revathi (ரேவதி)</option>
                </select>
                <input
                  style={styles.input}
                  type="text"
                  name="affliction"
                  placeholder="Dosham"
                  value={formData.affliction}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-column">
                <input
                  style={styles.input}
                  type="text"
                  name="placeOfBirth"
                  placeholder="Place of Birth"
                  value={formData.placeOfBirth}
                  onChange={handleInputChange}
                />
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "10px",
                    width: "100%",
                  }}
                >
                  <label
                    style={{
                      marginLeft: "30px",
                      color: "var(--card-text)",
                      fontSize: "17px",
                      whiteSpace: "nowrap",
                    }}
                    htmlFor="dateOfBirth"
                  >
                    Date of Birth :
                  </label>
                  <select
                    style={styles.smallInput}
                    name="dateOfBirthYear"
                    value={formData.dateOfBirthYear}
                    onChange={handleInputChange}
                  >
                    <option value="">YYYY</option>
                    {Array.from(
                      { length: new Date().getFullYear() - 1920 + 1 },
                      (_, i) => 1920 + i
                    )
                      .reverse()
                      .map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                  </select>
                  <select
                    style={styles.smallInput}
                    name="dateOfBirthMonth"
                    value={formData.dateOfBirthMonth}
                    onChange={handleInputChange}
                  >
                    <option value="">MM</option>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(
                      (month) => (
                        <option
                          key={month}
                          value={month.toString().padStart(2, "0")}
                        >
                          {month.toString().padStart(2, "0")}
                        </option>
                      )
                    )}
                  </select>
                  <select
                    style={styles.smallInput}
                    name="dateOfBirthDay"
                    value={formData.dateOfBirthDay}
                    onChange={handleInputChange}
                  >
                    <option value="">DD</option>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                      <option key={day} value={day.toString().padStart(2, "0")}>
                        {day.toString().padStart(2, "0")}
                      </option>
                    ))}
                  </select>
                </div>
                <div
                  style={{
                    marginLeft: "-60px",
                    display: "flex",
                    gap: "8px",
                    alignItems: "center",
                  }}
                >
                  <label
                    style={{ color: "var(--card-text)", fontSize: "17px" }}
                  >
                    Time of Birth :
                  </label>
                  <input
                    style={{ ...styles.input, width: "60px" }}
                    type="text"
                    name="timeOfBirthHours"
                    placeholder="HH"
                    maxLength="2"
                    value={formData.timeOfBirthHours}
                    onChange={handleTimeOfBirthChange}
                  />
                  <span style={{ color: "var(--card-text)" }}>:</span>
                  <input
                    style={{ ...styles.input, width: "60px" }}
                    type="text"
                    name="timeOfBirthMinutes"
                    placeholder="MM"
                    maxLength="2"
                    value={formData.timeOfBirthMinutes}
                    onChange={handleTimeOfBirthChange}
                  />
                  <span style={{ color: "var(--card-text)" }}>:</span>
                  <input
                    style={{ ...styles.input, width: "60px" }}
                    type="text"
                    name="timeOfBirthSeconds"
                    placeholder="SS"
                    maxLength="2"
                    value={formData.timeOfBirthSeconds}
                    onChange={handleTimeOfBirthChange}
                  />
                </div>
                <select
                  style={styles.input}
                  name="periodType"
                  value={formData.periodType}
                  onChange={handleInputChange}
                >
                  <option value="">Disai Type</option>
                  <option value="Surya Maga Disai">
                    Surya Maga Disai (சூரிய மகா திசை)
                  </option>
                  <option value="Chandhira Maga Disai">
                    Chandhira Maga Disai (சந்திர மகா திசை)
                  </option>
                  <option value="Sevvaai Maga Disai">
                    Sevvaai Maga Disai (செவ்வாய் மகா திசை)
                  </option>
                  <option value="Budhan Maga Disai">
                    Budhan Maga Disai (புதன் மகா திசை)
                  </option>
                  <option value="Viyaazha Maga Disai">
                    Viyaazha Maga Disai (வியாழ மகா திசை)
                  </option>
                  <option value="Sukkran Maga Disai">
                    Sukkran Maga Disai (சுக்கிர மகா திசை)
                  </option>
                  <option value="Sani Maga Disai">
                    Sani Maga Disai (சனி மகா திசை)
                  </option>
                  <option value="Raagu Maga Disai">
                    Raagu Maga Disai (ராகு மகா திசை)
                  </option>
                  <option value="Kethu Maga Disai">
                    Kethu Maga Disai (கேது மகா திசை)
                  </option>
                </select>
                <select
                  style={{ ...styles.input, marginTop: "10px" }}
                  name="disaiRemain"
                  value={formData.disaiRemain}
                  onChange={handleInputChange}
                >
                  <option value=""> Disai remain years</option>
                  {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="button-container">
              {step > 1 && (
                <button style={styles.previousButton} onClick={handlePrevious}>
                  Previous
                </button>
              )}
              <button style={styles.button} onClick={handleNext}>
                Next
              </button>
            </div>
          </div>
        ) : (
          <div style={styles.formContainer}>
            <p style={{ color: "var(--card-text)", fontSize: "18px" }}>
              Step {step} - Please proceed to the next step.
            </p>
            <div className="button-container">
              {step > 1 && (
                <button style={styles.previousButton} onClick={handlePrevious}>
                  Previous
                </button>
              )}
              <button style={styles.button} onClick={handleNext}>
                Next
              </button>
            </div>
          </div>
        )}
        <p
          style={{
            marginTop: "15px",
            fontSize: "14px",
            color: "var(--card-text)",
          }}
        >
          Already have an account?{" "}
          <a
            href="/login"
            style={{ color: "var(--link-color)", textDecoration: "none" }}
          >
            Login
          </a>
        </p>
      </div>
    </div>
  );
}
