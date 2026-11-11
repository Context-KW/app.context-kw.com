"use client";

import React, { useMemo, useState } from "react";
import { config } from "@/config";
import {
  CheckboxField,
  NumberField,
  SelectField,
  parseNumber,
} from "@/app/components/calculator/fields";
import { QuotePanel } from "@/app/components/calculator/QuotePanel";
import { formatDuration, pickLabel } from "@/app/utils/format";
import { ADVISING_LABELS, quoteAdvising } from "@/app/utils/pricing";
import type { QuoteLine } from "@/app/utils/pricing";
import { useTx } from "@/app/utils/useTx";

const degrees = config.universityAdvising.targetDegrees;
const durations = config.universityAdvising.sessionDurations;

export function AdvisingForm({ onAdd }: { onAdd: (line: QuoteLine) => void }) {
  const { language, tx } = useTx();
  const [mode, setMode] = useState<"sessions" | "fullPackage">("sessions");
  const [degreeId, setDegreeId] = useState(degrees[0].id);
  const [duration, setDuration] = useState(String(durations[0]));
  const [includeInitial, setIncludeInitial] = useState(true);
  const [followUps, setFollowUps] = useState("2");

  const result = useMemo(
    () =>
      quoteAdvising({
        mode,
        degreeId,
        duration: Number(duration),
        includeInitial,
        followUps: parseNumber(followUps),
      }),
    [mode, degreeId, duration, includeInitial, followUps]
  );

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          label={tx("Pricing", "التسعير")}
          value={mode}
          onChange={(value) => setMode(value as "sessions" | "fullPackage")}
          choices={[
            { value: "sessions", label: tx("Per session", "بالجلسة") },
            {
              value: "fullPackage",
              label: pickLabel(ADVISING_LABELS.fullPackage, language),
            },
          ]}
        />
        <SelectField
          label={tx("Target degree", "الدرجة المستهدفة")}
          value={degreeId}
          onChange={setDegreeId}
          choices={degrees.map((degree) => ({
            value: degree.id,
            label: pickLabel(degree, language),
          }))}
        />
        {mode === "sessions" && (
          <>
            <SelectField
              label={tx("Session length", "مدة الجلسة")}
              value={duration}
              onChange={setDuration}
              choices={durations.map((hours) => ({
                value: String(hours),
                label: formatDuration(hours, language),
              }))}
            />
            <NumberField
              label={tx("Follow-up sessions", "جلسات المتابعة")}
              value={followUps}
              onChange={setFollowUps}
              min={0}
            />
            <div className="self-end pb-3">
              <CheckboxField
                label={pickLabel(ADVISING_LABELS.initialConsultation, language)}
                checked={includeInitial}
                onChange={setIncludeInitial}
              />
            </div>
          </>
        )}
      </div>
      <QuotePanel result={result} onAdd={onAdd} />
    </div>
  );
}
