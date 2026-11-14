import { config } from "@/config";
import type { Language } from "@/app/context/LanguageContext";
import { formatDuration, formatPrice, pickText } from "@/app/utils/format";
import {
  bi,
  fail,
  isCount,
  labelFor,
  makeLine,
  perUnit,
  roundMoney,
  row,
} from "@/app/utils/pricing/core";
import type { Bilingual, QuoteResult, QuoteRow } from "@/app/utils/pricing/core";

export const ADVISING_LABELS = {
  initialConsultation: {
    labelEn: "Initial consultation",
    labelAr: "الاستشارة الأولى",
  },
  followUpSession: {
    labelEn: "Follow-up session",
    labelAr: "جلسة متابعة",
  },
  fullPackage: {
    labelEn: "Full advising package",
    labelAr: "باقة الإرشاد الكاملة",
  },
};

export interface AdvisingInput {
  mode: "sessions" | "fullPackage";
  includeInitial: boolean;
  followUps: number;
  /** Hours per session. Must be one of config.universityAdvising.sessionDurations. */
  duration: number;
  degreeId?: string;
}

/**
 * Price of one session. 1-hour sessions use the hourly rate. 30-minute sessions use
 * the configured share of it (60%). The degree multiplier is applied last.
 */
export function sessionPrice(
  hourlyRate: number,
  durationHours: number,
  degreeMultiplier: number
): number {
  const base =
    durationHours < 1
      ? roundMoney(hourlyRate * config.universityAdvising.shortSessionRatio)
      : hourlyRate;
  return roundMoney(base * degreeMultiplier);
}

/**
 * Either the flat full-package price, or an initial consultation plus follow-ups.
 * When per-session pricing costs more than the full package, a hint shows the saving.
 */
export function quoteAdvising(input: AdvisingInput): QuoteResult {
  const advising = config.universityAdvising;
  const rates = advising.rates;

  let degree: { labelEn: string; labelAr: string } | undefined;
  // With no degree chosen, prices use the Bachelor's baseline (1x).
  let degreeMultiplier = 1;
  if (input.degreeId) {
    const selected = advising.targetDegrees.find(
      (item) => item.id === input.degreeId
    );
    if (!selected) {
      return fail("Select a valid degree level.", "اختر مستوى درجة صحيح.");
    }
    degree = labelFor(advising.targetDegrees, input.degreeId);
    degreeMultiplier = selected.priceMultiplier;
  }
  const degreeText = (l: Language): string =>
    degree ? ` · ${pickText(l, degree.labelEn, degree.labelAr)}` : "";

  const packageLabel = ADVISING_LABELS.fullPackage;
  // The full package is scaled by the degree multiplier, like the per-session rates.
  const packagePrice = roundMoney(rates.fullPackage * degreeMultiplier);

  if (input.mode === "fullPackage") {
    return makeLine(
      "universityAdvising",
      advising,
      bi(
        (l) =>
          `${pickText(l, packageLabel.labelEn, packageLabel.labelAr)}${degreeText(l)}`
      ),
      [
        row(
          bi(
            (l) =>
              `${pickText(l, "Launch price", "سعر الإطلاق")}: ${pickText(l, packageLabel.labelEn, packageLabel.labelAr)}`
          ),
          packagePrice
        ),
      ]
    );
  }

  if (!advising.sessionDurations.includes(input.duration)) {
    return fail("Select a session length.", "اختر مدة الجلسة.");
  }
  if (!isCount(input.followUps, 0, 1000)) {
    return fail(
      "Enter a whole number of follow-up sessions (0 or more).",
      "أدخل عدداً صحيحاً من جلسات المتابعة (0 أو أكثر)."
    );
  }
  if (!input.includeInitial && input.followUps === 0) {
    return fail("Choose at least one session.", "اختر جلسة واحدة على الأقل.");
  }

  const initial = ADVISING_LABELS.initialConsultation;
  const followUp = ADVISING_LABELS.followUpSession;
  const rows: QuoteRow[] = [];
  const initialUnit = sessionPrice(
    rates.initialConsultation,
    input.duration,
    degreeMultiplier
  );
  const followUpUnit = sessionPrice(
    rates.followUpSession,
    input.duration,
    degreeMultiplier
  );

  if (input.includeInitial) {
    rows.push(
      row(
        bi(
          (l) =>
            `${pickText(l, "Launch price", "سعر الإطلاق")}: ${pickText(l, initial.labelEn, initial.labelAr)} (${formatDuration(
              input.duration,
              l
            )}): 1 × ${perUnit(initialUnit, "session", l)}`
        ),
        initialUnit
      )
    );
  }
  if (input.followUps > 0) {
    rows.push(
      row(
        bi(
          (l) =>
            `${pickText(l, "Launch price", "سعر الإطلاق")}: ${pickText(l, followUp.labelEn, followUp.labelAr)} (${formatDuration(
              input.duration,
              l
            )}): ${input.followUps} × ${perUnit(followUpUnit, "session", l)}`
        ),
        roundMoney(followUpUnit * input.followUps)
      )
    );
  }

  const total = roundMoney(rows.reduce((sum, item) => sum + item.amount, 0));
  const saving = roundMoney(total - packagePrice);
  const hint: Bilingual | undefined =
    saving > 0
      ? bi((l) =>
          pickText(
            l,
            `The full package (${formatPrice(packagePrice, l)}) would save you ${formatPrice(
              saving,
              l
            )}.`,
            `الباقة الكاملة (${formatPrice(packagePrice, l)}) توفر عليك ${formatPrice(
              saving,
              l
            )}.`
          )
        )
      : undefined;

  return makeLine(
    "universityAdvising",
    advising,
    bi(
      (l) =>
        `${pickText(l, "Per-session pricing", "التسعير بالجلسة")}${degreeText(l)}`
    ),
    rows,
    hint
  );
}
