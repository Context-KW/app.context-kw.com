import { config } from "@/config";
import { formatDuration, formatPrice, formatUnit, pickText } from "@/app/utils/format";
import {
  bi,
  fail,
  isCount,
  labelFor,
  makeLine,
  promoPercentFor,
  promoPrice,
  roundMoney,
  row,
} from "@/app/utils/pricing/core";
import type { QuoteResult } from "@/app/utils/pricing/core";
import { CONSULTATION_PRICE } from "@/app/utils/pricing/tutoring";

export type AccentRateKey = "accentCoaching" | "interviewPrep";

export const ACCENT_RATE_KEYS: AccentRateKey[] = [
  "accentCoaching",
  "interviewPrep",
];

export const ACCENT_RATE_LABELS: Record<
  AccentRateKey,
  { labelEn: string; labelAr: string }
> = {
  accentCoaching: labelFor(config.accentCoaching.options, "accentReduction"),
  interviewPrep: labelFor(config.accentCoaching.options, "interviewPrep"),
};

/** Launch (promo) hourly rate for an accent option, rounded to KWD thousandths. */
export function accentLaunchRate(key: AccentRateKey): number {
  return promoPrice(
    config.accentCoaching.rates[key],
    promoPercentFor("accentCoaching")
  );
}

export interface AccentInput {
  rateKey: AccentRateKey;
  /** Hours per session; must be one of config.accentCoaching.sessionDurations. */
  duration: number;
  sessions: number;
  /** Free 15-minute consultation: costs 0.000 KWD and ignores rate, duration and sessions. */
  isConsultation?: boolean;
}

/** Hourly rate x hours per session x number of sessions. */
export function quoteAccent(input: AccentInput): QuoteResult {
  const a = config.accentCoaching;
  if (input.isConsultation) {
    const consultationLabel = bi((l) =>
      pickText(l, "Free 15-minute consultation", "استشارة مجانية مدتها 15 دقيقة")
    );
    return makeLine("accentCoaching", a, consultationLabel, [
      row(consultationLabel, CONSULTATION_PRICE),
    ]);
  }

  const rate = a.rates[input.rateKey];
  const label = ACCENT_RATE_LABELS[input.rateKey];

  if (rate === undefined || !label) {
    return fail("Select a coaching type.", "اختر نوع التدريب.");
  }
  if (!a.sessionDurations.includes(input.duration)) {
    return fail("Select a session length.", "اختر مدة الجلسة.");
  }
  if (!isCount(input.sessions)) {
    return fail(
      "Enter a whole number of sessions (at least 1).",
      "أدخل عدداً صحيحاً من الجلسات (1 على الأقل)."
    );
  }

  // 30-minute sessions bill at the configured share of the hourly rate.
  const factor = input.duration < 1 ? a.shortSessionRatio : 1;
  // Launch rate already includes the promo, so the line is not discounted again.
  const launchRate = accentLaunchRate(input.rateKey);
  const isShort = input.duration < 1;
  // 30-minute sessions: one price per 30 minutes, counted per session.
  // Longer sessions: the hourly launch rate, counted per hour.
  const unitPrice = roundMoney(isShort ? launchRate * factor : launchRate);
  const quantity = isShort ? input.sessions : input.duration * input.sessions;
  const unitLabel = isShort
    ? bi((l) => (l === "ar" ? "30 دقيقة" : "30 minutes"))
    : bi((l) => formatUnit("hour", l));
  return makeLine(
    "accentCoaching",
    a,
    bi((l) => pickText(l, label.labelEn, label.labelAr)),
    [
      row(
        bi(
          (l) =>
            `${input.sessions} × ${formatDuration(input.duration, l)} @ ${formatPrice(
              unitPrice,
              l
            )}/${l === "ar" ? unitLabel.ar : unitLabel.en}`
        ),
        roundMoney(unitPrice * quantity)
      ),
    ]
  );
}
