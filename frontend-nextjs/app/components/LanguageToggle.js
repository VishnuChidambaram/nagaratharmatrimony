"use client";
import React from "react";

import { usePathname } from "next/navigation";

const isAllowedPath = (pathname) => {
  if (!pathname) return false;
  return (
    pathname === "/login" ||
    pathname === "/admin/login" ||
    pathname === "/forgot-password" ||
    pathname === "/dashboard" ||
    pathname === "/admin/dashboard" ||
    pathname.startsWith("/register")
  );
};

export default function LanguageToggle({ language, toggleLanguage }) {
  const pathname = usePathname();
  const isRegisterPath = pathname && pathname.startsWith("/register");
  if (!isAllowedPath(pathname)) return null;
  return (
    <>
      <style jsx>{`
        .language-toggle-container {
          display: inline-block;
          z-index: 1000;
        }
        
        .language-toggle-container.register {
          position: fixed;
          right: 20px;
          top: 16px;
        }
        
        .language-toggle-wrapper {
          display: flex;
          background: #f0f0f0;
          border-radius: 8px;
          padding: 4px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        
        .language-button {
          padding: 8px 16px;
          font-size: 14px;
          cursor: pointer;
          border: none;
          border-radius: 6px;
          font-weight: bold;
          transition: all 0.2s ease;
        }
        
        /* Mobile responsive styles */
        @media (max-width: 768px) {
          .language-toggle-wrapper {
           position:fixed;
            top: 0px;
            right:0px;
            padding: 0px;
            border-radius: 6px;
          }
          
          .language-button {
           
            padding: 6px 12px;
            font-size: 12px;
          }
        }
        
        @media (max-width: 480px) {
          .language-button {
            padding: 4px 8px;
            font-size: 10px;
          }
        }
      `}</style>
      
      <div className={`language-toggle-container ${isRegisterPath ? 'register' : ''}`}>
        <div className="language-toggle-wrapper">
          <button
            className="language-button"
            onClick={() => language !== "en" && toggleLanguage("en")}
            style={{
              backgroundColor: language === "en" ? "#fff" : "transparent",
              color: language === "en" ? "#008CBA" : "#666",
              boxShadow: language === "en" ? "0 1px 3px rgba(0,0,0,0.2)" : "none",
            }}
          >
            English
          </button>
          <button
            className="language-button"
            onClick={() => language !== "ta" && toggleLanguage("ta")}
            style={{
              backgroundColor: language === "ta" ? "#4CAF50" : "transparent",
              color: language === "ta" ? "#fff" : "#666",
              boxShadow: language === "ta" ? "0 1px 3px rgba(0,0,0,0.2)" : "none",
            }}
          >
            தமிழ்
          </button>
        </div>
      </div>
    </>
  );
}
