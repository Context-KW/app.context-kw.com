"use client";

import React, { useMemo, useState } from "react";
import { config } from "@/config";
import { NumberField, SelectField, parseNumber } from "@/app/components/calculator/fields";
import { QuotePanel } from "@/app/components/calculator/QuotePanel";
import { pickLabel } from "@/app/utils/format";
import {
  TRANSLATION_KINDS,
  TRANSLATION_KIND_ORDER,
  quoteTranslation,
} from "@/app/utils/pricing";
import type { QuoteLine, TranslationKind } from "@/app/utils/pricing";
import { useTx } from "@/app/utils/useTx";

const documentTypes = config.translation.documentTypes;

export function TranslationForm({ onAdd }: { onAdd: (line: QuoteLine) => void }) {
  const { language, tx } = useTx();
  const [kind, setKind] = useState<TranslationKind>(TRANSLATION_KIND_ORDER[0]);
  const [quantity, setQuantity] = useState("500");
  const [documentTypeId, setDocumentTypeId] = useState(documentTypes[0].id);

  const byWord = TRANSLATION_KINDS[kind].unit === "word";

  const result = useMemo(
    () =>
      quoteTranslation({
        kind,
        quantity: parseNumber(quantity),
        documentTypeId: byWord ? documentTypeId : undefined,
      }),
    [kind, quantity, documentTypeId, byWord]
  );

  const changeKind = (value: string) => {
    const next = value as TranslationKind;
    setKind(next);
    // Reset to a sensible default when switching between words and hours.
    setQuantity(TRANSLATION_KINDS[next].unit === "word" ? "500" : "1");
  };

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          label={tx("Service", "الخدمة")}
          value={kind}
          onChange={changeKind}
          choices={TRANSLATION_KIND_ORDER.map((key) => ({
            value: key,
            label: pickLabel(TRANSLATION_KINDS[key], language),
          }))}
        />
        <NumberField
          label={byWord ? tx("Word count", "عدد الكلمات") : tx("Hours", "الساعات")}
          value={quantity}
          onChange={setQuantity}
          min={byWord ? 1 : 0.5}
          step={byWord ? 1 : 0.5}
        />
        {byWord && (
          <SelectField
            label={tx("Document type", "نوع المستند")}
            value={documentTypeId}
            onChange={setDocumentTypeId}
            choices={documentTypes.map((type) => ({
              value: type.id,
              label: pickLabel(type, language),
            }))}
          />
        )}
      </div>
      <QuotePanel result={result} onAdd={onAdd} />
    </div>
  );
}
