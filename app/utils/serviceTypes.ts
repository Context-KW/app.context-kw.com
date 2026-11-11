import type { PriceUnit } from "@/app/utils/format";

export type ServiceId =
  | "tutoring"
  | "accentCoaching"
  | "communicativeArabic"
  | "universityAdvising"
  | "corporate"
  | "printShop";

export interface ServicePrice {
  amount: number;
  /** Omitted for flat fees. */
  unit?: PriceUnit;
}

export interface ServiceOption {
  id: string;
  labelEn: string;
  labelAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  /** Only set when config.js publishes a rate for this option. */
  price?: ServicePrice;
  /** Standard price shown struck through when a promotion lowers `price`. */
  originalPrice?: ServicePrice;
}

export interface ServiceSectionItem {
  id: string;
  labelEn: string;
  labelAr: string;
  detailEn?: string;
  detailAr?: string;
  price?: ServicePrice;
  /** Pre-discount price, shown struck through next to the discounted price. */
  originalPrice?: ServicePrice;
}

export interface ServiceSection {
  id: string;
  titleEn: string;
  titleAr: string;
  items: ServiceSectionItem[];
  /** Checkboxes instead of radio buttons, so several items can be chosen. */
  multiple?: boolean;
  /** Reference list only. Shown with prices but cannot be chosen. */
  readOnly?: boolean;
  /** A number typed in by the customer, such as sessions or pages. */
  quantity?: ServiceQuantity;
  /** Small inline choice chips instead of full-width rows. Used for short option sets. */
  compact?: boolean;
}

export interface ServiceQuantity {
  min: number;
  max: number;
  step: number;
  defaultValue: number;
}

export interface ServiceDefinition {
  id: ServiceId;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  /** Path under public/ shown at the top of the card. Optional. */
  image?: string;
  options: ServiceOption[];
  /** Pricing tiers and related details shown in the detail modal. */
  sections: ServiceSection[];
  /** Lowest published rate for this service, derived from config.js. */
  startingPrice: ServicePrice;
  /** Standard starting price, shown struck through when a promotion applies. */
  startingOriginalPrice?: ServicePrice;
}
