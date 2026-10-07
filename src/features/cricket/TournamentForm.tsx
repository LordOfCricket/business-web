"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ActionFeedback, inputClass, textareaClass } from "@/components/common/EditorSection";
import { Button } from "@/components/ui";
import type { ActionResult } from "@/lib/actions/result";
import { saveTournamentAction } from "./actions";

export interface TournamentValues {
  id?: string;
  name: string;
  description?: string;
  rules?: string;
  city: string;
  venueId?: string;
  ballType: "LEATHER" | "TENNIS";
  overs: number;
  playersPerSide: number;
  startDate: string;
  endDate: string;
  /** yyyy-MM-ddTHH:mm in IST */
  registrationClosesAt: string;
  entryFee: number;
  maxTeams: number;
  status?: string;
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="flex flex-col gap-1 text-sm font-medium">
      {label}
      {children}
      {hint && <span className="text-xs font-normal text-muted">{hint}</span>}
    </label>
  );
}

/** Create or edit a cricket tournament (spec §26). The entry fee is fixed once registration opens. */
export function TournamentForm({
  orgId,
  initial,
  venues,
}: {
  orgId: string;
  initial?: TournamentValues;
  venues: Array<{ id: string; name: string }>;
}) {
  const router = useRouter();
  const [result, setResult] = useState<ActionResult>({});
  const [pending, start] = useTransition();
  const feeLocked = initial?.status !== undefined && initial.status !== "DRAFT";
  return (
    <form
      className="grid gap-4 md:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const v = (k: string) => String(f.get(k) ?? "");
        start(async () => {
          const r = await saveTournamentAction(orgId, initial?.id ?? null, {
            name: v("name"),
            description: v("description"),
            rules: v("rules"),
            city: v("city"),
            venueId: v("venueId"),
            ballType: v("ballType") as "TENNIS",
            overs: v("overs"),
            playersPerSide: v("playersPerSide"),
            startDate: v("startDate"),
            endDate: v("endDate"),
            registrationClosesAt: v("registrationClosesAt"),
            entryFee: feeLocked ? String(initial!.entryFee) : v("entryFee"),
            maxTeams: v("maxTeams"),
          });
          setResult(r);
          if (r.success && !initial && r.id) router.push(`/tournaments/${r.id}`);
          else if (r.success) router.refresh();
        });
      }}
    >
      <Field label="Name">
        <input name="name" required maxLength={120} defaultValue={initial?.name} className={inputClass} />
      </Field>
      <Field label="City">
        <input name="city" required maxLength={80} defaultValue={initial?.city} className={inputClass} />
      </Field>
      <Field label="Ground" hint="One of your approved, public venues (optional)">
        <select name="venueId" defaultValue={initial?.venueId ?? ""} className={inputClass}>
          <option value="">Not on LordOfSportz / to be announced</option>
          {venues.map((venue) => (
            <option key={venue.id} value={venue.id}>
              {venue.name}
            </option>
          ))}
        </select>
      </Field>
      <div className="grid grid-cols-3 gap-3">
        <Field label="Ball">
          <select name="ballType" defaultValue={initial?.ballType ?? "TENNIS"} className={inputClass}>
            <option value="TENNIS">Tennis</option>
            <option value="LEATHER">Leather</option>
          </select>
        </Field>
        <Field label="Overs">
          <input
            name="overs"
            type="number"
            min={1}
            max={50}
            required
            defaultValue={initial?.overs ?? 10}
            className={inputClass}
          />
        </Field>
        <Field label="Players">
          <input
            name="playersPerSide"
            type="number"
            min={2}
            max={11}
            required
            defaultValue={initial?.playersPerSide ?? 11}
            className={inputClass}
          />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Starts">
          <input
            name="startDate"
            type="date"
            required
            defaultValue={initial?.startDate}
            className={inputClass}
          />
        </Field>
        <Field label="Ends">
          <input name="endDate" type="date" required defaultValue={initial?.endDate} className={inputClass} />
        </Field>
      </div>
      <Field label="Registration closes (IST)">
        <input
          name="registrationClosesAt"
          type="datetime-local"
          required
          defaultValue={initial?.registrationClosesAt}
          className={inputClass}
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Entry fee (₹)" hint={feeLocked ? "Fixed once registration opened" : "0 = free"}>
          <input
            name="entryFee"
            type="number"
            min={0}
            max={100000}
            step="1"
            required
            disabled={feeLocked}
            defaultValue={initial?.entryFee ?? 0}
            className={inputClass}
          />
        </Field>
        <Field label="Max teams">
          <input
            name="maxTeams"
            type="number"
            min={2}
            max={128}
            required
            defaultValue={initial?.maxTeams ?? 8}
            className={inputClass}
          />
        </Field>
      </div>
      <Field label="About the tournament">
        <textarea
          name="description"
          rows={4}
          maxLength={4000}
          defaultValue={initial?.description}
          className={textareaClass}
        />
      </Field>
      <Field label="Rules">
        <textarea
          name="rules"
          rows={4}
          maxLength={4000}
          defaultValue={initial?.rules}
          className={textareaClass}
        />
      </Field>
      <div className="flex items-center gap-3 md:col-span-2">
        <Button type="submit" loading={pending}>
          {initial ? "Save changes" : "Create tournament"}
        </Button>
        <ActionFeedback result={result} />
      </div>
    </form>
  );
}
