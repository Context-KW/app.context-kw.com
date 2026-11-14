"use client";

import React, { useMemo, useState } from "react";
import { config } from "@/config";
import { SelectField } from "@/app/components/calculator/fields";
import { QuotePanel } from "@/app/components/calculator/QuotePanel";
import { formatDuration, pickLabel } from "@/app/utils/format";
import { quoteTutoring } from "@/app/utils/pricing";
import type { QuoteLine } from "@/app/utils/pricing";
import { useTx } from "@/app/utils/useTx";

const t = config.tutoring;

export function TutoringForm({ onAdd }: { onAdd: (line: QuoteLine) => void }) {
  const { language, tx } = useTx();
  const [focusId, setFocusId] = useState(t.options[0].id);
  const [deliveryId, setDeliveryId] = useState(t.deliveryModes[0].id);
  const [duration, setDuration] = useState(String(t.sessionDurations[0]));
  const [packageId, setPackageId] = useState(t.packages[0].id);

  const result = useMemo(
    () =>
      quoteTutoring({
        focusId,
        deliveryId,
        duration: Number(duration),
        packageId,
      }),
    [focusId, deliveryId, duration, packageId]
  );

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          label={tx("Focus", "نوع التدريس")}
          value={focusId}
          onChange={setFocusId}
          choices={t.options.map((option) => ({
            value: option.id,
            label: pickLabel(option, language),
          }))}
        />
        <SelectField
          label={tx("Delivery", "طريقة التقديم")}
          value={deliveryId}
          onChange={setDeliveryId}
          choices={t.deliveryModes.map((mode) => ({
            value: mode.id,
            label: pickLabel(mode, language),
          }))}
        />
        <SelectField
          label={tx("Session length", "مدة الجلسة")}
          value={duration}
          onChange={setDuration}
          choices={t.sessionDurations.map((hours) => ({
            value: String(hours),
            label: formatDuration(hours, language),
          }))}
        />
        <SelectField
          label={tx("Package", "الباقة")}
          value={packageId}
          onChange={setPackageId}
          choices={t.packages.map((pkg) => ({
            value: pkg.id,
            label: pickLabel(pkg, language),
          }))}
        />
      </div>
      <QuotePanel result={result} onAdd={onAdd} />
    </div>
  );
}
