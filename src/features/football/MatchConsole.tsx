"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ActionFeedback, inputClass } from "@/components/common/EditorSection";
import { Badge, Button, Card } from "@/components/ui";
import type { ActionResult } from "@/lib/actions/result";
import type { MatchReport } from "./api";
import { finishMatchAction, recordEventAction, startMatchAction, undoEventAction } from "./actions";

const TYPES = [
  { value: "GOAL", label: "Goal" },
  { value: "PENALTY_GOAL", label: "Penalty scored" },
  { value: "OWN_GOAL", label: "Own goal" },
  { value: "PENALTY_MISSED", label: "Penalty missed" },
  { value: "YELLOW_CARD", label: "Yellow card" },
  { value: "RED_CARD", label: "Red card" },
];

const ICON: Record<string, string> = {
  GOAL: "⚽",
  PENALTY_GOAL: "⚽",
  OWN_GOAL: "⚽",
  PENALTY_MISSED: "✗",
  YELLOW_CARD: "🟨",
  RED_CARD: "🟥",
};

/**
 * The referee's console: kick-off, then one incident at a time (the clock only moves forwards), undo, and the final
 * whistle. The score and both squads come back from the server after every incident.
 */
export function MatchConsole({ report }: { report: MatchReport }) {
  const router = useRouter();
  const [result, setResult] = useState<ActionResult>({});
  const [pending, start] = useTransition();
  const [side, setSide] = useState<"home" | "away">("home");
  const [type, setType] = useState("GOAL");
  const m = report.match;
  const squad = side === "home" ? report.next.homeSquad : report.next.awaySquad;
  const teamId = side === "home" ? m.home.teamId : m.away.teamId;
  const run = (fn: () => Promise<ActionResult>) =>
    start(async () => {
      const r = await fn();
      setResult(r);
      if (r.success) router.refresh();
    });

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{m.stage}</Badge>
          <Badge tone={m.status === "LIVE" ? "warning" : "neutral"}>{m.status.toLowerCase()}</Badge>
          <span className="text-sm text-muted">{report.minutesPerHalf} minutes each half</span>
        </div>
        <p className="text-lg font-semibold">
          {m.home.name} <span className="tabular-nums">{m.home.goals ?? 0}</span>
          <span className="text-muted"> – </span>
          <span className="tabular-nums">{m.away.goals ?? 0}</span> {m.away.name}
        </p>
        {m.result && <p className="text-sm">{m.result}</p>}
        {report.sentOff.length > 0 && (
          <p className="text-sm text-danger">Sent off: {report.sentOff.map((p) => p.name).join(", ")}</p>
        )}
      </Card>

      {m.status === "SCHEDULED" && (
        <Button disabled={pending} onClick={() => run(() => startMatchAction(m.id))}>
          Kick off
        </Button>
      )}

      {m.status === "LIVE" && (
        <Card className="flex flex-col gap-3">
          <form
            className="grid gap-3 md:grid-cols-5"
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              run(() =>
                recordEventAction(m.id, {
                  seq: report.next.seq,
                  minute: String(f.get("minute") ?? ""),
                  teamId,
                  playerId: String(f.get("playerId") ?? ""),
                  type: type as "GOAL",
                  assistPlayerId: String(f.get("assistPlayerId") ?? ""),
                  note: String(f.get("note") ?? ""),
                }),
              );
            }}
          >
            <label className="flex flex-col gap-1 text-sm font-medium">
              Team
              <select
                value={side}
                onChange={(e) => setSide(e.target.value as "home")}
                className={inputClass}
                disabled={pending}
              >
                <option value="home">{m.home.name}</option>
                <option value="away">{m.away.name}</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium">
              Player
              <select name="playerId" required className={inputClass} disabled={pending}>
                {squad.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.jerseyNumber != null ? `#${p.jerseyNumber} ` : ""}
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium">
              What happened
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className={inputClass}
                disabled={pending}
              >
                {TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium">
              Minute
              <input
                name="minute"
                type="number"
                min={report.next.minute}
                max={130}
                required
                defaultValue={report.next.minute}
                className={inputClass}
              />
            </label>
            {type === "GOAL" ? (
              <label className="flex flex-col gap-1 text-sm font-medium">
                Assist (optional)
                <select name="assistPlayerId" className={inputClass} disabled={pending}>
                  <option value="">No assist</option>
                  {squad.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <label className="flex flex-col gap-1 text-sm font-medium">
                Note (optional)
                <input name="note" maxLength={200} className={inputClass} />
              </label>
            )}
            <div className="flex items-center gap-2 md:col-span-5">
              <Button type="submit" size="lg" loading={pending}>
                Record
              </Button>
              <Button
                type="button"
                size="lg"
                variant="secondary"
                disabled={pending || report.events.length === 0}
                onClick={() => run(() => undoEventAction(m.id))}
              >
                Undo last
              </Button>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={pending}
                onClick={() => {
                  if (confirm("Blow the final whistle?")) run(() => finishMatchAction(m.id));
                }}
              >
                Full time
              </Button>
              <ActionFeedback result={result} />
            </div>
          </form>
        </Card>
      )}

      {m.status === "COMPLETED" && (
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="lg"
            variant="secondary"
            disabled={pending}
            onClick={() => run(() => undoEventAction(m.id))}
          >
            Reopen the match
          </Button>
          <ActionFeedback result={result} />
        </div>
      )}

      <Card className="flex flex-col gap-2">
        <h3 className="font-semibold">Match report</h3>
        {report.events.length === 0 ? (
          <p className="text-sm text-muted">Nothing recorded yet.</p>
        ) : (
          <ol className="flex flex-col gap-1 text-sm">
            {report.events.map((e) => (
              <li key={e.id} className="flex items-baseline gap-3">
                <span className="w-10 shrink-0 text-right text-muted tabular-nums">{e.minute}&apos;</span>
                <span aria-hidden="true">{ICON[e.type]}</span>
                <span>
                  <strong>{e.playerName}</strong>
                  <span className="text-muted">
                    {" "}
                    · {TYPES.find((t) => t.value === e.type)?.label ?? e.type}
                    {e.assistName ? ` (assist ${e.assistName})` : ""}
                    {e.note ? ` · ${e.note}` : ""}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        )}
      </Card>
    </div>
  );
}
