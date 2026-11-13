import { businessServices } from "@/app/utils/catalog/business";
import { learningServices } from "@/app/utils/catalog/learning";
import {
  promoApplies,
  promoPercentFor,
  promoPrice,
} from "@/app/utils/pricing/core";
import type {
  ServiceDefinition,
  ServiceId,
  ServiceSectionItem,
} from "@/app/utils/serviceTypes";

export type {
  ServiceDefinition,
  ServiceId,
  ServiceOption,
  ServicePrice,
  ServiceSection,
  ServiceSectionItem,
} from "@/app/utils/serviceTypes";

/**
 * The six service cards, in display order.
 * All text and prices come from config.js (see app/utils/catalog/*).
 */
/**
 * Applies the promo to each card's starting price. The standard price is kept
 * as `startingOriginalPrice` so the card can show it struck through.
 * Printing is excluded (see PROMO_EXCLUDED_SERVICES). Tutoring keeps its own promo.
 */
function promoItem(
  entry: ServiceSectionItem,
  percent: number
): ServiceSectionItem {
  // Free items (price 0) get no launch price or struck-through standard price.
  if (!entry.price || entry.price.amount === 0 || entry.originalPrice) return entry;
  return {
    ...entry,
    originalPrice: entry.price,
    price: { ...entry.price, amount: promoPrice(entry.price.amount, percent) },
  };
}

function withPromo(service: ServiceDefinition): ServiceDefinition {
  if (!promoApplies(service.id) || service.startingOriginalPrice) return service;
  const percent = promoPercentFor(service.id);
  const standard = service.startingPrice.amount;
  return {
    ...service,
    startingOriginalPrice: { amount: standard, unit: service.startingPrice.unit },
    startingPrice: {
      amount: promoPrice(standard, percent),
      unit: service.startingPrice.unit,
    },
    // Modal rows get the same promo as the card and the quote.
    options: service.options.map((option) =>
      option.price && option.price.amount !== 0 && !option.originalPrice
        ? {
            ...option,
            originalPrice: option.price,
            price: {
              ...option.price,
              amount: promoPrice(option.price.amount, percent),
            },
          }
        : option
    ),
    sections: service.sections.map((section) => ({
      ...section,
      items: section.items.map((entry) => promoItem(entry, percent)),
    })),
  };
}

export const services: ServiceDefinition[] = [
  ...learningServices,
  ...businessServices,
].map(withPromo);

export function isServiceId(value: string | null | undefined): value is ServiceId {
  return services.some((service) => service.id === value);
}
