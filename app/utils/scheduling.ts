import type { Language } from "@/app/context/LanguageContext";

/** Pages above this count are treated as a high-volume job that needs a buffer. */
export const PRINT_HIGH_VOLUME_PAGES = 100;
/** Extra time for handling, collation, and quality checks on high-volume jobs. */
export const PRINT_HANDLING_MINUTES = 60;
/** Turnaround for jobs below the high-volume threshold. */
export const PRINT_STANDARD_WINDOW_MINUTES = 30;

/** Hourly appointment and pickup slots (assumed Kuwait business hours, 09:00-20:00). */
export const PICKUP_SLOT_TIMES: string[] = Array.from(
  { length: 12 },
  (_, index) => `${String(9 + index).padStart(2, "0")}:00`
);

export interface PrintBuffer {
  totalPages: number;
  printMinutes: number;
  windowMinutes: number;
  isHighVolume: boolean;
}

/**
 * Minimum completion window for a print job. Print time is total pages divided by
 * the printer's rated pages per minute. High-volume jobs add a handling buffer.
 */
export function computePrintBuffer(
  pages: number,
  copies: number,
  pagesPerMinute: number
): PrintBuffer {
  const totalPages = Math.max(0, Math.floor(pages * copies));
  const printMinutes =
    pagesPerMinute > 0 ? Math.ceil(totalPages / pagesPerMinute) : 0;
  const isHighVolume = totalPages >= PRINT_HIGH_VOLUME_PAGES;
  const windowMinutes = isHighVolume
    ? printMinutes + PRINT_HANDLING_MINUTES
    : PRINT_STANDARD_WINDOW_MINUTES;
  return { totalPages, printMinutes, windowMinutes, isHighVolume };
}

/** The earliest moment a pickup can happen, given the completion window. */
export function earliestPickup(windowMinutes: number, from: Date = new Date()): Date {
  return new Date(from.getTime() + windowMinutes * 60_000);
}

/** Local calendar date as YYYY-MM-DD, the format required by `<input type="date">`. */
export function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Combines a YYYY-MM-DD date and an HH:MM time in local time. */
export function toDateTime(date: string, time: string): Date | null {
  const [year, month, day] = date.split("-").map(Number);
  const [hours, minutes] = time.split(":").map(Number);
  if ([year, month, day, hours, minutes].some((part) => Number.isNaN(part))) {
    return null;
  }
  return new Date(year, month - 1, day, hours, minutes);
}

/** 90 -> "1 h 30 min" (Arabic: "1 ساعة و 30 دقيقة"). */
export function formatMinutes(minutes: number, language: Language): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (language === "ar") {
    const parts: string[] = [];
    if (hours > 0) parts.push(`${hours} ساعة`);
    if (rest > 0 || hours === 0) parts.push(`${rest} دقيقة`);
    return parts.join(" و ");
  }
  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours} h`);
  if (rest > 0 || hours === 0) parts.push(`${rest} min`);
  return parts.join(" ");
}
