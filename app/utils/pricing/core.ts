import { config } from "@/config";
import type { Language } from "@/app/context/LanguageContext";
import { formatPrice, formatUnit } from "@/app/utils/format";
import type { PriceUnit } from "@/app/utils/format";
import type { ServiceId } from "@/app/utils/serviceTypes";

/**
 * Shared types and helpers for the pricing engine.
 * Every rate, discount and multiplier is read from config.js.
 */

export interface QuoteRow {
  labelEn: string;
  labelAr: string;
  /** Negative for discounts. */
  amount: number;
  /** Amount before the promo discount. Set only when a promo changed the amount. */
  originalAmount?: number;
  /** When true, the promo discount is not applied to this row (for example, delivery fees). */
  exempt?: boolean;
  /** Extra percent discounts applied in order after the promo (for example, bulk steps). */
  postPromoPercents?: number[];
}

export interface QuoteLine {
  serviceId: ServiceId;
  titleEn: string;
  titleAr: string;
  summaryEn: string;
  summaryAr: string;
  rows: QuoteRow[];
  total: number;
  /** Total before the promo discount. Equals `total` when no discount applies. */
  originalTotal?: number;
  hintEn?: string;
  hintAr?: string;
}

export type QuoteResult =
  | { ok: true; line: QuoteLine }
  | { ok: false; errorEn: string; errorAr: string };

export interface Bilingual {
  en: string;
  ar: string;
}

const MAX_COUNT = 1_000_000;
const MAX_HOURS = 1_000;
const MONEY_FACTOR = 10 ** config.currency.decimalPlaces;

/** Standard promo discount for every service (from config.js). */
export const PROMO_DISCOUNT_PERCENT = config.tutoring.promo.discountPercent;
/** Printing has its own, smaller discount (from config.js). */
export const PRINT_PROMO_PERCENT = config.printShop.promoDiscountPercent;
/** Tutoring already bills its promo rate, so no further promo is applied to it. */
export const PROMO_EXCLUDED_SERVICES: ServiceId[] = ["tutoring"];

export function promoApplies(serviceId: ServiceId): boolean {
  return !PROMO_EXCLUDED_SERVICES.includes(serviceId);
}

/** Discount percent for a service: 25% for printing, 50% for everything else. */
export function promoPercentFor(serviceId: ServiceId): number {
  return serviceId === "printShop" ? PRINT_PROMO_PERCENT : PROMO_DISCOUNT_PERCENT;
}

/** Percent shown on the discount badge. Tutoring shows its promo; other services show their promo. */
export function discountPercentFor(serviceId: ServiceId): number {
  return promoApplies(serviceId) ? promoPercentFor(serviceId) : PROMO_DISCOUNT_PERCENT;
}

/** Price after the promo discount, rounded to 3 decimals (KWD). */
export function promoPrice(
  amount: number,
  percent: number = PROMO_DISCOUNT_PERCENT
): number {
  return roundMoney(amount * (1 - percent / 100));
}

export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * MONEY_FACTOR) / MONEY_FACTOR;
}

/** Builds a bilingual string from a language-aware builder. */
export const bi = (build: (language: Language) => string): Bilingual => ({
  en: build("en"),
  ar: build("ar"),
});

export const perUnit = (
  amount: number,
  unit: PriceUnit,
  language: Language
): string => `${formatPrice(amount, language)}/${formatUnit(unit, language)}`;

export function labelFor(
  list: ReadonlyArray<{ id: string; labelEn: string; labelAr: string }>,
  id: string
): { labelEn: string; labelAr: string } {
  const found = list.find((item) => item.id === id);
  return { labelEn: found?.labelEn ?? id, labelAr: found?.labelAr ?? id };
}

export function fail(en: string, ar: string): QuoteResult {
  return { ok: false, errorEn: en, errorAr: ar };
}

/** True for whole numbers within [min, max]. */
export function isCount(value: number, min = 1, max = MAX_COUNT): boolean {
  return Number.isInteger(value) && value >= min && value <= max;
}

/** True for multiples of 0.5 from 0.5 up to the hour cap. */
export function isHalfHours(value: number): boolean {
  return (
    Number.isFinite(value) &&
    value >= 0.5 &&
    value <= MAX_HOURS &&
    Number.isInteger(value * 2)
  );
}

export function row(label: Bilingual, amount: number): QuoteRow {
  return { labelEn: label.en, labelAr: label.ar, amount };
}

export function makeLine(
  serviceId: ServiceId,
  title: { titleEn: string; titleAr: string },
  summary: Bilingual,
  rows: QuoteRow[],
  hint?: Bilingual
): QuoteResult {
  // Positive rows get the promo unless the service or the row is exempt, then any
  // postPromoPercents steps in order. Negative rows (discounts) and zero rows are left alone.
  const discounted = rows.map((item) => {
    if (item.exempt || item.amount <= 0) return item;
    const promoAmount = promoApplies(serviceId)
      ? promoPrice(item.amount, promoPercentFor(serviceId))
      : item.amount;
    const amount = (item.postPromoPercents ?? []).reduce(
      (value, percent) => promoPrice(value, percent),
      promoAmount
    );
    if (!promoApplies(serviceId) && amount === item.amount) return item;
    return { ...item, amount, originalAmount: item.amount };
  });
  const originalTotal = roundMoney(rows.reduce((sum, item) => sum + item.amount, 0));
  return {
    ok: true,
    line: {
      serviceId,
      titleEn: title.titleEn,
      titleAr: title.titleAr,
      summaryEn: summary.en,
      summaryAr: summary.ar,
      rows: discounted,
      total: roundMoney(discounted.reduce((sum, item) => sum + item.amount, 0)),
      originalTotal,
      hintEn: hint?.en,
      hintAr: hint?.ar,
    },
  };
}

export function grandTotal(lines: QuoteLine[]): number {
  return roundMoney(lines.reduce((sum, line) => sum + line.total, 0));
}
