"use client";

import { Button } from "@/components/ui";
import { inputClass } from "@/components/common/EditorSection";

export const DAYS = [
  { value: "MONDAY", label: "Monday" },
  { value: "TUESDAY", label: "Tuesday" },
  { value: "WEDNESDAY", label: "Wednesday" },
  { value: "THURSDAY", label: "Thursday" },
  { value: "FRIDAY", label: "Friday" },
  { value: "SATURDAY", label: "Saturday" },
  { value: "SUNDAY", label: "Sunday" },
];

export interface HoursRow {
  day: string;
  opensAt: string;
  closesAt: string;
}

export interface PriceRow {
  day: string;
  startTime: string;
  endTime: string;
  pricePerHour: string;
  peak: boolean;
  label: string;
}

export const hhmm = (t: string) => t.slice(0, 5);

function DaySelect({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
}) {
  return (
    <select
      aria-label={label}
      className={inputClass}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {DAYS.map((d) => (
        <option key={d.value} value={d.value}>
          {d.label}
        </option>
      ))}
    </select>
  );
}

/** Weekly opening intervals; several per day allowed (e.g. morning and evening sessions). */
export function HoursEditor({ rows, onChange }: { rows: HoursRow[]; onChange: (rows: HoursRow[]) => void }) {
  const update = (i: number, patch: Partial<HoursRow>) =>
    onChange(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  const everyDay = () => {
    const template = rows[0] ?? { day: "MONDAY", opensAt: "06:00", closesAt: "22:00" };
    onChange(DAYS.map((d) => ({ day: d.value, opensAt: template.opensAt, closesAt: template.closesAt })));
  };
  return (
    <div className="flex flex-col gap-2">
      {rows.length === 0 && <p className="text-sm text-muted">Closed every day. Add opening hours below.</p>}
      {rows.map((row, i) => (
        <div key={i} className="flex flex-wrap items-center gap-2">
          <DaySelect label={`Day ${i + 1}`} value={row.day} onChange={(day) => update(i, { day })} />
          <input
            type="time"
            aria-label={`Opens ${i + 1}`}
            className={inputClass}
            value={row.opensAt}
            onChange={(e) => update(i, { opensAt: e.target.value })}
          />
          <span className="text-sm text-muted">to</span>
          <input
            type="time"
            aria-label={`Closes ${i + 1}`}
            className={inputClass}
            value={row.closesAt}
            onChange={(e) => update(i, { closesAt: e.target.value })}
          />
          <Button variant="ghost" onClick={() => onChange(rows.filter((_, j) => j !== i))}>
            Remove
          </Button>
        </div>
      ))}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onChange([...rows, { day: "MONDAY", opensAt: "06:00", closesAt: "22:00" }])}
        >
          Add hours
        </Button>
        <Button variant="ghost" size="sm" onClick={everyDay}>
          Same hours every day
        </Button>
      </div>
    </div>
  );
}

/** Hourly price bands per weekday: peak / off-peak and weekend pricing (spec §9). */
export function PricingEditor({
  rows,
  onChange,
}: {
  rows: PriceRow[];
  onChange: (rows: PriceRow[]) => void;
}) {
  const update = (i: number, patch: Partial<PriceRow>) =>
    onChange(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  const copyToWeek = () => {
    const monday = rows.filter((r) => r.day === "MONDAY");
    if (monday.length === 0) return;
    onChange(DAYS.flatMap((d) => monday.map((r) => ({ ...r, day: d.value }))));
  };
  return (
    <div className="flex flex-col gap-2">
      {rows.length === 0 && (
        <p className="text-sm text-muted">No prices yet — the facility cannot be booked.</p>
      )}
      {rows.map((row, i) => (
        <div key={i} className="flex flex-wrap items-center gap-2">
          <DaySelect label={`Price day ${i + 1}`} value={row.day} onChange={(day) => update(i, { day })} />
          <input
            type="time"
            aria-label={`From ${i + 1}`}
            className={inputClass}
            value={row.startTime}
            onChange={(e) => update(i, { startTime: e.target.value })}
          />
          <span className="text-sm text-muted">to</span>
          <input
            type="time"
            aria-label={`Until ${i + 1}`}
            className={inputClass}
            value={row.endTime}
            onChange={(e) => update(i, { endTime: e.target.value })}
          />
          <label className="flex items-center gap-1 text-sm">
            ₹
            <input
              type="number"
              min={0}
              step="1"
              aria-label={`Price per hour ${i + 1}`}
              className={`${inputClass} w-28`}
              value={row.pricePerHour}
              onChange={(e) => update(i, { pricePerHour: e.target.value })}
            />
            /hour
          </label>
          <label className="flex items-center gap-1 text-sm">
            <input
              type="checkbox"
              checked={row.peak}
              onChange={(e) => update(i, { peak: e.target.checked })}
            />
            Peak
          </label>
          <input
            aria-label={`Label ${i + 1}`}
            className={`${inputClass} w-32`}
            placeholder="Label"
            maxLength={40}
            value={row.label}
            onChange={(e) => update(i, { label: e.target.value })}
          />
          <Button variant="ghost" onClick={() => onChange(rows.filter((_, j) => j !== i))}>
            Remove
          </Button>
        </div>
      ))}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() =>
            onChange([
              ...rows,
              {
                day: "MONDAY",
                startTime: "06:00",
                endTime: "18:00",
                pricePerHour: "",
                peak: false,
                label: "",
              },
            ])
          }
        >
          Add price band
        </Button>
        <Button variant="ghost" size="sm" onClick={copyToWeek}>
          Copy Monday to every day
        </Button>
      </div>
    </div>
  );
}
