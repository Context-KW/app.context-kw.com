import { config } from "@/config";
import { formatPrice, pickText } from "@/app/utils/format";
import { bi, fail, isCount, makeLine, row } from "@/app/utils/pricing/core";
import type { QuoteResult } from "@/app/utils/pricing/core";

export interface CorporatePricingTier {
  minSize: number;
  maxSize: number;
  pricePerPerson: number;
}

/**
 * Team pricing tiers from config.js. config.js does not define them yet,
 * so this is an empty object until `corporate.pricingTiers` is added.
 */
export const corporatePricingTiers: Record<string, CorporatePricingTier> =
  (config.corporate as { pricingTiers?: Record<string, CorporatePricingTier> })
    .pricingTiers ?? {};

export interface CorporateInput {
  teamSize: number;
}

export function quoteCorporate(input: CorporateInput): QuoteResult {
  const corporate = config.corporate;

  const minPeople = corporate.smallTeamPackage?.minPeople ?? 3;
  const maxPeople = corporate.smallTeamPackage?.maxPeople ?? 8;

  if (!isCount(input.teamSize, minPeople, maxPeople)) {
    return fail(
      `Team size must be a whole number from ${minPeople} to ${maxPeople}.`,
      `يجب أن يكون حجم الفريق عدداً صحيحاً من ${minPeople} إلى ${maxPeople}.`
    );
  }

  const pkg = corporate.smallTeamPackage;

  const standard = pkg?.priceStandard ?? 300;
  const launch = pkg?.priceLaunch ?? 150;

  const isLaunch = input.teamSize === minPeople;

  return makeLine(
    "corporate",
    corporate,
    bi((l) =>
      pickText(
        l,
        `${input.teamSize} people · ${pkg?.descriptionEn ?? "Small Team Package"}`,
        `${input.teamSize} فرد · ${pkg?.descriptionAr ?? "باقة فريق صغير"}`
      )
    ),
    [
      row(
        bi((l) =>
          isLaunch
            ? `Launch price: ${formatPrice(launch, l)}`
            : `Standard price: ${formatPrice(standard, l)}`
        ),
        isLaunch ? launch : standard
      ),
    ],
    undefined
  );
}
