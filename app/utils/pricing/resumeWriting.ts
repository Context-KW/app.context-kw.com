import { config } from "@/config";
import { pickText } from "@/app/utils/format";
import { bi, fail, makeLine, promoPrice, row } from "@/app/utils/pricing/core";
import type { QuoteResult } from "@/app/utils/pricing/core";
import { CONSULTATION_PRICE } from "@/app/utils/pricing/tutoring";

const service = config.resumeWriting;

export interface ResumeWritingItem {
  id: string;
  labelEn: string;
  labelAr: string;
  /** Standard price in KWD. */
  originalRate: number;
  /** Launch price in KWD after the launch promotion, rounded to thousandths. */
  launchRate: number;
}

const withLaunchRate = (item: Omit<ResumeWritingItem, "launchRate">): ResumeWritingItem => ({
  ...item,
  launchRate: promoPrice(item.originalRate, service.launchPromo.discountPercent),
});

export const RESUME_WRITING_TIERS: ResumeWritingItem[] = service.tiers.map(withLaunchRate);
export const RESUME_WRITING_ADD_ONS: ResumeWritingItem[] = service.addOns.map(withLaunchRate);

export interface ResumeWritingInput {
  tierId: string;
  addOnIds: string[];
  /** Free 15-minute consultation: costs 0.000 KWD and ignores tier and add-ons. */
  isConsultation?: boolean;
}

/** Launch-price quote for one service level plus any chosen add-ons. */
export function quoteResumeWriting(input: ResumeWritingInput): QuoteResult {
  if (input.isConsultation) {
    const label = bi((l) => pickText(l, "Free 15-minute consultation", "استشارة مجانية مدتها 15 دقيقة"));
    return makeLine("resumeWriting", service, label, [row(label, CONSULTATION_PRICE)]);
  }

  const tier = RESUME_WRITING_TIERS.find((item) => item.id === input.tierId);
  if (!tier) {
    return fail("Select a service level.", "اختر مستوى الخدمة.");
  }

  const addOns = RESUME_WRITING_ADD_ONS.filter((item) => input.addOnIds.includes(item.id));
  const rows = [tier, ...addOns].map((item) => ({
    ...row(bi((l) => pickText(l, item.labelEn, item.labelAr)), item.launchRate),
    originalAmount: item.originalRate,
  }));

  return makeLine(
    "resumeWriting",
    service,
    bi((l) => pickText(l, tier.labelEn, tier.labelAr)),
    rows
  );
}
