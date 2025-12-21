"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { styles, loadFormData, saveFormData, defaultFormData } from "../../register/styles";
import Navigation from "../components/Navigation";
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
      <style jsx>{`
        @media (max-width: 768px) {
          .button-container {
            flex-direction: column !important;
            gap: 10px !important;
          }
          
          .button-container button {
            width: 90% !important;
            margin: 10px auto !important;
            max-width: 400px;
          }
        }
        
        @media (max-width: 480px) {
          h1 {
            font-size: 22px !important;
          }
        }
      `}</style>
      <div style={styles.container}>
      <style>
        {`
          .step5-layout {
            display: flex;
            justify-content: space-between;
            gap: 20;
          }
        .planet-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 13px;
        }
        .planet-row label {
          margin-bottom: 0 !important;
          flex: 1;
        }
        .input2 {
          width: 150px;
          padding: 4px;
          border-radius: 6px;
          border: 1px solid var(--input-border);
          background: var(--input-bg);
          color: var(--input-text);
          font-size: 16px;
        }
        /* Mobile screen */
        @media (max-width: 600px) {
          .input2 {
            width: 40%;
          }
        }
          @media (max-width: 768px) {
            .step5-layout {
              flex-direction: column;
            }

            .planet-container {
              flex-direction: column !important;
              width: 100% !important;
              max-width: 100% !important;
            }
            
            .step5-layout > div {
              flex: none !important;
              width: 100% !important;
            }
          }

          .rasi-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 2px;
            width: 100%;
            max-width: 400px;
            aspect-ratio: 1;
            margin: 40px auto;
            page-break-inside: avoid;
            border: 1px solid var(--input-border);
          }

          .rasi-grid-container {
            width: 100%;
            margin: auto;
            display: flex;
            justify-content: center;
            page-break-inside: avoid;
          }


          .rasi-grid > div {
            border: 1px solid var(--input-border);
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--card-bg);
            color: var(--card-text);
            text-align: center;
            padding: 5px;
            font-size: 12px;
            min-height: 80px;
            position: relative;
          }

          .center-box {
            grid-column: 2 / span 2;
            grid-row: 2 / span 2;
            font-weight: bold;
            font-size: 18px;
            background: var(--card-bg);
            color: var(--card-text);
          }
            @media (max-width: 600px) {
            .rasi-grid {
            max-width: 100% !important;
            font-size: 10px !important;
            width: 100% !important;
            margin: 40px auto 0px auto;
            }
            .rasi-grid > div {
            padding: 3px !important;
            font-size: 10px !important;
            min-height: 60px !important;
            }
            .center-box {
            font-size: 14px !important;
            }
            }

          @media print {
            .rasi-grid {
              width: 210mm;
              height: 210mm;
              page-break-inside: avoid;
            }
          }

          .card {
            margin: 40px 20px 20px 20px;
            padding: 20px;
            border: 1px solid var(--input-border);
            border-radius: 12px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
            background: var(--card-bg);
            color: var(--card-text);
          }

          @media (max-width: 600px) {
            .card {
              margin: 40px 20px 20px 20px;
            }
          }

}
        `}
      </style>
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
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    color: "var(--card-text)",
                  }}
                >
                  {planet.label}
                </label>
                <select
                  id={planet.key}
                  className="input2"
                  //style={styles.input2}
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

        <div
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
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
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    color: "var(--card-text)",
                  }}
                >
                  {planet.label}
                </label>
                <select
                  className="input2"
                  //style={styles.input2}
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

        <div
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
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

      <div style={styles.formContainer} className="button-container">
        <div style={styles.leftColumn}>
          <button
            style={styles.editDetailPreviousButton}
            onClick={async () => {
              await saveFormData(form); // Save before navigating
              router.push("/editdetail/4");
            }}
          >
            {t("Previous", language)}
          </button>
        </div>
        <div style={styles.rightColumn}>
          <button
            style={styles.editDetailButton}
            onClick={async () => {
              await saveFormData(form); // Save before navigating
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
