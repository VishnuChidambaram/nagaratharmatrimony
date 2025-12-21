"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import TamilInput from "@/app/components/TamilInput";
import { en } from "./locales/en";
import { ta } from "./locales/ta";
import { useLanguage } from "@/app/hooks/useLanguage";
import { API_URL } from "../../utils/config";

export default function AdminLogin() {
  const router = useRouter();
  const { language, toggleLanguage } = useLanguage();
  const t = language === "en" ? en : ta;

  const handleToggleLanguage = () => {
    const newLang = language === "en" ? "ta" : "en";
    toggleLanguage(newLang);
  };

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Clear admin session when login page loads to force authentication
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("adminEmail");
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

  const handleLogin = async () => {
    if (!email || !password) {
      setError(t.emailRequired);
      window.dispatchEvent(new CustomEvent('show-notification', { 
        detail: { message: t.emailRequired, type: 'error' } 
      }));
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(t.emailInvalid);
      window.dispatchEvent(new CustomEvent('show-notification', { 
        detail: { message: t.emailInvalid, type: 'error' } 
      }));
      return;
    }

    setError("");

    const res = await fetch(`${API_URL}/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
      
    if (data.success) {
      window.dispatchEvent(new CustomEvent('show-notification', { 
        detail: { message: data.message || 'Login Successful', type: 'success' }
      }));
      
      if (typeof window !== "undefined") {
        localStorage.setItem("adminEmail", email);
        // Set cookie for middleware
        document.cookie = `adminEmail=${email}; path=/; max-age=86400; samesite=lax`;
      }
      window.localStorage.setItem("adminEmail", email); 

      setTimeout(() => {
        router.push("/admin/dashboard");
      }, 2000);
    } else {
      window.dispatchEvent(new CustomEvent('show-notification', { 
        detail: { message: data.message || 'Login Failed', type: 'error' }
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
          position: "relative", // For positioning language toggle
        }}
      >


        <div style={{ ...styles.container, position: "relative" }} className="login-container">
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
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1 4-10z" />
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
        <h3 style={styles.title}>{t.title}</h3>

        <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} style={{ width: '100%' }}>
          <div style={{ width: '90%', margin: '0 auto 10px auto' }}>
            <TamilInput
              type="email"
              placeholder={t.emailPlaceholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              forcedLanguage="en"
              helperMessage={language === 'ta' ? t.onlyEnglish : ""}
              style={{ ...styles.input, width: '100%', margin: 0 }}
            />
          </div>
          <div style={{ position: "relative", width: "90%", margin: "0 auto 10px auto" }}>
            <TamilInput
              type="password"
              placeholder={t.passwordPlaceholder}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              forcedLanguage="en"
              displayLanguage={language}
              helperMessage={language === 'ta' ? t.onlyEnglish : ""}
              style={{ ...styles.input, width: '100%', margin: 0 }}
              enablePasswordToggle={true}
              id="password"
              name="password"
            />
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
          {t.goToLogin}{" "}
          <a
            href="/login"
            style={{ color: "var(--link-color)", textDecoration: "none" }}
          >
            {t.clickHere}
          </a>
        </p>
      </div>
    </div>
  </>
  );
}

const styles = {
  container: {
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
    width: "85%",
    padding: "10px",
    background: "var(--button-bg)",
    color: "var(--button-text)",
    borderRadius: "6px",
    cursor: "pointer",
    marginTop: "10px",
    fontWeight: "bold",
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
};
