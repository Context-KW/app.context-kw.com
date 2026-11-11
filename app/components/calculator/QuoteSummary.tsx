"use client";

import React, { useState } from "react";
import { config } from "@/config";
import { QuoteRequestForm } from "@/app/components/calculator/QuoteRequestForm";
import { formatPrice, pickText } from "@/app/utils/format";
import { buildQuoteMessage, grandTotal } from "@/app/utils/pricing";
import type { CartItem } from "@/app/utils/useQuoteCart";
import { useTx } from "@/app/utils/useTx";

interface QuoteSummaryProps {
  items: CartItem[];
  onRemove: (key: string) => void;
  onClear: () => void;
}

/** The saved quote: line items, grand total, and request/copy actions. */
export function QuoteSummary({ items, onRemove, onClear }: QuoteSummaryProps) {
  const { language, tx } = useTx();
  const [copied, setCopied] = useState(false);

  const lines = items.map((item) => item.line);
  const message = buildQuoteMessage(lines, language);
  const mailto = `mailto:${config.contact.email}?subject=${encodeURIComponent(
    pickText(language, "Quote request", "طلب عرض سعر")
  )}&body=${encodeURIComponent(message)}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section aria-labelledby="quote-summary-title" className="card mt-10 p-6">
      <h2 id="quote-summary-title" className="text-xl font-bold">
        {tx("Your quote", "عرض السعر الخاص بك")}
      </h2>

      {items.length === 0 ? (
        <p className="mt-3 text-text-secondary">
          {tx(
            "Nothing added yet. Configure a service above and choose “Add to quote”.",
            "لم تتم إضافة أي شيء بعد. اضبط خدمة أعلاه ثم اختر «أضف إلى العرض»."
          )}
        </p>
      ) : (
        <>
          <ul className="mt-4 divide-y divide-border">
            {items.map((item) => (
              <li
                key={item.key}
                className="flex items-start justify-between gap-4 py-3 text-sm"
              >
                <div>
                  <p className="font-semibold">
                    {pickText(language, item.line.titleEn, item.line.titleAr)}
                  </p>
                  <p className="text-text-secondary">
                    {pickText(language, item.line.summaryEn, item.line.summaryAr)}
                  </p>
                  <button
                    type="button"
                    onClick={() => onRemove(item.key)}
                    className="mt-1 text-xs font-semibold underline"
                  >
                    {tx("Remove", "إزالة")}
                  </button>
                </div>
                <p dir="ltr" className="whitespace-nowrap font-bold">
                  {formatPrice(item.line.total, language)}
                </p>
              </li>
            ))}
          </ul>

          <div className="mt-2 flex justify-between gap-4 border-t border-border pt-4 text-xl font-bold">
            <span>{tx("Estimated total", "الإجمالي التقديري")}</span>
            <span dir="ltr">{formatPrice(grandTotal(lines), language)}</span>
          </div>
          <p className="mt-1 text-xs text-text-secondary">
            {tx(
              "Estimates only. Final pricing is confirmed by our team.",
              "هذه تقديرات فقط. يتم تأكيد السعر النهائي من قبل فريقنا."
            )}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <a href={mailto} className="btn btn-primary">
              {tx("Request this quote", "اطلب عرض السعر")}
            </a>
            <button type="button" onClick={copy} className="btn btn-secondary">
              {copied ? tx("Copied!", "تم النسخ!") : tx("Copy quote", "نسخ العرض")}
            </button>
            <button type="button" onClick={onClear} className="btn btn-secondary">
              {tx("Clear all", "مسح الكل")}
            </button>
          </div>
          <QuoteRequestForm lines={lines} total={grandTotal(lines)} />
        </>
      )}
    </section>
  );
}
