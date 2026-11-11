import { config } from "@/config";
import { effectiveTutoringRate } from "@/app/utils/pricing/tutoring";
import { SERVICE_SECTIONS } from "@/app/utils/sections";
import type { ServiceDefinition } from "@/app/utils/serviceTypes";
import { COMMUNICATIVE_ARABIC_OPTIONS } from "@/app/utils/pricing/communicativeArabic";

const lowest = (...values: number[]): number => Math.min(...values);

const tutoringRates: Record<string, number> = config.tutoring.rates;
const accentOptionRates: Record<string, number> = {
  accentReduction: config.accentCoaching.rates.accentCoaching,
  interviewPrep: config.accentCoaching.rates.interviewPrep,
};

/** Services 1-3: tutoring, accent coaching, communicative Arabic coaching. */
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
    id: "communicativeArabic",
    image: "/images/services/communicative-arabic.jpg",
    titleEn: config.communicativeArabic.titleEn,
    titleAr: config.communicativeArabic.titleAr,
    descriptionEn: config.communicativeArabic.descriptionEn,
    descriptionAr: config.communicativeArabic.descriptionAr,
    options: COMMUNICATIVE_ARABIC_OPTIONS.map((option) => ({
      id: option.id,
      labelEn: option.labelEn,
      labelAr: option.labelAr,
      descriptionEn: option.subcategoryLabelEn,
      descriptionAr: option.subcategoryLabelAr,
      price: { amount: option.launchRate },
      originalPrice: { amount: option.originalRate },
    })),
    sections: SERVICE_SECTIONS.communicativeArabic,
    // Launch prices are flat per package, so no unit is shown.
    startingPrice: {
      amount: lowest(...COMMUNICATIVE_ARABIC_OPTIONS.map((option) => option.launchRate)),
    },
    startingOriginalPrice: {
      amount: lowest(...COMMUNICATIVE_ARABIC_OPTIONS.map((option) => option.originalRate)),
    },
  },
];
