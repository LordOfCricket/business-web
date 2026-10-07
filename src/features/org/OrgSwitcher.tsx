"use client";

import { useTransition } from "react";
import { selectOrganizationAction } from "./actions";

/** Switches the dashboard between the user's businesses. */
export function OrgSwitcher({
  current,
  options,
}: {
  current: string;
  options: Array<{ value: string; label: string }>;
}) {
  const [pending, start] = useTransition();
  if (options.length <= 1) {
    return <p className="font-semibold">{options[0]?.label}</p>;
  }
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-muted">Business</span>
      <select
        className="h-9 rounded-lg border border-line bg-surface px-2 font-semibold"
        value={current}
        disabled={pending}
        onChange={(e) => start(() => selectOrganizationAction(e.target.value))}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
