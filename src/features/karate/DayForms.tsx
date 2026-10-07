"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ActionFeedback, inputClass } from "@/components/common/EditorSection";
import { Button } from "@/components/ui";
import type { ActionResult } from "@/lib/actions/result";
import type { DrawView } from "./day";
import {
  addTatamiAction,
  assignTatamiAction,
  checkInAction,
  generateDrawAction,
  lockDrawAction,
  overrideWeighInAction,
  reorderQueueAction,
  swapDrawAction,
  unlockDrawAction,
  weighInAction,
} from "./dayActions";

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

const TIE_BREAKS: Record<string, string> = {
  WINS: "Wins",
  HEAD_TO_HEAD: "Head to head",
  POINT_DIFFERENCE: "Point difference",
  POINTS_FOR: "Points scored",
};

/** Configuration and seeds of a draw; generating replaces a draw under review. */
export function DrawConfigForm({
  orgId,
  categoryId,
  athletes,
}: {
  orgId: string;
  categoryId: string;
  athletes: Array<{ entryId: string; name: string }>;
}) {
  const { result, pending, run } = useAction();
  const [format, setFormat] = useState<"KNOCKOUT" | "ROUND_ROBIN" | "POOLS_KNOCKOUT">("KNOCKOUT");
  const [order, setOrder] = useState(Object.keys(TIE_BREAKS));
  const move = (i: number, d: -1 | 1) =>
    setOrder((o) => {
      const n = [...o];
      const [x] = n.splice(i, 1);
      n.splice(i + d, 0, x!);
      return n;
    });
  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const seeds: Record<string, number> = {};
        for (const a of athletes) {
          const s = String(f.get(`seed-${a.entryId}`) ?? "");
          if (s) seeds[a.entryId] = Number(s);
        }
        run(() =>
          generateDrawAction(orgId, categoryId, {
            format,
            pools: String(f.get("pools") ?? "2"),
            qualifiersPerPool: String(f.get("qualifiers") ?? "2"),
            thirdPlace: f.get("thirdPlace") === "on",
            requireCheckIn: f.get("requireCheckIn") === "on",
            tieBreaks: order as Array<"WINS">,
            seeds,
          }),
        );
      }}
    >
      <fieldset className="flex flex-wrap gap-2">
        <legend className="mb-2 text-sm font-medium">Format</legend>
        {(
          [
            ["KNOCKOUT", "Knockout"],
            ["ROUND_ROBIN", "Round robin"],
            ["POOLS_KNOCKOUT", "Pools → knockout"],
          ] as const
        ).map(([v, l]) => (
          <label
            key={v}
            className={`cursor-pointer rounded-full px-4 py-2 text-sm ring-1 ${format === v ? "bg-ink text-paper ring-ink" : "ring-line"}`}
          >
            <input
              type="radio"
              name="format"
              className="sr-only"
              checked={format === v}
              onChange={() => setFormat(v)}
            />
            {l}
          </label>
        ))}
      </fieldset>
      {format === "POOLS_KNOCKOUT" && (
        <div className="flex flex-wrap gap-3">
          <label className="flex flex-col gap-1 text-sm font-medium">
            Pools
            <input name="pools" type="number" min={2} max={16} defaultValue={2} className={inputClass} />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            Qualify per pool
            <input name="qualifiers" type="number" min={1} max={4} defaultValue={2} className={inputClass} />
          </label>
        </div>
      )}
      {format !== "ROUND_ROBIN" && (
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="thirdPlace" /> Third-place (bronze) bout
        </label>
      )}
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="requireCheckIn" /> Only checked-in athletes (and passed weigh-ins)
      </label>
      {format !== "KNOCKOUT" && (
        <div className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Pool ranking tie-breaks, in order</span>
          <ol className="flex flex-col gap-1">
            {order.map((t, i) => (
              <li key={t} className="flex items-center gap-2">
                <span className="w-5 text-muted tabular-nums">{i + 1}</span>
                <span className="flex-1">{TIE_BREAKS[t]}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={i === 0}
                  onClick={() => move(i, -1)}
                >
                  Up
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={i === order.length - 1}
                  onClick={() => move(i, 1)}
                >
                  Down
                </Button>
              </li>
            ))}
          </ol>
        </div>
      )}
      <div className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Seeds (optional)</span>
        {athletes.map((a) => (
          <label key={a.entryId} className="flex items-center justify-between gap-3">
            {a.name}
            <select name={`seed-${a.entryId}`} className={inputClass}>
              <option value="">Unseeded</option>
              {athletes.map((_, i) => (
                <option key={i} value={i + 1}>
                  Seed {i + 1}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit" loading={pending}>
          Generate the draw
        </Button>
        <ActionFeedback result={result} />
      </div>
    </form>
  );
}

/** The draw under review: pick two athletes to swap them, then lock. */
export function DrawReview({
  orgId,
  categoryId,
  draw,
}: {
  orgId: string;
  categoryId: string;
  draw: DrawView;
}) {
  const { result, pending, run } = useAction();
  const [picked, setPicked] = useState<string | null>(null);
  const pools = [...new Set(draw.places.map((p) => p.pool))].sort((a, b) => a - b);
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted">Select two athletes to swap their places, then lock the draw.</p>
      {pools.map((pool) => (
        <section key={pool} className="flex flex-col gap-1">
          {draw.format !== "KNOCKOUT" && (
            <h3 className="font-semibold">Pool {String.fromCharCode(64 + pool)}</h3>
          )}
          {draw.places
            .filter((p) => p.pool === pool)
            .sort((a, b) => a.position - b.position)
            .map((p) => (
              <button
                key={p.entryId}
                type="button"
                disabled={pending}
                onClick={() => {
                  if (!picked) return setPicked(p.entryId);
                  const a = picked;
                  setPicked(null);
                  if (a !== p.entryId) run(() => swapDrawAction(orgId, categoryId, a, p.entryId));
                }}
                className={`flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm ring-1 ${picked === p.entryId ? "bg-brand-50 ring-brand-700" : "ring-line"}`}
              >
                <span>
                  <span className="mr-2 text-muted tabular-nums">
                    {draw.format === "KNOCKOUT" ? `Bout ${Math.floor(p.position / 2) + 1}` : p.position + 1}
                  </span>
                  {p.name}
                </span>
                <span className="text-muted">
                  {[p.academyName, p.seed ? `seed ${p.seed}` : null].filter(Boolean).join(" · ")}
                </span>
              </button>
            ))}
        </section>
      ))}
      <div className="flex items-center gap-3">
        <Button loading={pending} onClick={() => run(() => lockDrawAction(orgId, categoryId))}>
          Lock the draw
        </Button>
        <ActionFeedback result={result} />
      </div>
    </div>
  );
}

export function UnlockDrawButton({ orgId, categoryId }: { orgId: string; categoryId: string }) {
  const { result, pending, run } = useAction();
  return (
    <span className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        loading={pending}
        onClick={() => {
          const reason = window.prompt("Why is the draw reopened?");
          if (reason?.trim()) run(() => unlockDrawAction(orgId, categoryId, reason));
        }}
      >
        Reopen for review (before any bout)
      </Button>
      <ActionFeedback result={result} />
    </span>
  );
}

export function CheckInRow({
  orgId,
  entryId,
  checkedIn,
  weighed,
  weighResult,
}: {
  orgId: string;
  entryId: string;
  checkedIn: boolean;
  weighed: boolean;
  weighResult?: string;
}) {
  const { result, pending, run } = useAction();
  return (
    <span className="flex flex-wrap items-center gap-2">
      {!checkedIn && (
        <Button size="sm" loading={pending} onClick={() => run(() => checkInAction(orgId, entryId))}>
          Check in
        </Button>
      )}
      {checkedIn && weighed && weighResult !== "PASSED" && (
        <form
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const kg = String(new FormData(e.currentTarget).get("kg") ?? "");
            run(() => weighInAction(orgId, entryId, kg));
          }}
        >
          <input
            name="kg"
            inputMode="decimal"
            placeholder="kg"
            aria-label="Official weight in kg"
            className={`${inputClass} w-24`}
          />
          <Button type="submit" size="sm" variant="secondary" loading={pending}>
            Weigh
          </Button>
        </form>
      )}
      {weighResult === "FAILED" && (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            const reason = window.prompt("Why does the failed weigh-in stand as passed?");
            if (reason?.trim()) run(() => overrideWeighInAction(orgId, entryId, reason));
          }}
        >
          Override
        </Button>
      )}
      <ActionFeedback result={result} />
    </span>
  );
}

export function AddTatamiForm({ orgId, tournamentId }: { orgId: string; tournamentId: string }) {
  const { result, pending, run } = useAction();
  return (
    <form
      className="flex items-center gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        const f = e.currentTarget;
        const name = String(new FormData(f).get("name") ?? "");
        run(() => addTatamiAction(orgId, tournamentId, name));
        f.reset();
      }}
    >
      <input name="name" placeholder="Tatami 1" aria-label="Tatami name" className={inputClass} />
      <Button type="submit" size="sm" variant="secondary" loading={pending}>
        Add tatami
      </Button>
      <ActionFeedback result={result} />
    </form>
  );
}

/** A waiting bout's tatami. */
export function AssignTatami({
  orgId,
  boutId,
  tatamis,
  current,
}: {
  orgId: string;
  boutId: string;
  tatamis: Array<{ id: string; name: string }>;
  current?: string;
}) {
  const { result, pending, run } = useAction();
  return (
    <span className="flex items-center gap-2">
      <select
        aria-label="Tatami"
        defaultValue={current ?? ""}
        disabled={pending}
        onChange={(e) => run(() => assignTatamiAction(orgId, boutId, e.target.value))}
        className={inputClass}
      >
        <option value="">No tatami</option>
        {tatamis.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>
      <ActionFeedback result={result} />
    </span>
  );
}

/** A tatami's waiting bouts, moved up or down (called or fought bouts do not move). */
export function QueueEditor({
  orgId,
  tatamiId,
  bouts,
}: {
  orgId: string;
  tatamiId: string;
  bouts: Array<{ id: string; label: string }>;
}) {
  const { result, pending, run } = useAction();
  const move = (i: number, d: -1 | 1) => {
    const ids = bouts.map((b) => b.id);
    const [x] = ids.splice(i, 1);
    ids.splice(i + d, 0, x!);
    run(() => reorderQueueAction(orgId, tatamiId, ids));
  };
  return (
    <ol className="flex flex-col gap-1 text-sm">
      {bouts.map((b, i) => (
        <li key={b.id} className="flex items-center gap-2">
          <span className="w-5 text-muted tabular-nums">{i + 1}</span>
          <span className="flex-1">{b.label}</span>
          <Button variant="ghost" size="sm" disabled={pending || i === 0} onClick={() => move(i, -1)}>
            Up
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={pending || i === bouts.length - 1}
            onClick={() => move(i, 1)}
          >
            Down
          </Button>
        </li>
      ))}
      <ActionFeedback result={result} />
    </ol>
  );
}
