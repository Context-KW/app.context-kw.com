"use client";

import React from "react";
import Link from "next/link";
import { LanguageToggle } from "@/app/components/LanguageToggle";
import { Logo } from "@/app/components/Logo";
import { useLanguage } from "@/app/context/LanguageContext";
import { config } from "@/config";

interface ComingSoonProps {
  /** Navigation tab id from config.navigation.tabs (e.g. "orders"). */
  tabId: string;
}

export function ComingSoon({ tabId }: ComingSoonProps) {
  const { language } = useLanguage();
  const isArabic = language === "ar";

  const tab = config.navigation.tabs.find((item) => item.id === tabId);
  const title = tab ? (isArabic ? tab.labelAr : tab.labelEn) : tabId;

  return (
    <main className="max-w-7xl mx-auto px-4 pt-10 pb-32">
      {tabId === "orders" ? (
        <header className="relative flex flex-col items-center gap-4 text-center">
          <div className="absolute end-0 top-0">
            <LanguageToggle />
          </div>
          <Logo className="w-48" />
          <h1 className="sr-only">{title}</h1>
        </header>
      ) : (
        <header className="flex items-start justify-between gap-4">
          <h1 className="text-3xl font-bold">{title}</h1>
          <LanguageToggle />
        </header>
      )}

      <section className="card mt-10 p-8 text-center">
        <p className="text-xl font-bold">
          {isArabic ? "قريباً" : "Coming soon"}
        </p>
        <p className="mt-2 text-text-secondary">
          {isArabic
            ? "هذه الصفحة قيد الإنشاء."
            : "This page is under construction."}
        </p>
        <Link href="/services" className="btn btn-primary mt-6">
          {isArabic ? "العودة إلى الخدمات" : "Back to Services"}
        </Link>
      </section>
    </main>
  );
}
