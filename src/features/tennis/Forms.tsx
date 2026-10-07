"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ActionFeedback, inputClass, textareaClass } from "@/components/common/EditorSection";
import { Button } from "@/components/ui";
import type { ActionResult } from "@/lib/actions/result";
import {
  addEventAction,
  eventOpAction,
  saveTennisTournamentAction,
  scheduleMatchAction,
  tennisStatusAction,
} from "./actions";

function useAction() {
  const router = useRouter();
  const [result, setResult] = useState<ActionResult>({});
  const [pending, start] = useTransition();
  const run = (fn: () => Promise<ActionResult>, after?: (r: ActionResult) => void) =>
    start(async () => {
      const r = await fn();
      setResult(r);
      if (r.success) {
        after?.(r);
        router.refresh();
      }
    });
  return { result, pending, run, router };
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-sm font-medium">
      {label}
      {children}
    </label>
  );
}

const value = (f: FormData, k: string) => String(f.get(k) ?? "");

// ------------------------------------------------------------------ tournament

export function TennisTournamentForm({
  orgId,
  initial,
  venues,
}: {
  orgId: string;
  venues: Array<{ id: string; name: string }>;
  initial?: {
    id: string;
    name: string;
    description?: string;
    rules?: string;
    city: string;
    surface: string;
    venueId?: string;
    startDate: string;
    endDate: string;
    registrationClosesAt: string;
    entryFee: number;
    status: string;
  };
}) {
  const { result, pending, run, router } = useAction();
  const feeLocked = initial !== undefined && initial.status !== "DRAFT";
  return (
    <form
      className="grid gap-3 md:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        run(
          () =>
            saveTennisTournamentAction(orgId, initial?.id ?? null, {
              name: value(f, "name"),
              description: value(f, "description"),
              rules: value(f, "rules"),
              city: value(f, "city"),
              surface: value(f, "surface") as "HARD",
              venueId: value(f, "venueId"),
              startDate: value(f, "startDate"),
              endDate: value(f, "endDate"),
              registrationClosesAt: value(f, "registrationClosesAt"),
              entryFee: feeLocked ? String(initial!.entryFee) : value(f, "entryFee"),
            }),
          (r) => {
            const id = (r as ActionResult & { id?: string }).id;
            if (!initial && id) router.push(`/tennis/tournaments/${id}`);
          },
        );
      }}
    >
      <Field label="Name">
        <input name="name" required maxLength={120} defaultValue={initial?.name} className={inputClass} />
      </Field>
      <Field label="City">
        <input name="city" required maxLength={80} defaultValue={initial?.city} className={inputClass} />
      </Field>
      <Field label="Surface">
        <select name="surface" defaultValue={initial?.surface ?? "HARD"} className={inputClass}>
          <option value="HARD">Hard court</option>
          <option value="CLAY">Clay</option>
          <option value="GRASS">Grass</option>
          <option value="CARPET">Carpet</option>
        </select>
      </Field>
      <Field label="Venue (optional)">
        <select name="venueId" defaultValue={initial?.venueId ?? ""} className={inputClass}>
          <option value="">Not on LordOfSportz</option>
          {venues.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Entry fee per event (₹)">
        <input
          name="entryFee"
          type="number"
          min={0}
          max={100000}
          required
          disabled={feeLocked}
          defaultValue={initial?.entryFee ?? 0}
          className={inputClass}
        />
      </Field>
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
      <Field label="About">
        <textarea
          name="description"
          rows={3}
          maxLength={4000}
          defaultValue={initial?.description}
          className={textareaClass}
        />
      </Field>
      <Field label="Rules">
        <textarea
          name="rules"
          rows={3}
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

const NEXT: Record<string, Array<{ to: string; label: string; danger?: boolean }>> = {
  DRAFT: [
    { to: "OPEN", label: "Open registration" },
    { to: "CANCELLED", label: "Cancel", danger: true },
  ],
  OPEN: [
    { to: "CLOSED", label: "Close registration" },
    { to: "CANCELLED", label: "Cancel", danger: true },
  ],
  CLOSED: [
    { to: "OPEN", label: "Reopen registration" },
    { to: "IN_PROGRESS", label: "Start" },
    { to: "CANCELLED", label: "Cancel", danger: true },
  ],
  IN_PROGRESS: [
    { to: "COMPLETED", label: "Mark completed" },
    { to: "CANCELLED", label: "Cancel", danger: true },
  ],
};

export function TennisStatusButtons({ orgId, id, status }: { orgId: string; id: string; status: string }) {
  const { result, pending, run } = useAction();
  return (
    <div className="flex flex-wrap items-center gap-2">
      {(NEXT[status] ?? []).map((m) => (
        <Button
          key={m.to}
          size="sm"
          variant={m.danger ? "danger" : "secondary"}
          disabled={pending}
          onClick={() => {
            let reason: string | undefined;
            if (m.to === "CANCELLED") {
              const answer = prompt("Why is the tournament cancelled? Paid entries are refunded in full.");
              if (answer === null) return;
              reason = answer;
            }
            run(() => tennisStatusAction(orgId, id, m.to, reason));
          }}
        >
          {m.label}
        </Button>
      ))}
      <ActionFeedback result={result} />
    </div>
  );
}

// ------------------------------------------------------------------ events

export function EventForm({ orgId, tournamentId }: { orgId: string; tournamentId: string }) {
  const { result, pending, run } = useAction();
  return (
    <form
      className="grid gap-3 md:grid-cols-4"
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const form = e.currentTarget;
        run(
          () =>
            addEventAction(orgId, tournamentId, {
              name: value(f, "name"),
              gender: value(f, "gender") as "OPEN",
              minAge: value(f, "minAge"),
              maxAge: value(f, "maxAge"),
              bestOf: value(f, "bestOf"),
              finalSet: value(f, "finalSet") as "TIEBREAK",
              noAd: f.get("noAd") === "on",
              maxEntries: value(f, "maxEntries"),
            }),
          () => form.reset(),
        );
      }}
    >
      <Field label="Name">
        <input name="name" required maxLength={120} placeholder="Men's singles" className={inputClass} />
      </Field>
      <Field label="Who may enter">
        <select name="gender" defaultValue="OPEN" className={inputClass}>
          <option value="OPEN">Open</option>
          <option value="MALE">Men / boys</option>
          <option value="FEMALE">Women / girls</option>
        </select>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Min age">
          <input name="minAge" type="number" min={5} max={99} defaultValue={18} className={inputClass} />
        </Field>
        <Field label="Max age">
          <input name="maxAge" type="number" min={5} max={99} defaultValue={99} className={inputClass} />
        </Field>
      </div>
      <Field label="Draw size">
        <input name="maxEntries" type="number" min={2} max={128} defaultValue={16} className={inputClass} />
      </Field>
      <Field label="Match length">
        <select name="bestOf" defaultValue="3" className={inputClass}>
          <option value="1">One set</option>
          <option value="3">Best of 3 sets</option>
          <option value="5">Best of 5 sets</option>
        </select>
      </Field>
      <Field label="Final set">
        <select name="finalSet" defaultValue="TIEBREAK" className={inputClass}>
          <option value="TIEBREAK">Tie-break at 6-6</option>
          <option value="ADVANTAGE">Advantage set (no tie-break)</option>
          <option value="MATCH_TIEBREAK">Match tie-break to 10</option>
        </select>
      </Field>
      <label className="flex items-center gap-2 self-end text-sm font-medium">
        <input type="checkbox" name="noAd" className="size-4" />
        No-ad scoring
      </label>
      <div className="flex items-center gap-3 md:col-span-4">
        <Button type="submit" loading={pending}>
          Add event
        </Button>
        <ActionFeedback result={result} />
      </div>
    </form>
  );
}

/** Draw, delete, assign an umpire. */
export function EventOps({
  orgId,
  eventId,
  status,
  players,
  umpires,
  canDraw,
}: {
  orgId: string;
  eventId: string;
  status: string;
  players: number;
  umpires: Array<{ profileId: string; displayName: string }>;
  canDraw: boolean;
}) {
  const { result, pending, run } = useAction();
  const [umpire, setUmpire] = useState("");
  return (
    <div className="flex flex-wrap items-center gap-2">
      {status === "OPEN" && canDraw && (
        <Button
          size="sm"
          disabled={pending || players < 2}
          onClick={() => run(() => eventOpAction(orgId, "draw", eventId))}
        >
          Make the draw
        </Button>
      )}
      {status === "OPEN" && players === 0 && (
        <Button
          size="sm"
          variant="danger"
          disabled={pending}
          onClick={() => {
            if (confirm("Delete this event?")) run(() => eventOpAction(orgId, "delete", eventId));
          }}
        >
          Delete
        </Button>
      )}
      <select
        aria-label="Umpire"
        value={umpire}
        onChange={(e) => {
          setUmpire(e.target.value);
          run(() => eventOpAction(orgId, "umpire", eventId, e.target.value));
        }}
        className={inputClass}
        disabled={pending}
      >
        <option value="">No umpire</option>
        {umpires.map((u) => (
          <option key={u.profileId} value={u.profileId}>
            {u.displayName}
          </option>
        ))}
      </select>
      <ActionFeedback result={result} />
    </div>
  );
}

export function RemoveEntry({ orgId, entryId }: { orgId: string; entryId: string }) {
  const { result, pending, run } = useAction();
  return (
    <span className="inline-flex items-center gap-2">
      <Button
        size="sm"
        variant="danger"
        disabled={pending}
        onClick={() => {
          const reason = prompt("Why is the entry removed? A paid entry is refunded in full.");
          if (reason === null) return;
          run(() => eventOpAction(orgId, "remove-entry", entryId, reason));
        }}
      >
        Remove
      </Button>
      <ActionFeedback result={result} />
    </span>
  );
}

/** Court and time of a match (the order of play). */
export function ScheduleForm({
  orgId,
  matchId,
  court,
  scheduledAt,
}: {
  orgId: string;
  matchId: string;
  court?: string;
  scheduledAt?: string;
}) {
  const { result, pending, run } = useAction();
  return (
    <form
      className="flex flex-wrap items-end gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        run(() => scheduleMatchAction(orgId, matchId, value(f, "court"), value(f, "scheduledAt")));
      }}
    >
      <Field label="Court">
        <input name="court" maxLength={40} defaultValue={court} className={inputClass} />
      </Field>
      <Field label="Time (IST)">
        <input
          name="scheduledAt"
          type="datetime-local"
          defaultValue={scheduledAt ? scheduledAt.slice(0, 16) : undefined}
          className={inputClass}
        />
      </Field>
      <Button type="submit" size="sm" variant="secondary" loading={pending}>
        Save
      </Button>
      <ActionFeedback result={result} />
    </form>
  );
}
