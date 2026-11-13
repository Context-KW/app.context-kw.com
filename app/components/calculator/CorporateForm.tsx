"use client";

import React, { useMemo, useState } from "react";
import { config } from "@/config";
import { NumberField, parseNumber } from "@/app/components/calculator/fields";
import { QuotePanel } from "@/app/components/calculator/QuotePanel";
import { quoteCorporate } from "@/app/utils/pricing";
import type { QuoteLine } from "@/app/utils/pricing";
import { useTx } from "@/app/utils/useTx";

const { minimumTeamSize, maximumTeamSize } = config.corporate;

export function CorporateForm({ onAdd }: { onAdd: (line: QuoteLine) => void }) {
  const { tx } = useTx();
  const [teamSize, setTeamSize] = useState(String(minimumTeamSize));

  const result = useMemo(
    () =>
      quoteCorporate({
        teamSize: parseNumber(teamSize),
      }),
    [teamSize]
  );

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField
          label={tx("Team size", "حجم الفريق")}
          value={teamSize}
          onChange={setTeamSize}
          min={minimumTeamSize}
          max={maximumTeamSize}
          hint={tx(
            `${minimumTeamSize} to ${maximumTeamSize} people`,
            `من ${minimumTeamSize} إلى ${maximumTeamSize} فرد`
          )}
        />
      </div>
      <QuotePanel result={result} onAdd={onAdd} />
    </div>
  );
}
