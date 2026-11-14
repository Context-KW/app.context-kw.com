"use client";

import React, { useMemo, useState } from "react";
import { config } from "@/config";
import {
  CheckboxField,
  NumberField,
  SelectField,
  parseNumber,
} from "@/app/components/calculator/fields";
import { DiscountBadge } from "@/app/components/DiscountBadge";
import { QuotePanel } from "@/app/components/calculator/QuotePanel";
import { formatRate, pickLabel } from "@/app/utils/format";
import {
  FINISHING_UNIT,
  PRINT_PROMO_PERCENT,
  PROTECTOR_MAX_COUNT,
  bulkDiscountSteps,
  bulkPercents,
  flatPagePrice,
  promoPrice,
  quotePrint,
} from "@/app/utils/pricing";
import type { ProtectorMode } from "@/app/utils/pricing";
import type { QuoteLine } from "@/app/utils/pricing";
import { useTx } from "@/app/utils/useTx";

const p = config.printShop;

export function PrintForm({ onAdd }: { onAdd: (line: QuoteLine) => void }) {
  const { language, tx } = useTx();
  const [paperId, setPaperId] = useState(p.paperTypes[0].id);
  const [colorId, setColorId] = useState(p.colorModes[0].id);
  const [layoutId, setLayoutId] = useState(p.layoutModes[0].id);
  const [pages, setPages] = useState("10");
  const [copies, setCopies] = useState("1");
  const [finishingIds, setFinishingIds] = useState<string[]>([]);
  const [zoneId, setZoneId] = useState<string>("");
  const [protectorMode, setProtectorMode] = useState<ProtectorMode>("eachSheet");
  const [protectorCountInput, setProtectorCountInput] = useState<string>("");
  const [protectorThicknessId, setProtectorThicknessId] = useState<string>(
    p.protectorThicknesses[0].id
  );

  const result = useMemo(
    () =>
      quotePrint({
        paperId,
        colorId,
        layoutId,
        pages: parseNumber(pages),
        copies: parseNumber(copies),
        finishingIds,
        deliveryZoneId: zoneId || undefined,
        protectorMode,
        protectorCount:
          protectorMode === "custom" ? parseNumber(protectorCountInput) : undefined,
        protectorThicknessId,
      }),
    [
      paperId,
      colorId,
      layoutId,
      pages,
      copies,
      finishingIds,
      zoneId,
      protectorMode,
      protectorCountInput,
      protectorThicknessId,
    ]
  );
  const protectorsSelected = finishingIds.includes("protectors");
  const totalSheets = parseNumber(pages) * parseNumber(copies);
  const tierCardColor = colorId === "color";
  const tiers = p.printTiers;
  const activeTier = tierCardColor ? tiers.color : tiers.bw;
  // Papers with flat rates show those rates; other papers show the volume tiers.
  const flatRate = flatPagePrice(paperId, colorId);
  const displayPerPage = flatRate ?? activeTier.displayPrice;
  const tierRate = Number.isFinite(totalSheets) && totalSheets >= tiers.threshold
    ? activeTier.atOrAboveThreshold
    : activeTier.belowThreshold;
  // Billed price = rate with the printing promo, then any bulk steps, matching the quote.
  const bulkSteps = bulkPercents(paperId, totalSheets);
  const bulkTiers = bulkDiscountSteps(paperId);
  const billedPerPage = bulkSteps.reduce(
    (value, percent) => promoPrice(value, percent),
    promoPrice(flatRate ?? tierRate, PRINT_PROMO_PERCENT)
  );

  const toggleFinishing = (id: string, checked: boolean) =>
    setFinishingIds((previous) =>
      checked ? [...previous, id] : previous.filter((item) => item !== id)
    );

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          label={tx("Paper", "الورق")}
          value={paperId}
          onChange={setPaperId}
          choices={p.paperTypes.map((paper) => ({
            value: paper.id,
            label: pickLabel(paper, language),
          }))}
        />
        <SelectField
          label={tx("Color", "الألوان")}
          value={colorId}
          onChange={setColorId}
          choices={p.colorModes.map((mode) => ({
            value: mode.id,
            label: pickLabel(mode, language),
          }))}
        />
        <SelectField
          label={tx("Layout", "نمط الطباعة")}
          value={layoutId}
          onChange={setLayoutId}
          choices={p.layoutModes.map((mode) => ({
            value: mode.id,
            label: pickLabel(mode, language),
          }))}
        />
        <NumberField
          label={tx("Pages per copy", "عدد الصفحات لكل نسخة")}
          value={pages}
          onChange={setPages}
          min={1}
        />
        <NumberField
          label={tx("Copies", "عدد النسخ")}
          value={copies}
          onChange={setCopies}
          min={1}
          max={10000}
        />
      </div>

      <div className="mt-4 rounded-card border border-border p-4">
        <p className="text-sm font-bold uppercase tracking-wide text-text-secondary">
          {tx("Price per page", "سعر الصفحة")}
        </p>
        <p className="mt-2 text-base">
          <s className="me-2 text-text-secondary">{displayPerPage.toFixed(3)} KWD</s>
          <span className="font-bold text-red-600">{billedPerPage.toFixed(3)} KWD</span>
          <DiscountBadge percent={PRINT_PROMO_PERCENT} />
          <span className="ms-2 text-sm text-text-secondary">
            {totalSheets >= tiers.threshold
              ? tx(`(${tiers.threshold}+ pages)`, `(${tiers.threshold} صفحة فأكثر)`)
              : tx(`(under ${tiers.threshold} pages)`, `(أقل من ${tiers.threshold} صفحة)`)}
          </span>
        </p>
        {bulkTiers.length > 0 && (
          <div className="mt-3 space-y-1 rounded-card border-2 border-red-600 p-3 text-sm font-semibold text-red-600">
            {bulkTiers.map((step) => {
              const active = totalSheets >= step.minSheets;
              return (
                <p key={step.minSheets} className={active ? "" : "opacity-70"}>
                  {active
                    ? tx(
                        `Bulk discount applied: an extra ${step.percent}% off`,
                        `تم تطبيق خصم الكميات: خصم إضافي ${step.percent}%`
                      )
                    : tx(
                        `Order ${step.minSheets}+ sheets for an extra ${step.percent}% off`,
                        `اطلب ${step.minSheets} ورقة فأكثر للحصول على خصم إضافي ${step.percent}%`
                      )}
                  {active && <DiscountBadge percent={step.percent} />}
                </p>
              );
            })}
          </div>
        )}

      </div>

      <fieldset className="mt-4">
        <legend className="text-sm font-semibold">
          {tx("Delivery zone (optional)", "منطقة التوصيل (اختياري)")}
        </legend>
        <div role="radiogroup" className="mt-2 grid gap-2">
          <label className="flex cursor-pointer items-center justify-between gap-4 rounded-card border-2 border-border p-3 text-sm">
            <span className="flex items-center gap-3">
              <input
                type="radio"
                name="delivery-zone"
                value=""
                checked={zoneId === ""}
                onChange={() => setZoneId("")}
                className="h-4 w-4 accent-black"
              />
              <span className="font-semibold">{tx("Pickup (no delivery)", "استلام من المحل")}</span>
            </span>
            <span className="font-bold">0.000 KWD</span>
          </label>
          {p.deliveryZones.map((zone) => (
            <label
              key={zone.id}
              className="flex cursor-pointer items-center justify-between gap-4 rounded-card border-2 border-border p-3 text-sm"
            >
              <span className="flex items-center gap-3">
                <input
                  type="radio"
                  name="delivery-zone"
                  value={zone.id}
                  checked={zoneId === zone.id}
                  onChange={() => setZoneId(zone.id)}
                  className="h-4 w-4 accent-black"
                />
                <span className="font-semibold">{pickLabel(zone, language)}</span>
              </span>
              <span className="font-bold">{zone.fee.toFixed(3)} KWD</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-4">
        <legend className="text-sm font-semibold">
          {tx("Finishing", "التشطيب")}
        </legend>
        <div className="mt-2 space-y-2">
          {p.finishingOptions.map((option) => (
            <CheckboxField
              key={option.id}
              label={pickLabel(option, language)}
              detail={formatRate(
                option.price,
                FINISHING_UNIT[option.id],
                language
              )}
              checked={finishingIds.includes(option.id)}
              onChange={(checked) => toggleFinishing(option.id, checked)}
            />
          ))}
        </div>
        {protectorsSelected && (
          <div className="mt-4 grid gap-4 rounded-card border border-border p-4 sm:grid-cols-2">
            <div role="radiogroup" className="sm:col-span-2 grid gap-2">
              <span className="text-sm font-semibold">
                {tx("Sheet protectors apply to", "أغلفة الورق تُطبَّق على")}
              </span>
              <label className="flex cursor-pointer items-center gap-3 text-sm">
                <input
                  type="radio"
                  name="protector-mode"
                  value="allCopies"
                  checked={protectorMode === "allCopies"}
                  onChange={() => setProtectorMode("allCopies")}
                  className="h-4 w-4 accent-black"
                />
                <span>{tx("All copies (one protector for the whole job)", "جميع النسخ (غلاف واحد للطلب كله)")}</span>
              </label>
              <label className="flex cursor-pointer items-center gap-3 text-sm">
                <input
                  type="radio"
                  name="protector-mode"
                  value="eachSheet"
                  checked={protectorMode === "eachSheet"}
                  onChange={() => setProtectorMode("eachSheet")}
                  className="h-4 w-4 accent-black"
                />
                <span>{tx("Each piece of paper (one protector per sheet)", "كل ورقة (غلاف لكل ورقة)")}</span>
              </label>
              <label className="flex cursor-pointer items-center gap-3 text-sm">
                <input
                  type="radio"
                  name="protector-mode"
                  value="custom"
                  checked={protectorMode === "custom"}
                  onChange={() => setProtectorMode("custom")}
                  className="h-4 w-4 accent-black"
                />
                <span>{tx("Choose a number of protectors", "اختر عدد الأغلفة")}</span>
              </label>
            </div>
            {protectorMode === "custom" && (
              <NumberField
                label={tx("Number of sheet protectors", "عدد أغلفة الورق")}
                value={protectorCountInput}
                onChange={setProtectorCountInput}
                min={1}
                max={PROTECTOR_MAX_COUNT}
                hint={tx(
                  `Enter a number from 1 to ${PROTECTOR_MAX_COUNT}.`,
                  `أدخل رقماً من 1 إلى ${PROTECTOR_MAX_COUNT}.`
                )}
              />
            )}
            <div role="radiogroup" className="sm:col-span-2 grid gap-2">
              <span className="text-sm font-semibold">
                {tx("Protector thickness", "سماكة الغلاف")}
              </span>
              {p.protectorThicknesses.map((thickness) => (
                <label
                  key={thickness.id}
                  className="flex cursor-pointer items-center gap-3 text-sm"
                >
                  <input
                    type="radio"
                    name="protector-thickness"
                    value={thickness.id}
                    checked={protectorThicknessId === thickness.id}
                    onChange={() => setProtectorThicknessId(thickness.id)}
                    className="h-4 w-4 accent-black"
                  />
                  <span>{pickLabel(thickness, language)}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </fieldset>

      <QuotePanel result={result} onAdd={onAdd} />
    </div>
  );
}
