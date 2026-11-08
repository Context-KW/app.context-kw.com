import { quoteAccent } from "@/app/utils/pricing/accent";
import type { AccentRateKey } from "@/app/utils/pricing/accent";
import { quoteAdvising } from "@/app/utils/pricing/advising";
import type { AdvisingInput } from "@/app/utils/pricing/advising";
import { quoteCorporate } from "@/app/utils/pricing/corporate";
import type { QuoteResult } from "@/app/utils/pricing/core";
import { quotePrint } from "@/app/utils/pricing/print";
import type { ProtectorMode } from "@/app/utils/pricing/print";
import { quoteTranslation } from "@/app/utils/pricing/translation";
import type { TranslationKind } from "@/app/utils/pricing/translation";
import { quoteTutoring } from "@/app/utils/pricing/tutoring";
import type {
  ServiceDefinition,
  ServiceId,
  ServiceSection,
} from "@/app/utils/serviceTypes";

/** Services that take a booking request. Their modal rows are selectable. */
export type BookableServiceId = "tutoring" | "universityAdvising";

export function isBookableService(serviceId: ServiceId): serviceId is BookableServiceId {
  return serviceId === "tutoring" || serviceId === "universityAdvising";
}

/** Group id for the service's option list (tutoring focus, advising service type). */
export const TYPE_GROUP_ID = "type";

/** Services that show the "Request a session" form. Printing uses its own order form. */
export type RequestableServiceId = Exclude<ServiceId, "printShop">;

export function isRequestableService(serviceId: ServiceId): serviceId is RequestableServiceId {
  return serviceId !== "printShop";
}

/** Option group whose chosen value is saved as `tier_type` for each requestable service. */
const TIER_GROUP_BY_SERVICE: Record<RequestableServiceId, string> = {
  tutoring: TYPE_GROUP_ID,
  universityAdvising: TYPE_GROUP_ID,
  accentCoaching: "focus",
  translation: "rates",
  corporate: "options",
};


/**
 * The chosen value for each group id, e.g. { type: "ielts", packages: "five" }.
 * Checkbox groups store their chosen ids comma-separated, and number inputs store the typed text.
 */
export type ModalSelection = Record<string, string>;

/** Print-shop groups that only apply when sheet protectors are ticked. */
const PROTECTOR_GROUP_IDS = ["protectorMode", "protectorThickness", "protectorCount"];

/**
 * False for protector groups while "protectors" is not ticked, and for the custom
 * count unless "custom" mode is chosen. Every other group is always visible.
 */
export function isGroupVisible(groupId: string, selection: ModalSelection): boolean {
  if (!PROTECTOR_GROUP_IDS.includes(groupId)) return true;
  if (!splitIds(selection.finishing).includes("protectors")) return false;
  return groupId !== "protectorCount" || selection.protectorMode === "custom";
}

/** Ids from a checkbox group's stored value, e.g. "protectors,binding" -> ["protectors", "binding"]. */
export function splitIds(value: string | undefined): string[] {
  return value ? value.split(",").filter(Boolean) : [];
}

/**
 * Groups shown as selectable rows. The service options become one group, and any
 * section that only repeats those option ids (tutoring hourly rates) is dropped.
 */
export function getSelectionGroups(service: ServiceDefinition): ServiceSection[] {
  // Only bookable services use the option list as a group. Others already have their own sections.
  if (!isBookableService(service.id) || service.options.length === 0) {
    return service.sections;
  }

  const optionIds = new Set(service.options.map((option) => option.id));
  const typeGroup: ServiceSection = {
    id: TYPE_GROUP_ID,
    titleEn: "Choose an option",
    titleAr: "اختر خياراً",
    items: service.options.map((option) => ({
      id: option.id,
      labelEn: option.labelEn,
      labelAr: option.labelAr,
      detailEn: option.descriptionEn,
      detailAr: option.descriptionAr,
      price: option.price,
      originalPrice: option.originalPrice,
    })),
  };
  const others = service.sections.filter(
    (section) =>
      !(
        section.items.length > 0 &&
        section.items.every((item) => optionIds.has(item.id))
      )
  );
  return [typeGroup, ...others];
}

/**
 * Starting values: the first item of each radio group, nothing for checkbox groups,
 * the default number for number inputs. Read-only reference groups are skipped.
 */
export function defaultSelection(groups: ServiceSection[]): ModalSelection {
  const selection: ModalSelection = {};
  for (const group of groups) {
    if (group.readOnly) continue;
    if (group.quantity) {
      selection[group.id] = String(group.quantity.defaultValue);
    } else if (group.multiple) {
      selection[group.id] = "";
    } else if (group.items.length > 0) {
      selection[group.id] = group.items[0].id;
    }
  }
  return selection;
}

/** Maps each advising rate row to the quote input that prices it (duration is added at quote time). */
const ADVISING_RATE_INPUTS: Record<string, Omit<AdvisingInput, "duration">> = {
  initialConsultation: { mode: "sessions", includeInitial: true, followUps: 0 },
  followUpSession: { mode: "sessions", includeInitial: false, followUps: 1 },
  fullPackage: { mode: "fullPackage", includeInitial: false, followUps: 0 },
};

/** Groups locked while the free consultation is chosen. The delivery group is pinned to in-person. */
export const CONSULTATION_LOCKED_GROUPS = ["packages", "delivery", "durations"];
/** Groups hidden entirely while the free consultation is chosen (session length and packages). */
export const CONSULTATION_HIDDEN_GROUPS = ["packages", "durations"];
export const CONSULTATION_DELIVERY_ID = "inPerson";

/** True when the tutoring consultation row is chosen. */
export function isConsultationSelected(selection: ModalSelection): boolean {
  return selection.consultation === "consultation";
}

/** Earliest bookable date for a free consultation: tomorrow at midnight (local time). */
export function consultationEarliest(now: Date = new Date()): Date {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
}

/** Live price for the current choices, for every service. Null for unknown services. */
export function quoteSelection(
  serviceId: ServiceId,
  selection: ModalSelection
): QuoteResult | null {
  switch (serviceId) {
    case "tutoring":
      return quoteTutoring({
        focusId: selection[TYPE_GROUP_ID] ?? "",
        deliveryId: selection.delivery ?? "",
        duration: Number(selection.durations),
        packageId: selection.packages ?? "",
        isConsultation: isConsultationSelected(selection),
      });
    case "universityAdvising": {
      const input = ADVISING_RATE_INPUTS[selection.rates ?? ""];
      if (!input) return null;
      return quoteAdvising({
        ...input,
        duration: Number(selection.durations),
        degreeId: selection.degrees || undefined,
      });
    }
    case "accentCoaching":
      return quoteAccent({
        rateKey: (selection.rates ?? "") as AccentRateKey,
        duration: Number(selection.durations),
        sessions: Number(selection.sessions),
      });
    case "translation":
      return quoteTranslation({
        kind: (selection.rates ?? "") as TranslationKind,
        quantity: Number(selection.quantity),
        documentTypeId: selection.documents || undefined,
      });
    case "corporate":
      return quoteCorporate({
        teamSize: Number(selection.teamSize),
      });
    case "printShop":
      return quotePrint({
        paperId: selection.paper ?? "",
        colorId: selection.color ?? "",
        layoutId: selection.layout ?? "",
        pages: Number(selection.pages),
        copies: Number(selection.copies),
        finishingIds: splitIds(selection.finishing),
        protectorMode: (selection.protectorMode || undefined) as ProtectorMode | undefined,
        protectorCount: Number(selection.protectorCount),
        protectorThicknessId: selection.protectorThickness || undefined,
      });
    default:
      return null;
  }
}

export interface BookingFields {
  /** True when the free consultation row was booked (no package). */
  isConsultation: boolean;
  tierType: string;
  deliveryMode: string | null;
  /** Null for services that have no session length. */
  sessionDurationHours: number | null;
  packageId: string | null;
}

/** Maps the modal's choices onto the columns of the `bookings` row. */
export function bookingFields(
  serviceId: RequestableServiceId,
  selection: ModalSelection
): BookingFields {
  const isTutoring = serviceId === "tutoring";
  // Tutoring stores its package. The other services store the rate row the customer clicked.
  const packageId = (isTutoring ? selection.packages : selection.rates) || null;

  return {
    isConsultation: isConsultationSelected(selection),
    tierType: selection[TIER_GROUP_BY_SERVICE[serviceId]] ?? "",
    deliveryMode: isTutoring && selection.delivery ? selection.delivery : null,
    sessionDurationHours: selection.durations ? Number(selection.durations) : null,
    packageId,
  };
}
