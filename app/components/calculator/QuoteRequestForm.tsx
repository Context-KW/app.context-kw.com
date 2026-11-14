"use client";

import React, { useState } from "react";
import { ContactFields, EMPTY_CONTACT, isContactComplete } from "@/app/components/ContactFields";
import type { QuoteLine } from "@/app/utils/pricing";
import { submitStatusText } from "@/app/utils/submitStatus";
import type { SubmitState } from "@/app/utils/submitStatus";
import { insertQuoteRequest } from "@/app/utils/supabase/submissions";
import type { CustomerDetails } from "@/app/utils/supabase/submissions";
import { useTx } from "@/app/utils/useTx";

interface QuoteRequestFormProps {
  lines: QuoteLine[];
  total: number;
}

/** Saves the current quote cart to `quote_requests` so the team can follow up. */
export function QuoteRequestForm({ lines, total }: QuoteRequestFormProps) {
  const { language, tx } = useTx();
  const [contact, setContact] = useState<CustomerDetails>(EMPTY_CONTACT);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isContactComplete(contact) || lines.length === 0) {
      setSubmitState("incomplete");
      return;
    }

    setSubmitState("saving");
    const result = await insertQuoteRequest({
      language,
      lines,
      total,
      customer: contact,
    });
    setSubmitState(result.ok ? "done" : result.reason);
  };

  const statusText = submitStatusText(submitState, language);

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-8 border-t border-border pt-6">
      <p className="text-sm font-bold uppercase tracking-wide text-text-secondary">
        {tx("Save this quote for our team", "احفظ هذا العرض لفريقنا")}
      </p>
      <ContactFields value={contact} onChange={setContact} />
      <button
        type="submit"
        className="btn btn-primary mt-6"
        disabled={submitState === "saving"}
      >
        {tx("Submit quote request", "أرسل طلب عرض السعر")}
      </button>
      <p role="status" aria-live="polite" className="mt-3 min-h-5 text-sm font-semibold">
        {statusText ?? ""}
      </p>
    </form>
  );
}
