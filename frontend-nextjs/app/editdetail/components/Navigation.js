"use client";
import React from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function Navigation({ current }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const steps = [1, 2, 3, 4, 5, 6, 7, 8];
  return (
    <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 12 }}>
      {steps.map((s) => (
        <div
          key={s}
          onClick={() => {
            const path = `/editdetail/${s}`;
            const fullPath = email ? `${path}?email=${encodeURIComponent(email)}` : path;
            router.push(fullPath);
          }}
          style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            border: s === current ? "2px solid #0070f3" : "1px solid #ccc",
            background: s === current ? "#e6f0ff" : "transparent",
          }}
        >
          {s}
        </div>
      ))}
    </div>
  );
}
