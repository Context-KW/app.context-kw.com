"use client";

import React from "react";
import { useLanguage } from "@/app/context/LanguageContext";
import { config } from "@/config";

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();
  const nextLanguage = language === "en" ? "ar" : "en";

  return (
    <button
      type="button"
      className="btn btn-secondary"
      onClick={() => setLanguage(nextLanguage)}
      aria-label={`Switch language to ${config.languages.labels[nextLanguage]}`}
    >
      {config.languages.labels[nextLanguage]}
    </button>
  );
}
