"use client";

import React from "react";
import { useTx } from "@/app/utils/useTx";

export function DiscountBadge({ percent }: { percent: number }) {
  const { tx } = useTx();

  return (
    <span className="ms-2 inline-block rounded-card bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
      {tx(`${percent}% OFF`, `خصم ${percent}%`)}
    </span>
  );
}
