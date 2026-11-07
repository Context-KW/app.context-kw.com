"use client";

import React, { useState } from "react";
import { ContactFields, EMPTY_CONTACT, isContactComplete } from "@/app/components/ContactFields";
import {
  EMPTY_SCHEDULE,
  ScheduleBooking,
  getScheduledStart,
} from "@/app/components/ScheduleBooking";
import type { ScheduleValue } from "@/app/components/ScheduleBooking";
import {
  bookingFields,
  consultationEarliest,
  isConsultationSelected,
  quoteSelection,
} from "@/app/utils/bookingSelection";
import type { BookableServiceId, ModalSelection } from "@/app/utils/bookingSelection";
import { formatPrice, pickText } from "@/app/utils/format";
import { submitStatusText } from "@/app/utils/submitStatus";
import type { SubmitState } from "@/app/utils/submitStatus";
import { insertBooking } from "@/app/utils/supabase/submissions";
import type { CustomerDetails } from "@/app/utils/supabase/submissions";
import { useTx } from "@/app/utils/useTx";

interface BookingRequestProps {
  serviceId: BookableServiceId;
  /** Choices made in the modal rows. Saved to the booking and used for the total. */
  selection: ModalSelection;
}

/** Date, time, and contact details for a session request, saved to `bookings`. */
export function BookingRequest({ serviceId, selection }: BookingRequestProps) {
  const { language, tx } = useTx();
  const [schedule, setSchedule] = useState<ScheduleValue>(EMPTY_SCHEDULE);
  const [contact, setContact] = useState<CustomerDetails>(EMPTY_CONTACT);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");

  // Recomputed on every render, so the total follows each click immediately.
  const quote = quoteSelection(serviceId, selection);
  // A free consultation can only be booked from tomorrow onward.
  const isConsultation = isConsultationSelected(selection);
  const earliest = isConsultation ? consultationEarliest() : undefined;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const start = getScheduledStart(schedule);
    if (!start || !isContactComplete(contact) || !quote || !quote.ok) {
      setSubmitState("incomplete");
      return;
    }

    setSubmitState("saving");
    const result = await insertBooking({
      ...bookingFields(serviceId, selection),
      serviceId,
      sessionDate: schedule.date,
      sessionTime: schedule.time,
      customer: contact,
    });
    setSubmitState(result.ok ? "done" : result.reason);
  };

  const statusText = submitStatusText(submitState, language);

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-8 border-t border-border pt-6">
      <p className="text-sm font-bold uppercase tracking-wide text-text-secondary">
        {tx("Request a session", "اطلب جلسة")}
      </p>

      {quote && (
        <div
          aria-live="polite"
          className="mt-4 rounded-card border border-border bg-accent-light p-4 text-sm"
        >
          <p className="text-xs font-bold uppercase tracking-wide text-text-secondary">
            {tx("Estimated total", "الإجمالي التقديري")}
          </p>
          {quote.ok ? (
            <>
              <ul className="mt-2 space-y-1">
                {quote.line.rows.map((line, index) => (
                  <li key={index} className="flex justify-between gap-4">
                    <span>{pickText(language, line.labelEn, line.labelAr)}</span>
                    <span className="whitespace-nowrap">
                      {formatPrice(line.amount, language)}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 flex justify-between gap-4 border-t border-border pt-3 text-base font-bold">
                <span>{tx("Total", "المجموع")}</span>
                <span className="whitespace-nowrap">
                  {formatPrice(quote.line.total, language)}
                </span>
              </p>
              {(quote.line.hintEn || quote.line.hintAr) && (
                <p className="mt-3 text-text-secondary">
                  {pickText(language, quote.line.hintEn ?? "", quote.line.hintAr ?? "")}
                </p>
              )}
            </>
          ) : (
            <p className="mt-2">{pickText(language, quote.errorEn, quote.errorAr)}</p>
          )}
        </div>
      )}

      <ScheduleBooking
        title={tx("Preferred session time", "موعد الجلسة المفضل")}
        value={schedule}
        onChange={setSchedule}
        earliest={earliest}
      />

      <ContactFields value={contact} onChange={setContact} />

      <button
        type="submit"
        className="btn btn-primary mt-6"
        disabled={submitState === "saving"}
      >
        {tx("Request booking", "أرسل الطلب")}
      </button>
      <p role="status" aria-live="polite" className="mt-3 min-h-5 text-sm font-semibold">
        {statusText ?? ""}
      </p>
    </form>
  );
}
