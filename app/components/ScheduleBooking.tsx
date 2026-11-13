"use client";

import React, { useId } from "react";
import { useTx } from "@/app/utils/useTx";
import {
  PICKUP_SLOT_TIMES,
  toDateInputValue,
  toDateTime,
} from "@/app/utils/scheduling";

export interface ScheduleValue {
  /** YYYY-MM-DD, or empty */
  date: string;
  /** HH:MM, or empty */
  time: string;
}

export const EMPTY_SCHEDULE: ScheduleValue = { date: "", time: "" };

/** The chosen start moment, or null if incomplete or earlier than `earliest`. */
export function getScheduledStart(
  value: ScheduleValue,
  earliest: Date = new Date()
): Date | null {
  if (!value.date || !value.time) return null;
  const when = toDateTime(value.date, value.time);
  if (!when || when.getTime() < earliest.getTime()) return null;
  return when;
}

interface ScheduleBookingProps {
  title: string;
  value: ScheduleValue;
  onChange: (value: ScheduleValue) => void;
  /** Earliest allowed moment. Defaults to now. */
  earliest?: Date;
}

/** Controlled date picker and time-slot dropdown. Slots before `earliest` are hidden. */
export function ScheduleBooking({
  title,
  value,
  onChange,
  earliest,
}: ScheduleBookingProps) {
  const { language, tx } = useTx();
  const groupId = useId();

  const minimum = earliest ?? new Date();
  const minDate = toDateInputValue(minimum);

  const availableTimes = value.date
    ? PICKUP_SLOT_TIMES.filter((slot) => {
        const when = toDateTime(value.date, slot);
        return when !== null && when.getTime() >= minimum.getTime();
      })
    : [];
  // A time chosen for a different date may no longer be valid, so only show a valid one.
  const selectedTime = availableTimes.includes(value.time) ? value.time : "";
  const selectedWhen = getScheduledStart(
    { date: value.date, time: selectedTime },
    minimum
  );

  let placeholder = tx("Select a time", "اختر الوقت");
  if (!value.date) placeholder = tx("Choose a date first", "اختر التاريخ أولاً");
  else if (availableTimes.length === 0)
    placeholder = tx("No slots left on this date", "لا توجد مواعيد متاحة في هذا اليوم");

  return (
    <fieldset className="mt-6">
      <legend className="text-sm font-bold uppercase tracking-wide text-text-secondary">
        {title}
      </legend>
      <div className="mt-2 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`${groupId}-date`} className="me-4 text-sm font-semibold">
            {tx("Date", "التاريخ")}
          </label>
          <input
            id={`${groupId}-date`}
            type="date"
            min={minDate}
            value={value.date}
            className="mt-2"
            onChange={(event) => onChange({ date: event.target.value, time: "" })}
          />
        </div>
        <div>
          <label htmlFor={`${groupId}-time`} className="me-4 text-sm font-semibold">
            {tx("Time slot", "الوقت")}
          </label>
          <select
            id={`${groupId}-time`}
            className="mt-2"
            value={selectedTime}
            disabled={availableTimes.length === 0}
            onChange={(event) => onChange({ ...value, time: event.target.value })}
          >
            <option value="">{placeholder}</option>
            {availableTimes.map((slot) => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
          </select>
        </div>
      </div>
      {selectedWhen && (
        <p className="mt-3 text-sm font-semibold" aria-live="polite">
          {tx("Selected:", "المحدد:")}{" "}
          {selectedWhen.toLocaleString(language === "ar" ? "ar-KW" : "en-GB", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </p>
      )}
    </fieldset>
  );
}
