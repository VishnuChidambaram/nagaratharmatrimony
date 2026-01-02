"use client";

import { Geist, Geist_Mono } from "next/font/google";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import "./globals.css";
import { LanguageProvider, useLanguage } from "./context/LanguageContext";
import { t as translate } from "./utils/translations";
import NotificationToast from "./components/NotificationToast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Inline language selector for the layout menu
function LanguageMenuSection() {
  const { language, toggleLanguage } = useLanguage();
  return (
    <div
      style={{
        padding: "10px",
        borderTop: "1px solid var(--menu-border)",
      }}
    >
      <div
        style={{
          color: "var(--menu-text)",
          fontSize: "14px",
          marginBottom: "8px",
        }}
      >
        <T>Language</T>
      </div>
      <div
        style={{
          display: "flex",
          gap: "8px",
        }}
      >
        <button
          onClick={() => toggleLanguage("en")}
          style={{
            flex: 1,
            padding: "8px 12px",
            background: language === "en" ? "lightgreen" : "#ffffff",
            color: language === "en" ? "black" : "#000000",
            border: language === "en" ? "none" : "1px solid #ccc",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "bold",
          }}
        >
          <T>English</T>
        </button>
        <button
          onClick={() => toggleLanguage("ta")}
          style={{
            flex: 1,
            padding: "8px 12px",
            background: language === "ta" ? "#4CAF50" : "#ffffff",
            color: language === "ta" ? "#fff" : "#000000",
            border: language === "ta" ? "none" : "1px solid #ccc",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "bold",
          }}
        >
          <T>தமிழ்</T>
        </button>
      </div>
    </div>
  );
}

// Translate text using language context
function T({ children }: { children: string }) {
  const { language } = useLanguage();
  return <>{translate(children, language)}</>;
}

// Sync html[lang] attribute with selected language
function LanguageEffects() {
  const { language } = useLanguage();
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("lang", language === "ta" ? "ta" : "en");
    }
  }, [language]);
  return null;
}

// Prevent Inspect Element and Right Click
function PreventInspect() {
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable F12, Ctrl + Shift + I, Ctrl + Shift + J, Ctrl + U
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J" || e.key === "C")) ||
        (e.ctrlKey && e.key === "u")
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return null;
}

import { API_URL } from "@/app/utils/config";
import { getAuthHeaders } from "@/app/utils/auth-headers";
import { clearFormData } from "@/app/register/styles";
import SessionMonitor from "./components/SessionMonitor";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [bodyClass, setBodyClass] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [menuTimeout, setMenuTimeout] = useState<NodeJS.Timeout | null>(null);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);


  useEffect(() => {
    // Suppress specific console warnings in the browser
    const originalConsoleWarn = console.warn;
    const originalConsoleError = console.error;

    console.warn = (...args) => {
      if (
        typeof args[0] === 'string' &&
        (args[0].includes('stale') || args[0].includes('version-staleness'))
      ) {
        return;
      }
      originalConsoleWarn(...args);
    };

    console.error = (...args) => {
       if (
        typeof args[0] === 'string' &&
        (args[0].includes('stale') || args[0].includes('version-staleness'))
      ) {
        return;
      }
      originalConsoleError(...args);
    };
    
    // Check for saved theme preference
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme) {
        const initialDark = savedTheme === "dark";
        setIsDarkMode(initialDark);
        const bodyClass = initialDark ? "dark" : "";
        setBodyClass(bodyClass);
        document.body.className = bodyClass;
      } else {
        // No saved theme, default to light mode
        setIsDarkMode(false);
        setBodyClass("");
        document.body.className = "";
        localStorage.setItem("theme", "light");
      }

      // Check for saved user email
      const savedEmail = sessionStorage.getItem("userEmail");
      if (savedEmail) {
        setUserEmail(savedEmail);
      }
      
      // Listen for theme changes from Admin Menu
      const handleThemeChange = (e: any) => {
        const newTheme = e.detail; 
        console.log("RootLayout: Received theme-sync", newTheme);
        if (newTheme) {
          setIsDarkMode(newTheme === "dark");
          const bodyClass = newTheme === "dark" ? "dark" : "";
          setBodyClass(bodyClass);
          document.body.className = bodyClass;
          document.documentElement.setAttribute("data-theme", newTheme); // Ensure global sync
          localStorage.setItem("theme", newTheme); 
        }
      };

      window.addEventListener("theme-sync", handleThemeChange);
      
      // Cleanup listener
      return () => {
        window.removeEventListener("theme-sync", handleThemeChange);
      };
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        isMenuOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
        if (menuTimeout) {
          clearTimeout(menuTimeout);
          setMenuTimeout(null);
        }
      }
    }

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen, menuTimeout]);


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
      }, 7000); // 7 seconds
      setMenuTimeout(timeout);
    }
  };

  const setTheme = (mode: string) => {
    console.log("RootLayout: Setting theme to", mode);
    const newDarkMode = mode === "dark";
    setIsDarkMode(newDarkMode);
    const bodyClass = newDarkMode ? "dark" : "";
    setBodyClass(bodyClass);
    document.body.className = bodyClass;
    document.documentElement.setAttribute("data-theme", mode); // Ensure global sync
    localStorage.setItem("theme", mode);
    
    // Dispatch event so AdminMenu (and others) can update their state
    window.dispatchEvent(new CustomEvent("theme-sync", { detail: mode }));
  };

  const selectTheme = (mode: string) => {
    setTheme(mode);
    setShowThemeModal(false);
  };

  const setLightMode = () => setTheme("light");
  const setDarkMode = () => setTheme("dark");

  const handleEditDetailsClick = async () => {
    try {
      if (!userEmail) {
        // Fallback if email not set yet
        window.location.href = `/editdetail`;
        return;
      }

      // Check for pending updates
      const headers = getAuthHeaders() as any; 
      const res = await fetch(`${API_URL}/api/update-requests/user/${encodeURIComponent(userEmail)}`, {
        credentials: "include",
        headers: headers
      });
      const data = await res.json();

      if (data.success && data.hasPending) {
        setShowApprovalModal(true);
        setIsMenuOpen(false); // Close menu
      } else {
        window.location.href = `/editdetail?email=${encodeURIComponent(userEmail)}`;
      }
    } catch (error) {
      console.error("Error checking pending status:", error);
      // Fallback on error - let them proceed or maybe show generic error?
      // For now, let's let them proceed as fail-safe
      window.location.href = `/editdetail?email=${encodeURIComponent(userEmail)}`;
    }
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased ${bodyClass}`}
        style={{
          margin: 0,
          padding: 0,
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          overflow: "auto",
        }}
      >
        <LanguageProvider>
        <LanguageEffects />
        <PreventInspect />
        <NotificationToast />
        {/* Global Header */}
        <header
          style={{
            width: "100%",
            padding: "15px",
            background: "var(--header-bg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid var(--menu-border)",
            flexShrink: 0,
            position: "fixed",
            top: 0,
            zIndex: 1100,
            boxSizing: "border-box",
          }}
        >
          {/* Title and Search */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <img 
              src="/logo.png" 
              alt="Logo" 
              style={{ 
                height: "40px", 
                width: "40px", 
                borderRadius: "50%",
                objectFit: "cover" 
              }} 
            />
            <div
              className="header-title"
              style={{
                fontSize: "26px",
                fontWeight: "bold",
                color: "var(--header-text)",
              }}
            >
              <>Nagarathar Matrimony</>
            </div>
          </div>

          {/* Menu Button - Hide on login, register, and forgot-password pages */}
          {pathname !== "/login" &&
          pathname !== "/admin/login" &&
          pathname !== "/admin/dashboard" &&
          pathname !== "/" &&
          pathname !== "/admin/deleted-rows" &&
          pathname !== "/admin/approval-requests" &&
          pathname !== "/admin/users" &&
          !pathname.startsWith("/register") &&
          !pathname.startsWith("/admin/users/") &&
          !pathname.startsWith("/admin/approval-requests/") &&
          pathname !== "/forgot-password" && (
              <button
                ref={buttonRef}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--header-text)",
                  fontSize: "20px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onClick={toggleMenu}
              >
                ☰
              </button>

            )}
        </header>

        {/* Menu Dropdown */}
        {isMenuOpen && (
          <div
            ref={menuRef}
            onMouseEnter={() => {
              if (menuTimeout) {
                clearTimeout(menuTimeout);
                setMenuTimeout(null);
              }
            }}
            onMouseLeave={() => {
              const timeout = setTimeout(() => {
                setIsMenuOpen(false);
                setMenuTimeout(null);
              }, 7000); // 7 seconds
              setMenuTimeout(timeout);
            }}
            style={{
              position: "fixed",
              top: "60px",
              right: "15px",
              background: "var(--menu-bg)",
              border: "1px solid var(--menu-border)",
              borderRadius: "8px",
              padding: "10px",
              zIndex: 1200,
              minWidth: "200px",
              boxShadow: "0 4px 8px rgba(0,0,0,0.5)",
            }}
          >

            {/* User Profile - Only show if not on login, register, or forgot-password pages */}
            {pathname !== "/" &&
              pathname !== "/login" &&
              pathname !== "/register" &&
              pathname !== "/forgot-password" && (
                <div
                  style={{
                    padding: "10px",
                    borderBottom: "1px solid var(--menu-border)",
                    marginBottom: "10px",
                  }}
                >
                  <div
                    style={{ color: "var(--menu-text)", fontWeight: "bold" }}
                  >
                    <T>User Profile</T>
                  </div>
                  <div style={{ color: "#666", fontSize: "14px" }}>
                    {userEmail || "user@example.com"}
                  </div>
                </div>
              )}
            {/* Menu Options - Show on dashboard and editdetail pages */}
            {(pathname === "/dashboard" || pathname.startsWith("/editdetail")) && (
              <div
                style={{
                  padding: "10px",
                  borderTop: "1px solid var(--menu-border)",
                  borderBottom: "1px solid var(--menu-border)",
                }}
              >
                <div
                  style={{
                    color: "var(--menu-text)",
                    fontSize: "14px",
                    marginBottom: "8px",
                  }}
                >
                  <T>Menu</T>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  {pathname === "/dashboard" && (
                    <button
                      onClick={handleEditDetailsClick}
                      style={{
                        padding: "8px 12px",
                        background: "var(--menu-item-bg)",
                        color: "var(--menu-text)",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "14px",
                      }}
                    >
                      <T>Edit Details</T>
                    </button>
                  )}
                  {pathname.startsWith("/editdetail") && (
                    <button
                      onClick={() => {
                        window.location.href = "/dashboard";
                      }}
                      style={{
                        padding: "8px 12px",
                        background: "var(--menu-item-bg)",
                        color: "var(--menu-text)",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "14px",
                      }}
                    >
                      <T>Dashboard</T>
                    </button>
                  )}
                </div>
              </div>
            )}
            {/* Language Selector */}
            <LanguageMenuSection />
            {/* Theme Selector */}
            <div
              style={{
                padding: "10px",
                borderTop: "1px solid var(--menu-border)",
              }}
            >
              <div
                style={{
                  color: "var(--menu-text)",
                  fontSize: "14px",
                  marginBottom: "8px",
                }}
              >
                <T>Theme</T>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                }}
              >
                <button
                  onClick={setLightMode}
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    background: !isDarkMode ? "lightgreen" : "#ffffff",
                    color: !isDarkMode ? "black" : "#000000",
                    border: !isDarkMode ? "none" : "1px solid #ccc",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "bold",
                  }}
                >
                  <T>Light Mode</T>
                </button>
                <button
                  onClick={setDarkMode}
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    background: isDarkMode ? "lightgreen" : "#ffffff",
                    color: isDarkMode ? "black" : "#000000",
                    border: isDarkMode ? "none" : "1px solid #ccc",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "bold",
                  }}
                >
                  <T>Dark Mode</T>
                </button>
              </div>
            </div>
            {/* Logout Button - Only show if not on login, register, or forgot-password pages */}
            {pathname !== "/" &&
              pathname !== "/login" &&
              pathname !== "/register" &&
              pathname !== "/forgot-password" && (
                <div
                  style={{
                    padding: "10px",
                    borderTop: "1px solid var(--menu-border)",
                  }}
                >
                  <button
                    onClick={async () => {
                      try {
                        const headers = getAuthHeaders() as any;
                        await fetch(`${API_URL}/logout`, {
                          method: "POST",
                          credentials: "include",
                          headers: headers
                        });
                      } catch (error) {
                        console.error("Logout error:", error);
                      }
                      await clearFormData(); // Clear registration data
                      sessionStorage.removeItem("userEmail");
                      // Show toast and wait
                      window.dispatchEvent(new CustomEvent('show-notification', { 
                        detail: { message: 'Logout Successful', type: 'success' } 
                      }));
                      setTimeout(() => {
                        window.location.href = "/login";
                      }, 2000);
                    }}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      background: "#f44336",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "14px",
                    }}
                  >
                    <T>Logout</T>
                  </button>
                </div>
              )}
          </div>
        )}

        {/* Theme Selection Modal */}
        {showThemeModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "rgba(0, 0, 0, 0.8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 2000,
            }}
          >
            <div
              style={{
                background: "#ffffff",
                padding: "40px",
                borderRadius: "12px",
                textAlign: "center",
                maxWidth: "400px",
                width: "90%",
                boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
              }}
            >
              <h2
                style={{
                  margin: "0 0 20px 0",
                  fontSize: "24px",
                  color: "#000000",
                }}
              >
                <T>Choose Your Theme</T>
              </h2>
              <p
                style={{
                  margin: "0 0 30px 0",
                  fontSize: "16px",
                  color: "#666",
                }}
              >
                <T>Select your preferred theme to continue.</T>
              </p>
              <div
                style={{
                  display: "flex",
                  gap: "20px",
                  justifyContent: "center",
                }}
              >
                <button
                  onClick={() => selectTheme("light")}
                  style={{
                    padding: "15px 30px",
                    background: !isDarkMode ? "lightgreen" : "#ffffff",
                    color: !isDarkMode ? "black" : "#000000",
                    border: !isDarkMode ? "none" : "2px solid #ccc",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "16px",
                    fontWeight: "bold",
                  }}
                >
                  <T>Light Mode</T>
                </button>
                <button
                  onClick={() => selectTheme("dark")}
                  style={{
                    padding: "15px 30px",
                    background: isDarkMode ? "lightgreen" : "#000000",
                    color: isDarkMode ? "black" : "#ffffff",
                    border: isDarkMode ? "none" : "2px solid #000000",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "16px",
                    fontWeight: "bold",
                  }}
                >
                  <T>Dark Mode</T>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Approval Pending Warning Modal */}
        {showApprovalModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 2100, // Higher than other modals
            }}
            onClick={() => setShowApprovalModal(false)}
          >
            <div
              style={{
                background: isDarkMode ? "#333" : "#ffffff",
                padding: "30px",
                borderRadius: "12px",
                textAlign: "center",
                maxWidth: "400px",
                width: "90%",
                boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                position: "relative",
              }}
              onClick={(e) => e.stopPropagation()} // Prevent close on content click
            >
              <button 
                onClick={() => setShowApprovalModal(false)}
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  border: "none",
                  background: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: isDarkMode ? "#fff" : "#000",
                }}
              >
                ×
              </button>
              
              <div style={{ fontSize: "48px", marginBottom: "20px" }}>
                ⏳
              </div>
              
              <h2
                style={{
                  margin: "0 0 15px 0",
                  fontSize: "22px",
                  color: isDarkMode ? "#fff" : "#000000",
                }}
              >
                <T>Wait for Approval</T>
              </h2>
              
              <p
                style={{
                  margin: "0 0 25px 0",
                  fontSize: "16px",
                  color: isDarkMode ? "#ccc" : "#666",
                  lineHeight: "1.5",
                }}
              >
                <T>You have a pending update request. Please wait for the admin to approve your request before making further changes.</T>
              </p>
              
              <button
                onClick={() => setShowApprovalModal(false)}
                style={{
                  padding: "10px 25px",
                  background: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "16px",
                  fontWeight: "bold",
                }}
              >
                <T>Okay, I'll wait</T>
              </button>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main style={{ flex: 1, display: "flex", flexDirection: "column", marginTop: "70px" }}>
          {children}
        </main>

        {/* Floating Email Icon Button - Hide on admin pages */}
        {!pathname.startsWith("/admin") && (
        <button
          onClick={() => window.location.href = 'mailto:'}
          style={{
            position: "fixed",
            bottom: "90px",
            right: "20px",
            width: "50px",
            height: "50px",
            borderRadius: "50%",
            background: isDarkMode ? "#ffffff" : "#000000",
            color: isDarkMode ? "#000000" : "#ffffff",
            border: "none",
            cursor: "pointer",
            fontSize: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
            zIndex: 1000,
          }}
          title="Contact Us"
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
          >
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
            <polyline points="22,6 12,13 2,6"></polyline>
          </svg>
        </button>
        )}

        {/* Floating Theme Toggle Button */}
        <button
          onClick={() => setTheme(isDarkMode ? "light" : "dark")}
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            width: "50px",
            height: "50px",
            borderRadius: "50%",
            background: isDarkMode ? "#ffffff" : "#000000",
            color: isDarkMode ? "#000000" : "#ffffff",
            border: "none",
            cursor: "pointer",
            fontSize: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
            zIndex: 1000,
          }}
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDarkMode ? "☀️" : "🌙"}
        </button>
        <style>
          {`
            @media (max-width: 768px) {
              button[title*="Switch to"], button[title="Contact Us"] {
                width: 40px !important;
                height: 40px !important;
                font-size: 20px !important;
              }
              button[title="Contact Us"] {
                bottom: 70px !important;
              }
            }
          `}
        </style>
        <SessionMonitor />
        </LanguageProvider>
      </body>
    </html>
  );
}
