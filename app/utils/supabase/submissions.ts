import type { Language } from "@/app/context/LanguageContext";
import type { QuoteLine } from "@/app/utils/pricing";
import { getSupabaseClient } from "@/app/utils/supabase/client";

export interface CustomerDetails {
  name: string;
  email: string;
  phone: string;
}

export type SubmitFailure = "not_configured" | "invalid_file" | "failed";

export type SubmitResult = { ok: true } | { ok: false; reason: SubmitFailure };

export interface BookingPayload {
  serviceId: "tutoring" | "universityAdvising" | "accentCoaching" | "communicativeArabic" | "corporate";
  tierType: string;
  deliveryMode: string | null;
  /** Null for services without a session length. */
  sessionDurationHours: number | null;
  packageId: string | null;
  /** True for the free 15-minute consultation. */
  isConsultation: boolean;
  /** YYYY-MM-DD */
  sessionDate: string;
  /** HH:MM */
  sessionTime: string;
  customer: CustomerDetails;
}

export interface PrintOrderPayload {
  /** Standard price before the promo, in KWD (3 decimals). */
  originalPriceKwd: number;
  /** Price the customer is billed, in KWD (3 decimals). */
  discountedPriceKwd: number;
  /** Delivery zone id, or null for pickup. */
  deliveryZone: string | null;
  /** Delivery fee in KWD. Zero for pickup. */
  deliveryFeeKwd: number;
  paperType: string;
  pagesPerCopy: number;
  copies: number;
  printMinutes: number;
  bufferMinutes: number;
  isHighVolume: boolean;
  readyAt: Date;
  pickupAt: Date;
  /** Optional notes from the customer. Empty string when none were written. */
  instructions: string;
  customer: CustomerDetails;
}

export interface QuoteRequestPayload {
  language: Language;
  lines: QuoteLine[];
  total: number;
  customer: CustomerDetails;
}

/** Bucket name must match the one created in supabase/migrations. */
export const PRINT_DOCUMENT_BUCKET = "print-documents";
export const MAX_DOCUMENT_BYTES = 20 * 1024 * 1024;
export const ACCEPTED_DOCUMENT_TYPES: readonly string[] = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const NOT_CONFIGURED: SubmitResult = { ok: false, reason: "not_configured" };
const FAILED: SubmitResult = { ok: false, reason: "failed" };

/** Customer columns shared by every request table. */
function customerColumns(customer: CustomerDetails) {
  return {
    customer_name: customer.name.trim(),
    customer_email: customer.email.trim(),
    customer_phone: customer.phone.trim() || null,
  };
}

/** Keeps letters, digits, dots, dashes, and underscores so object keys stay safe. */
function safeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

/**
 * Inserts are sent without `.select()`. The guest role has no SELECT policy,
 * so asking for the row back would be rejected by RLS.
 */
export async function insertBooking(payload: BookingPayload): Promise<SubmitResult> {
  const supabase = getSupabaseClient();
  if (!supabase) return NOT_CONFIGURED;

  const { error } = await supabase.from("bookings").insert({
    service_id: payload.serviceId,
    tier_type: payload.tierType,
    delivery_mode: payload.deliveryMode,
    session_duration_hours: payload.sessionDurationHours,
    package_id: payload.packageId,
    is_consultation: payload.isConsultation,
    session_date: payload.sessionDate,
    session_time: payload.sessionTime,
    ...customerColumns(payload.customer),
  });

  if (error) {
    console.error("Booking insert failed:", error.message);
    return FAILED;
  }
  return { ok: true };
}

/**
 * Uploads the optional document first, then inserts the order that points to it.
 * If the insert fails after upload, the orphaned object stays in the bucket,
 * because guests have no DELETE policy to clean it up.
 */
export async function insertPrintOrder(
  payload: PrintOrderPayload,
  file: File | null
): Promise<SubmitResult> {
  const supabase = getSupabaseClient();
  if (!supabase) return NOT_CONFIGURED;

  if (
    file &&
    (file.size > MAX_DOCUMENT_BYTES || !ACCEPTED_DOCUMENT_TYPES.includes(file.type))
  ) {
    return { ok: false, reason: "invalid_file" };
  }

  let documentPath: string | null = null;
  if (file) {
    const suffix = Math.random().toString(36).slice(2, 10);
    documentPath = `${Date.now()}-${suffix}/${safeFileName(file.name)}`;
    const { error: uploadError } = await supabase.storage
      .from(PRINT_DOCUMENT_BUCKET)
      .upload(documentPath, file, { contentType: file.type, upsert: false });
    if (uploadError) {
      console.error("Document upload failed:", uploadError.message);
      return FAILED;
    }
  }

  const { error } = await supabase.from("print_orders").insert({
    paper_type: payload.paperType,
    pages_per_copy: payload.pagesPerCopy,
    copies: payload.copies,
    print_minutes: payload.printMinutes,
    buffer_minutes: payload.bufferMinutes,
    is_high_volume: payload.isHighVolume,
    original_price_kwd: Number(payload.originalPriceKwd.toFixed(3)),
    discounted_price_kwd: Number(payload.discountedPriceKwd.toFixed(3)),
    delivery_zone: payload.deliveryZone,
    delivery_fee_kwd: Number(payload.deliveryFeeKwd.toFixed(3)),
    ready_at: payload.readyAt.toISOString(),
    pickup_at: payload.pickupAt.toISOString(),
    document_path: documentPath,
    instructions: payload.instructions.trim() || null,
    ...customerColumns(payload.customer),
  });

  if (error) {
    console.error("Print order insert failed:", error.message);
    return FAILED;
  }
  return { ok: true };
}

export async function insertQuoteRequest(
  payload: QuoteRequestPayload
): Promise<SubmitResult> {
  const supabase = getSupabaseClient();
  if (!supabase) return NOT_CONFIGURED;

  const { error } = await supabase.from("quote_requests").insert({
    language: payload.language,
    lines: payload.lines,
    total: payload.total,
    ...customerColumns(payload.customer),
  });

  if (error) {
    console.error("Quote request insert failed:", error.message);
    return FAILED;
  }
  return { ok: true };
}
