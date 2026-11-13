import type { ServiceId, ServiceSection } from "@/app/utils/serviceTypes";
import {
  accentCoaching,
  communicativeArabic,
  resumeWriting,
  tutoring,
} from "@/app/utils/sections/coaching";
import {
  corporate,
  printShop,
  universityAdvising,
} from "@/app/utils/sections/business";

/** Pricing tiers and related details shown in each service's detail modal. */
export const SERVICE_SECTIONS: Record<ServiceId, ServiceSection[]> = {
  tutoring,
  accentCoaching,
  communicativeArabic,
  resumeWriting,
  universityAdvising,
  corporate,
  printShop,
};
