"use client";
import React from "react";
import { useRouter } from "next/navigation";

export default function Navigation({ current }) {
  const router = useRouter();
  const steps = [1, 2, 3, 4, 5, 6, 7, 8];
  return (
    <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 12 }}>
      {steps.map((s) => (
        <div
          key={s}
          onClick={() => router.push(`/editdetail/${s}`)}
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
