"use client";

import React from "react";

const TEMPLE_OPTIONS = [
  "Nemam Kovil",
  "Ilayatrangudi",
  "Iluppakudi",
  "Iraniyur",
  "Mathur",
  "Pillaiyarpatti",
  "Soorakudi",
  "Vairavan Kovil",
  "Velangudi",
];

const ALL_DIVISION_OPTIONS = [
  // Ilayatrangudi
  "Kazhani Vaasarkkudaiyar",
  "Kinginikkurudaiyar",
  "Okkurudaiyar",
  "Pattanasamiyar",
  "Perusenthrudaiyar",
  "Sirusenthrudaiyar",
  "Perumaruthurudaiyar",
  // Mathur
  "Arumbakkur",
  "Karuppur",
  "Kulathur",
  "Mannur",
  "Manalur",
  "Uraiyur",
  // Vairavan Kovil
  "Maruthenthirapuram",
  "Periya vahuppu",
  "Pilliyar vahuppu",
  "Theyyanar vahuppu",
  "Kannur", // Also in Mathur but keeping unique list
];

export default function DashboardHeader({
  view,
  setView,
  searchTerm,
  setSearchTerm,
  searchField,
  setSearchField,
  currentUserTemple,
  currentUserDivision,
  t,
}) {
  const isTempleSearch = searchField === "yourTemple";
  const isDivisionSearch = searchField === "yourDivision";

  const getFilteredOptions = () => {
    if (isTempleSearch) {
      return TEMPLE_OPTIONS.filter((opt) => opt !== currentUserTemple);
    }
    if (isDivisionSearch) {
      // Get unique options and filter
      const uniqueDivisions = [...new Set(ALL_DIVISION_OPTIONS)];
      return uniqueDivisions.filter((opt) => opt !== currentUserDivision);
    }
    return [];
  };

  const filteredOptions = getFilteredOptions();

  return (
    <>
      <div className="dashboard-header">
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {view !== "dashboard" && (
            <button
              onClick={() => {
                setView("dashboard");
                setSearchTerm("");
                setSearchField("");
              }}
              style={{
                padding: "8px 12px",
                background: "var(--card-bg)",
                border: "1px solid var(--input-border)",
                color: "var(--page-text)",
                borderRadius: "6px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                fontSize: "14px",
              }}
            >
              ← {t("Back")}
            </button>
          )}
          <h1
            style={{
              margin: 0,
              fontSize: "20px",
              color: "var(--page-text)",
              fontWeight: "normal",
            }}
          >
            {view === "dashboard"
              ? t("Dashboard")
              : view === "personal"
              ? t("Personal Card")
              : view === "other"
              ? t("All Other Profiles")
              : view === "shortlist"
              ? t("Shortlisted Profiles")
              : view === "matches"
              ? t("Best Matches")
              : t("Search Members")}
          </h1>
        </div>
        {view === "search" && (
          <div className="search-controls">
            <select
              value={searchField}
              onChange={(e) => {
                setSearchField(e.target.value);
                setSearchTerm(""); // Clear search term when field changes
              }}
              className="search-select"
            >
              <option value="">{t("Select Search Field")}</option>
              <option value="name">{t("Name")}</option>
              <option value="user_id">{t("User ID")}</option>
              <option value="phone">{t("Phone")}</option>
              <option value="yourTemple">{t("Temple")}</option>
              <option value="yourDivision">{t("Division")}</option>
              <option value="nativePlace">{t("Native Place")}</option>
              <option value="educationQualification">{t("Education Details")}</option>
              <option value="workDetails">{t("Work Details")}</option>
            </select>
            {isTempleSearch || isDivisionSearch ? (
              <select
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
                style={{ paddingLeft: "12px", backgroundImage: "none" }}
              >
                <option value="">
                  {isTempleSearch ? t("Select Temple") : t("Select Division")}
                </option>
                {filteredOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {t(opt)}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                placeholder={t("Search")}
                disabled={!searchField}
                value={searchTerm}
                onChange={(e) => {
                  const value = e.target.value;
                  setSearchTerm(value);
                }}
                className="search-input"
              />
            )}
          </div>
        )}
      </div>
      <style jsx>{`
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 5px 20px;
          background: rgba(var(--card-bg-rgb), 0.8);
          backdrop-filter: blur(15px);
          -webkit-backdrop-filter: blur(15px);
          border-bottom: 1px solid rgba(147, 144, 144, 0.35);
          min-height: 60px;
          position: sticky;
          top: 0;
          z-index: 100;
          flex-wrap: wrap; /* Allow wrapping */
        }

        .search-controls {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .search-select {
          padding: 8px;
          border-radius: 6px;
          border: 1px solid var(--input-border);
          background-color: var(--card-bg);
          color: var(--page-text);
          outline: none;
        }

        .search-input {
          padding: 8px 12px 8px 40px;
          border-radius: 6px;
          border: 1px solid var(--input-border);
          background-color: var(--card-bg);
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='11' cy='11' r='8'%3E%3C/circle%3E%3Cpath d='m21 21-4.35-4.35'%3E%3C/path%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: 10px center;
          color: var(--page-text);
          font-size: 16px;
          width: 250px;
          outline: none;
          opacity: ${searchField ? 1 : 0.5};
        }

        /* Mobile Styles */
        @media (max-width: 768px) {
          .dashboard-header {
            padding: 10px 15px;
            gap: 10px;
          }

          .search-controls {
            width: 100%;
            justify-content: space-between;
            order: 2; /* Force to next line if wrapped */
          }

          .search-select,
          .search-input {
            width: 48% !important; /* Approx 40-50% as requested */
          }
        }
      `}</style>
    </>
  );
}
