"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ActionFeedback, inputClass } from "@/components/common/EditorSection";
import { Button } from "@/components/ui";
import type { ActionResult } from "@/lib/actions/result";
import type { Official } from "./api";
import {
  abandonAction,
  generateFixturesAction,
  officialsAction,
  removeEntryAction,
  rescheduleAction,
  statusAction,
} from "./actions";

function useAction() {
  const router = useRouter();
  const [result, setResult] = useState<ActionResult>({});
  const [pending, start] = useTransition();
  const run = (fn: () => Promise<ActionResult>) =>
    start(async () => {
      const r = await fn();
      setResult(r);
      if (r.success) router.refresh();
    });
  return { result, pending, run };
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

export function StatusButtons({ orgId, id, status }: { orgId: string; id: string; status: string }) {
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
            run(() => statusAction(orgId, id, m.to, reason));
          }}
        >
          {m.label}
        </Button>
      ))}
      <ActionFeedback result={result} />
    </div>
  );
}

/** Draws up the league: every confirmed team plays every other once. */
export function GenerateFixtures({ orgId, id, teams }: { orgId: string; id: string; teams: number }) {
  const { result, pending, run } = useAction();
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        size="sm"
        disabled={pending || teams < 2}
        onClick={() => {
          if (confirm(`Draw up the fixtures for ${teams} teams? Each team plays every other once.`)) {
            run(() => generateFixturesAction(orgId, id));
          }
        }}
      >
        Draw up the fixtures
      </Button>
      <ActionFeedback result={result} />
    </div>
  );
}

export function RemoveEntryButton({ orgId, entryId }: { orgId: string; entryId: string }) {
  const { result, pending, run } = useAction();
  return (
    <span className="inline-flex items-center gap-2">
      <Button
        size="sm"
        variant="danger"
        disabled={pending}
        onClick={() => {
          const reason = prompt("Why is the team removed? A paid entry is refunded in full.");
          if (reason === null) return;
          run(() => removeEntryAction(orgId, entryId, reason));
        }}
      >
        Remove
      </Button>
      <ActionFeedback result={result} />
    </span>
  );
}

export function ScheduleForm({
  orgId,
  matchId,
  stage,
  startsAt,
  pitch,
}: {
  orgId: string;
  matchId: string;
  stage: string;
  /** yyyy-MM-ddTHH:mm in IST */
  startsAt: string;
  pitch?: string;
}) {
  const { result, pending, run } = useAction();
  return (
    <form
      className="flex flex-wrap items-end gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        run(() =>
          rescheduleAction(
            orgId,
            matchId,
            String(f.get("stage") ?? ""),
            String(f.get("startsAt") ?? ""),
            String(f.get("pitch") ?? ""),
          ),
        );
      }}
    >
      <label className="flex flex-col gap-1 text-sm font-medium">
        Stage
        <input name="stage" maxLength={40} defaultValue={stage} className={inputClass} />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium">
        Kick-off (IST)
        <input name="startsAt" type="datetime-local" defaultValue={startsAt} className={inputClass} />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium">
        Pitch
        <input name="pitch" maxLength={120} defaultValue={pitch} className={inputClass} />
      </label>
      <Button type="submit" size="sm" variant="secondary" loading={pending}>
        Save
      </Button>
      <ActionFeedback result={result} />
    </form>
  );
}

/** The referee and up to two assistants, picked from the public football referees. */
export function OfficialsForm({
  orgId,
  matchId,
  referees,
  current,
}: {
  orgId: string;
  matchId: string;
  referees: Official[];
  current: Array<{ profileId: string; role: string }>;
}) {
  const { result, pending, run } = useAction();
  const [referee, setReferee] = useState(current.find((o) => o.role === "REFEREE")?.profileId ?? "");
  const [assistants, setAssistants] = useState<string[]>(
    current.filter((o) => o.role === "ASSISTANT").map((o) => o.profileId),
  );
  const toggle = (id: string) =>
    setAssistants((list) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id].slice(0, 2)));
  if (referees.length === 0) {
    return <p className="text-sm text-muted">No public football referees are listed yet.</p>;
  }
  return (
    <div className="flex flex-col gap-2">
      <label className="flex flex-col gap-1 text-sm font-medium">
        Referee
        <select
          value={referee}
          onChange={(e) => setReferee(e.target.value)}
          className={inputClass}
          disabled={pending}
        >
          <option value="">No referee yet</option>
          {referees.map((r) => (
            <option key={r.profileId} value={r.profileId}>
              {r.displayName}
              {r.city ? ` · ${r.city}` : ""}
            </option>
          ))}
        </select>
      </label>
      <fieldset className="flex flex-wrap items-center gap-2 text-sm">
        <legend className="font-medium">Assistants (up to two)</legend>
        {referees
          .filter((r) => r.profileId !== referee)
          .map((r) => (
            <label key={r.profileId} className="inline-flex items-center gap-1.5">
              <input
                type="checkbox"
                className="size-4"
                checked={assistants.includes(r.profileId)}
                onChange={() => toggle(r.profileId)}
                disabled={pending}
              />
              {r.displayName}
            </label>
          ))}
      </fieldset>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="secondary"
          loading={pending}
          onClick={() => run(() => officialsAction(orgId, matchId, referee, assistants))}
        >
          Save officials
        </Button>
        <ActionFeedback result={result} />
      </div>
    </div>
  );
}

export function AbandonButton({ orgId, matchId }: { orgId: string; matchId: string }) {
  const { result, pending, run } = useAction();
  return (
    <span className="inline-flex items-center gap-2">
      <Button
        size="sm"
        variant="danger"
        disabled={pending}
        onClick={() => {
          const reason = prompt("Why is the match abandoned?");
          if (reason === null) return;
          run(() => abandonAction(orgId, matchId, reason));
        }}
      >
        Abandon
      </Button>
      <ActionFeedback result={result} />
    </span>
  );
}
