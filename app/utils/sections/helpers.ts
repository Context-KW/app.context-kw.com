import { formatDuration } from "@/app/utils/format";
import { bi } from "@/app/utils/pricing/core";
import type { Bilingual } from "@/app/utils/pricing/core";
import type {
  ServicePrice,
  ServiceQuantity,
  ServiceSection,
  ServiceSectionItem,
} from "@/app/utils/serviceTypes";

export const text = (en: string, ar: string): Bilingual => ({ en, ar });

export const fromLabel = (x: {
  labelEn: string;
  labelAr: string;
}): Bilingual => ({ en: x.labelEn, ar: x.labelAr });

export function item(
  id: string,
  label: Bilingual,
  detail?: Bilingual,
  price?: ServicePrice,
  originalPrice?: ServicePrice
): ServiceSectionItem {
  return {
    id,
    labelEn: label.en,
    labelAr: label.ar,
    detailEn: detail?.en,
    detailAr: detail?.ar,
    price,
    originalPrice,
  };
}

type SectionFlags = Pick<ServiceSection, "multiple" | "readOnly" | "quantity" | "compact">;

export function section(
  id: string,
  title: Bilingual,
  items: ServiceSectionItem[],
  flags: SectionFlags = {}
): ServiceSection {
  return { id, titleEn: title.en, titleAr: title.ar, items, ...flags };
}

/** A section with no items whose only choice is a typed-in number. */
export const quantitySection = (
  id: string,
  title: Bilingual,
  quantity: ServiceQuantity
): ServiceSection => section(id, title, [], { quantity });

export const durationItems = (durations: number[]): ServiceSectionItem[] =>
  durations.map((hours) =>
    item(String(hours), bi((l) => formatDuration(hours, l)))
  );
