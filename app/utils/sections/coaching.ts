import { config } from "@/config";
import {
  ACCENT_RATE_KEYS,
  ACCENT_RATE_LABELS,
  accentLaunchRate,
} from "@/app/utils/pricing/accent";
import {
  CONSULTATION_PRICE,
  effectiveTutoringRate,
  TUTORING_PROMO_FOCUS,
} from "@/app/utils/pricing/tutoring";
import { COMMUNICATIVE_ARABIC_OPTIONS } from "@/app/utils/pricing/communicativeArabic";
import { RESUME_WRITING_ADD_ONS, RESUME_WRITING_TIERS } from "@/app/utils/pricing/resumeWriting";
import {
  durationItems,
  fromLabel,
  item,
  quantitySection,
  section,
  text,
} from "@/app/utils/sections/helpers";
import type { ServiceSection } from "@/app/utils/serviceTypes";

const tutoringRates: Record<string, number> = config.tutoring.rates;

// KWD uses 3 decimal places (config.currency.decimalPlaces).
const roundKwd = (value: number): number => Math.round(value * 1000) / 1000;

export const tutoring: ServiceSection[] = [
  section(
    "consultation",
    text("Session type", "نوع الجلسة"),
    [
      item("session", text("Standard session", "جلسة عادية"), text("Billed by the rate and package above", "تُحسب حسب السعر والباقة أعلاه")),
      item(
        "consultation",
        text("Free 15-Minute Consultation", "استشارة مجانية مدتها 15 دقيقة"),
        text("Introductory call. Choose a date from tomorrow onward.", "مكالمة تعريفية. اختر تاريخاً ابتداءً من الغد."),
        { amount: CONSULTATION_PRICE }
      ),
    ]
  ),
  section(
    "rates",
    text("Hourly rates", "الأسعار بالساعة"),
    config.tutoring.options.map((option) => {
      return item(
        option.id,
        fromLabel(option),
        undefined,
        { amount: effectiveTutoringRate(option.id), unit: "hour" },
        { amount: tutoringRates[option.id], unit: "hour" }
      );
    })
  ),
  section(
    "packages",
    text("Packages", "الباقات"),
    config.tutoring.packages.map((pkg) => {
      // Standard price: each session is one hour at the standard General English rate.
      const standard = roundKwd(pkg.sessions * tutoringRates.general);
      // Active price uses the promo rate, the same rate the quote bills.
      const base = roundKwd(pkg.sessions * effectiveTutoringRate(TUTORING_PROMO_FOCUS));
      const discounted = roundKwd(base * (1 - pkg.discount / 100));
      return item(
        pkg.id,
        fromLabel(pkg),
        pkg.discount > 0
          ? text(
              `${pkg.sessions} sessions · ${pkg.discount}% off`,
              `${pkg.sessions} جلسات · خصم ${pkg.discount}%`
            )
          : text(`${pkg.sessions} session`, `${pkg.sessions} جلسة`),
        { amount: discounted },
        standard !== discounted ? { amount: standard } : undefined
      );
    })
  ),
  section(
    "delivery",
    text("Delivery modes", "طرق التقديم"),
    config.tutoring.deliveryModes.map((mode) => item(mode.id, fromLabel(mode)))
  ),
  section(
    "durations",
    text("Session lengths", "مدة الجلسة"),
    durationItems(config.tutoring.sessionDurations)
  ),
];

export const accentCoaching: ServiceSection[] = [
  section(
    "rates",
    text("Choose an option", "اختر خياراً"),
    [
      ...ACCENT_RATE_KEYS.map((key) =>
        item(
          key,
          fromLabel(ACCENT_RATE_LABELS[key]),
          undefined,
          { amount: accentLaunchRate(key), unit: "hour" },
          { amount: config.accentCoaching.rates[key], unit: "hour" }
        )
      ),
      ...RESUME_WRITING_TIERS.map((tier) =>
        item(tier.id, text(tier.labelEn, tier.labelAr), undefined, { amount: tier.launchRate }, { amount: tier.originalRate })
      ),
    ]
  ),
  section(
    "consultation",
    text("Session type", "نوع الجلسة"),
    [
      item("session", text("Standard session", "جلسة عادية"), text("Billed by the rate and package above", "تُحسب حسب السعر والباقة أعلاه")),
      item(
        "consultation",
        text("Free 15-Minute Consultation", "استشارة مجانية مدتها 15 دقيقة"),
        text("Introductory call. Choose a date from tomorrow onward.", "مكالمة تعريفية. اختر تاريخاً ابتداءً من الغد."),
        { amount: CONSULTATION_PRICE }
      ),
    ]
  ),
  section(
    "focus",
    text("Focus areas", "مجالات التركيز"),
    config.accentCoaching.focusAreas.map((area) => item(area.id, fromLabel(area)))
  ),
  section(
    "delivery",
    text("Delivery modes", "طرق التقديم"),
    config.accentCoaching.deliveryModes.map((mode) => item(mode.id, fromLabel(mode)))
  ),
  section(
    "durations",
    text("Session lengths", "مدة الجلسة"),
    durationItems(config.accentCoaching.sessionDurations)
  ),
  quantitySection("sessions", text("Number of sessions", "عدد الجلسات"), {
    min: 1,
    max: 1000,
    step: 1,
    defaultValue: 1,
  }),
  section(
    "addons",
    text("Resume add-ons (optional)", "إضافات السيرة الذاتية (اختيارية)"),
    RESUME_WRITING_ADD_ONS.map((addOn) =>
      item(addOn.id, text(addOn.labelEn, addOn.labelAr), undefined, { amount: addOn.launchRate }, { amount: addOn.originalRate })
    ),
    { multiple: true }
  ),
];

export const resumeWriting: ServiceSection[] = [
  section(
    "consultation",
    text("Session type", "نوع الجلسة"),
    [
      item("session", text("Standard service", "خدمة عادية"), text("Billed by the level and add-ons below", "تُحسب حسب المستوى والإضافات أدناه")),
      item(
        "consultation",
        text("Free 15-Minute Consultation", "استشارة مجانية مدتها 15 دقيقة"),
        text("Introductory call. Choose a date from tomorrow onward.", "مكالمة تعريفية. اختر تاريخاً ابتداءً من الغد."),
        { amount: CONSULTATION_PRICE }
      ),
    ]
  ),
  section(
    "rates",
    text("Service levels & launch prices", "مستويات الخدمة وأسعار الإطلاق"),
    RESUME_WRITING_TIERS.map((tier) =>
      item(tier.id, text(tier.labelEn, tier.labelAr), undefined, { amount: tier.launchRate }, { amount: tier.originalRate })
    )
  ),
  section(
    "addons",
    text("Optional add-ons", "إضافات اختيارية"),
    RESUME_WRITING_ADD_ONS.map((addOn) =>
      item(addOn.id, text(addOn.labelEn, addOn.labelAr), undefined, { amount: addOn.launchRate }, { amount: addOn.originalRate })
    ),
    { multiple: true }
  ),
  section(
    "delivery",
    text("Delivery modes", "طرق التقديم"),
    config.resumeWriting.deliveryModes.map((mode) => item(mode.id, fromLabel(mode)))
  ),
];

export const communicativeArabic: ServiceSection[] = [
  section(
    "rates",
    text("Choose an option", "اختر خياراً"),
    COMMUNICATIVE_ARABIC_OPTIONS.map((option) =>
      item(
        option.id,
        text(option.labelEn, option.labelAr),
        text(option.subcategoryLabelEn, option.subcategoryLabelAr),
        { amount: option.launchRate },
        { amount: option.originalRate }
      )
    )
  ),
  section(
    "consultation",
    text("Session type", "نوع الجلسة"),
    [
      item("session", text("Standard session", "جلسة عادية"), text("Billed by the package above", "تُحسب حسب الباقة أعلاه")),
      item(
        "consultation",
        text("Free 15-Minute Consultation", "استشارة مجانية مدتها 15 دقيقة"),
        text("Introductory call. Choose a date from tomorrow onward.", "مكالمة تعريفية. اختر تاريخاً ابتداءً من الغد."),
        { amount: CONSULTATION_PRICE }
      ),
    ]
  ),
  section(
    "delivery",
    text("Delivery modes", "طرق التقديم"),
    config.communicativeArabic.deliveryModes.map((mode) => item(mode.id, fromLabel(mode)))
  ),
];
