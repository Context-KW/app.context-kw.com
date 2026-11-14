"use client";

import { useCallback, useState } from "react";
import { LanguageToggle } from "@/app/components/LanguageToggle";
import { Logo } from "@/app/components/Logo";
import { ServiceCard } from "@/app/components/ServiceCard";
import { ServiceModal } from "@/app/components/ServiceModal";
import { useLanguage } from "@/app/context/LanguageContext";
import { services } from "@/app/utils/services";
import type { ServiceDefinition } from "@/app/utils/services";
import { config } from "@/config";

export default function HomePage() {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const [activeService, setActiveService] = useState<ServiceDefinition | null>(
    null
  );
  const closeModal = useCallback(() => setActiveService(null), []);

  return (
    <main className="max-w-7xl mx-auto px-4 pt-10 pb-32">
      <header className="relative flex flex-col items-center gap-4 text-center">
        <div className="absolute end-0 top-0">
          <LanguageToggle />
        </div>
        <Logo className="w-48" />
        <h1 className="sr-only">
          {isArabic ? config.company.nameArabic : config.company.name}
        </h1>
      </header>

      <section aria-label={isArabic ? "الخدمات" : "Services"} className="mt-10">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <ServiceCard
              key={service.id}
              service={service}
              index={index}
              onOpen={setActiveService}
            />
          ))}
        </div>
      </section>

      {activeService && (
        <ServiceModal service={activeService} onClose={closeModal} />
      )}
    </main>
  );
}
