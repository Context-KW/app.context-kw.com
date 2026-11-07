"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/app/context/LanguageContext";
import { config } from "@/config";

// Maps each navigation tab id from config.js to its route.
// The "services" tab is the services portal at /services, which shows the 6-card grid.
// The root route ("/") is the language gate and hides the navigation bar.
const TAB_ROUTES: Record<string, string> = {
  contact: "/contact",
  services: "/services",
  orders: "/orders",
  calculator: "/calculator",
  profile: "/profile",
};

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Navigation() {
  const { language } = useLanguage();
  const pathname = usePathname();

  // The language gate on "/" is fullscreen and must not show the tab bar.
  if (pathname === "/") return null;

  const tabs = config.navigation.tabs;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-background border-t border-border"
      aria-label={language === "en" ? "Main navigation" : "التنقل الرئيسي"}
    >
      <div className="max-w-7xl mx-auto px-4 flex justify-around">
        {tabs.map((tab) => {
          const href = TAB_ROUTES[tab.id] ?? `/${tab.id}`;
          const active = isActive(pathname, href);

          return (
            <Link
              key={tab.id}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex-1 py-4 px-4 text-center border-t-2 transition-colors ${
                active
                  ? "border-brand-navy"
                  : "border-transparent hover:border-brand-gold"
              }`}
            >
              <div
                className={`text-sm text-black ${
                  active ? "font-bold" : "font-semibold"
                }`}
              >
                {language === "en" ? tab.labelEn : tab.labelAr}
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
