"use client";

import React from "react";
import { formatPrice, pickText } from "@/app/utils/format";
import type { QuoteResult } from "@/app/utils/pricing";
import { useTx } from "@/app/utils/useTx";

interface SelectionQuoteProps {
  /** Live price for the choices in the modal. Null when the service has no quote. */
  quote: QuoteResult | null;
}

/** Estimated total for services without a booking form, updated on every choice. */
export function SelectionQuote({ quote }: SelectionQuoteProps) {
  const { language, tx } = useTx();

  if (!quote) return null;

  return (
    <div
      aria-live="polite"
      className="mt-8 rounded-card border border-border bg-accent-light p-4 text-sm"
    >
      <p className="text-xs font-bold uppercase tracking-wide text-text-secondary">
        {tx("Estimated total", "الإجمالي التقديري")}
      </p>
      {quote.ok ? (
        <>
          <ul className="mt-2 space-y-1">
            {quote.line.rows.map((line, index) => (
              <li key={index} className="flex justify-between gap-4">
                <span>
                  {pickText(language, line.labelEn, line.labelAr)}
                  {line.postPromoPercents?.map((percent, stepIndex) => (
                    <span key={stepIndex} className="block text-xs font-semibold text-deep-red">
                      {tx(
                        `Extra bulk discount: ${percent}% off`,
                        `خصم كميات إضافي: ${percent}%`
                      )}
                    </span>
                  ))}
                </span>
                <span
                  className={`whitespace-nowrap ${
                    line.originalAmount !== undefined ? "font-bold text-deep-red" : ""
                  }`}
                >
                  {line.originalAmount !== undefined && (
                    <s className="me-2 font-normal text-text-secondary">
                      {formatPrice(line.originalAmount, language)}
                    </s>
                  )}
                  {formatPrice(line.amount, language)}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 flex justify-between gap-4 border-t border-border pt-3 text-base font-bold">
            <span>{tx("Total", "المجموع")}</span>
            <span
              className={`whitespace-nowrap ${
                quote.line.originalTotal !== undefined &&
                quote.line.originalTotal > quote.line.total
                  ? "text-deep-red"
                  : ""
              }`}
            >
              {formatPrice(quote.line.total, language)}
            </span>
          </p>
          {(quote.line.hintEn || quote.line.hintAr) && (
            <p className="mt-3 text-text-secondary">
              {pickText(language, quote.line.hintEn ?? "", quote.line.hintAr ?? "")}
            </p>
          )}
        </>
      ) : (
        <p className="mt-2">{pickText(language, quote.errorEn, quote.errorAr)}</p>
      )}
    </div>
  );
}
