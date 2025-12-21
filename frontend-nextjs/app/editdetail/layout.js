"use client";

import { Suspense } from "react";

export default function EditDetailLayout({ children }) {
  return (
    <div
      style={{
        background: "var(--container-bg)",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      <Suspense fallback={<div style={{ textAlign: "center", padding: "40px" }}>Loading...</div>}>
        {children}
      </Suspense>
    </div>
  );
}
