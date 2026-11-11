"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/app/components/Logo";
import { useLanguage } from "@/app/context/LanguageContext";
import type { Language } from "@/app/context/LanguageContext";

// Fullscreen language gate shown on the root route.
// Selecting a language sets the global language state, then opens the services portal.
export default function LanguageGatePage() {
  const { setLanguage } = useLanguage();
  const router = useRouter();

  const selectLanguage = useCallback(
    (lang: Language) => {
      setLanguage(lang);
      router.push("/services");
    },
    [setLanguage, router]
  );

  return (
    <main className="fixed inset-0 w-screen h-screen bg-background z-50 flex flex-col items-center justify-center p-6">
      <Logo className="mb-12 w-[min(560px,90vw)]" />
      <h1 className="sr-only">
        <span>CONTEXT</span>
        <span className="mx-[0.25em] font-light" aria-hidden="true">
          |
        </span>
        <span lang="ar" dir="rtl">
          كونتكست
        </span>
      </h1>

      <div className="mt-16 flex w-full max-w-2xl flex-col gap-6 sm:flex-row">
        <button
          type="button"
          lang="en"
          onClick={() => selectLanguage("en")}
          className="flex-1 border-2 border-brand-navy bg-brand-navy px-8 py-8 text-2xl font-bold uppercase tracking-wide text-white transition-colors hover:bg-background hover:text-brand-navy focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-gold focus-visible:ring-offset-4"
        >
          English
        </button>
        <button
          type="button"
          lang="ar"
          dir="rtl"
          onClick={() => selectLanguage("ar")}
          className="flex-1 border-2 border-brand-navy bg-brand-navy px-8 py-8 text-2xl font-bold text-white transition-colors hover:bg-background hover:text-brand-navy focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-gold focus-visible:ring-offset-4"
        >
          العربية
        </button>
      </div>
    </main>
  );
}
