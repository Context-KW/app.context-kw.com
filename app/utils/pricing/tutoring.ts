import { config } from "@/config";
import { formatDuration, pickText } from "@/app/utils/format";
import {
  bi,
  fail,
  makeLine,
  perUnit,
  roundMoney,
  row,
} from "@/app/utils/pricing/core";
import type { QuoteResult, QuoteRow } from "@/app/utils/pricing/core";

const tutoringRates: Record<string, number> = config.tutoring.rates;

export interface TutoringInput {
  focusId: string;
  deliveryId: string;
  /** Hours per session; must be one of config.tutoring.sessionDurations. */
  duration: number;
  packageId: string;
  /** Free 15-minute consultation: costs 0.000 KWD and ignores the package. */
  isConsultation?: boolean;
}

/** Price for the free 15-minute consultation row. */
export const CONSULTATION_PRICE = 0;

/** Kept for the card and modal rows: the focus that anchors the promo display. */
export const TUTORING_PROMO_FOCUS = "general";

/**
 * Hourly rate actually billed. Every tutoring focus gets the promo discount
 * (config.tutoring.promo.discountPercent), so IELTS, General and Business all match.
 */
export function effectiveTutoringRate(focusId: string): number {
  const standard = tutoringRates[focusId];
  if (standard === undefined) return standard;
  return roundMoney(standard * (1 - config.tutoring.promo.discountPercent / 100));
}

/** Hourly rate x (hours per session x sessions in the package), minus the package discount. */
export function quoteTutoring(input: TutoringInput): QuoteResult {
  const t = config.tutoring;
  const focus = t.options.find((option) => option.id === input.focusId);
  const rate = effectiveTutoringRate(input.focusId);
  const delivery = t.deliveryModes.find((mode) => mode.id === input.deliveryId);
  const pkg = t.packages.find((item) => item.id === input.packageId);

  if (!focus || rate === undefined) {
    return fail("Select a tutoring focus.", "اختر نوع التدريس.");
  }
  if (!delivery) {
    return fail("Select a delivery mode.", "اختر طريقة التقديم.");
  }
  if (input.isConsultation) {
    const label = bi((l) =>
      pickText(l, "Free 15-minute consultation", "استشارة مجانية مدتها 15 دقيقة")
    );
    return makeLine(
      "tutoring",
      t,
      label,
      [row(label, CONSULTATION_PRICE)]
    );
  }
  if (!pkg) {
    return fail("Select a package.", "اختر الباقة.");
  }
  if (!t.sessionDurations.includes(input.duration)) {
    return fail("Select a session length.", "اختر مدة الجلسة.");
  }

  const hours = input.duration * pkg.sessions;
  const subtotal = roundMoney(rate * hours);
  const discount = roundMoney((subtotal * pkg.discount) / 100);

  const rows: QuoteRow[] = [
    row(
      bi(
        (l) =>
          `${pickText(l, focus.labelEn, focus.labelAr)}: ${pkg.sessions} × ${formatDuration(
            input.duration,
            l
          )} @ ${perUnit(rate, "hour", l)}`
      ),
      subtotal
    ),
  ];
  // Standard (pre-promo) subtotal for the struck-through original price.
  const standardRate = tutoringRates[input.focusId];
  rows[0].originalAmount = roundMoney(standardRate * hours);
  if (discount > 0) {
    rows.push(
      row(
        bi((l) =>
          pickText(
            l,
            `Package discount (${pkg.discount}%)`,
            `خصم الباقة (${pkg.discount}%)`
          )
        ),
        -discount
      )
    );
  }

  return makeLine(
    "tutoring",
    t,
    bi(
      (l) =>
        `${pickText(l, pkg.labelEn, pkg.labelAr)} · ${pickText(
          l,
          delivery.labelEn,
          delivery.labelAr
        )}`
    ),
    rows
  );
}
