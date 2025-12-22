"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { API_URL } from "../../utils/config";
import { getPhotoUrl } from "../../utils/photoUtils";

export default function PreviewDetail() {
  const { email } = useParams();
  const [detailData, setDetailData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await fetch(
          `${API_URL}/userdetails/${encodeURIComponent(email)}`
        );
        const result = await response.json();
        if (result.success) {
          setDetailData(result.data);
        } else {
          setError("Failed to fetch detail: " + result.message);
        }
      } catch (err) {
        setError("Error fetching data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (email) {
      fetchDetail();
    }
  }, [email]);

  if (loading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "var(--page-bg)",
          color: "var(--page-text)",
          fontFamily: '"Arial", sans-serif',
        }}
      >
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "var(--page-bg)",
          color: "var(--page-text)",
          fontFamily: '"Arial", sans-serif',
        }}
      >
        <p style={{ fontSize: "18px", color: "#c00" }}>{error}</p>
      </div>
    );
  }

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "var(--page-bg)",
        color: "var(--page-text)",
        fontFamily: '"Arial", sans-serif',
        padding: "20px",
      }}
    >
      <style jsx>{`
        .scrollable-content {
          flex: 1;
          overflow: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
          max-height: calc(100vh - 80px);
          padding-bottom: 10px;
        }
        .scrollable-content::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* Header */}
      <div
        style={{
          position: "sticky",
          top: 0,
          background: "var(--page-bg)",
          height: "60px",
          borderBottom: "1px solid var(--input-border)",
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          paddingLeft: "20px",
          paddingRight: "20px",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: "24px",
            color: "var(--page-text)",
            fontWeight: "bold",
          }}
        >
          Preview Details
        </h1>
      </div>

      {/* Scrollable Content */}
      <div className="scrollable-content">
        {detailData && (
          <div
            style={{
              maxWidth: "600px",
              margin: "0 auto",
              backgroundColor: "var(--card-bg)",
              padding: "30px",
              borderRadius: "12px",
              boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
              border: "1px solid var(--input-border)",
            }}
          >
            <h2
              style={{
                marginTop: 0,
                color: "var(--card-text)",
                fontWeight: "bold",
                textAlign: "center",
                marginBottom: "20px",
              }}
            >
              User Details
            </h2>

            {/* Image */}
            {(() => {
              const photoUrl = getPhotoUrl(detailData);
              return photoUrl ? (
                <div style={{ textAlign: "center", marginBottom: "20px" }}>
                  <img
                    loading="lazy"
                    src={photoUrl}
                    alt={detailData.name}
                    style={{
                      width: "120px",
                      height: "120px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "2px solid var(--input-border)",
                    }}
                  />
                </div>
              ) : null;
            })()}

            {/* Details */}
            <div style={{ display: "grid", gap: "15px" }}>
              <div>
                <strong style={{ color: "#555" }}>ID:</strong>{" "}
                <span style={{ color: "#333" }}>
                  {detailData.user_id || detailData.id}
                </span>
              </div>
              <div>
                <strong style={{ color: "#555" }}>Name:</strong>{" "}
                <span style={{ color: "#333" }}>{detailData.name}</span>
              </div>
              <div>
                <strong style={{ color: "#555" }}>Email:</strong>{" "}
                <span style={{ color: "#333" }}>{detailData.email}</span>
              </div>
              <div>
                <strong style={{ color: "#555" }}>Phone:</strong>{" "}
                <span style={{ color: "#333" }}>{detailData.phone}</span>
              </div>
              <div>
                <strong style={{ color: "#555" }}>Description:</strong>{" "}
                <span style={{ color: "#333", lineHeight: "1.5" }}>
                  {detailData.description}
                </span>
              </div>
              <div>
                <strong style={{ color: "#555" }}>
                  Education Qualification:
                </strong>{" "}
                <span style={{ color: "#333" }}>
                  {detailData.educationQualification || "N/A"}
                </span>
              </div>
              <div>
                <strong style={{ color: "#555" }}>Work Details:</strong>{" "}
                <span style={{ color: "#333", lineHeight: "1.5" }}>
                  {detailData.workDetails || "N/A"}
                </span>
              </div>
              <div>
                <strong style={{ color: "#555" }}>Created At:</strong>{" "}
                <span style={{ color: "#333" }}>
                  {detailData.created_at
                    ? new Date(detailData.created_at).toLocaleString()
                    : "N/A"}
                </span>
              </div>
              {detailData.imagePath && !detailData.photo && (
                <div>
                  <strong style={{ color: "#555" }}>Image:</strong>{" "}
                  <a
                    href={getPhotoUrl(detailData)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#007bff", textDecoration: "none" }}
                  >
                    View Image
                  </a>
                </div>
              )}
              {detailData.pdfPath && (
                <div>
                  <strong style={{ color: "#555" }}>PDF:</strong>{" "}
                  <a
                    href={`${API_URL}/uploads/${detailData.pdfPath.replace(
                      /\\/g,
                      "/"
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#007bff", textDecoration: "none" }}
                  >
                    View PDF
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          height: "50px",
          background: "var(--page-bg)",
          borderTop: "1px solid var(--input-border)",
        }}
      ></div>
    </div>
  );
}
