"use client";
import { useLanguage as useContextLanguage } from "../context/LanguageContext";

export function useLanguage() {
  return useContextLanguage();
}
