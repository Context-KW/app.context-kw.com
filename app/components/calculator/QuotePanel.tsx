"use client";

import React from "react";
import { formatPrice, pickText } from "@/app/utils/format";
import { DiscountBadge } from "@/app/components/DiscountBadge";
import { discountPercentFor } from "@/app/utils/pricing/core";
import { useTx } from "@/app/utils/useTx";
import type { QuoteLine, QuoteResult } from "@/app/utils/pricing";

interface QuotePanelProps {
  result: QuoteResult;
  onAdd: (line: QuoteLine) => void;
}

/** Live estimate for the current form values, with an "Add to quote" button. */
export function QuotePanel({ result, onAdd }: QuotePanelProps) {
  const { language, tx } = useTx();

  if (!result.ok) {
    return (
      <div
        role="status"
        className="mt-6 rounded-card border border-border bg-accent-light p-4 text-sm"
      >
        {pickText(language, result.errorEn, result.errorAr)}
      </div>
    );
  }

  const { line } = result;
  const hint = pickText(language, line.hintEn ?? "", line.hintAr ?? "");

  return (
    <div className="mt-6 rounded-card border border-border p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-text-secondary">
        {tx("Estimate", "التقدير")}
      </p>
      <p className="mt-1 text-sm">
        {pickText(language, line.summaryEn, line.summaryAr)}
      </p>

      <ul className="mt-3 divide-y divide-border text-sm">
        {line.rows.map((item, index) => (
          <li key={index} className="flex justify-between gap-4 py-2">
            <span>
              {pickText(language, item.labelEn, item.labelAr)}
              {item.postPromoPercents?.map((percent, stepIndex) => (
                <span key={stepIndex} className="block text-xs font-semibold text-red-600">
                  {pickText(
                    language,
                    `Extra bulk discount: ${percent}% off`,
                    `خصم كميات إضافي: ${percent}%`
                  )}
                </span>
              ))}
            </span>
            <span
              dir="ltr"
              className={`whitespace-nowrap font-semibold ${
                item.originalAmount !== undefined ? "text-red-600" : ""
              }`}
            >
              {item.originalAmount !== undefined && (
                <s className="me-2 font-normal text-text-secondary">
                  {formatPrice(item.originalAmount, language)}
                </s>
              )}
              {formatPrice(item.amount, language)}
              {item.originalAmount !== undefined && (
                <DiscountBadge percent={discountPercentFor(line.serviceId)} />
              )}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-3 flex justify-between gap-4 border-t border-border pt-3 text-lg font-bold">
        <span>{tx("Total", "الإجمالي")}</span>
        <span
          dir="ltr"
          className={
            line.originalTotal !== undefined && line.originalTotal > line.total
              ? "text-red-600"
              : ""
          }
        >
          {line.originalTotal !== undefined && line.originalTotal > line.total && (
            <s className="me-2 text-base font-normal text-text-secondary">
              {formatPrice(line.originalTotal, language)}
            </s>
          )}
          {formatPrice(line.total, language)}
          {line.originalTotal !== undefined && line.originalTotal > line.total && (
            <DiscountBadge percent={discountPercentFor(line.serviceId)} />
          )}
        </span>
      </div>

      {hint && (
        <p className="mt-3 rounded-card bg-accent-light p-3 text-sm">{hint}</p>
      )}

      <button
        type="button"
        className="btn btn-primary mt-4"
        onClick={() => onAdd(line)}
      >
        {tx("Add to quote", "أضف إلى العرض")}
      </button>
    </div>
  );
}
