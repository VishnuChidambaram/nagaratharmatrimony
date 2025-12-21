"use client";
import { Suspense } from "react";
import { FormProvider } from "./components/FormContext";

export default function RegisterLayout({ children }) {
  return (
    <FormProvider>
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
    </FormProvider>
  );
}
