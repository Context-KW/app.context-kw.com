"use client";

import React, { useMemo, useState } from "react";
import { config } from "@/config";
import { parseNumber } from "@/app/components/calculator/fields";
import { ContactFields, EMPTY_CONTACT, isContactComplete } from "@/app/components/ContactFields";
import { PrintBufferNotice } from "@/app/components/PrintBufferNotice";
import {
  EMPTY_SCHEDULE,
  ScheduleBooking,
  getScheduledStart,
} from "@/app/components/ScheduleBooking";
import type { ScheduleValue } from "@/app/components/ScheduleBooking";
import { quoteSelection } from "@/app/utils/bookingSelection";
import type { ModalSelection } from "@/app/utils/bookingSelection";
import { deliveryFee } from "@/app/utils/pricing/print";
import { computePrintBuffer, earliestPickup } from "@/app/utils/scheduling";
import { submitStatusText } from "@/app/utils/submitStatus";
import type { SubmitState } from "@/app/utils/submitStatus";
import { ACCEPTED_DOCUMENT_TYPES, insertPrintOrder } from "@/app/utils/supabase/submissions";
import type { CustomerDetails } from "@/app/utils/supabase/submissions";
import { useTx } from "@/app/utils/useTx";

const printConfig = config.printShop;

/**
 * Print job request: optional document upload, completion buffer, and pickup time.
 * Paper, pages, and copies come from the modal selection so the order matches the quote.
 * Saved to `print_orders` and the print-documents bucket.
 */
export function PrintOrderRequest({ selection }: { selection: ModalSelection }) {
  const { language, tx } = useTx();
  const [file, setFile] = useState<File | null>(null);
  const [schedule, setSchedule] = useState<ScheduleValue>(EMPTY_SCHEDULE);
  const [contact, setContact] = useState<CustomerDetails>(EMPTY_CONTACT);
  const [instructions, setInstructions] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");

  const paper =
    printConfig.paperTypes.find((item) => item.id === selection.paper) ??
    printConfig.paperTypes[0];
  const pageCount = parseNumber(selection.pages ?? "");
  const copyCount = parseNumber(selection.copies ?? "");
  const isValid =
    Number.isFinite(pageCount) &&
    pageCount >= 1 &&
    Number.isFinite(copyCount) &&
    copyCount >= 1;

  const buffer = useMemo(
    () =>
      isValid
        ? computePrintBuffer(
            pageCount,
            copyCount,
            printConfig.printerSpecs.maxPagesPerMinute
          )
        : null,
    [isValid, pageCount, copyCount]
  );
  const earliest = useMemo(
    () => (buffer ? earliestPickup(buffer.windowMinutes) : undefined),
    [buffer]
  );

  // Same quote the modal shows, so the saved order matches the price the customer saw.
  const quote = useMemo(() => quoteSelection("printShop", selection), [selection]);
  const deliveryAmount = selection.deliveryZone
    ? deliveryFee(selection.deliveryZone) ?? 0
    : 0;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const pickup = earliest ? getScheduledStart(schedule, earliest) : null;
    if (!buffer || !earliest || !pickup || !isContactComplete(contact)) {
      setSubmitState("incomplete");
      return;
    }

    setSubmitState("saving");
    const result = await insertPrintOrder(
      {
        paperType: paper.id,
        pagesPerCopy: Math.floor(pageCount),
        copies: Math.floor(copyCount),
        printMinutes: buffer.printMinutes,
        bufferMinutes: buffer.windowMinutes,
        isHighVolume: buffer.isHighVolume,
        originalPriceKwd: quote && quote.ok ? quote.line.originalTotal ?? quote.line.total : 0,
        discountedPriceKwd: quote && quote.ok ? quote.line.total : 0,
        deliveryZone: selection.deliveryZone || null,
        deliveryFeeKwd: deliveryAmount,
        readyAt: earliest,
        pickupAt: pickup,
        instructions,
        customer: contact,
      },
      file
    );
    setSubmitState(result.ok ? "done" : result.reason);
  };

  const statusText = submitStatusText(submitState, language);

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-8 border-t border-border pt-6">
      <p className="text-sm font-bold uppercase tracking-wide text-text-secondary">
        {tx("Print job and pickup", "الطباعة والاستلام")}
      </p>

      <div className="mt-2">
        <label htmlFor="print-document" className="text-sm font-semibold">
          {tx("Document (optional, PDF / Word / PNG / JPG)", "المستند (اختياري)")}
        </label>
        <input
          id="print-document"
          type="file"
          accept={ACCEPTED_DOCUMENT_TYPES.join(",")}
          className="mt-2"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        />
      </div>

      {buffer && <PrintBufferNotice buffer={buffer} />}

      {earliest && (
        <ScheduleBooking
          title={tx("Pickup time", "وقت الاستلام")}
          value={schedule}
          onChange={setSchedule}
          earliest={earliest}
        />
      )}

      <ContactFields value={contact} onChange={setContact} />

      <div className="mt-6 grid gap-2 sm:grid-cols-[auto_1fr] sm:items-start sm:gap-x-[1cm]">
        <label htmlFor="print-instructions" className="pt-2 text-sm font-semibold whitespace-nowrap">
          {tx("Instructions", "التعليمات")}
        </label>
        <textarea
          id="print-instructions"
          rows={3}
          value={instructions}
          className="w-full"
          placeholder={tx(
            "Notes for us, for example: staple each copy, print double-sided, or collect by Thursday",
            "ملاحظات لنا، على سبيل المثال: تثبيت كل نسخة، طباعة وجهين، أو الاستلام يوم الخميس"
          )}
          onChange={(event) => setInstructions(event.target.value)}
        />
      </div>

      <button
        type="submit"
        className="btn btn-primary mt-6"
        disabled={submitState === "saving"}
      >
        {tx("Place print order", "أرسل طلب الطباعة")}
      </button>
      <p role="status" aria-live="polite" className="mt-3 min-h-5 text-sm font-semibold">
        {statusText ?? ""}
      </p>
    </form>
  );
}
