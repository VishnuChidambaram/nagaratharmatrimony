"use client";

import { useState, useEffect } from "react";
import { en } from "./locales/en";
import { ta } from "./locales/ta";
import TamilInput from "@/app/components/TamilInput";
import { useLanguage } from "@/app/hooks/useLanguage";
import { API_URL } from "@/app/utils/config";


export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  // showPassword states removed as TamilInput handles it internally
  const [step, setStep] = useState(1); // 1: email, 2: otp, 3: new password
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [otpSent, setOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  const { language, toggleLanguage } = useLanguage();
  const t = language === "en" ? en : ta;

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleToggleLanguage = () => {
    const newLang = language === "en" ? "ta" : "en";
    toggleLanguage(newLang);
  };

  const handleSendOtp = async () => {
    if (!email) {
      setError(t.errorMissingEmail);
      return;
    }

    if (cooldown > 0) return;
    setIsSendingOtp(true);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(t.errorInvalidEmail);
      return;
    }

    setError("");
    setMessage("");

    const res = await fetch(`${API_URL}/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    if (data.success) {
      setMessage(data.message);
      setStep(2);
      setCooldown(60);
      setOtpSent(true);
    } else {
      setError(data.message);
    }
    setIsSendingOtp(false);
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      setError(t.errorMissingOtp);
      return;
    }

    setError("");
    setMessage("");

    const res = await fetch(`${API_URL}/verify-reset-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, otp }),
    });

    const data = await res.json();
    if (data.success) {
      setMessage(data.message);
      setStep(3);
    } else {
      setError(data.message);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      setError(t.errorMissingAll);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t.errorMismatch);
      return;
    }

    setError("");
    setMessage("");

    const res = await fetch(`${API_URL}/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, newPassword }),
    });

    const data = await res.json();
    if (data.success) {
      alert(data.message);
      window.location.href = "/login";
    } else {
      setError(data.message);
    }
  };

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
        background: "var(--page-bg)",
      }}
    >
      <div style={{ ...styles.container, position: "relative" }}>
        {/* Language Toggle Icon */}
        <button
          style={styles.languageToggle}
          onClick={handleToggleLanguage}
          title="Change Language"
          type="button"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: "var(--card-text)" }}
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          <span
            style={{
              marginLeft: "5px",
              fontSize: "12px",
              fontWeight: "bold",
            }}
          >
            {language === "en" ? "TA" : "EN"}
          </span>
        </button>

        <h1 style={styles.title}>{t.title}</h1>

        {step === 1 && (
          <>
            <TamilInput
              style={styles.input}
              type="text" // Changed to text as TamilInput handles it better, but for consistency with Login where it was 'text' for email
              placeholder={t.emailPlaceholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              forcedLanguage="en" // Email always English
              helperMessage={language === 'ta' ? t.helperEnglishOnly : ""}
              id="email"
              name="email"
            />
            <button
              style={styles.button}
              onClick={handleSendOtp}
              disabled={isSendingOtp}
            >
              {isSendingOtp ? t.sending : t.sendOtp}
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <p style={{ color: "var(--card-text)", marginBottom: "20px" }}>
              {t.otpSentTo} {email}
            </p>
            <TamilInput
              style={styles.input}
              type="text"
              placeholder={t.otpPlaceholder}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength="4"
              forcedLanguage="en" // OTP usually numbers/English
              id="otp"
              name="otp"
            />
            <button style={styles.button} onClick={handleVerifyOtp}>
              {t.verifyOtp}
            </button>
            <button
              style={{
                ...styles.button,
                backgroundColor: "#6c757d",
                marginTop: "10px",
              }}
              onClick={handleSendOtp}
              disabled={cooldown > 0 || isSendingOtp}
            >
              {isSendingOtp
                ? t.sending
                : cooldown > 0
                ? `${t.resendOtp} (${cooldown}s)`
                : t.resendOtp}
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <div style={{ position: "relative", width: "90%", margin: "10px auto" }}>
              <TamilInput
                style={{ ...styles.input, width: "100%", margin: 0 }}
                type="password"
                placeholder={t.newPasswordPlaceholder}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                forcedLanguage="en" // Passwords usually English
                displayLanguage={language}
                helperMessage={language === 'ta' ? t.helperEnglishOnly : ""}
                id="newPassword"
                name="newPassword"
                enablePasswordToggle={true}
              />
            </div>

            <div style={{ position: "relative", width: "90%", margin: "10px auto" }}>
              <TamilInput
                style={{ ...styles.input, width: "100%", margin: 0 }}
                type="password"
                placeholder={t.confirmPasswordPlaceholder}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                forcedLanguage="en" // Passwords usually English
                displayLanguage={language}
                helperMessage={language === 'ta' ? t.helperEnglishOnly : ""}
                id="confirmPassword"
                name="confirmPassword"
                enablePasswordToggle={true}
              />
            </div>
            <button style={styles.button} onClick={handleResetPassword}>
              {t.resetPassword}
            </button>
          </>
        )}

        {error && <p style={styles.error}>{error}</p>}
        {message && (
          <p style={{ color: "var(--success-text)", marginTop: "10px" }}>
            {message}
          </p>
        )}

        <p
          style={{
            marginTop: "15px",
            fontSize: "14px",
            color: "var(--card-text)",
          }}
        >
          {t.rememberPassword}
          <a
            href="/login"
            style={{ color: "var(--link-color)", textDecoration: "none" }}
          >
            {t.loginLink}
          </a>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: "360px",
    padding: "20px",
    borderRadius: "10px",
    background: "var(--card-bg)",
    boxShadow: "0 0 10px rgba(0,0,0,0.4)",
    textAlign: "center",
    fontFamily: '"Arial", sans-serif',
    color: "var(--card-text)",
  },
  languageToggle: {
    position: "absolute",
    top: "15px",
    right: "15px",
    background: "none",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    padding: "5px",
    borderRadius: "5px",
    zIndex: 10,
    color: "var(--card-text)",
  },
  title: {
    marginBottom: "20px",
    color: "var(--card-text)",
  },
  input: {
    width: "90%",
    padding: "12px",
    margin: "10px 0",
    borderRadius: "6px",
    border: "1px solid var(--input-border)",
    background: "var(--input-bg)",
    color: "var(--input-text)",
  },
  error: {
    color: "var(--error-text)",
    marginTop: "-5px",
    marginBottom: "10px",
    fontSize: "14px",
  },
  button: {
    width: "80%",
    padding: "12px",
    background: "var(--button-bg)",
    color: "var(--button-text)",
    borderRadius: "6px",
    cursor: "pointer",
    marginTop: "10px",
    fontWeight: "bold",
  },
};

