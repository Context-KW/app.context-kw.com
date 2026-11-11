"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Language = "en" | "ar";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Start with "en" on both server and client to avoid hydration mismatches,
  // then restore the saved preference after mount.
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language");
    if (savedLanguage === "en" || savedLanguage === "ar") {
      setLanguageState(savedLanguage);
    }
  }, []);

  // Keep <html lang> and <html dir> in sync so the RTL rules in globals.css apply.
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        isRTL: language === "ar",
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}