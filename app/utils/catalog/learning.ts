import { config } from "@/config";
import { effectiveTutoringRate } from "@/app/utils/pricing/tutoring";
import { SERVICE_SECTIONS } from "@/app/utils/sections";
import type { ServiceDefinition, ServicePrice } from "@/app/utils/serviceTypes";

const lowest = (...values: number[]): number => Math.min(...values);

const tutoringRates: Record<string, number> = config.tutoring.rates;
const accentOptionRates: Record<string, number> = {
  accentReduction: config.accentCoaching.rates.accentCoaching,
  interviewPrep: config.accentCoaching.rates.interviewPrep,
};
const translationOptionRates: Record<string, ServicePrice> = {
  translation: {
    amount: lowest(
      config.translation.rates.englishToArabic,
      config.translation.rates.arabicToEnglish
    ),
    unit: "word",
  },
  proofreading: { amount: config.translation.rates.proofreading, unit: "word" },
  researchSupport: {
    amount: config.translation.rates.researchSupport,
    unit: "hour",
  },
};

/** Services 1-3: tutoring, accent coaching, translation. */
export const learningServices: ServiceDefinition[] = [
  {
    id: "tutoring",
    image: "/images/services/tutoring.jpg",
    titleEn: config.tutoring.titleEn,
    titleAr: config.tutoring.titleAr,
    descriptionEn: config.tutoring.descriptionEn,
    descriptionAr: config.tutoring.descriptionAr,
    options: config.tutoring.options.map((option) => ({
      ...option,
      price: {
        amount: effectiveTutoringRate(option.id),
        unit: "hour" as const,
      },
      originalPrice: { amount: tutoringRates[option.id], unit: "hour" as const },
    })),
    sections: SERVICE_SECTIONS.tutoring,
    startingPrice: {
      amount: lowest(
        ...config.tutoring.options.map((option) => effectiveTutoringRate(option.id))
      ),
      unit: "hour",
    },
    startingOriginalPrice: {
      amount: lowest(...Object.values(config.tutoring.rates)),
      unit: "hour",
    },
  },
  {
    id: "accentCoaching",
    image: "/images/services/accent-coaching.jpg",
    titleEn: config.accentCoaching.titleEn,
    titleAr: config.accentCoaching.titleAr,
    descriptionEn: config.accentCoaching.descriptionEn,
    descriptionAr: config.accentCoaching.descriptionAr,
    // publicSpeaking has no published rate in config.js, so it stays unpriced.
    options: config.accentCoaching.options.map((option) => ({
      ...option,
      price:
        accentOptionRates[option.id] === undefined
          ? undefined
          : { amount: accentOptionRates[option.id], unit: "hour" as const },
    })),
    sections: SERVICE_SECTIONS.accentCoaching,
    startingPrice: {
      amount: lowest(...Object.values(config.accentCoaching.rates)),
      unit: "hour",
    },
  },
  {
    id: "translation",
    image: "/images/services/translation.png",
    titleEn: config.translation.titleEn,
    titleAr: config.translation.titleAr,
    descriptionEn: config.translation.descriptionEn,
    descriptionAr: config.translation.descriptionAr,
    options: config.translation.options.map((option) => ({
      ...option,
      price: translationOptionRates[option.id],
    })),
    sections: SERVICE_SECTIONS.translation,
    // researchSupport is hourly, so only the per-word rates are compared here.
    startingPrice: {
      amount: lowest(
        config.translation.rates.englishToArabic,
        config.translation.rates.arabicToEnglish,
        config.translation.rates.proofreading
      ),
      unit: "word",
    },
  },
];
