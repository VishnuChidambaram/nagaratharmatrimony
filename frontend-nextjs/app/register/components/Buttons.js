"use client";
import React from "react";
import { useRouter } from "next/navigation";

export function PrevNext({ step }) {
  const router = useRouter();
  return (
    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12 }}>
      {step > 1 && (
        <button onClick={() => router.push(`/register/${step - 1}`)} style={{ padding: 10 }}>
          Previous
        </button>
      )}
      {step < 8 && (
        <button onClick={() => router.push(`/register/${step + 1}`)} style={{ padding: 10 }}>
          Next
        </button>
      )}
    </div>
  );
}
