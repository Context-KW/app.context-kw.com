"use client";

import React from "react";
import { useTx } from "@/app/utils/useTx";

export function MarketplaceOfferBanner() {
  const { tx } = useTx();

  return (
    <div
      role="region"
      aria-label="Free 15-minute consultation offer"
      className="relative overflow-hidden rounded-card border-2 border-[#990000] bg-[#FFF0F0] px-6 py-5 mt-10 text-left"
    >
      <p className="text-base font-semibold text-[#990000]">
        {tx("Free 15-minute consultation", "استشارة مجانية لمدة 15 دقيقة")}
      </p>
    </div>
  );
}
