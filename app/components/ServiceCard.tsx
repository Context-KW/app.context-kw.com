"use client";

import React from "react";
import { formatRate, pickText } from "@/app/utils/format";
import { useTx } from "@/app/utils/useTx";
import type { ServiceDefinition } from "@/app/utils/services";

const MAX_PREVIEW_OPTIONS = 3;

interface ServiceCardProps {
  service: ServiceDefinition;
  index: number;
  onOpen: (service: ServiceDefinition) => void;
}

export function ServiceCard({ service, index, onOpen }: ServiceCardProps) {
  const { language, tx } = useTx();

  const title = pickText(language, service.titleEn, service.titleAr);
  const description = pickText(
    language,
    service.descriptionEn,
    service.descriptionAr
  );
  const previewOptions = service.options.slice(0, MAX_PREVIEW_OPTIONS);
  const hiddenCount = service.options.length - previewOptions.length;

  return (
    // The title button stretches over the whole card (after:inset-0), so the entire
    // card is clickable while the heading stays valid HTML.
    <article className="card relative flex flex-col p-6 focus-within:ring-2 focus-within:ring-black">
      {service.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={service.image}
          alt={title}
          className="mb-4 aspect-[4/3] w-full rounded-md object-cover"
        />
      )}
      <span className="text-sm font-semibold text-text-secondary" aria-hidden="true">
        {String(index + 1).padStart(2, "0")}
      </span>

      <h2 className="mt-2 text-xl font-bold leading-snug">
        <button
          type="button"
          onClick={() => onOpen(service)}
          aria-haspopup="dialog"
          className="text-start after:absolute after:inset-0 after:cursor-pointer after:content-[''] focus:outline-none"
        >
          {title}
        </button>
      </h2>
      <p className="mt-2 text-sm text-text-secondary">{description}</p>

      <ul className="mt-4 space-y-2 text-sm">
        {previewOptions.map((option) => (
          <li key={option.id} className="flex items-start gap-2">
            <span aria-hidden="true">•</span>
            <span>{pickText(language, option.labelEn, option.labelAr)}</span>
          </li>
        ))}
        {hiddenCount > 0 && (
          <li className="text-text-secondary">
            {tx(`+${hiddenCount} more`, `+${hiddenCount} أخرى`)}
          </li>
        )}
      </ul>

      <div className="mt-auto border-t border-border pt-4">
        <p className="mt-4 text-xs uppercase tracking-wide text-text-secondary">
          {tx("Starting from", "ابتداءً من")}
        </p>
        <p
          className={`mt-1 text-lg font-bold ${
            service.startingOriginalPrice ? "text-deep-red" : ""
          }`}
        >
          {service.startingOriginalPrice && (
            <s className="me-2 font-normal text-text-secondary">
              {formatRate(
                service.startingOriginalPrice.amount,
                service.startingOriginalPrice.unit,
                language
              )}
            </s>
          )}
          {service.id === "tutoring" || service.id === "communicativeArabic" || service.id === "accentCoaching" || service.id === "resumeWriting"
            ? tx("0.000 KWD (Free 15-min trial)", "0.000 د.ك (تجربة مجانية 15 دقيقة)")
            : formatRate(
                service.startingPrice.amount,
                service.startingPrice.unit,
                language
              )}
        </p>
        {service.id === "printShop" && (
          <p className="mt-2 text-sm font-semibold text-deep-red">
            {tx(
              "Extra bulk discount: 25% off at 50+ sheets, and 25% more at 500+ sheets",
              "خصم كميات إضافي: 25% عند 50 ورقة فأكثر، و25% إضافية عند 500 ورقة فأكثر"
            )}
          </p>
        )}
        <p className="mt-3 text-sm font-semibold" aria-hidden="true">
          {tx("View details →", "عرض التفاصيل ←")}
        </p>
      </div>
    </article>
  );
}
