"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/app/context/LanguageContext";

/** Direct WhatsApp chat with the team. Number is fixed in the link. */
const WHATSAPP_URL = "https://wa.me/96555039794";

/**
 * Floating WhatsApp shortcut shown on every page except the language gate.
 * Rendered from the root layout, so it stays on the side for the whole app.
 */
export function WhatsAppButton() {
  const { language } = useLanguage();
  const pathname = usePathname();

  if (pathname === "/") return null;

  const label = language === "en" ? "Chat with us on WhatsApp" : "تواصل معنا عبر واتساب";

  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      className="fixed bottom-24 end-4 z-40 flex h-14 w-14 animate-whatsapp-heartbeat items-center justify-center rounded-full border-2 border-black bg-background shadow-md transition-colors hover:bg-black focus:outline-none focus-visible:ring-2 focus-visible:ring-black group"
    >
      <span
        aria-hidden="true"
        className="absolute inset-0 animate-ping rounded-full bg-[#25D366] opacity-60"
      />
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="relative h-7 w-7 fill-black transition-colors group-hover:fill-white"
      >
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2Zm0 18.15h-.01a8.23 8.23 0 0 1-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 4.54 0 8.24 3.7 8.24 8.24 0 4.54-3.7 8.24-8.23 8.24Zm4.52-6.17c-.25-.12-1.46-.72-1.69-.8-.23-.08-.39-.12-.55.12-.17.25-.63.8-.77.96-.14.17-.29.19-.53.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.38-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.55-1.33-.76-1.82-.2-.48-.4-.42-.55-.42h-.47c-.16 0-.43.06-.66.31-.23.25-.86.84-.86 2.05 0 1.21.88 2.38 1 2.54.12.17 1.74 2.65 4.21 3.72.59.25 1.05.4 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.46-.6 1.67-1.17.2-.58.2-1.07.14-1.17-.06-.11-.22-.17-.47-.29Z" />
      </svg>
    </a>
  );
}
