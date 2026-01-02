"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { useLanguage } from "../context/LanguageContext";
import { t } from "../utils/translations";
import { API_URL } from "../utils/config";
import { getAuthHeaders } from "../utils/auth-headers";

export default function AdminMenu() {
  const router = useRouter();
  const { language, toggleLanguage } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [theme, setTheme] = useState("light");
  const [menuTimeout, setMenuTimeout] = useState(null);

  useEffect(() => {
    // Load admin email
    const storedAdminEmail = sessionStorage.getItem("adminEmail");
    if (storedAdminEmail) {
      setAdminEmail(storedAdminEmail);
    }
    
    // Load theme preference - Unified with global theme
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
    
    // Sync body class to ensure admin theme overrides layout theme
    if (savedTheme === "dark") {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }

    // Listen for global theme changes (e.g. from RootLayout floating button)
    const handleThemeChange = (e) => {
      // e is a CustomEvent
      const newTheme = e.detail;
      console.log("AdminMenu: Received theme-sync", newTheme);
      if (newTheme) {
        setTheme(newTheme);
        document.documentElement.setAttribute("data-theme", newTheme);
        
        if (newTheme === "dark") {
          document.body.classList.add("dark");
        } else {
          document.body.classList.remove("dark");
        }
        // No need to set localStorage here as the sender does it, or we do it reciprocally
      }
    };

    window.addEventListener("theme-sync", handleThemeChange);

    return () => {
      window.removeEventListener("theme-sync", handleThemeChange);
    };
  }, []);

  const toggleTheme = (newTheme) => {
    console.log("AdminMenu: Toggling theme to", newTheme);
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme); // Unified key
    document.documentElement.setAttribute("data-theme", newTheme);
    
    // Sync body class
    if (newTheme === "dark") {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }

    // Dispatch event for other components (like RootLayout) to sync
    window.dispatchEvent(new CustomEvent("theme-sync", { detail: newTheme }));
  };

  const handleLogout = async () => {
    sessionStorage.removeItem("adminEmail");
    try {
      await fetch(`${API_URL}/admin/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        credentials: "include",
      });
    } catch (e) {
      console.error("Logout error", e);
    }
    router.push("/admin/login");
  };

  const toggleMenu = () => {
    if (isMenuOpen) {
      setIsMenuOpen(false);
      if (menuTimeout) {
        clearTimeout(menuTimeout);
        setMenuTimeout(null);
      }
    } else {
      setIsMenuOpen(true);
      const timeout = setTimeout(() => {
        setIsMenuOpen(false);
        setMenuTimeout(null);
      }, 4000); // 4 seconds
      setMenuTimeout(timeout);
    }
  };

  const handleMouseEnter = () => {
    if (menuTimeout) {
      clearTimeout(menuTimeout);
      setMenuTimeout(null);
    }
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setIsMenuOpen(false);
      setMenuTimeout(null);
    }, 4000); // 4 seconds
    setMenuTimeout(timeout);
  };

  return (
    <>
      {/* Top bar with Language + Hamburger */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {/* Language Toggle */}

        {/* Hamburger Menu Button */}
        <button
          onClick={toggleMenu}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "8px",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          <div style={{ width: "25px", height: "3px", background: "var(--page-text)", borderRadius: "2px" }}></div>
          <div style={{ width: "25px", height: "3px", background: "var(--page-text)", borderRadius: "2px" }}></div>
          <div style={{ width: "25px", height: "3px", background: "var(--page-text)", borderRadius: "2px" }}></div>
        </button>
      </div>

      {/* Sidebar Menu */}
      {isMenuOpen && (
        <>
          {/* Overlay */}
          <div
            onClick={() => setIsMenuOpen(false)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0, 0, 0, 0.5)",
              zIndex: 999,
            }}
          ></div>

          <div
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              width: "300px",
              height: "100vh",
              background: "var(--page-bg)",
              boxShadow: "2px 0 8px rgba(0, 0, 0, 0.2)",
              zIndex: 1000,
              padding: "20px",
              overflowY: "auto",
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {/* Admin Profile Section */}
            <div style={{ marginTop: "40px", marginBottom: "30px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "15px", color: "var(--page-text)" }}>
                {t("Admin Profile", language)}
              </h3>
              <div style={{ color: "var(--card-text)", fontSize: "14px" }}>
                {adminEmail}
              </div>
            </div>

            {/* Language Section inside menu */}
            <div style={{ marginBottom: "30px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "15px", color: "var(--page-text)" }}>
                {t("Language", language)}
              </h3>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={() => toggleLanguage("en")}
                  style={{
                    flex: 1,
                    padding: "12px",
                    backgroundColor: language === "en" ? "#007bff" : "#e9ecef",
                    color: language === "en" ? "white" : "#333",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    fontSize: "14px",
                  }}
                >
                  English
                </button>
                <button
                  onClick={() => toggleLanguage("ta")}
                  style={{
                    flex: 1,
                    padding: "12px",
                    backgroundColor: language === "ta" ? "#007bff" : "#e9ecef",
                    color: language === "ta" ? "white" : "#333",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    fontSize: "14px",
                  }}
                >
                  தமிழ்
                </button>
              </div>
            </div>

            {/* Theme Section */}
            <div style={{ marginBottom: "30px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "15px", color: "var(--page-text)" }}>
                {t("Theme", language)}
              </h3>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={() => toggleTheme("light")}
                  style={{
                    flex: 1,
                    padding: "12px",
                    backgroundColor: theme === "light" ? "#007bff" : "#e9ecef",
                    color: theme === "light" ? "white" : "#333",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    fontSize: "14px",
                  }}
                >
                  {t("Light Mode", language)}
                </button>
                <button
                  onClick={() => toggleTheme("dark")}
                  style={{
                    flex: 1,
                    padding: "12px",
                    backgroundColor: theme === "dark" ? "#007bff" : "#e9ecef",
                    color: theme === "dark" ? "white" : "#333",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    fontSize: "14px",
                  }}
                >
                  {t("Dark Mode", language)}
                </button>
              </div>
            </div>

            {/* Dashboard Button */}
            <button
              onClick={() => {
                setIsMenuOpen(false);
                router.push("/admin/dashboard");
              }}
              style={{
                width: "100%",
                padding: "12px",
                marginBottom: "15px",
                backgroundColor: "#17a2b8", // Info/Dashboard color
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "16px",
              }}
            >
              🏠 {t("Dashboard", language)}
            </button>

            {/* Approval Requests Button */}
            <button
              onClick={() => {
                setIsMenuOpen(false);
                router.push("/admin/approval-requests");
              }}
              style={{
                width: "100%",
                padding: "12px",
                marginBottom: "15px",
                backgroundColor: "#28a745", // Green for approvals
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "16px",
              }}
            >
              📋 {t("Approval Requests", language)}
            </button>

            {/* Deleted Rows Button */}
            <button
              onClick={() => {
                setIsMenuOpen(false);
                router.push("/admin/deleted-rows");
              }}
              style={{
                width: "100%",
                padding: "12px",
                marginBottom: "15px",
                backgroundColor: "#ffc107", // Warning color
                color: "#000",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "16px",
              }}
            >
              {t("Deleted Rows", language)}
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: "#dc3545",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "16px",
              }}
            >
              {t("Logout", language)}
            </button>
          </div>
        </>
      )}
    </>
  );
}
