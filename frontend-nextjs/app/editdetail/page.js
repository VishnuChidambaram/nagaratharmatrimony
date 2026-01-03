"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";


export default function EditIndex() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    sessionStorage.removeItem("lastFetchedEmail");
    const email = searchParams.get("email");
    if (email) {
      router.push(`/editdetail/1?email=${encodeURIComponent(email)}`);
    } else {
      router.push("/editdetail/1");
    }
  }, [router, searchParams]);
  return null;
}
