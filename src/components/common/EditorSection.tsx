"use client";

import { useState, useTransition, type ReactNode } from "react";
import { Button, Card } from "@/components/ui";
import type { ActionResult } from "@/lib/actions/result";

/** One editable block with its own Save button and inline feedback (used by all business editors). */
export function EditorSection({
  title,
  description,
  onSave,
  saveLabel = "Save",
  children,
}: {
  title: string;
  description?: string;
  onSave?: () => Promise<ActionResult>;
  saveLabel?: string;
  children: ReactNode;
}) {
  const [pending, start] = useTransition();
  const [result, setResult] = useState<ActionResult>({});
  return (
    <Card className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        {description && <p className="text-sm text-muted">{description}</p>}
      </div>
      {children}
      {onSave && (
        <div className="flex flex-wrap items-center gap-3">
          <Button loading={pending} onClick={() => start(async () => setResult(await onSave()))}>
            {saveLabel}
          </Button>
          <ActionFeedback result={result} />
        </div>
      )}
    </Card>
  );
}

export function ActionFeedback({ result }: { result: ActionResult }) {
  if (result.error) {
    return (
      <span role="alert" className="text-sm text-danger">
        {result.error}
      </span>
    );
  }
  if (result.success) {
    return (
      <span role="status" className="text-sm text-brand-700">
        {result.success}
      </span>
    );
  }
  return null;
}

/** Runs a server action from a button (e.g. Submit, Deactivate) and shows the outcome. */
export function ActionButton({
  action,
  children,
  variant = "primary",
  confirm,
}: {
  action: () => Promise<ActionResult>;
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  confirm?: string;
}) {
  const [pending, start] = useTransition();
  const [result, setResult] = useState<ActionResult>({});
  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <Button
        variant={variant}
        loading={pending}
        onClick={() => {
          if (confirm && !window.confirm(confirm)) return;
          start(async () => setResult(await action()));
        }}
      >
        {children}
      </Button>
      <ActionFeedback result={result} />
    </span>
  );
}

export interface Choice {
  value: string;
  label: string;
  hint?: string;
}

/** Accessible checkbox group. */
export function CheckboxGroup({
  legend,
  choices,
  selected,
  onChange,
  columns = 3,
}: {
  legend: string;
  choices: Choice[];
  selected: string[];
  onChange: (next: string[]) => void;
  columns?: 2 | 3 | 4;
}) {
  const grid = { 2: "sm:grid-cols-2", 3: "sm:grid-cols-3", 4: "sm:grid-cols-4" }[columns];
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1 text-sm font-medium text-ink">{legend}</legend>
      <div className={`grid gap-2 ${grid}`}>
        {choices.map((c) => {
          const checked = selected.includes(c.value);
          return (
            <label
              key={c.value}
              className="flex cursor-pointer items-start gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-sm has-[:checked]:border-brand-600 has-[:checked]:bg-brand-50"
            >
              <input
                type="checkbox"
                className="mt-0.5"
                checked={checked}
                onChange={() =>
                  onChange(checked ? selected.filter((v) => v !== c.value) : [...selected, c.value])
                }
              />
              <span>
                <span className="font-medium">{c.label}</span>
                {c.hint && <span className="block text-xs text-muted">{c.hint}</span>}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export const textareaClass =
  "min-h-24 rounded-lg border border-line bg-surface px-3 py-2 text-sm placeholder:text-muted focus:border-brand-600";
export const inputClass = "h-10 rounded-lg border border-line bg-surface px-3 text-sm";
