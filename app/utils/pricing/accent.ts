import { config } from "@/config";
import { formatDuration, pickText } from "@/app/utils/format";
import {
  bi,
  fail,
  isCount,
  labelFor,
  makeLine,
  perUnit,
  promoPercentFor,
  promoPrice,
  roundMoney,
  row,
} from "@/app/utils/pricing/core";
import type { QuoteResult } from "@/app/utils/pricing/core";

export type AccentRateKey = "accentCoaching" | "interviewPrep" | "combined";

export const ACCENT_RATE_KEYS: AccentRateKey[] = [
  "accentCoaching",
  "interviewPrep",
  "combined",
];

export const ACCENT_RATE_LABELS: Record<
  AccentRateKey,
  { labelEn: string; labelAr: string }
> = {
  accentCoaching: labelFor(config.accentCoaching.options, "accentReduction"),
  interviewPrep: labelFor(config.accentCoaching.options, "interviewPrep"),
  combined: {
    labelEn: "Accent Coaching + Interview Prep",
    labelAr: "تطوير النطق + التحضير للمقابلات",
  },
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
}

/** Hourly rate x hours per session x number of sessions. */
export function quoteAccent(input: AccentInput): QuoteResult {
  const a = config.accentCoaching;
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

  const hours = input.duration * input.sessions;
  return makeLine(
    "accentCoaching",
    a,
    bi((l) => pickText(l, label.labelEn, label.labelAr)),
    [
      row(
        bi(
          (l) =>
            `${input.sessions} × ${formatDuration(input.duration, l)} @ ${perUnit(
              rate,
              "hour",
              l
            )}`
        ),
        roundMoney(rate * hours)
      ),
    ]
  );
}
