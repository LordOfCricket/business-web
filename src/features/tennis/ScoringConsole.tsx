"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ActionFeedback } from "@/components/common/EditorSection";
import { Badge, Button, Card } from "@/components/ui";
import type { ActionResult } from "@/lib/actions/result";
import type { MatchDetail } from "./api";
import { concedeAction, pointAction, startMatchAction, undoPointAction } from "./actions";

const KINDS: Array<{ value: string; label: string }> = [
  { value: "RALLY", label: "Rally" },
  { value: "ACE", label: "Ace" },
  { value: "DOUBLE_FAULT", label: "Double fault" },
  { value: "WINNER", label: "Winner" },
  { value: "UNFORCED_ERROR", label: "Unforced error" },
];

/**
 * The umpire's chair: who serves first, then one point at a time (with how it ended), undo, and a retirement or
 * walkover. The score comes back from the server after every point.
 */
export function ScoringConsole({ match: m }: { match: MatchDetail }) {
  const router = useRouter();
  const [result, setResult] = useState<ActionResult>({});
  const [kind, setKind] = useState("RALLY");
  const [pending, start] = useTransition();
  const run = (fn: () => Promise<ActionResult>) =>
    start(async () => {
      const r = await fn();
      setResult(r);
      if (r.success) {
        setKind("RALLY");
        router.refresh();
      }
    });

  const one = m.player1?.name ?? "Player 1";
  const two = m.player2?.name ?? "Player 2";
  const serving = (side: 1 | 2) => m.status === "LIVE" && m.server === side;

  if (m.status === "WAITING") {
    return <p className="text-sm text-muted">Waiting for both players to come through their matches.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{m.roundName}</Badge>
          <Badge tone={m.status === "LIVE" ? "warning" : "neutral"}>{m.status.toLowerCase()}</Badge>
          <span className="text-sm text-muted">{m.format}</span>
        </div>
        <table className="w-full text-sm">
          <caption className="sr-only">Current score</caption>
          <tbody>
            {([1, 2] as const).map((side) => {
              const name = side === 1 ? one : two;
              const games = side === 1 ? m.games1 : m.games2;
              const points = side === 1 ? m.points1 : m.points2;
              return (
                <tr key={side} className="border-t border-line">
                  <th scope="row" className="py-2 text-left font-normal">
                    <span className="flex items-center gap-2">
                      {serving(side) && (
                        <span aria-label="serving" className="size-2 rounded-full bg-brand-600" />
                      )}
                      <span
                        className={
                          m.winnerEntryId === (side === 1 ? m.player1 : m.player2)?.entryId
                            ? "font-semibold"
                            : ""
                        }
                      >
                        {name}
                      </span>
                    </span>
                  </th>
                  {m.sets.map((s, i) => (
                    <td key={i} className="w-10 py-2 text-center tabular-nums">
                      {s.label.startsWith("[")
                        ? ((side === 1 ? s.tiebreak1 : s.tiebreak2) ?? "—")
                        : side === 1
                          ? s.games1
                          : s.games2}
                    </td>
                  ))}
                  {m.status === "LIVE" && (
                    <>
                      <td className="w-10 py-2 text-center tabular-nums">{games ?? 0}</td>
                      <td className="w-12 py-2 text-center text-lg font-semibold tabular-nums">
                        {points ?? "0"}
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
        {m.status === "COMPLETED" && (
          <p className="text-sm">
            Final: <strong className="tabular-nums">{m.score}</strong>
            {m.outcome === "RETIRED" && " (retired)"}
            {m.outcome === "WALKOVER" && " (walkover)"}
          </p>
        )}
        {m.tiebreak && m.status === "LIVE" && <p className="text-sm text-muted">Tie-break.</p>}
      </Card>

      {m.status === "READY" && (
        <Card className="flex flex-col gap-3">
          <h3 className="font-semibold">Who serves first?</h3>
          <div className="flex flex-wrap gap-2">
            <Button disabled={pending} onClick={() => run(() => startMatchAction(m.id, 1))}>
              {one}
            </Button>
            <Button disabled={pending} onClick={() => run(() => startMatchAction(m.id, 2))}>
              {two}
            </Button>
          </div>
        </Card>
      )}

      {m.status === "LIVE" && (
        <Card className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium">The point ended with:</span>
            {KINDS.map((k) => (
              <button
                key={k.value}
                type="button"
                aria-pressed={kind === k.value}
                onClick={() => setKind(k.value)}
                className={`h-10 rounded-full px-4 text-sm ${
                  kind === k.value ? "bg-ink text-paper" : "ring-1 ring-line hover:ring-ink/40"
                }`}
              >
                {k.label}
              </button>
            ))}
          </div>
          {/* one big pad per side, always side by side: the umpire taps the side that won the point */}
          <div className="grid grid-cols-2 gap-2">
            {([1, 2] as const).map((side) => (
              <button
                key={side}
                type="button"
                disabled={pending}
                onClick={() => run(() => pointAction(m.id, m.nextSeq, side, kind))}
                className="flex min-h-24 flex-col items-center justify-center gap-1 rounded-2xl bg-ink px-3 text-center text-base font-medium text-paper transition-[transform,background-color] hover:bg-brand-900 active:scale-[0.98] disabled:opacity-40"
              >
                Point to {side === 1 ? one : two}
                {serving(side) ? " (serving)" : ""}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              size="lg"
              variant="secondary"
              disabled={pending}
              onClick={() => run(() => undoPointAction(m.id))}
            >
              Undo last point
            </Button>
            {([1, 2] as const).map((side) => (
              <Button
                key={side}
                size="sm"
                variant="danger"
                disabled={pending}
                onClick={() => {
                  const reason = prompt(`${side === 1 ? one : two} retires. Reason (optional):`);
                  if (reason === null) return;
                  run(() => concedeAction(m.id, side, reason));
                }}
              >
                {side === 1 ? one : two} retires
              </Button>
            ))}
          </div>
        </Card>
      )}

      {m.status === "READY" && (
        <div className="flex flex-wrap gap-2">
          {([1, 2] as const).map((side) => (
            <Button
              key={side}
              size="sm"
              variant="secondary"
              disabled={pending}
              onClick={() => {
                const reason = prompt(
                  `${side === 1 ? one : two} does not play (walkover). Reason (optional):`,
                );
                if (reason === null) return;
                run(() => concedeAction(m.id, side, reason));
              }}
            >
              Walkover against {side === 1 ? one : two}
            </Button>
          ))}
        </div>
      )}

      {m.status === "COMPLETED" && m.outcome !== "BYE" && (
        <Button
          size="lg"
          variant="secondary"
          disabled={pending}
          onClick={() => run(() => undoPointAction(m.id))}
        >
          Take the result back
        </Button>
      )}
      <ActionFeedback result={result} />
    </div>
  );
}
