"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { AccentForm } from "@/app/components/calculator/AccentForm";
import { AdvisingForm } from "@/app/components/calculator/AdvisingForm";
import { CorporateForm } from "@/app/components/calculator/CorporateForm";
import { PrintForm } from "@/app/components/calculator/PrintForm";
import { QuoteSummary } from "@/app/components/calculator/QuoteSummary";
import { CommunicativeArabicForm } from "@/app/components/calculator/CommunicativeArabicForm";
import { ResumeWritingForm } from "@/app/components/calculator/ResumeWritingForm";
import { TutoringForm } from "@/app/components/calculator/TutoringForm";
import { LanguageToggle } from "@/app/components/LanguageToggle";
import { Logo } from "@/app/components/Logo";
import { pickText } from "@/app/utils/format";
import type { QuoteLine } from "@/app/utils/pricing";
import { isServiceId, services } from "@/app/utils/services";
import type { ServiceId } from "@/app/utils/services";
import { useQuoteCart } from "@/app/utils/useQuoteCart";
import { useTx } from "@/app/utils/useTx";
import { config } from "@/config";

const FORMS: Record<
  ServiceId,
  (props: { onAdd: (line: QuoteLine) => void }) => React.JSX.Element
> = {
  tutoring: TutoringForm,
  accentCoaching: AccentForm,
  communicativeArabic: CommunicativeArabicForm,
  resumeWriting: ResumeWritingForm,
  universityAdvising: AdvisingForm,
  corporate: CorporateForm,
  printShop: PrintForm,
};

export function Calculator() {
  const { language, tx } = useTx();
  const searchParams = useSearchParams();
  const requested = searchParams.get("service");
  const [serviceId, setServiceId] = useState<ServiceId>(
    isServiceId(requested) ? requested : services[0].id
  );
  const [justAdded, setJustAdded] = useState(false);
  const cart = useQuoteCart();

  const tab = config.navigation.tabs.find((item) => item.id === "calculator");
  const title = tab ? pickText(language, tab.labelEn, tab.labelAr) : "";
  const ServiceForm = FORMS[serviceId];

  const handleAdd = (line: QuoteLine) => {
    cart.add(line);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 2500);
  };

  return (
    <main className="max-w-3xl mx-auto px-4 pt-10 pb-32">
      <header className="flex items-start justify-between gap-4">
        <Logo className="w-36 shrink-0" />
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="mt-2 text-text-secondary">
            {tx(
              "Pick a service, adjust the details, and build your quote. Rates come straight from our price list.",
              "اختر خدمة، عدّل التفاصيل، وابنِ عرض السعر الخاص بك. الأسعار مأخوذة مباشرة من قائمة أسعارنا."
            )}
          </p>
        </div>
        <LanguageToggle />
      </header>

      <div role="tablist" aria-label={tx("Services", "الخدمات")} className="mt-8 flex flex-wrap gap-2">
        {services.map((service) => {
          const selected = service.id === serviceId;
          return (
            <button
              key={service.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setServiceId(service.id)}
              className={`btn text-sm ${selected ? "btn-primary" : "btn-secondary"}`}
            >
              {pickText(language, service.titleEn, service.titleAr)}
            </button>
          );
        })}
      </div>

      <section role="tabpanel" className="card mt-6 p-6">
        <ServiceForm key={serviceId} onAdd={handleAdd} />
      </section>

      <p role="status" aria-live="polite" className="mt-3 h-5 text-sm font-semibold">
        {justAdded ? tx("Added to your quote ✓", "تمت الإضافة إلى عرضك ✓") : ""}
      </p>

      <QuoteSummary
        items={cart.items}
        onRemove={cart.remove}
        onClear={cart.clear}
      />
    </main>
  );
}
