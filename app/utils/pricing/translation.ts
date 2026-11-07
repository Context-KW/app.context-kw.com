import { config } from "@/config";
import { pickText } from "@/app/utils/format";
import type { PriceUnit } from "@/app/utils/format";
import {
  bi,
  fail,
  isCount,
  isHalfHours,
  labelFor,
  makeLine,
  perUnit,
  roundMoney,
  row,
} from "@/app/utils/pricing/core";
import type { QuoteResult } from "@/app/utils/pricing/core";

export type TranslationKind =
  | "englishToArabic"
  | "arabicToEnglish"
  | "proofreading"
  | "researchSupport"
  | "consultation";

export interface TranslationKindInfo {
  labelEn: string;
  labelAr: string;
  unit: PriceUnit;
  rate: number;
}

export const TRANSLATION_KIND_ORDER: TranslationKind[] = [
  "englishToArabic",
  "arabicToEnglish",
  "proofreading",
  "researchSupport",
  "consultation",
];

export const TRANSLATION_KINDS: Record<TranslationKind, TranslationKindInfo> = {
  englishToArabic: {
    labelEn: "Translation: English → Arabic",
    labelAr: "ترجمة: من الإنجليزية إلى العربية",
    unit: "word",
    rate: config.translation.rates.englishToArabic,
  },
  arabicToEnglish: {
    labelEn: "Translation: Arabic → English",
    labelAr: "ترجمة: من العربية إلى الإنجليزية",
    unit: "word",
    rate: config.translation.rates.arabicToEnglish,
  },
  proofreading: {
    ...labelFor(config.translation.options, "proofreading"),
    unit: "word",
    rate: config.translation.rates.proofreading,
  },
  researchSupport: {
    ...labelFor(config.translation.options, "researchSupport"),
    unit: "hour",
    rate: config.translation.rates.researchSupport,
  },
  consultation: {
    labelEn: config.linguisticConsultation.titleEn,
    labelAr: config.linguisticConsultation.titleAr,
    unit: "hour",
    rate: config.linguisticConsultation.rates.consultation,
  },
};

export interface TranslationInput {
  kind: TranslationKind;
  /** Words for per-word services, hours for per-hour services. */
  quantity: number;
  documentTypeId?: string;
}

/** Per-word services are priced by word count; research and consultation by the hour. */
export function quoteTranslation(input: TranslationInput): QuoteResult {
  const info = TRANSLATION_KINDS[input.kind];
  if (!info) {
    return fail("Select a service.", "اختر الخدمة.");
  }

  const byWord = info.unit === "word";
  if (byWord && !isCount(input.quantity)) {
    return fail(
      "Enter a whole number of words (at least 1).",
      "أدخل عدداً صحيحاً من الكلمات (1 على الأقل)."
    );
  }
  if (!byWord && !isHalfHours(input.quantity)) {
    return fail(
      "Enter hours in steps of 0.5 (at least 0.5).",
      "أدخل الساعات بمضاعفات 0.5 (0.5 على الأقل)."
    );
  }

  let documentType: { labelEn: string; labelAr: string } | undefined;
  if (byWord && input.documentTypeId) {
    const known = config.translation.documentTypes.some(
      (type) => type.id === input.documentTypeId
    );
    if (!known) {
      return fail("Select a valid document type.", "اختر نوع مستند صحيح.");
    }
    documentType = labelFor(config.translation.documentTypes, input.documentTypeId);
  }

  return makeLine(
    "translation",
    config.translation,
    bi((l) =>
      documentType
        ? `${pickText(l, info.labelEn, info.labelAr)} · ${pickText(
            l,
            documentType.labelEn,
            documentType.labelAr
          )}`
        : pickText(l, info.labelEn, info.labelAr)
    ),
    [
      row(
        bi((l) => `${input.quantity} × ${perUnit(info.rate, info.unit, l)}`),
        roundMoney(info.rate * input.quantity)
      ),
    ]
  );
}
