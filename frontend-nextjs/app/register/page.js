"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";


export default function RegisterIndex() {
const router = useRouter();
useEffect(() => {
router.push("/register/1");
}, [router]);
return null;
}