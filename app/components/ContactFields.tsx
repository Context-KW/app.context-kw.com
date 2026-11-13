"use client";

import React, { useId } from "react";
import { useTx } from "@/app/utils/useTx";
import type { CustomerDetails } from "@/app/utils/supabase/submissions";

export const EMPTY_CONTACT: CustomerDetails = { name: "", email: "", phone: "" };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Name and a plausible email are required. Phone is optional. */
export function isContactComplete(value: CustomerDetails): boolean {
  return value.name.trim() !== "" && EMAIL_PATTERN.test(value.email.trim());
}

interface ContactFieldsProps {
  value: CustomerDetails;
  onChange: (value: CustomerDetails) => void;
}

export function ContactFields({ value, onChange }: ContactFieldsProps) {
  const { tx } = useTx();
  const groupId = useId();

  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2">
      <div>
        <label htmlFor={`${groupId}-name`} className="me-4 text-sm font-semibold">
          {tx("Full name", "الاسم الكامل")}
        </label>
        <input
          id={`${groupId}-name`}
          type="text"
          autoComplete="name"
          required
          value={value.name}
          className="mt-2"
          onChange={(event) => onChange({ ...value, name: event.target.value })}
        />
      </div>
      <div>
        <label htmlFor={`${groupId}-email`} className="me-4 text-sm font-semibold">
          {tx("Email", "البريد الإلكتروني")}
        </label>
        <input
          id={`${groupId}-email`}
          type="email"
          autoComplete="email"
          required
          value={value.email}
          className="mt-2"
          onChange={(event) => onChange({ ...value, email: event.target.value })}
        />
      </div>
      <div>
        <label htmlFor={`${groupId}-phone`} className="me-4 text-sm font-semibold">
          {tx("Phone (optional)", "الهاتف (اختياري)")}
        </label>
        <input
          id={`${groupId}-phone`}
          type="tel"
          autoComplete="tel"
          value={value.phone}
          className="mt-2"
          onChange={(event) => onChange({ ...value, phone: event.target.value })}
        />
      </div>
    </div>
  );
}
