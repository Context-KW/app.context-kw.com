"use client";

import { useLanguage } from "@/app/context/LanguageContext";
import type { Language } from "@/app/context/LanguageContext";
import { pickText } from "@/app/utils/format";

/** Returns the active language and a helper that picks the English or Arabic string. */
export function useTx(): {
  language: Language;
  isArabic: boolean;
  tx: (en: string, ar: string) => string;
} {
  const { language } = useLanguage();
  return {
    language,
    isArabic: language === "ar",
    tx: (en, ar) => pickText(language, en, ar),
  };
}
