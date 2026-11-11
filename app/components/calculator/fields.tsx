"use client";

import React, { useId } from "react";

export interface SelectChoice {
  value: string;
  label: string;
}

/** Empty input becomes NaN so the pricing validators reject it. */
export function parseNumber(value: string): number {
  return value.trim() === "" ? Number.NaN : Number(value);
}

interface FieldShellProps {
  label: string;
  hint?: string;
  children: (id: string) => React.ReactNode;
}

export function FieldShell({ label, hint, children }: FieldShellProps) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
      </label>
      <div className="mt-2">{children(id)}</div>
      {hint && <p className="mt-1 text-xs text-text-secondary">{hint}</p>}
    </div>
  );
}

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  choices: SelectChoice[];
  hint?: string;
}

export function SelectField({
  label,
  value,
  onChange,
  choices,
  hint,
}: SelectFieldProps) {
  return (
    <FieldShell label={label} hint={hint}>
      {(id) => (
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          {choices.map((choice) => (
            <option key={choice.value} value={choice.value}>
              {choice.label}
            </option>
          ))}
        </select>
      )}
    </FieldShell>
  );
}

interface NumberFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  min?: number;
  max?: number;
  step?: number;
  hint?: string;
}

export function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  hint,
}: NumberFieldProps) {
  return (
    <FieldShell label={label} hint={hint}>
      {(id) => (
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </FieldShell>
  );
}

interface CheckboxFieldProps {
  label: string;
  detail?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function CheckboxField({
  label,
  detail,
  checked,
  onChange,
}: CheckboxFieldProps) {
  const id = useId();
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start text-sm">
      <input
        id={id}
        type="checkbox"
        className="mt-1 h-4 w-4 p-0"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span>
        <span className="font-semibold">{label}</span>
        {detail && <span className="text-text-secondary"> · {detail}</span>}
      </span>
    </label>
  );
}
