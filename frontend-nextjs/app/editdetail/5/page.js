"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { styles, loadFormData, saveFormData, defaultFormData } from "../../register/styles";
import Navigation from "../components/Navigation";
import "./../editdetail.css";
import LanguageToggle from "@/app/components/LanguageToggle";
import TamilPopup from "@/app/components/TamilPopup";
import { t } from "@/app/utils/translations";
import { useLanguage } from "@/app/hooks/useLanguage";
import { normalizeDropdownValue } from "@/app/utils/normalization";

export default function EditStep5() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState(defaultFormData);
  const [loading, setLoading] = useState(true);
  const { language, toggleLanguage } = useLanguage();

  useEffect(() => {
    loadFormData().then(localData => {
      // Normalize Planets and Amsam Planets using Zodiac Mapping
      const planetKeys = ["sooriyan", "chandiran", "sevai", "budhan", "viyazhan", "sukkiran", "sani", "rahu", "maanthi", "kethu", "lagnam"];
      
      planetKeys.forEach(planet => {
         // Normalize main chart
         if (localData[planet]) {
            localData[planet] = normalizeDropdownValue("zodiacSign", localData[planet]);
         }
         // Normalize amsam chart
         if (localData["amsam_" + planet]) {
            localData["amsam_" + planet] = normalizeDropdownValue("zodiacSign", localData["amsam_" + planet]);
         }
      });

      setForm(localData);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!loading) {
      saveFormData(form);
    }
  }, [form, loading]);

  const handle = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const rasiOptions = Array.from({ length: 13 }, (_, i) => ({
    value: i + 0,
    label: `${i + 0}`,
  }));

  const leftPlanets = [
    { key: "sooriyan", label: "சூரியன்-Sooriyan" },
    { key: "chandiran", label: "சந்திரன்-Chandiran" },
    { key: "sevai", label: "செவ்வாய்-Sevvai" },
    { key: "budhan", label: "புதன்-Budhan" },
    { key: "viyazhan", label: "வியாழன்-Viyazhan" },
    { key: "sukkiran", label: "சுக்கிரன்-Sukkiran" },
  ];

  const rightPlanets = [
    { key: "sani", label: "சனி-Sani" },
    { key: "rahu", label: "ராகு-Rahu" },
    { key: "maanthi", label: "மாந்தி-Maanthi" },
    { key: "kethu", label: "கேது-Kethu" },
    { key: "lagnam", label: "லக்னம்-Lagnam" },
  ];

  const allPlanets = [...leftPlanets, ...rightPlanets];
  const chartData = {};

  allPlanets.forEach((planet) => {
    const pos = form[planet.key];
    if (pos && pos >= 1 && pos <= 12) {
      if (!chartData[pos]) chartData[pos] = [];
      const tamilLabel = planet.label.split("-")[0];
      chartData[pos].push(tamilLabel);
    }
  });

  const amsamChartData = {};

  allPlanets.forEach((planet) => {
    const pos = form["amsam_" + planet.key];
    if (pos && pos >= 1 && pos <= 12) {
      if (!amsamChartData[pos]) amsamChartData[pos] = [];
      const tamilLabel = planet.label.split("-")[0];
      amsamChartData[pos].push(tamilLabel);
    }
  });

  const cellStyle = {
    border: "1px solid var(--input-border)",
    textAlign: "center",
    verticalAlign: "middle",
    padding: "20px",
    width: "100%",
    height: "100%",
    color: "var(--card-text)",
  };

  const renderBox = (pos) => {
    if (pos === "center") return <div className="center-box">{t("Rasi", language)}</div>;
    const planets = chartData[pos] || [];
    return (
      <div>
        <span
          style={{
            position: "absolute",
            fontSize: "10px",
            color: "var(--card-text)",
            opacity: 0.5,
            top: "2px",
            left: "2px",
          }}
        >
          {pos}
        </span>
        {planets.length > 0 ? planets.join(", ") : ""}
      </div>
    );
  };

  const renderAmsamBox = (pos) => {
    if (pos === "center") return <div className="center-box">{t("Amsam", language)}</div>;
    const planets = amsamChartData[pos] || [];
    return (
      <div>
        <span
          style={{
            position: "absolute",
            fontSize: "10px",
            color: "var(--card-text)",
            opacity: 0.5,
            top: "2px",
            left: "2px",
          }}
        >
          {pos}
        </span>
        {planets.length > 0 ? planets.join(", ") : ""}
      </div>
    );
  };

  return (
    <>
      <div className="edit-detail-container">
      {language === "ta" && (
        <div style={{ position: "fixed", top: "100px", right: "20px", zIndex: 50 }}>
          </div>
      )}

      <h1 style={{ fontWeight: 'bold' }}>{t("Edit Form", language)}</h1>
      <br/>
      <Navigation current={5} />
      <h1>{t("Step 5 - Full Horoscope Chart", language)}</h1>
      <br></br>
      <h2>
        <b>{t("Choose for Rasi", language)}</b>
      </h2>
      <div className="step5-layout">
        <div className="planet-container" style={{ flex: 1 }}>
          <div className="card">
            {allPlanets.map((planet) => (
              <div key={planet.key} className="planet-row">
                <label
                  htmlFor={planet.key}
                  className="planet-label"
                >
                  {planet.label}
                </label>
                <select
                  id={planet.key}
                  className="input2"
                  name={planet.key}
                  value={form[planet.key] ?? ""}
                  onChange={handle}
                >
                  {rasiOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div>
            <h2>{t("Chart for Rasi-ராசி", language)}</h2>
            <div className="rasi-grid">
              {renderBox(1)}
              {renderBox(2)}
              {renderBox(3)}
              {renderBox(4)}

              {renderBox(12)}
              <div className="center-box">ராசி</div>
              {renderBox(5)}

              {renderBox(11)}
              {renderBox(6)}

              {renderBox(10)}
              {renderBox(9)}
              {renderBox(8)}
              {renderBox(7)}
            </div>
          </div>
        </div>
      </div>

      <br></br>
      <br></br>
      <h2>
        <b>{t("Choose for Amsam", language)}</b>
      </h2>

      <div className="step5-layout">
        <div className="planet-container" style={{ flex: 1 }}>
          <div className="card">
            {allPlanets.map((planet) => (
              <div key={"amsam-" + planet.key} className="planet-row">
                <label
                  className="planet-label"
                >
                  {planet.label}
                </label>
                <select
                  className="input2"
                  name={"amsam_" + planet.key}
                  value={form["amsam_" + planet.key] ?? ""}
                  onChange={handle}
                >
                  {rasiOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div>
            <h2>{t("Chart for Amsam-அம்சம்", language)}</h2>
            <div className="rasi-grid">
              {renderAmsamBox(1)}
              {renderAmsamBox(2)}
              {renderAmsamBox(3)}
              {renderAmsamBox(4)}

              {renderAmsamBox(12)}
              <div className="center-box">அம்சம்</div>
              {renderAmsamBox(5)}

              {renderAmsamBox(11)}
              {renderAmsamBox(6)}

              {renderAmsamBox(10)}
              {renderAmsamBox(9)}
              {renderAmsamBox(8)}
              {renderAmsamBox(7)}
            </div>
          </div>
        </div>
      </div>

      <div className="edit-form-container button-container">
        <div className="edit-left-column">
          <button
            style={{width: "80%"}}
            className="edit-detail-previous-button"
            onClick={async () => {
              await saveFormData(form);
              router.push("/editdetail/4");
            }}
          >
            {t("Previous", language)}
          </button>
        </div>
        <div className="edit-right-column">
          <button
            style={{width: "80%"}}
            className="edit-detail-button"
            onClick={async () => {
              await saveFormData(form);
              router.push("/editdetail/6");
            }}
          >
            {t("Next", language)}
          </button>
        </div>
      </div>

      <div style={{ textAlign: "center", marginTop: "20px", marginBottom: "20px" }}>
        {t("Go To Dashboard", language)} <span style={{ color: "blue", cursor: "pointer", textDecoration: "underline" }} onClick={() => router.push("/dashboard")}>{t("ClickHere", language)}</span>
      </div>

    </div>
    </>
  );
}
