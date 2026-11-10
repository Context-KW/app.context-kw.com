import { config } from "@/config";
import { formatPrice, pickText } from "@/app/utils/format";
import { bi, fail, makeLine, promoPrice, row } from "@/app/utils/pricing/core";
import type { QuoteResult } from "@/app/utils/pricing/core";
import { CONSULTATION_PRICE } from "@/app/utils/pricing/tutoring";

const tier = config.communicativeArabic;

export interface CommunicativeArabicOption {
  id: string;
  subcategoryLabelEn: string;
  subcategoryLabelAr: string;
  labelEn: string;
  labelAr: string;
  /** Standard price in KWD. */
  originalRate: number;
  /** Launch price in KWD after the launch promotion, rounded to thousandths. */
  launchRate: number;
}

/** Every package in both subcategories, flattened in display order. */
export const COMMUNICATIVE_ARABIC_OPTIONS: CommunicativeArabicOption[] = tier.subcategories.flatMap(
  (subcategory) =>
    subcategory.items.map((option) => ({
      id: option.id,
      subcategoryLabelEn: subcategory.labelEn,
      subcategoryLabelAr: subcategory.labelAr,
      labelEn: option.labelEn,
      labelAr: option.labelAr,
      originalRate: option.originalRate,
      launchRate: promoPrice(option.originalRate, tier.launchPromo.discountPercent),
    }))
);

/**
 * Quote for one package at its launch price. The launch discount is already
 * applied to `launchRate`, so the generic promo is excluded for this service.
 */
export function quoteCommunicativeArabic(optionId: string, isConsultation = false): QuoteResult {
  if (isConsultation) {
    const label = bi((l) => pickText(l, "Free 15-minute consultation", "استشارة مجانية مدتها 15 دقيقة"));
    return makeLine("communicativeArabic", tier, label, [row(label, CONSULTATION_PRICE)]);
  }

  const option = COMMUNICATIVE_ARABIC_OPTIONS.find((item) => item.id === optionId);
  if (!option) {
    return fail("Select a package.", "اختر الباقة.");
  }

  return makeLine(
    "communicativeArabic",
    tier,
    bi((l) => pickText(l, option.subcategoryLabelEn, option.subcategoryLabelAr)),
    [
      {
        ...row(bi((l) => pickText(l, option.labelEn, option.labelAr)), option.launchRate),
        originalAmount: option.originalRate,
      },
    ],
    bi((l) =>
      pickText(
        l,
        `Launch price. Standard price: ${formatPrice(option.originalRate, "en")}.`,
        `سعر الإطلاق. السعر الأصلي: ${formatPrice(option.originalRate, "ar")}.`
      )
    )
  );
}
