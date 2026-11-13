import { config } from "@/config";
import { corporatePricingTiers } from "@/app/utils/pricing/corporate";
import { FINISHING_UNIT } from "@/app/utils/pricing/print";
import { SERVICE_SECTIONS } from "@/app/utils/sections";
import type { ServiceDefinition } from "@/app/utils/serviceTypes";

const lowest = (...values: number[]): number => Math.min(...values);

/** Services 4-6: university advising, corporate, print shop. */
export const businessServices: ServiceDefinition[] = [
  {
    id: "universityAdvising",
    image: "/images/services/university-advising.jpg",
    titleEn: config.universityAdvising.titleEn,
    titleAr: config.universityAdvising.titleAr,
    descriptionEn: config.universityAdvising.descriptionEn,
    descriptionAr: config.universityAdvising.descriptionAr,
    // Advising options are priced through the consultation rates (see sections).
    options: config.universityAdvising.options,
    sections: SERVICE_SECTIONS.universityAdvising,
    // fullPackage is a bundle price, so only the per-session rates are compared.
    startingPrice: {
      amount: lowest(
        config.universityAdvising.rates.initialConsultation,
        config.universityAdvising.rates.followUpSession
      ),
      unit: "session",
    },
  },
  {
    id: "corporate",
    image: "/images/services/corporate.jpg",
    titleEn: config.corporate.titleEn,
    titleAr: config.corporate.titleAr,
    descriptionEn: config.corporate.descriptionEn,
    descriptionAr: config.corporate.descriptionAr,
    options: config.corporate.options,
    sections: SERVICE_SECTIONS.corporate,
    // Per-person tiers are used when config.js defines them. Otherwise the
    // Small Team Package launch price is the lowest published flat fee.
    startingPrice:
      Object.keys(corporatePricingTiers).length > 0
        ? {
            amount: lowest(
              ...Object.values(corporatePricingTiers).map(
                (tier) => tier.pricePerPerson
              )
            ),
            unit: "personMonth",
          }
        : { amount: config.corporate.smallTeamPackage.priceLaunch },
  },
  {
    id: "printShop",
    image: "/images/services/print-shop.jpg",
    titleEn: config.printShop.titleEn,
    titleAr: config.printShop.titleAr,
    descriptionEn: config.printShop.descriptionEn,
    descriptionAr: config.printShop.descriptionAr,
    // The print shop has no `options` list in config.js, so paper types and
    // finishing options are mapped into the common option shape.
    options: [
      ...config.printShop.paperTypes.map((paper) => ({
        id: paper.id,
        labelEn: paper.labelEn,
        labelAr: paper.labelAr,
        descriptionEn: paper.helperTextEn,
        descriptionAr: paper.helperTextAr,
        price: { amount: paper.pricePerPage, unit: "page" as const },
      })),
      ...config.printShop.finishingOptions.map((finish) => ({
        id: finish.id,
        labelEn: finish.labelEn,
        labelAr: finish.labelAr,
        price: {
          amount: finish.price,
          unit: FINISHING_UNIT[finish.id] ?? ("copy" as const),
        },
      })),
    ],
    sections: SERVICE_SECTIONS.printShop,
    startingPrice: {
      amount: lowest(
        ...config.printShop.paperTypes.map((paper) => paper.pricePerPage)
      ),
      unit: "page",
    },
  },
];
