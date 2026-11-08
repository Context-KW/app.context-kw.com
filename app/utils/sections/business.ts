import { config } from "@/config";
import { ADVISING_LABELS } from "@/app/utils/pricing/advising";
import { corporatePricingTiers } from "@/app/utils/pricing/corporate";
import { FINISHING_UNIT, PROTECTOR_MAX_COUNT } from "@/app/utils/pricing/print";
import {
  durationItems,
  fromLabel,
  item,
  quantitySection,
  section,
  text,
} from "@/app/utils/sections/helpers";
import type { ServiceSection } from "@/app/utils/serviceTypes";

export const universityAdvising: ServiceSection[] = [
  section("rates", text("Consultation rates", "أسعار الاستشارات"), [
    item(
      "initialConsultation",
      fromLabel(ADVISING_LABELS.initialConsultation),
      undefined,
      {
        amount: config.universityAdvising.rates.initialConsultation,
        unit: "session",
      }
    ),
    item(
      "followUpSession",
      fromLabel(ADVISING_LABELS.followUpSession),
      undefined,
      {
        amount: config.universityAdvising.rates.followUpSession,
        unit: "session",
      }
    ),
    item(
      "fullPackage",
      fromLabel(ADVISING_LABELS.fullPackage),
      text("Flat bundle price", "سعر ثابت للباقة"),
      { amount: config.universityAdvising.rates.fullPackage }
    ),
  ]),
  section(
    "degrees",
    text("Target degrees", "الدرجات المستهدفة"),
    config.universityAdvising.targetDegrees.map((degree) =>
      item(degree.id, fromLabel(degree))
    )
  ),
  section(
    "durations",
    text("Session lengths", "مدة الجلسة"),
    durationItems(config.universityAdvising.sessionDurations)
  ),
];

export const corporate: ServiceSection[] = [
  section(
    "options",
    text("Training focus", "مجال التدريب"),
    config.corporate.options.map((option) =>
      item(
        option.id,
        fromLabel(option),
        text(option.descriptionEn, option.descriptionAr)
      )
    )
  ),
  section(
    "tiers",
    text("Team pricing tiers", "شرائح أسعار الفرق"),
    Object.entries(corporatePricingTiers)
      .sort(([, a], [, b]) => a.minSize - b.minSize)
      .map(([id, tier]) =>
        item(
          id,
          text(
            `${tier.minSize}–${tier.maxSize} people`,
            `${tier.minSize}–${tier.maxSize} فرد`
          ),
          undefined,
          { amount: tier.pricePerPerson, unit: "personMonth" }
        )
      ),
    { readOnly: true }
  ),
  quantitySection(
    "teamSize",
    text("Team size (people)", "حجم الفريق (عدد الأفراد)"),
    {
      min: config.corporate.minimumTeamSize,
      max: config.corporate.maximumTeamSize,
      step: 1,
      defaultValue: config.corporate.minimumTeamSize,
    }
  ),
  quantitySection("months", text("Duration (months)", "المدة (بالأشهر)"), {
    min: 1,
    max: 120,
    step: 1,
    defaultValue: 1,
  }),
];

const multiplierDetail = (multiplier: number) =>
  text(`× ${multiplier} price`, `× ${multiplier} السعر`);

export const printShop: ServiceSection[] = [
  section(
    "paper",
    text("Paper types", "أنواع الورق"),
    config.printShop.paperTypes.map((paper) =>
      item(paper.id, fromLabel(paper), undefined, {
        amount: paper.pricePerPage,
        unit: "page",
      })
    )
  ),
  section(
    "color",
    text("Color modes", "أنماط الألوان"),
    config.printShop.colorModes.map((mode) =>
      item(mode.id, fromLabel(mode), multiplierDetail(mode.priceMultiplier))
    )
  ),
  section(
    "layout",
    text("Layouts", "أنماط الطباعة"),
    config.printShop.layoutModes.map((mode) =>
      item(mode.id, fromLabel(mode), multiplierDetail(mode.priceMultiplier))
    )
  ),
  section(
    "finishing",
    text("Finishing", "التشطيب"),
    config.printShop.finishingOptions.map((option) =>
      item(option.id, fromLabel(option), undefined, {
        amount: option.price,
        unit: FINISHING_UNIT[option.id],
      })
    ),
    { multiple: true }
  ),
  // Protector options. Shown only when "protectors" is ticked (see isGroupVisible).
  section(
    "protectorMode",
    text("Protectors apply to", "الأغلفة تُطبَّق على"),
    [
      item("eachSheet", text("Each sheet", "كل ورقة")),
      item("allCopies", text("All copies", "جميع النسخ")),
      item("custom", text("Custom", "مخصص")),
    ],
    { compact: true }
  ),
  section(
    "protectorThickness",
    text("Thickness", "السماكة"),
    config.printShop.protectorThicknesses.map((thickness) =>
      item(thickness.id, fromLabel(thickness), undefined, {
        amount: thickness.price,
        unit: "piece",
      })
    ),
    { compact: true }
  ),
  // Shown only in "custom" protector mode (see isGroupVisible).
  quantitySection(
    "protectorCount",
    text(`Number of protectors (1–${PROTECTOR_MAX_COUNT})`, `عدد الأغلفة (1–${PROTECTOR_MAX_COUNT})`),
    { min: 1, max: PROTECTOR_MAX_COUNT, step: 1, defaultValue: 10 }
  ),
  quantitySection("pages", text("Pages per copy", "عدد الصفحات لكل نسخة"), {
    min: 1,
    max: 1000000,
    step: 1,
    defaultValue: 10,
  }),
  quantitySection("copies", text("Copies", "عدد النسخ"), {
    min: 1,
    max: 10000,
    step: 1,
    defaultValue: 1,
  }),
];
