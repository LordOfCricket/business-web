"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ActionFeedback, inputClass } from "@/components/common/EditorSection";
import { Button } from "@/components/ui";
import type { ActionResult } from "@/lib/actions/result";
import {
  abandonMatchAction,
  officialsAction,
  removeEntryAction,
  scheduleMatchAction,
  tournamentStatusAction,
} from "./actions";

type Status = "OPEN" | "CLOSED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

const NEXT: Record<string, Array<{ to: Status; label: string; danger?: boolean }>> = {
  DRAFT: [
    { to: "OPEN", label: "Open registration" },
    { to: "CANCELLED", label: "Cancel tournament", danger: true },
  ],
  OPEN: [
    { to: "CLOSED", label: "Close registration" },
    { to: "CANCELLED", label: "Cancel tournament", danger: true },
  ],
  CLOSED: [
    { to: "OPEN", label: "Reopen registration" },
    { to: "IN_PROGRESS", label: "Start tournament" },
    { to: "CANCELLED", label: "Cancel tournament", danger: true },
  ],
  IN_PROGRESS: [
    { to: "COMPLETED", label: "Mark completed" },
    { to: "CANCELLED", label: "Cancel tournament", danger: true },
  ],
};

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

export function StatusButtons({ orgId, id, status }: { orgId: string; id: string; status: string }) {
  const { result, pending, run } = useAction();
  const moves = NEXT[status] ?? [];
  if (moves.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      {moves.map((m) => (
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
            run(() => tournamentStatusAction(orgId, id, m.to, reason));
          }}
        >
          {m.label}
        </Button>
      ))}
      <ActionFeedback result={result} />
    </div>
  );
}

export function RemoveEntryButton({
  orgId,
  tournamentId,
  entryId,
}: {
  orgId: string;
  tournamentId: string;
  entryId: string;
}) {
  const { result, pending, run } = useAction();
  return (
    <span className="inline-flex items-center gap-2">
      <Button
        size="sm"
        variant="ghost"
        disabled={pending}
        onClick={() => {
          const reason = prompt("Reason for removing the team (shown to the captain):");
          if (reason === null) return;
          run(() => removeEntryAction(orgId, tournamentId, entryId, reason));
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
  tournamentId,
  teams,
}: {
  orgId: string;
  tournamentId: string;
  teams: Array<{ id: string; name: string }>;
}) {
  const { result, pending, run } = useAction();
  return (
    <form
      className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_1fr_auto] md:items-end"
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        run(() =>
          scheduleMatchAction(orgId, tournamentId, {
            homeTeamId: String(f.get("home")),
            awayTeamId: String(f.get("away")),
            startsAt: String(f.get("startsAt")),
            stage: String(f.get("stage")),
            ground: String(f.get("ground") ?? ""),
          }),
        );
      }}
    >
      {(["home", "away"] as const).map((side, i) => (
        <label key={side} className="flex flex-col gap-1 text-sm font-medium">
          {side === "home" ? "Team 1" : "Team 2"}
          <select name={side} defaultValue={teams[i]?.id} className={inputClass}>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
      ))}
      <label className="flex flex-col gap-1 text-sm font-medium">
        Starts (IST)
        <input name="startsAt" type="datetime-local" required className={inputClass} />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium">
        Stage
        <input name="stage" defaultValue="League" required maxLength={40} className={inputClass} />
      </label>
      <Button type="submit" loading={pending}>
        Schedule
      </Button>
      <label className="flex flex-col gap-1 text-sm font-medium md:col-span-2">
        Ground (optional)
        <input name="ground" maxLength={150} className={inputClass} />
      </label>
      <div className="md:col-span-3">
        <ActionFeedback result={result} />
      </div>
    </form>
  );
}

export function OfficialsForm({
  orgId,
  tournamentId,
  matchId,
  umpires,
  scorers,
  current,
}: {
  orgId: string;
  tournamentId: string;
  matchId: string;
  umpires: Array<{ profileId: string; displayName: string; city?: string }>;
  scorers: Array<{ profileId: string; displayName: string; city?: string }>;
  current: Array<{ profileId: string; role: string }>;
}) {
  const { result, pending, run } = useAction();
  const currentUmpires = current.filter((o) => o.role === "UMPIRE").map((o) => o.profileId);
  const currentScorer = current.find((o) => o.role === "SCORER")?.profileId ?? "";
  const label = (p: { displayName: string; city?: string }) =>
    `${p.displayName}${p.city ? ` (${p.city})` : ""}`;
  return (
    <form
      className="grid gap-2 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end"
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const ump = [String(f.get("u1") ?? ""), String(f.get("u2") ?? "")].filter(Boolean);
        run(() =>
          officialsAction(orgId, tournamentId, matchId, [...new Set(ump)], String(f.get("scorer") ?? "")),
        );
      }}
    >
      {(["u1", "u2"] as const).map((name, i) => (
        <label key={name} className="flex flex-col gap-1 text-xs font-medium">
          Umpire {i + 1}
          <select name={name} defaultValue={currentUmpires[i] ?? ""} className={inputClass}>
            <option value="">—</option>
            {umpires.map((u) => (
              <option key={u.profileId} value={u.profileId}>
                {label(u)}
              </option>
            ))}
          </select>
        </label>
      ))}
      <label className="flex flex-col gap-1 text-xs font-medium">
        Scorer
        <select name="scorer" defaultValue={currentScorer} className={inputClass}>
          <option value="">— (you score it)</option>
          {scorers.map((s) => (
            <option key={s.profileId} value={s.profileId}>
              {label(s)}
            </option>
          ))}
        </select>
      </label>
      <Button type="submit" size="sm" variant="secondary" loading={pending}>
        Save officials
      </Button>
      <div className="md:col-span-4">
        <ActionFeedback result={result} />
      </div>
    </form>
  );
}

export function AbandonButton({
  orgId,
  tournamentId,
  matchId,
}: {
  orgId: string;
  tournamentId: string;
  matchId: string;
}) {
  const { result, pending, run } = useAction();
  return (
    <span className="inline-flex items-center gap-2">
      <Button
        size="sm"
        variant="ghost"
        disabled={pending}
        onClick={() => {
          const reason = prompt("Why is the match abandoned (e.g. rain)?");
          if (reason === null) return;
          run(() => abandonMatchAction(orgId, tournamentId, matchId, reason));
        }}
      >
        Abandon
      </Button>
      <ActionFeedback result={result} />
    </span>
  );
}
