"use client";

import React, { useMemo, useState } from "react";
import { config } from "@/config";
import { NumberField, SelectField, parseNumber } from "@/app/components/calculator/fields";
import { QuotePanel } from "@/app/components/calculator/QuotePanel";
import { formatDuration, pickLabel } from "@/app/utils/format";
import {
  ACCENT_RATE_KEYS,
  ACCENT_RATE_LABELS,
  quoteAccent,
} from "@/app/utils/pricing";
import type { AccentRateKey, QuoteLine } from "@/app/utils/pricing";
import { useTx } from "@/app/utils/useTx";

const durations = config.accentCoaching.sessionDurations;

export function AccentForm({ onAdd }: { onAdd: (line: QuoteLine) => void }) {
  const { language, tx } = useTx();
  const [rateKey, setRateKey] = useState<AccentRateKey>(ACCENT_RATE_KEYS[0]);
  const [duration, setDuration] = useState(String(durations[0]));
  const [sessions, setSessions] = useState("1");

  const result = useMemo(
    () =>
      quoteAccent({
        rateKey,
        duration: Number(duration),
        sessions: parseNumber(sessions),
      }),
    [rateKey, duration, sessions]
  );

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          label={tx("Coaching type", "نوع التدريب")}
          value={rateKey}
          onChange={(value) => setRateKey(value as AccentRateKey)}
          choices={ACCENT_RATE_KEYS.map((key) => ({
            value: key,
            label: pickLabel(ACCENT_RATE_LABELS[key], language),
          }))}
        />
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
          label={tx("Number of sessions", "عدد الجلسات")}
          value={sessions}
          onChange={setSessions}
          min={1}
        />
      </div>
      <QuotePanel result={result} onAdd={onAdd} />
    </div>
  );
}
