import { config } from "@/config";
import type { Language } from "@/app/context/LanguageContext";

export type PriceUnit = "hour" | "word" | "session" | "page" | "copy" | "piece" | "personMonth";

const UNIT_LABELS: Record<PriceUnit, { en: string; ar: string }> = {
  hour: { en: "hour", ar: "ساعة" },
  word: { en: "word", ar: "كلمة" },
  session: { en: "session", ar: "جلسة" },
  page: { en: "page", ar: "صفحة" },
  copy: { en: "copy", ar: "نسخة" },
  piece: { en: "piece", ar: "قطعة" },
  personMonth: { en: "person / month", ar: "فرد / شهر" },
};

/**
 * Formats an amount using the currency settings in config.js.
 * English uses the ISO code (KWD); Arabic uses the local symbol (د.ك).
 */
export function formatPrice(amount: number, language: Language): string {
  const { code, symbol, symbolPosition, decimalPlaces } = config.currency;
  const value = amount.toFixed(decimalPlaces);
  const label = language === "ar" ? symbol : code;
  return symbolPosition === "prefix" ? `${label} ${value}` : `${value} ${label}`;
}

export function formatUnit(unit: PriceUnit, language: Language): string {
  return UNIT_LABELS[unit][language];
}

/** "15.000 KWD / hour". With no unit the price is returned on its own (flat fee). */
export function formatRate(
  amount: number,
  unit: PriceUnit | undefined,
  language: Language
): string {
  const price = formatPrice(amount, language);
  return unit ? `${price} / ${formatUnit(unit, language)}` : price;
}

/** 0.5 -> "30 min", 1 -> "1 h", 1.5 -> "1.5 h" (Arabic: "30 دقيقة", "1 ساعة"). */
export function formatDuration(hours: number, language: Language): string {
  if (hours < 1) {
    const minutes = Math.round(hours * 60);
    return language === "ar" ? `${minutes} دقيقة` : `${minutes} min`;
  }
  return language === "ar" ? `${hours} ساعة` : `${hours} h`;
}

export function pickText(language: Language, en: string, ar: string): string {
  return language === "ar" ? ar : en;
}

export function pickLabel(
  item: { labelEn: string; labelAr: string },
  language: Language
): string {
  return pickText(language, item.labelEn, item.labelAr);
}
