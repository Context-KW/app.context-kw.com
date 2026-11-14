import { config } from "@/config";
import { formatPrice, pickText } from "@/app/utils/format";
import type { PriceUnit } from "@/app/utils/format";
import {
  bi,
  fail,
  isCount,
  makeLine,
  perUnit,
  roundMoney,
  row,
} from "@/app/utils/pricing/core";
import type { QuoteResult, QuoteRow } from "@/app/utils/pricing/core";

/**
 * ASSUMPTION: config.js lists a single price per finishing option but not what it
 * is charged per. Sheet protectors and scanning are charged per page; spiral binding is
 * charged once per piece (not per copy). Options with no unit (stapling) are a flat
 * price shown as-is, with no per-unit label. Adjust here if that changes.
 */
export const FINISHING_UNIT: Record<string, PriceUnit | undefined> = {
  protectors: "piece",
  binding: "piece",
  scanning: "page",
};

export interface PrintInput {
  paperId: string;
  colorId: string;
  layoutId: string;
  pages: number;
  copies: number;
  finishingIds: string[];
  /** Delivery zone id from config.printShop.deliveryZones. Empty for pickup. */
  deliveryZoneId?: string;
  /**
   * How sheet protectors are counted when "protectors" is selected:
   * "allCopies" = one protector for the whole job, "eachSheet" = one per sheet
   * (pages x copies), "custom" = `protectorCount`. Defaults to "eachSheet".
   */
  protectorMode?: ProtectorMode;
  /** Protector count for "custom" mode, from 1 to PROTECTOR_MAX_COUNT. */
  protectorCount?: number;
  /** Protector thickness id from config.printShop.protectorThicknesses. Defaults to the first. */
  protectorThicknessId?: string;
}

export type ProtectorMode = "allCopies" | "eachSheet" | "custom";

export const PROTECTOR_MAX_COUNT = 50;

/**
 * Flat per-page price for a paper and color mode, from `pageRates` in config.js.
 * Returns null when the paper has no flat rate, so the volume tiers apply.
 */
export function flatPagePrice(paperId: string, colorId: string): number | null {
  const paper = config.printShop.paperTypes.find((item) => item.id === paperId);
  const rates = (paper as { pageRates?: Record<string, number> } | undefined)?.pageRates;
  return rates?.[colorId] ?? null;
}

/** Per-page price billed for a job, from the volume tiers in config.js (base paper). */
export function tieredPagePrice(colorId: string, totalPages: number): number | null {
  const tiers = config.printShop.printTiers;
  const tier = colorId === "color" ? tiers.color : colorId === "bw" ? tiers.bw : null;
  if (!tier) return null;
  return totalPages >= tiers.threshold ? tier.atOrAboveThreshold : tier.belowThreshold;
}

/**
 * Bulk discount percents that apply to a paper for a given number of sheets,
 * from `bulkDiscounts` in config.js. Each matching step applies after the promo.
 */
export interface BulkDiscountStep {
  minSheets: number;
  percent: number;
}

/** All bulk steps configured for a paper, whether or not the order reaches them. */
export function bulkDiscountSteps(paperId: string): BulkDiscountStep[] {
  const paper = config.printShop.paperTypes.find((item) => item.id === paperId);
  return (paper as { bulkDiscounts?: BulkDiscountStep[] } | undefined)?.bulkDiscounts ?? [];
}

export function bulkPercents(paperId: string, sheets: number): number[] {
  return bulkDiscountSteps(paperId)
    .filter((step) => sheets >= step.minSheets)
    .map((step) => step.percent);
}

/** Delivery fee for a zone, or null if the zone is unknown. */
export function deliveryFee(zoneId: string): number | null {
  const zone = config.printShop.deliveryZones.find((item) => item.id === zoneId);
  return zone ? zone.fee : null;
}

/**
 * Printing = pages x copies x paper price x color multiplier x layout multiplier,
 * plus each selected finishing option (per page or per copy, see FINISHING_UNIT).
 */
export function quotePrint(input: PrintInput): QuoteResult {
  const print = config.printShop;
  const paper = print.paperTypes.find((item) => item.id === input.paperId);
  const color = print.colorModes.find((item) => item.id === input.colorId);
  const layout = print.layoutModes.find((item) => item.id === input.layoutId);

  if (!paper) return fail("Select a paper type.", "اختر نوع الورق.");
  if (!color) return fail("Select a color mode.", "اختر نمط الألوان.");
  if (!layout) return fail("Select a layout.", "اختر نمط الطباعة.");
  if (!isCount(input.pages)) {
    return fail(
      "Enter a whole number of pages (at least 1).",
      "أدخل عدداً صحيحاً من الصفحات (1 على الأقل)."
    );
  }
  if (!isCount(input.copies, 1, 10_000)) {
    return fail(
      "Enter a whole number of copies (1 to 10,000).",
      "أدخل عدداً صحيحاً من النسخ (من 1 إلى 10,000)."
    );
  }

  const finishing = [];
  for (const id of new Set(input.finishingIds)) {
    const option = print.finishingOptions.find((item) => item.id === id);
    if (!option) {
      return fail("Select valid finishing options.", "اختر خيارات تشطيب صحيحة.");
    }
    finishing.push(option);
  }

  const sheets = input.pages * input.copies;
  const protectorsSelected = input.finishingIds.includes("protectors");
  const protectorMode: ProtectorMode = input.protectorMode ?? "eachSheet";
  const thickness = input.protectorThicknessId
    ? print.protectorThicknesses.find((item) => item.id === input.protectorThicknessId)
    : print.protectorThicknesses[0];
  if (protectorsSelected) {
    if (!thickness) {
      return fail("Select a valid protector thickness.", "اختر سماكة صحيحة لأغلفة الورق.");
    }
    if (
      protectorMode !== "allCopies" &&
      protectorMode !== "eachSheet" &&
      protectorMode !== "custom"
    ) {
      return fail("Select a valid protector option.", "اختر خياراً صحيحاً لأغلفة الورق.");
    }
    if (protectorMode === "custom" && !isCount(input.protectorCount ?? NaN, 1, PROTECTOR_MAX_COUNT)) {
      return fail(
        `Enter a whole number of sheet protectors (1 to ${PROTECTOR_MAX_COUNT}).`,
        `أدخل عدداً صحيحاً من أغلفة الورق (من 1 إلى ${PROTECTOR_MAX_COUNT}).`
      );
    }
  }
  const multiplier = color.priceMultiplier * layout.priceMultiplier;
  // Papers with flat rates bill those rates per color mode, times the layout multiplier.
  // Other papers use the volume tiers for the color mode.
  const flatRate = flatPagePrice(paper.id, color.id);
  const tierPrice = flatRate === null ? tieredPagePrice(input.colorId, sheets) : null;
  const unitPrice = flatRate ?? tierPrice ?? paper.pricePerPage;
  const printCost =
    flatRate !== null
      ? roundMoney(sheets * flatRate * layout.priceMultiplier)
      : tierPrice === null
        ? roundMoney(sheets * paper.pricePerPage * multiplier)
        : roundMoney(sheets * tierPrice * layout.priceMultiplier);
  const rows: QuoteRow[] = [
    {
      ...row(
        bi(
          (l) =>
            `${pickText(l, "Printing", "الطباعة")}: ${sheets} × ${perUnit(
              unitPrice,
              "page",
              l
            )}`
        ),
        printCost
      ),
      // Bulk steps apply after the 25% promo, so they stack on the promo price.
      postPromoPercents: bulkPercents(paper.id, sheets),
    },
  ];

  if (input.deliveryZoneId) {
    const fee = deliveryFee(input.deliveryZoneId);
    if (fee === null) {
      return fail("Select a valid delivery zone.", "اختر منطقة توصيل صحيحة.");
    }
    // Delivery fees are fixed charges, so the promo discount does not apply to them.
    rows.push({
      ...row(bi((l) => pickText(l, "Delivery", "التوصيل")), roundMoney(fee)),
      exempt: true,
    });
  }

  for (const option of finishing) {
    if (option.id === "protectors" && thickness) {
      const protectorQuantity =
        protectorMode === "allCopies"
          ? 1
          : protectorMode === "custom"
            ? input.protectorCount ?? 0
            : sheets;
      rows.push(
        row(
          bi(
            (l) =>
              `${pickText(l, option.labelEn, option.labelAr)} (${pickText(
                l,
                thickness.labelEn,
                thickness.labelAr
              )}): ${protectorQuantity} × ${perUnit(thickness.price, "piece", l)}`
          ),
          roundMoney(protectorQuantity * thickness.price)
        )
      );
      continue;
    }
    const unit = FINISHING_UNIT[option.id];
    if (unit === undefined) {
      rows.push(
        row(
          bi((l) => `${pickText(l, option.labelEn, option.labelAr)}: ${formatPrice(option.price, l)}`),
          roundMoney(option.price)
        )
      );
      continue;
    }
    const quantity = unit === "page" ? sheets : unit === "piece" ? 1 : input.copies;
    rows.push(
      row(
        bi(
          (l) =>
            `${pickText(l, option.labelEn, option.labelAr)}: ${quantity} × ${perUnit(
              option.price,
              unit,
              l
            )}`
        ),
        roundMoney(quantity * option.price)
      )
    );
  }

  return makeLine(
    "printShop",
    print,
    bi(
      (l) =>
        `${pickText(l, paper.labelEn, paper.labelAr)} · ${pickText(
          l,
          color.labelEn,
          color.labelAr
        )} · ${pickText(l, layout.labelEn, layout.labelAr)}`
    ),
    rows
  );
}
