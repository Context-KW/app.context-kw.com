import "./globals.css";
import type { Metadata } from "next";
import { Navigation } from "@/app/components/Navigation";
import { WhatsAppButton } from "@/app/components/WhatsAppButton";
import { LanguageProvider } from "@/app/context/LanguageContext";

export const metadata: Metadata = {
  metadataBase: new URL("https://context-kw.com"),
  title: "Context",
  description: "Professional English tutoring, Arabic communication coaching, and corporate solutions in Kuwait",
  icons: { icon: "/logo.png" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr">
      <body>
        <LanguageProvider>
          {children}
          <Navigation />
          <WhatsAppButton />
        </LanguageProvider>
      </body>
    </html>
  );
}