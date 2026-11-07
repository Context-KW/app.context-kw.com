"use client";

import React, { useId } from "react";
import { NumberField } from "@/app/components/calculator/fields";
import { splitIds } from "@/app/utils/bookingSelection";
import type { ModalSelection } from "@/app/utils/bookingSelection";
import { formatRate, pickText } from "@/app/utils/format";
import { useTx } from "@/app/utils/useTx";
import type { ServiceSection, ServiceSectionItem } from "@/app/utils/services";

interface ServiceSectionsProps {
  sections: ServiceSection[];
  /** Chosen item id per group. Only read when `onSelect` is also given. */
  selection?: ModalSelection;
  /**
   * When given, every selectable row becomes a radio or checkbox, and number
   * inputs report their typed text. Checkbox groups receive their chosen ids comma-separated.
   */
  onSelect?: (groupId: string, value: string) => void;
  /** Radio groups that are grayed out and not clickable. */
  lockedGroupIds?: string[];
}

/** Pricing tiers and related details for one service, rendered as bordered lists. */
export function ServiceSections({
  sections,
  selection,
  onSelect,
  lockedGroupIds = [],
}: ServiceSectionsProps) {
  const { language, tx } = useTx();
  const idPrefix = useId();
  const selectable = Boolean(onSelect);

  const renderPrice = (entry: ServiceSectionItem) =>
    entry.price && (
      <p
        className={`whitespace-nowrap font-bold ${
          entry.originalPrice ? "text-deep-red" : ""
        }`}
      >
        {entry.originalPrice && (
          <span className="me-2 text-xs font-semibold uppercase tracking-wide">
            {tx("Launch Price", "سعر الإطلاق")}
          </span>
        )}

        {entry.originalPrice && (
          <s className="me-2 font-normal text-text-secondary">
            {formatRate(entry.originalPrice.amount, entry.originalPrice.unit, language)}
          </s>
        )}
        {formatRate(entry.price.amount, entry.price.unit, language)}
      </p>
    );

  const toggleChecked = (sectionId: string, itemId: string, checked: boolean) => {
    const current = splitIds(selection?.[sectionId]);
    const next = checked
      ? [...current, itemId]
      : current.filter((id) => id !== itemId);
    onSelect?.(sectionId, next.join(","));
  };

  return (
    <>
      {sections.map((section) => {
        const title = pickText(language, section.titleEn, section.titleAr);

        if (section.quantity) {
          if (!selectable) return null;
          const quantity = section.quantity;
          return (
            <section key={section.id} className="mt-6">
              <NumberField
                label={title}
                value={selection?.[section.id] ?? String(quantity.defaultValue)}
                onChange={(value) => onSelect?.(section.id, value)}
                min={quantity.min}
                max={quantity.max}
                step={quantity.step}
              />
            </section>
          );
        }

        if (!selectable || section.readOnly) {
          return (
            <section key={section.id} className="mt-6">
              <h3 className="text-sm font-bold uppercase tracking-wide text-text-secondary">
                {title}
              </h3>
              <ul className="mt-2 divide-y divide-border rounded-card border border-border">
                {section.items.map((entry) => (
                  <li
                    key={entry.id}
                    className="flex items-start justify-between gap-4 p-3 text-sm"
                  >
                    <div>
                      <p className="font-semibold">
                        {pickText(language, entry.labelEn, entry.labelAr)}
                      </p>
                      {(entry.detailEn || entry.detailAr) && (
                        <p className="text-text-secondary">
                          {pickText(language, entry.detailEn ?? "", entry.detailAr ?? "")}
                        </p>
                      )}
                    </div>
                    {renderPrice(entry)}
                  </li>
                ))}
              </ul>
            </section>
          );
        }

        const groupName = `${idPrefix}-${section.id}`;
        const locked = lockedGroupIds.includes(section.id);
        if (section.compact && selectable) {
          return (
            <section key={section.id} className="mt-6">
              <h3 className="text-sm font-bold uppercase tracking-wide text-text-secondary">
                {title}
              </h3>
              <div role="radiogroup" aria-label={title} className="mt-2 flex flex-wrap gap-2">
                {section.items.map((entry) => {
                  const checked = selection?.[section.id] === entry.id;
                  return (
                    <label
                      key={entry.id}
                      className={`flex cursor-pointer items-center gap-2 rounded-full border-2 px-3 py-1 text-sm font-semibold transition-colors ${
                        checked
                          ? "border-black bg-black text-white"
                          : "border-border bg-background hover:border-black"
                      }`}
                    >
                      <input
                        type="radio"
                        name={groupName}
                        value={entry.id}
                        checked={checked}
                        onChange={() => onSelect?.(section.id, entry.id)}
                        className="sr-only"
                      />
                      <span>{pickText(language, entry.labelEn, entry.labelAr)}</span>
                    </label>
                  );
                })}
              </div>
            </section>
          );
        }
        return (
          <section
            key={section.id}
            className={`mt-6 ${locked ? "opacity-40" : ""}`}
          >
            <h3 className="text-sm font-bold uppercase tracking-wide text-text-secondary">
              {title}
              {locked && (
                <span className="ms-2 font-normal normal-case">
                  {tx("(not available for free consultation)", "(غير متاح للاستشارة المجانية)")}
                </span>
              )}
            </h3>
            <div
              role={section.multiple ? "group" : "radiogroup"}
              aria-label={title}
              className="mt-2 grid gap-2"
            >
              {section.items.map((entry) => {
                const checked = section.multiple
                  ? splitIds(selection?.[section.id]).includes(entry.id)
                  : selection?.[section.id] === entry.id;
                return (
                  <label
                    key={entry.id}
                    className={`flex items-start justify-between gap-4 rounded-card border-2 p-3 text-sm transition-colors ${
                      locked ? "cursor-not-allowed" : "cursor-pointer"
                    } ${
                      checked
                        ? "border-black bg-accent-light ring-1 ring-black"
                        : "border-border bg-background hover:border-black"
                    }`}
                  >
                    <span className="flex items-start gap-3">
                      <input
                        type={section.multiple ? "checkbox" : "radio"}
                        name={groupName}
                        value={entry.id}
                        checked={checked}
                        disabled={locked}
                        onChange={(event) =>
                          section.multiple
                            ? toggleChecked(section.id, entry.id, event.target.checked)
                            : onSelect?.(section.id, entry.id)
                        }
                        className="mt-1 h-4 w-4 border-0 p-0 accent-black"
                      />
                      <span>
                        <span className="block font-semibold">
                          {pickText(language, entry.labelEn, entry.labelAr)}
                        </span>
                        {(entry.detailEn || entry.detailAr) && (
                          <span className="block text-text-secondary">
                            {pickText(language, entry.detailEn ?? "", entry.detailAr ?? "")}
                          </span>
                        )}
                      </span>
                    </span>
                    {renderPrice(entry)}
                  </label>
                );
              })}
            </div>
          </section>
        );
      })}
    </>
  );
}
