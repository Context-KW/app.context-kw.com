"use client";

import React, { useMemo, useState } from "react";
import { CheckboxField, SelectField } from "@/app/components/calculator/fields";
import { QuotePanel } from "@/app/components/calculator/QuotePanel";
import { formatPrice, pickText } from "@/app/utils/format";
import {
  quoteResumeWriting,
  RESUME_WRITING_ADD_ONS,
  RESUME_WRITING_TIERS,
} from "@/app/utils/pricing/resumeWriting";
import type { QuoteLine } from "@/app/utils/pricing";
import { useTx } from "@/app/utils/useTx";
import { config } from "@/config";

const CONSULTATION_CHOICE = "consultation";

export function ResumeWritingForm({ onAdd }: { onAdd: (line: QuoteLine) => void }) {
  const { language, tx } = useTx();
  const [choice, setChoice] = useState(RESUME_WRITING_TIERS[0].id);
  const [addOnIds, setAddOnIds] = useState<string[]>([]);

  const isConsultation = choice === CONSULTATION_CHOICE;

  const result = useMemo(
    () =>
      quoteResumeWriting({
        tierId: choice,
        addOnIds: isConsultation ? [] : addOnIds,
        isConsultation,
      }),
    [choice, addOnIds, isConsultation]
  );

  const toggleAddOn = (id: string, checked: boolean) => {
    setAddOnIds((current) =>
      checked ? [...current, id] : current.filter((item) => item !== id)
    );
  };

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          label={tx("Service level", "مستوى الخدمة")}
          value={choice}
          onChange={setChoice}
          choices={[
            ...RESUME_WRITING_TIERS.map((tier) => ({
              value: tier.id,
              label: pickText(language, tier.labelEn, tier.labelAr),
            })),
            {
              value: CONSULTATION_CHOICE,
              label: tx("Free 15-Minute Consultation", "استشارة مجانية مدتها 15 دقيقة"),
            },
          ]}
        />
      </div>

      {!isConsultation && (
        <fieldset className="mt-6">
          <legend className="text-sm font-semibold">{tx("Optional add-ons", "إضافات اختيارية")}</legend>
          <div className="mt-2 grid gap-3">
            {RESUME_WRITING_ADD_ONS.map((addOn) => (
              <CheckboxField
                key={addOn.id}
                label={pickText(language, addOn.labelEn, addOn.labelAr)}
                detail={formatPrice(addOn.launchRate, language)}
                checked={addOnIds.includes(addOn.id)}
                onChange={(checked) => toggleAddOn(addOn.id, checked)}
              />
            ))}
          </div>
        </fieldset>
      )}

      <p className="mt-4 text-xs text-text-secondary">
        {tx(
          `Delivery: ${config.resumeWriting.deliveryModes.map((mode) => pickText(language, mode.labelEn, mode.labelAr)).join(" / ")}`,
          `طرق التقديم: ${config.resumeWriting.deliveryModes.map((mode) => pickText(language, mode.labelEn, mode.labelAr)).join(" / ")}`
        )}
      </p>

      <QuotePanel result={result} onAdd={onAdd} />
    </div>
  );
}
