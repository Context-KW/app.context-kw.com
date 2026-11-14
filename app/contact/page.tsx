"use client";

import React, { useEffect, useRef, useState } from "react";
import { LanguageToggle } from "@/app/components/LanguageToggle";
import { Logo } from "@/app/components/Logo";
import { useTx } from "@/app/utils/useTx";
import { config } from "@/config";

/** WhatsApp Business link for the contact page button. */
const WHATSAPP_URL = "https://wa.me/96555039794";

const CONTACT_EMAIL = config.contact.email;
const CONTACT_PHONE_DISPLAY = config.contact.phone;
const CONTACT_PHONE_HREF = config.contact.phone.replace(/\s+/g, "");
const WEBSITE_DOMAIN = config.contact.website;
const UNIFIED_HANDLE = `@${config.contact.handle}`;

/** Official Google Maps link for the business location. */
const GOOGLE_MAPS_URL = "https://maps.app.goo.gl/shvx5jEVicYhQ1D17";
/** Embedded map query, keyed to the address so no API key is needed. */
const GOOGLE_MAPS_EMBED_URL =
  "https://www.google.com/maps?q=" +
  encodeURIComponent("Habib Al-Munawir Street, Shop 16, Farwaniya, Kuwait") +
  "&output=embed";

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

/* ---------- Icons: 1.5px-stroke monochrome inline SVGs ---------- */

type IconProps = { className?: string };

function Svg({ className, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {children}
    </svg>
  );
}

function MailIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </Svg>
  );
}

function PhoneIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" />
    </Svg>
  );
}

function MapPinIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </Svg>
  );
}

function GlobeIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </Svg>
  );
}

function CopyIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V5a2 2 0 0 1 2-2h10" />
    </Svg>
  );
}

function CheckIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M20 6L9 17l-5-5" />
    </Svg>
  );
}

function ArrowUpRightIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M7 17L17 7M8 7h9v9" />
    </Svg>
  );
}

function WhatsAppIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M3 21l1.6-4.6A9 9 0 1 1 8 19.6L3 21z" />
      <path d="M9 9.5c0 2.8 2.7 5.5 5.5 5.5l1-1.2-1.8-.9-.8.8c-.9-.4-1.9-1.4-2.3-2.3l.8-.8-.9-1.8z" />
    </Svg>
  );
}

function InstagramIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
    </Svg>
  );
}

function TikTokIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M16.5 3c.3 2.6 1.9 4.4 4.5 4.6v3.2a7.6 7.6 0 0 1-4.4-1.4v6.2a5.6 5.6 0 1 1-5.6-5.6v3.3a2.3 2.3 0 1 0 2.3 2.3V3z" />
    </Svg>
  );
}

function FacebookIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </Svg>
  );
}

function LinkedInIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7" />
    </Svg>
  );
}

const SOCIAL_ICONS: Record<string, (props: IconProps) => React.ReactElement> = {
  linkedin: LinkedInIcon,
  instagram: InstagramIcon,
  tiktok: TikTokIcon,
  facebook: FacebookIcon,
};

/* ---------- Shared styles ---------- */

/** Bento card: frosted glass, border, and hover highlight. */
const bentoCardClass =
  "group flex flex-col gap-4 rounded-2xl border border-black/10 bg-white/60 p-5 shadow-sm backdrop-blur-md transition-all duration-200 hover:border-black hover:shadow-md";

const iconBadgeClass =
  "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-black/15 bg-white/80 backdrop-blur-md transition-all duration-200 group-hover:border-black";

const labelTextClass = "block text-xs font-semibold uppercase tracking-widest text-black/50";

/* ---------- Unified handle spotlight ---------- */

function UnifiedHandleSpotlight() {
  const { tx } = useTx();
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, []);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(UNIFIED_HANDLE);
      setCopied(true);
      if (resetTimer.current) clearTimeout(resetTimer.current);
      resetTimer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section
      aria-label={tx("Unified handle", "المعرّف الموحّد")}
      className="relative mt-10 overflow-hidden rounded-3xl border border-black bg-black p-6 text-white sm:p-8"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -end-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-3xl"
      />
      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest backdrop-blur-md">
            {tx("Unified handle", "معرّف موحّد")}
          </span>
          <p
            dir="ltr"
            className="mt-4 inline-flex max-w-full items-center rounded-full border border-white/25 bg-white/10 px-5 py-2 text-2xl font-bold tracking-tight backdrop-blur-md sm:text-3xl"
          >
            {UNIFIED_HANDLE}
          </p>
          <p className="mt-4 text-base text-white/80">
            {tx(
              "Find us anywhere under one unified handle",
              "تواصل معنا على جميع المنصات بمعرّف واحد موحّد"
            )}
          </p>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-black transition-all duration-200 hover:scale-[1.03] hover:bg-white/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          {copied ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
          <span aria-live="polite">
            {copied ? tx("Copied!", "تم النسخ!") : tx("Copy @contextq8", "نسخ @contextq8")}
          </span>
        </button>
      </div>
    </section>
  );
}

/* ---------- Social platform pills ---------- */

function SocialPills() {
  const { tx } = useTx();

  return (
    <section aria-label={tx("Social platforms", "المنصات الاجتماعية")} className="mt-10">
      <h2 className="text-xl font-semibold">{tx("Follow us", "تابعنا")}</h2>
      <ul className="mt-4 flex flex-wrap gap-3">
        {config.contact.socials.map((social) => {
          const Icon = SOCIAL_ICONS[social.id];
          return (
            <li key={social.id}>
              <a
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-3 rounded-full border border-black/15 bg-white/60 py-2 ps-2 pe-4 shadow-sm backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-black hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-black/15 bg-white transition-all duration-200 group-hover:border-black">
                  {Icon && <Icon className="h-4 w-4" />}
                </span>
                <span className="text-sm font-semibold">{social.label}</span>
                <span dir="ltr" className="rounded-full bg-black/5 px-2 py-0.5 text-xs text-black/70">
                  {UNIFIED_HANDLE}
                </span>
                <ArrowUpRightIcon className="h-4 w-4 text-black/50 transition-all duration-200 group-hover:text-black" />
              </a>
            </li>
          );
        })}
        <li>
          <span className="inline-flex items-center rounded-full border border-dashed border-black/20 px-4 py-2.5 text-sm text-black/50">
            {tx("More platforms coming soon", "المزيد من المنصات قريباً")}
          </span>
        </li>
      </ul>
    </section>
  );
}

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

      {/* WhatsApp Business routing button */}
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="group mt-10 flex items-center justify-between gap-4 rounded-2xl border border-black/10 bg-white/60 p-5 shadow-sm backdrop-blur-md transition-all duration-200 hover:border-black hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
      >
        <span className="flex items-center gap-4">
          <span className="relative flex h-11 w-11 shrink-0 items-center justify-center">
            <span
              aria-hidden="true"
              className="absolute inset-0 animate-ping rounded-full bg-[#25D366] opacity-40"
            />
            <span className="relative flex h-11 w-11 items-center justify-center rounded-full border border-black/15 bg-white/80 backdrop-blur-md transition-all duration-200 group-hover:border-black">
              <WhatsAppIcon className="h-5 w-5" />
            </span>
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
        <ArrowUpRightIcon className="h-5 w-5 shrink-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </a>

      <UnifiedHandleSpotlight />

      <SocialPills />

      <section aria-label={tx("Contact details", "بيانات التواصل")} className="mt-10">
        <h2 className="text-xl font-semibold">{tx("Direct contact", "التواصل المباشر")}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {/* Phone */}
          <a href={`tel:${CONTACT_PHONE_HREF}`} className={bentoCardClass}>
            <span className={iconBadgeClass}>
              <PhoneIcon className="h-5 w-5" />
            </span>
            <span>
              <span className={labelTextClass}>{tx("Phone", "الهاتف")}</span>
              <span dir="ltr" className="mt-1 block text-lg font-bold">
                {CONTACT_PHONE_DISPLAY}
              </span>
            </span>
          </a>

          {/* Email */}
          <a href={`mailto:${CONTACT_EMAIL}`} className={bentoCardClass}>
            <span className={iconBadgeClass}>
              <MailIcon className="h-5 w-5" />
            </span>
            <span>
              <span className={labelTextClass}>{tx("Email", "البريد الإلكتروني")}</span>
              <span dir="ltr" className="mt-1 block break-all text-lg font-bold">
                {CONTACT_EMAIL}
              </span>
            </span>
          </a>

          {/* Website */}
          <a
            href={`https://${WEBSITE_DOMAIN}`}
            target="_blank"
            rel="noopener noreferrer"
            className={bentoCardClass}
          >
            <span className={iconBadgeClass}>
              <GlobeIcon className="h-5 w-5" />
            </span>
            <span>
              <span className={labelTextClass}>{tx("Website", "الموقع الإلكتروني")}</span>
              <span dir="ltr" className="mt-1 block text-lg font-bold">
                {WEBSITE_DOMAIN}
              </span>
            </span>
          </a>

          {/* Physical hub */}
          <div className={bentoCardClass}>
            <span className={iconBadgeClass}>
              <MapPinIcon className="h-5 w-5" />
            </span>
            <div>
              <span className={labelTextClass}>{tx("Our Hub", "مقرّنا")}</span>
              <p className="mt-1 text-base font-semibold">
                {isArabic ? LOCATION_AR.address : LOCATION_EN.address}
              </p>
              <p className="mt-2 text-sm text-black/70">
                <span className="font-bold">{tx("Directions: ", "ارشادات الوصول: ")}</span>
                {isArabic ? LOCATION_AR.directions : LOCATION_EN.directions}
              </p>
            </div>
          </div>
        </div>

        {/* Map: embedded preview of the office location */}
        <div className="mt-4 overflow-hidden rounded-2xl border border-black/10 bg-white/60 shadow-sm backdrop-blur-md transition-all duration-200 hover:border-black hover:shadow-md">
          <iframe
            src={GOOGLE_MAPS_EMBED_URL}
            title={tx("Map of our office", "خريطة مقرّنا")}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-56 w-full border-0 grayscale transition-all duration-500 hover:grayscale-0"
          />
          <div className="flex items-center justify-between gap-4 p-5">
            <span className="flex items-center gap-3">
              <span className={iconBadgeClass}>
                <MapPinIcon className="h-5 w-5" />
              </span>
              <span className="text-sm font-semibold">
                {isArabic ? "الفروانية، محل 16" : "Farwaniya, Shop 16"}
              </span>
            </span>
            <a
              href={GOOGLE_MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-black px-4 py-2 text-sm font-bold text-white transition-all duration-200 hover:scale-[1.03] focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
            >
              {tx("Open in Maps", "افتح الخريطة")}
              <ArrowUpRightIcon className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
