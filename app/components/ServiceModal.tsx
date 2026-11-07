"use client";

import React, { useId, useState } from "react";
import Link from "next/link";
import { BookingRequest } from "@/app/components/BookingRequest";
import { BulkDiscountNotice } from "@/app/components/BulkDiscountNotice";
import { PrintOrderRequest } from "@/app/components/PrintOrderRequest";
import { SelectionQuote } from "@/app/components/SelectionQuote";
import { ServiceSections } from "@/app/components/ServiceSections";
import {
  CONSULTATION_DELIVERY_ID,
  CONSULTATION_HIDDEN_GROUPS,
  CONSULTATION_LOCKED_GROUPS,
  defaultSelection,
  getSelectionGroups,
  isBookableService,
  isConsultationSelected,
  isGroupVisible,
  quoteSelection,
} from "@/app/utils/bookingSelection";
import type { ModalSelection } from "@/app/utils/bookingSelection";
import { pickText } from "@/app/utils/format";
import { useModalBehavior } from "@/app/utils/useModalBehavior";
import { useTx } from "@/app/utils/useTx";
import type { ServiceDefinition } from "@/app/utils/services";

interface ServiceModalProps {
  service: ServiceDefinition;
  onClose: () => void;
}

export function ServiceModal({ service, onClose }: ServiceModalProps) {
  const { language, tx } = useTx();
  const titleId = useId();
  const dialogRef = useModalBehavior(onClose);
  const bookable = isBookableService(service.id);
  // Every service gets selectable groups. Their choices drive the live price.
  const groups = getSelectionGroups(service);
  const [selection, setSelection] = useState<ModalSelection>(() =>
    defaultSelection(groups)
  );

  // Non-bookable services show their estimate here. Bookable ones show it in BookingRequest.
  const quote = bookable ? null : quoteSelection(service.id, selection);

  // Choosing the free consultation pins delivery to in-person and locks the other rows.
  const handleSelect = (groupId: string, value: string) =>
    setSelection((current) => {
      const next = { ...current, [groupId]: value };
      if (groupId === "consultation" && value === "consultation") {
        next.delivery = CONSULTATION_DELIVERY_ID;
      }
      return next;
    });
  const lockedGroupIds = isConsultationSelected(selection)
    ? CONSULTATION_LOCKED_GROUPS
    : [];
  // A full advising package is a flat bundle, so session lengths do not apply to it.
  const isFullAdvisingPackage =
    service.id === "universityAdvising" && selection.rates === "fullPackage";
  const visibleGroups = groups.filter((group) => {
    if (!isGroupVisible(group.id, selection)) return false;
    if (isConsultationSelected(selection) && CONSULTATION_HIDDEN_GROUPS.includes(group.id)) {
      return false;
    }
    return !(isFullAdvisingPackage && group.id === "durations");
  });

  return (
    <div
      className="modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="modal-content p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id={titleId} className="text-2xl font-bold leading-snug">
            {pickText(language, service.titleEn, service.titleAr)}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={tx("Close", "إغلاق")}
            className="btn btn-secondary shrink-0"
          >
            ✕
          </button>
        </div>
        <p className="mt-2 text-text-secondary">
          {pickText(language, service.descriptionEn, service.descriptionAr)}
        </p>

        <ServiceSections
          sections={visibleGroups}
          selection={selection}
          onSelect={handleSelect}
          lockedGroupIds={lockedGroupIds}
        />

        {service.id === "printShop" && <BulkDiscountNotice />}

        {!bookable && <SelectionQuote quote={quote} />}

        {bookable && isBookableService(service.id) && (
          <BookingRequest serviceId={service.id} selection={selection} />
        )}
        {service.id === "printShop" && <PrintOrderRequest selection={selection} />}

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={`/calculator?service=${service.id}`}
            className="btn btn-primary"
          >
            {tx("Build a quote", "احسب عرض السعر")}
          </Link>
          <button type="button" onClick={onClose} className="btn btn-secondary">
            {tx("Close", "إغلاق")}
          </button>
        </div>
      </div>
    </div>
  );
}
