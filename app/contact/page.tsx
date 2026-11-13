"use client";

import React from "react";
import { LanguageToggle } from "@/app/components/LanguageToggle";
import { Logo } from "@/app/components/Logo";
import { useTx } from "@/app/utils/useTx";

/** WhatsApp Business link for the contact page button. */
const WHATSAPP_URL = "https://wa.me/96555039794";

const CONTACT_EMAIL = "info@context-kw.com";
const CONTACT_PHONE_DISPLAY = "+965 5503 9794";
const CONTACT_PHONE_HREF = "+96555039794";
const WEBSITE_DOMAIN = "www.context-kw.com";

/** Social media profiles, all under the handle @contextq8. */
const SOCIAL_LINKS = [
  { label: "Instagram", handle: "contextq8", url: "https://www.instagram.com/contextq8", icon: "📸" },
  { label: "TikTok", handle: "contextq8", url: "https://www.tiktok.com/@contextq8", icon: "🎵" },
  { label: "Facebook", handle: "contextq8", url: "https://www.facebook.com/contextq8", icon: "📘" },
];

/** Official Google Maps link for the business location. */
const GOOGLE_MAPS_URL = "https://maps.app.goo.gl/shvx5jEVicYhQ1D17";

const LOCATION_EN = {
  address:
    "Farwaniya, Habib Al-Munawir Street, between Ibn Al-Wazeer and Al-Ameed Coffee, Shop 16 (Basement).",
  directions:
    "Enter the corridor between the two shops and take the stairs down. First shop to your right.",
};
const LOCATION_AR = {
  address:
    "الفروانية، شارع حبيب المناور، بين ابن الوزير ومطحنة بن العميد، محل 16 (السرداب).",
  directions:
    "الدخول من الممر بين المحلين والنزول بالدرج، المحل على يمينك مباشرة عند نهاية الدرج.",
};

const rowClass =
  "grid gap-2 border-t border-black py-6 sm:grid-cols-[200px_1fr] sm:gap-8";
const labelClass = "text-xl font-semibold text-black sm:text-2xl";

export default function ContactPage() {
  const { isArabic, tx } = useTx();

  return (
    <main className="max-w-3xl mx-auto px-4 pt-10 pb-32 bg-background text-black">
      <header className="flex items-start justify-between gap-4">
        <Logo className="w-36 shrink-0" />
        <div>
          <h1 className="text-4xl font-bold leading-tight">
            {isArabic ? "لديك أي أسئلة؟" : "Got any questions?"}
          </h1>
          <p className="mt-3 text-base text-black">
            {tx(
              "Reach out to our team. We reply during business hours.",
              "تواصل مع فريقنا. نرد خلال ساعات العمل."
            )}
          </p>
        </div>
        <LanguageToggle />
      </header>

      {/* WhatsApp Business routing button, styled as a minimal bordered card. */}
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-10 flex items-center justify-between gap-4 border-2 border-black bg-background p-6 transition-colors hover:bg-black hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
      >
        <span className="flex items-center gap-4">
          <span className="relative flex h-12 w-12 shrink-0 items-center justify-center">
            <span
              aria-hidden="true"
              className="absolute inset-0 animate-ping rounded-full bg-[#25D366] opacity-60"
            />
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="relative h-10 w-10 fill-[#25D366]"
            >
            <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2Zm0 18.15h-.01a8.23 8.23 0 0 1-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 4.54 0 8.24 3.7 8.24 8.24 0 4.54-3.7 8.24-8.23 8.24Zm4.52-6.17c-.25-.12-1.46-.72-1.69-.8-.23-.08-.39-.12-.55.12-.17.25-.63.8-.77.96-.14.17-.29.19-.53.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.38-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.55-1.33-.76-1.82-.2-.48-.4-.42-.55-.42h-.47c-.16 0-.43.06-.66.31-.23.25-.86.84-.86 2.05 0 1.21.88 2.38 1 2.54.12.17 1.74 2.65 4.21 3.72.59.25 1.05.4 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.46-.6 1.67-1.17.2-.58.2-1.07.14-1.17-.06-.11-.22-.17-.47-.29Z" />
            </svg>
          </span>
          <span>
            <span className="block text-xl font-bold">
              {tx("Connect with Context on WhatsApp", "تواصل مع كونتكست عبر واتساب")}
            </span>
            <span className="mt-1 block text-sm">
              {tx("Fastest way to reach our team", "أسرع طريقة للتواصل مع فريقنا")}
            </span>
          </span>
        </span>
        <span aria-hidden="true" className="text-2xl font-bold">
          {isArabic ? "←" : "→"}
        </span>
      </a>

      <section aria-label={tx("Contact details", "بيانات التواصل")} className="mt-10">
        {/* Location row: Arabic copy on the Arabic page, English on the English page */}
        <div className={rowClass}>
          <p className={labelClass}>{tx("📌 Location", "العنوان 📌")}</p>
          <div>
            <p className="text-base text-black">
              {isArabic ? LOCATION_AR.address : LOCATION_EN.address}
            </p>
            <p className="mt-3 text-sm text-black">
              <span className="font-bold">
                {tx("Directions: ", "ارشادات الوصول: ")}
              </span>
              {isArabic ? LOCATION_AR.directions : LOCATION_EN.directions}
            </p>
          </div>
        </div>

        {/* Contact details row */}
        <div className={rowClass}>
          <p className={labelClass}>{tx("Our Contact Details", "بيانات التواصل")}</p>
          <ul className="space-y-3 text-base font-semibold text-black">
            <li>
              ✉️{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="underline underline-offset-4" dir="ltr">
                {CONTACT_EMAIL}
              </a>
            </li>
            <li>
              📞{" "}
              <a href={`tel:${CONTACT_PHONE_HREF}`} className="underline underline-offset-4" dir="ltr">
                {CONTACT_PHONE_DISPLAY}
              </a>
            </li>
            <li>
              🌐{" "}
              <a
                href={`https://${WEBSITE_DOMAIN}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4"
                dir="ltr"
              >
                {WEBSITE_DOMAIN}
              </a>
            </li>
            {SOCIAL_LINKS.map((social) => (
              <li key={social.label}>
                {social.icon}{" "}
                <a
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-4"
                  dir="ltr"
                >
                  {social.label}: @{social.handle}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Google Maps row: links to the official business location */}
        <div className={rowClass}>
          <p className={labelClass}>{tx("Google Maps", "خرائط جوجل")}</p>
          <div>
            <a
              href={GOOGLE_MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between gap-4 border-2 border-black bg-background p-5 transition-colors hover:bg-black hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
            >
              <span className="flex items-center gap-4">
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="h-7 w-7 shrink-0 fill-current"
                >
                  <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z" />
                </svg>
                <span>
                  <span className="block text-lg font-bold">
                    {tx("Open in Google Maps", "افتح في خرائط جوجل")}
                  </span>
                  <span className="mt-1 block text-sm">
                    {tx("Get directions to our office", "احصل على الاتجاهات إلى مكتبنا")}
                  </span>
                </span>
              </span>
              <span aria-hidden="true" className="text-2xl font-bold">
                {isArabic ? "←" : "→"}
              </span>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
