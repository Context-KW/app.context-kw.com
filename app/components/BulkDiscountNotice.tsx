"use client";

import React from "react";
import { config } from "@/config";
import { pickLabel } from "@/app/utils/format";
import { PRINT_PROMO_PERCENT, bulkDiscountSteps } from "@/app/utils/pricing";
import { useTx } from "@/app/utils/useTx";

/** Red notice listing the extra bulk discounts for every paper that has them. */
export function BulkDiscountNotice() {
  const { language, tx } = useTx();
  const papers = config.printShop.paperTypes
    .map((paper) => ({ paper, steps: bulkDiscountSteps(paper.id) }))
    .filter((entry) => entry.steps.length > 0);

  if (papers.length === 0) return null;

  return (
    <div className="mt-8 rounded-card border-2 border-deep-red p-4 text-sm text-deep-red">
      <p className="text-xs font-bold uppercase tracking-wide">
        {tx("Extra bulk discount", "خصم كميات إضافي")}
      </p>
      <ul className="mt-2 space-y-3">
        {papers.map(({ paper, steps }) => (
          <li key={paper.id}>
            <p className="font-semibold">{pickLabel(paper, language)}</p>
            {steps.map((step) => (
              <p key={step.minSheets} className="flex flex-wrap items-center gap-2">
                {tx(
                  `${step.minSheets}+ sheets: an extra ${step.percent}% off`,
                  `${step.minSheets} ورقة فأكثر: خصم إضافي ${step.percent}%`
                )}
                <span className="inline-block -rotate-12 whitespace-nowrap border-2 border-deep-red bg-deep-red px-2 py-0.5 align-middle text-xs font-bold text-white">
                  -{step.percent}% !
                </span>
              </p>
            ))}
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs font-semibold">
        {tx(
          `Bulk discounts stack on top of the ${PRINT_PROMO_PERCENT}% printing promotion.`,
          `خصومات الكميات تُضاف فوق خصم الطباعة بنسبة ${PRINT_PROMO_PERCENT}%.`
        )}
      </p>
    </div>
  );
}
