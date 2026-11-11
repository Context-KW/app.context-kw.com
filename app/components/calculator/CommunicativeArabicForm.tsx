"use client";

import React, { useMemo, useState } from "react";
import { SelectField } from "@/app/components/calculator/fields";
import { QuotePanel } from "@/app/components/calculator/QuotePanel";
import { pickText } from "@/app/utils/format";
import {
  COMMUNICATIVE_ARABIC_OPTIONS,
  quoteCommunicativeArabic,
} from "@/app/utils/pricing/communicativeArabic";
import type { QuoteLine } from "@/app/utils/pricing";
import { useTx } from "@/app/utils/useTx";

export function CommunicativeArabicForm({ onAdd }: { onAdd: (line: QuoteLine) => void }) {
  const { language, tx } = useTx();
  const [optionId, setOptionId] = useState(COMMUNICATIVE_ARABIC_OPTIONS[0].id);

  const result = useMemo(() => quoteCommunicativeArabic(optionId), [optionId]);

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          label={tx("Package", "الباقة")}
          value={optionId}
          onChange={setOptionId}
          choices={COMMUNICATIVE_ARABIC_OPTIONS.map((option) => ({
            value: option.id,
            label: `${pickText(language, option.subcategoryLabelEn, option.subcategoryLabelAr)} — ${pickText(
              language,
              option.labelEn,
              option.labelAr
            )}`,
          }))}
        />
      </div>
      <QuotePanel result={result} onAdd={onAdd} />
    </div>
  );
}
