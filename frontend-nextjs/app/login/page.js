"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { en } from "./locales/en";
import { ta } from "./locales/ta";
import TamilInput from "@/app/components/TamilInput";
import TamilPopup from "@/app/components/TamilPopup";
import { useRef } from "react";
import { useLanguage } from "@/app/hooks/useLanguage";
import { API_URL } from "@/app/utils/config";


export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { language, toggleLanguage } = useLanguage();

  const t = language === "en" ? en : ta;

  // Clear user session when login page loads to force authentication
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("userEmail");
    }
  }, []);



  // Auto-hide error messages after 2 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError("");
      }, 2000);

      // Cleanup function to clear timeout if component unmounts or error changes
      return () => clearTimeout(timer);
    }
  }, [error]);



  const handleToggleLanguage = () => {
    const newLang = language === "en" ? "ta" : "en";
    toggleLanguage(newLang);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setError(t.errorMissing);
      window.dispatchEvent(new CustomEvent('show-notification', { 
        detail: { message: t.errorMissing, type: 'error' } 
      }));
      return;
    }

    // Allow Tamil characters in email - basic check for @ and . only
    if (!email.includes('@') || !email.includes('.')) {
      setError(t.errorEmail);
      window.dispatchEvent(new CustomEvent('show-notification', { 
        detail: { message: t.errorEmail, type: 'error' } 
      }));
      return;
    }

    setError("");

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Important for cookies
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.success) {
        // Show toast immediately
        window.dispatchEvent(new CustomEvent('show-notification', { 
          detail: { message: 'Login Successful', type: 'success' } 
        }));
        
        if (typeof window !== "undefined") {
          localStorage.setItem("userEmail", email);
          // Set cookie for middleware (not httpOnly as it's set by client-side JS)
          document.cookie = `userEmail=${email}; path=/; max-age=86400; samesite=lax`;
        }
        window.localStorage.setItem("userEmail", email);

        // Wait 2 seconds before redirecting
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 2000);
      } else {
        setError(data.message || t.loginFailed);
        window.dispatchEvent(new CustomEvent('show-notification', { 
          detail: { message: data.message || t.loginFailed, type: 'error' } 
        }));
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(t.errorGeneric);
      window.dispatchEvent(new CustomEvent('show-notification', { 
        detail: { message: t.errorGeneric, type: 'error' } 
      }));
    }
  };

  return (
    <>
      <style jsx>{`
        @media (max-width: 480px) {
          .login-container {
            width: 100% !important;
            max-width: 340px !important;
            padding: 15px !important;
            margin: 0 10px !important;
          }

          .eye-icon svg {
            width: 24px !important;
            height: 24px !important;
          }
        }

        @media (max-width: 320px) {
          .login-container {
            max-width: 300px !important;
            padding: 12px !important;
            margin: 0 5px !important;
          }
        }
      `}</style>
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

        {/* Flex Wrapper for Side-by-Side Layout */}
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'start', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }} className="login-wrapper">
          
          <div
            style={{ ...styles.container, position: "relative" }}
            className="login-container"
          >
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

          <h3 style={styles.title}>{t.loginTitle}</h3>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
            style={{ width: "100%" }}
          >
            <TamilInput
              style={styles.input}
              type="text"
              placeholder={t.emailPlaceholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              forcedLanguage="en"
              helperMessage={language === 'ta' ? "ஆங்கிலத்தில் மட்டும் தட்டச்சு செய்யவும்" : ""}
              id="email"
              name="email"
            />
            <div style={styles.passwordWrapper}>
              <TamilInput
                style={styles.passwordInput}
                type="password"
                placeholder={t.passwordPlaceholder}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                forcedLanguage="en"
                displayLanguage={language}
                helperMessage={language === 'ta' ? "ஆங்கிலத்தில் மட்டும் தட்டச்சு செய்யவும்" : ""}
                id="password"
                name="password"
                enablePasswordToggle={true}
              />
            </div>

            {/* Forgot Password Link */}
            <div
              style={{ width: "90%", textAlign: "right", margin: "5px auto 0" }}
            >
              <a
                href="/forgot-password"
                style={{
                  fontSize: "12px",
                  color: "var(--link-color)",
                  textDecoration: "none",
                }}
              >
                {t.forgotPassword}
              </a>
            </div>

            {error && <p style={styles.error}>{error}</p>}
            <button style={styles.button} type="submit">
              {t.loginButton}
            </button>
          </form>
          <p
            style={{
              marginTop: "10px",
              fontSize: "14px",
              color: "var(--card-text)",
            }}
          >
            {t.noAccount}
            <a
              href="/register"
              style={{ color: "var(--link-color)", textDecoration: "none" }}
            >
              {t.registerLink}
            </a>
          </p>

          {/* Admin Login Link */}
          <div
            style={{
              marginTop: "15px",
              borderTop: "1px solid var(--input-border)",
              paddingTop: "10px",
            }}
          >
            <a
              href="/admin/login"
              style={{
                fontSize: "12px",
                color: "var(--card-text)",
                textDecoration: "none",
                opacity: 0.7,
              }}
            >
              {t.adminAccess}
            </a>
          </div>
          </div>

        </div>
      </div>
    </>
  );
}

const styles = {
  container: {
    position: "relative",
    width: "100%",
    maxWidth: "360px",
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
  passwordWrapper: {
    position: "relative",
    width: "90%",
    margin: "0 auto",
  },
  passwordInput: {
    width: "100%",
    padding: "12px",
    paddingRight: "45px",
    margin: "10px 0",
    borderRadius: "6px",
    border: "1px solid var(--input-border)",
    background: "var(--input-bg)",
    color: "var(--input-text)",
  },
  eyeIcon: {
    position: "absolute",
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    cursor: "pointer",
    fontSize: "18px",
    userSelect: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "20px",
    minHeight: "20px",
    padding: "2px",
    zIndex: 10, // Ensure it's on top
  },
  error: {
    color: "var(--error-text)",
    marginTop: "-5px",
    marginBottom: "10px",
    fontSize: "14px",
  },
  button: {
    width: "85%",
    padding: "10px",
    background: "var(--button-bg)",
    color: "var(--button-text)",
    borderRadius: "6px",
    cursor: "pointer",
    marginTop: "10px",
    fontWeight: "bold",
  },
};
