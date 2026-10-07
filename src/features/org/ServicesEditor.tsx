"use client";

import { Button } from "@/components/ui";
import { inputClass } from "@/components/common/EditorSection";

/** Editable list of services / facilities the business offers (free text, spec §6). */
export function ServicesEditor({
  items,
  onChange,
}: {
  items: Array<{ name: string; description?: string }>;
  onChange: (items: Array<{ name: string; description?: string }>) => void;
}) {
  const update = (i: number, key: "name" | "description", value: string) =>
    onChange(items.map((item, j) => (j === i ? { ...item, [key]: value } : item)));
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1 text-sm font-medium">Services and facilities you offer (optional)</legend>
      {items.map((item, i) => (
        <div key={i} className="flex flex-wrap gap-2">
          <input
            aria-label={`Service ${i + 1} name`}
            className={`${inputClass} min-w-48 flex-1`}
            value={item.name}
            maxLength={120}
            placeholder="e.g. Summer cricket camp"
            onChange={(e) => update(i, "name", e.target.value)}
          />
          <input
            aria-label={`Service ${i + 1} description`}
            className={`${inputClass} min-w-48 flex-[2]`}
            value={item.description ?? ""}
            maxLength={500}
            placeholder="Short description"
            onChange={(e) => update(i, "description", e.target.value)}
          />
          <Button variant="ghost" onClick={() => onChange(items.filter((_, j) => j !== i))}>
            Remove
          </Button>
        </div>
      ))}
      <div>
        <Button
          variant="secondary"
          size="sm"
          disabled={items.length >= 30}
          onClick={() => onChange([...items, { name: "", description: "" }])}
        >
          Add service
        </Button>
      </div>
    </fieldset>
  );
}
