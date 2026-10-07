"use client";

import { useState, useTransition } from "react";
import { Button, Input, Select } from "@/components/ui";
import { ActionFeedback } from "@/components/common/EditorSection";
import type { ActionResult } from "@/lib/actions/result";
import { bookingAction, walkInAction } from "./actions";

/** Row actions: played / no-show after the start, cancel (full refund to the customer) before the end. */
export function BookingRowActions({
  orgId,
  bookingId,
  started,
  ended,
  status,
}: {
  orgId: string;
  bookingId: string;
  started: boolean;
  ended: boolean;
  status: string;
}) {
  const [pending, start] = useTransition();
  const [result, setResult] = useState<ActionResult>({});
  const act = (action: "cancel" | "complete" | "no-show") =>
    start(async () => {
      let reason: string | undefined;
      if (action === "cancel") {
        const answer = window.prompt("Reason for cancelling (the customer is refunded in full):", "");
        if (answer === null) return;
        reason = answer;
      }
      setResult(await bookingAction(orgId, bookingId, action, reason));
    });
  if (status !== "CONFIRMED" && status !== "HELD") return null;
  return (
    <span className="inline-flex flex-wrap items-center gap-1">
      {status === "CONFIRMED" && started && (
        <>
          <Button size="sm" variant="secondary" disabled={pending} onClick={() => act("complete")}>
            Played
          </Button>
          <Button size="sm" variant="ghost" disabled={pending} onClick={() => act("no-show")}>
            No-show
          </Button>
        </>
      )}
      {!ended && (
        <Button size="sm" variant="ghost" disabled={pending} onClick={() => act("cancel")}>
          Cancel
        </Button>
      )}
      <ActionFeedback result={result} />
    </span>
  );
}

/** Converts a local date + time in the venue's zone to an ISO instant. */
function toInstant(date: string, time: string, timezone: string): string {
  const guess = new Date(`${date}T${time}:00Z`);
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(guess);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"));
  return new Date(guess.getTime() - (asUtc - guess.getTime())).toISOString();
}

export function WalkInForm({
  orgId,
  date,
  timezone,
  facilities,
}: {
  orgId: string;
  date: string;
  timezone: string;
  facilities: Array<{ value: string; label: string }>;
}) {
  const [form, setForm] = useState({
    facilityId: facilities[0]?.value ?? "",
    time: "18:00",
    duration: "60",
    name: "",
    phone: "",
    note: "",
  });
  const [pending, start] = useTransition();
  const [result, setResult] = useState<ActionResult>({});
  const set = (key: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm({ ...form, [key]: e.target.value });
  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-3">
        <Select label="Facility" value={form.facilityId} onChange={set("facilityId")} options={facilities} />
        <Input label={`Start (${date})`} type="time" value={form.time} onChange={set("time")} />
        <Select
          label="Duration"
          value={form.duration}
          onChange={set("duration")}
          options={[30, 60, 90, 120, 180].map((m) => ({ value: String(m), label: `${m} min` }))}
        />
        <Input label="Customer name" value={form.name} maxLength={120} onChange={set("name")} />
        <Input label="Phone" type="tel" value={form.phone} onChange={set("phone")} />
        <Input label="Note" value={form.note} maxLength={300} onChange={set("note")} />
      </div>
      <div className="flex items-center gap-3">
        <Button
          loading={pending}
          onClick={() =>
            start(async () =>
              setResult(
                await walkInAction(orgId, {
                  facilityId: form.facilityId,
                  startAt: toInstant(date, form.time, timezone),
                  durationMinutes: Number(form.duration),
                  name: form.name,
                  phone: form.phone,
                  note: form.note,
                }),
              ),
            )
          }
        >
          Add walk-in
        </Button>
        <ActionFeedback result={result} />
      </div>
    </div>
  );
}
