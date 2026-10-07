"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { inputClass } from "@/components/common/EditorSection";
import { Button, Card } from "@/components/ui";
import type { ActionResult } from "@/lib/actions/result";
import { ballAction, tossAction, undoBallAction } from "./actions";
import type { Scorecard } from "./api";
import { GroundBoard, type Shot } from "./GroundBoard";

type Extra = "NONE" | "WIDE" | "NO_BALL" | "BYE" | "LEG_BYE";
type Wicket = "BOWLED" | "CAUGHT" | "LBW" | "STUMPED" | "HIT_WICKET" | "RUN_OUT";

const EXTRAS: Array<{ value: Extra; label: string }> = [
  { value: "NONE", label: "Off the bat" },
  { value: "WIDE", label: "Wide" },
  { value: "NO_BALL", label: "No-ball" },
  { value: "BYE", label: "Bye" },
  { value: "LEG_BYE", label: "Leg bye" },
];

const WICKETS: Array<{ value: Wicket; label: string }> = [
  { value: "BOWLED", label: "Bowled" },
  { value: "CAUGHT", label: "Caught" },
  { value: "LBW", label: "LBW" },
  { value: "RUN_OUT", label: "Run out" },
  { value: "STUMPED", label: "Stumped" },
  { value: "HIT_WICKET", label: "Hit wicket" },
];

function Message({ result }: { result: ActionResult }) {
  if (!result.error) return null;
  return (
    <p role="alert" className="text-sm text-danger">
      {result.error}
    </p>
  );
}

export function TossForm({ card }: { card: Scorecard }) {
  const router = useRouter();
  const [result, setResult] = useState<ActionResult>({});
  const [pending, start] = useTransition();
  const m = card.match;
  return (
    <form
      className="flex flex-wrap items-end gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        start(async () => {
          const r = await tossAction(m.id, String(f.get("winner")), String(f.get("decision")) as "BAT");
          setResult(r);
          if (r.success) router.refresh();
        });
      }}
    >
      <label className="flex flex-col gap-1 text-sm font-medium">
        Toss won by
        <select name="winner" className={inputClass}>
          <option value={m.home.teamId}>{m.home.name}</option>
          <option value={m.away.teamId}>{m.away.name}</option>
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium">
        Chose to
        <select name="decision" className={inputClass}>
          <option value="BAT">Bat</option>
          <option value="BOWL">Bowl</option>
        </select>
      </label>
      <Button type="submit" loading={pending}>
        Start the match
      </Button>
      <Message result={result} />
    </form>
  );
}

/** Ball-by-ball scoring. Keyed by the ball number, so it resets with the server's suggestions after every ball. */
export function BallPad({ card }: { card: Scorecard }) {
  const router = useRouter();
  const next = card.next!;
  const batting = card.squads[next.battingTeamId] ?? [];
  const fielding = card.squads[next.bowlingTeamId] ?? [];
  const available = batting.filter((p) => !next.dismissed.includes(p.id));
  const newOver = !next.bowlerId && !!next.lastOverBowlerId;
  const [striker, setStriker] = useState(next.strikerId ?? "");
  const [nonStriker, setNonStriker] = useState(next.nonStrikerId ?? "");
  const [bowler, setBowler] = useState(next.bowlerId ?? "");
  const [extra, setExtra] = useState<Extra>("NONE");
  const [wicket, setWicket] = useState<Wicket | "">("");
  const [dismissed, setDismissed] = useState("");
  const [fielder, setFielder] = useState("");
  const [shot, setShot] = useState<Shot | null>(null);
  const [result, setResult] = useState<ActionResult>({});
  // a shot belongs to a ball the batter played: none for a wide, bye or leg bye
  const shotAllowed = extra === "NONE" || extra === "NO_BALL";
  const leftHanded = batting.find((p) => p.id === striker)?.leftHanded ?? false;
  const [pending, start] = useTransition();

  const record = (runs: number) =>
    start(async () => {
      const body = {
        seq: next.seq,
        strikerId: striker,
        nonStrikerId: nonStriker,
        bowlerId: bowler,
        batRuns: extra === "NONE" || extra === "NO_BALL" ? runs : 0,
        extra,
        extraRuns: extra === "WIDE" ? 1 + runs : extra === "NO_BALL" ? 1 : extra === "NONE" ? 0 : runs,
        wicket: wicket || undefined,
        dismissedId: wicket === "RUN_OUT" ? dismissed || undefined : undefined,
        fielderId: wicket && fielder ? fielder : undefined,
        shotX: shot && shotAllowed ? shot.x : undefined,
        shotY: shot && shotAllowed ? shot.y : undefined,
      };
      const r = await ballAction(card.match.id, body);
      setResult(r);
      if (r.success) router.refresh();
    });

  const undo = () =>
    start(async () => {
      const r = await undoBallAction(card.match.id);
      setResult(r);
      if (r.success) router.refresh();
    });

  const select = (
    label: string,
    value: string,
    set: (v: string) => void,
    people: typeof batting,
    disabled?: string,
  ) => (
    <label className="flex flex-col gap-1 text-sm font-medium">
      {label}
      <select value={value} onChange={(e) => set(e.target.value)} className={inputClass}>
        <option value="">Choose…</option>
        {people.map((p) => (
          <option key={p.id} value={p.id} disabled={p.id === disabled}>
            {p.name}
            {p.id === disabled ? " (bowled the last over)" : ""}
          </option>
        ))}
      </select>
    </label>
  );

  const runs = extra === "BYE" || extra === "LEG_BYE" ? [1, 2, 3, 4] : [0, 1, 2, 3, 4, 6];
  return (
    <Card className="flex flex-col gap-4">
      <p className="text-sm font-medium">
        Innings {next.innings} · over {next.over} · ball {next.seq}
        {newOver ? " · new over: choose the bowler" : ""}
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        {select("Striker", striker, setStriker, available)}
        {select("Non-striker", nonStriker, setNonStriker, available)}
        {select("Bowler", bowler, setBowler, fielding, newOver ? next.lastOverBowlerId : undefined)}
      </div>
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-medium">Delivery</legend>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {EXTRAS.map((x) => (
            <label
              key={x.value}
              className={`flex h-12 cursor-pointer items-center justify-center rounded-2xl text-sm font-medium transition-colors select-none has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-brand-600 ${
                extra === x.value ? "bg-ink text-paper" : "bg-surface ring-1 ring-line hover:ring-ink/40"
              }`}
            >
              <input
                type="radio"
                name="extra"
                value={x.value}
                checked={extra === x.value}
                onChange={() => setExtra(x.value)}
                className="sr-only"
              />
              {x.label}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-6 lg:grid-cols-[1fr_minmax(16rem,22rem)] lg:items-start">
        <div className="flex flex-col gap-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="flex flex-col gap-1 text-sm font-medium">
              Wicket
              <select
                value={wicket}
                onChange={(e) => setWicket(e.target.value as Wicket | "")}
                className={inputClass}
              >
                <option value="">No wicket</option>
                {WICKETS.map((w) => (
                  <option key={w.value} value={w.value}>
                    {w.label}
                  </option>
                ))}
              </select>
            </label>
            {wicket === "RUN_OUT" &&
              select(
                "Who is out",
                dismissed,
                setDismissed,
                available.filter((p) => p.id === striker || p.id === nonStriker),
              )}
            {(wicket === "CAUGHT" || wicket === "STUMPED" || wicket === "RUN_OUT") &&
              select(wicket === "STUMPED" ? "Keeper" : "Fielder", fielder, setFielder, fielding)}
          </div>
          <div>
            <p className="mb-2 text-sm font-medium">
              {extra === "WIDE"
                ? "Runs run (the wide adds 1)"
                : extra === "NO_BALL"
                  ? "Runs off the bat (+1 no-ball)"
                  : "Runs"}
            </p>
            {/* big pads: a scorer taps these dozens of times an innings, often one-handed */}
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {runs.map((n) => (
                <button
                  key={n}
                  type="button"
                  disabled={pending || !striker || !nonStriker || !bowler}
                  onClick={() => record(n)}
                  aria-label={`${n} ${n === 1 ? "run" : "runs"}${wicket ? " and wicket" : ""}`}
                  className={`flex h-20 flex-col items-center justify-center rounded-2xl text-3xl font-medium tabular-nums transition-[transform,background-color] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 ${
                    wicket
                      ? "bg-danger text-white hover:opacity-90"
                      : n === 4 || n === 6
                        ? "bg-brand-700 text-white hover:bg-brand-900"
                        : "bg-surface ring-1 ring-line hover:ring-ink/40"
                  }`}
                >
                  {n}
                  {wicket && <span className="text-xs font-semibold tracking-wide">WICKET</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
        <section aria-label="Where the ball went" className="flex flex-col gap-2">
          <p className="text-sm font-medium">Where the ball went</p>
          <GroundBoard value={shot} onChange={setShot} leftHanded={leftHanded} disabled={!shotAllowed} />
        </section>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="secondary" size="lg" disabled={pending || next.seq === 1} onClick={undo}>
          <span aria-hidden="true">↶</span> Undo last ball
        </Button>
        <Message result={result} />
      </div>
    </Card>
  );
}

export function UndoOnly({ matchId }: { matchId: string }) {
  const router = useRouter();
  const [result, setResult] = useState<ActionResult>({});
  const [pending, start] = useTransition();
  return (
    <div className="flex items-center gap-3">
      <Button
        variant="secondary"
        size="sm"
        loading={pending}
        onClick={() =>
          start(async () => {
            const r = await undoBallAction(matchId);
            setResult(r);
            if (r.success) router.refresh();
          })
        }
      >
        Undo the last ball (reopens the match)
      </Button>
      <Message result={result} />
    </div>
  );
}
