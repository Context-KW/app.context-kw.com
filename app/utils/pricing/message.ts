import { config } from "@/config";
import type { Language } from "@/app/context/LanguageContext";
import { formatPrice, pickText } from "@/app/utils/format";
import { grandTotal } from "@/app/utils/pricing/core";
import type { QuoteLine } from "@/app/utils/pricing/core";

/** Plain-text quote used by "Request this quote" (mailto) and "Copy". */
export function buildQuoteMessage(lines: QuoteLine[], language: Language): string {
  const blocks = lines.map((line, index) => {
    const title = pickText(language, line.titleEn, line.titleAr);
    const summary = pickText(language, line.summaryEn, line.summaryAr);
    const detail = line.rows.map(
      (item) =>
        `   - ${pickText(language, item.labelEn, item.labelAr)}: ${formatPrice(
          item.amount,
          language
        )}`
    );
    return [
      `${index + 1}. ${title}`,
      `   ${summary}`,
      ...detail,
      `   ${pickText(language, "Subtotal", "المجموع الفرعي")}: ${formatPrice(
        line.total,
        language
      )}`,
    ].join("\n");
  });

  return [
    pickText(
      language,
      `${config.company.name} - Quote request`,
      `${config.company.nameArabic} - طلب عرض سعر`
    ),
    "",
    ...blocks,
    "",
    `${pickText(language, "Estimated total", "الإجمالي التقديري")}: ${formatPrice(
      grandTotal(lines),
      language
    )}`,
  ].join("\n");
}
