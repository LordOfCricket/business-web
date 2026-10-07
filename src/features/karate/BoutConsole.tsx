"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button, Card } from "@/components/ui";
import { DECIDED, type BoutAction, type BoutEventLine, type BoutLive } from "./live";
import { boutActAction, boutEventsAction, boutLiveAction } from "./liveActions";

const PENALTIES = ["CHUI_1", "CHUI_2", "CHUI_3", "HANSOKU_CHUI", "HANSOKU"];
const words = (s: string) => s.replaceAll("_", " ").toLowerCase();

export function clock(ms: number) {
  const s = Math.ceil(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/** Remaining time now: the server's figure, run on locally while the server says the clock runs. */
export function useRemaining(live: BoutLive | null, at: number) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, []);
  if (!live) return 0;
  return live.clock.running ? Math.max(0, live.clock.remainingMs - (now - at)) : live.clock.remainingMs;
}

export function Scoreboard({
  live,
  remaining,
  large,
}: {
  live: BoutLive;
  remaining: number;
  large?: boolean;
}) {
  const side = (a: BoutLive["red"], label: string, bg: string) => (
    <div className={`flex flex-1 flex-col items-center gap-1 p-4 text-white ${bg}`}>
      <span className="text-xs tracking-wide opacity-80">{label}</span>
      <span className="text-center font-semibold">{a?.name ?? "To be decided"}</span>
      <span className={`font-bold tabular-nums ${large ? "text-[10rem] leading-none" : "text-6xl"}`}>
        {a?.score ?? 0}
      </span>
      <span className="text-sm">
        {[a?.senshu ? "Senshu" : null, a?.penalty ? words(a.penalty) : null].filter(Boolean).join(" · ")}
      </span>
    </div>
  );
  const decided = DECIDED.includes(live.status);
  return (
    <Card className="overflow-hidden p-0">
      <div className="flex">
        {side(live.red, "AKA · RED", "bg-[#d32f2f]")}
        {side(live.blue, "AO · BLUE", "bg-[#1565c0]")}
      </div>
      <div className="flex flex-col items-center gap-1 p-4">
        <span className={`font-semibold tabular-nums ${large ? "text-8xl" : "text-5xl"}`}>
          {clock(remaining)}
        </span>
        <span className="text-sm tracking-wide text-muted uppercase">
          {decided
            ? [words(live.status), live.winner ? `${words(live.winner)} wins` : null]
                .filter(Boolean)
                .join(" · ")
            : live.timeUp
              ? "time up"
              : words(live.status)}
        </span>
      </div>
    </Card>
  );
}

/**
 * The live console of a bout: every action gets a client action id and waits in this browser's session storage
 * until the server acknowledges it, so a dropped connection or a reload neither loses nor doubles a score.
 */
export function BoutConsole({ boutId, initial }: { boutId: string; initial: BoutLive }) {
  const key = `los.kumite.pending.${boutId}`;
  const [live, setLive] = useState<BoutLive>(initial);
  const [at, setAt] = useState(() => Date.now());
  const [pending, setPending] = useState<BoutAction[]>([]);
  const [rejected, setRejected] = useState<string[]>([]);
  const [offline, setOffline] = useState(false);
  const [events, setEvents] = useState<BoutEventLine[] | null>(null);
  const busy = useRef(false);
  const queue = useRef<BoutAction[]>([]);
  const remaining = useRemaining(live, at);

  const store = useCallback(
    (list: BoutAction[]) => {
      queue.current = list;
      setPending(list);
      try {
        sessionStorage.setItem(key, JSON.stringify(list));
      } catch {
        // storage unavailable: the in-memory queue still retries until the page closes
      }
    },
    [key],
  );

  const flush = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    try {
      while (queue.current.length > 0) {
        const a = queue.current[0];
        if (!a) break;
        const r = await boutActAction(boutId, a);
        if (r.transient) {
          setOffline(true);
          return;
        }
        store(queue.current.slice(1));
        if (r.live) {
          setLive(r.live);
          setAt(Date.now());
          setOffline(false);
        } else if (r.error) {
          setRejected((x) => [...x, `${words(a.type)}${a.side ? ` ${words(a.side)}` : ""}: ${r.error}`]);
        }
      }
    } finally {
      busy.current = false;
    }
  }, [boutId, store]);

  useEffect(() => {
    let restored = false;
    const t = setInterval(async () => {
      if (!restored) {
        restored = true;
        try {
          const saved = JSON.parse(sessionStorage.getItem(key) ?? "[]") as BoutAction[];
          if (saved.length > 0) store(saved);
        } catch {
          // nothing saved
        }
      }
      if (queue.current.length > 0) {
        await flush();
        return;
      }
      if (busy.current) return;
      const r = await boutLiveAction(boutId);
      if (r.live) {
        setLive(r.live);
        setAt(Date.now());
        setOffline(false);
      } else if (r.transient) {
        setOffline(true);
      }
    }, 1500);
    return () => clearInterval(t);
  }, [boutId, flush, key, store]);

  const send = (a: Omit<BoutAction, "clientActionId">) => {
    store([...queue.current, { ...a, clientActionId: crypto.randomUUID() }]);
    void flush();
  };
  const withReason = (type: string, side: "RED" | "BLUE", prompt: string, required: boolean) => {
    const reason = window.prompt(prompt) ?? undefined;
    if (reason === undefined || (required && !reason.trim())) return;
    send({ type, side, reason: reason.trim() || undefined });
  };
  const correct = async (e: BoutEventLine) => {
    const reason = window.prompt(`Why is #${e.seq} corrected?`);
    if (!reason?.trim()) return;
    send({ type: "CORRECTION", correctsEventId: e.id, reason: reason.trim() });
    setEvents(null);
  };

  const decided = DECIDED.includes(live.status);
  const inPlay = live.status === "LIVE" || live.status === "PAUSED";
  const sidePad = (side: "RED" | "BLUE") => {
    const a = side === "RED" ? live.red : live.blue;
    const next = a?.penalty ? PENALTIES[PENALTIES.indexOf(a.penalty) + 1] : PENALTIES[0];
    return (
      <div className="flex flex-1 flex-col gap-2">
        {[
          [1, "Yuko"],
          [2, "Waza-ari"],
          [3, "Ippon"],
        ].map(([p, n]) => (
          <Button key={p} size="lg" onClick={() => send({ type: "SCORE", side, points: p as number })}>
            +{p} {n} · {words(side)}
          </Button>
        ))}
        {next && (
          <Button variant="secondary" onClick={() => send({ type: "PENALTY", side, penalty: next })}>
            {words(next)} · {words(side)}
          </Button>
        )}
        {a?.senshu && (
          <Button variant="ghost" onClick={() => send({ type: "SENSHU_REVOKE", side })}>
            Withdraw senshu
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {(offline || pending.length > 0) && (
        <p role="status" className="text-sm text-warning">
          {offline
            ? `Offline: ${pending.length} action(s) kept in this browser and sent when the connection returns.`
            : `Sending ${pending.length} action(s)…`}
        </p>
      )}
      {rejected.map((r, i) => (
        <p key={i} role="alert" className="text-sm text-danger">
          Not recorded: {r}
        </p>
      ))}
      <Scoreboard live={live} remaining={remaining} />
      {!live.canControl ? (
        <p className="text-sm">Only the category&apos;s referee or the organiser can run this bout.</p>
      ) : decided ? null : (
        <div className="flex flex-col gap-3">
          {live.status === "READY" && (
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => send({ type: "CALL" })}>Call to the tatami</Button>
              {(["RED", "BLUE"] as const).map((s) => (
                <Button
                  key={s}
                  variant="secondary"
                  onClick={() => withReason("WALKOVER", s, `${words(s)} withdrew? Reason (optional)`, false)}
                >
                  Walkover: {words(s)} withdrew
                </Button>
              ))}
            </div>
          )}
          {live.status === "CALLED" && (
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => send({ type: "START" })}>Hajime · start</Button>
              {(["RED", "BLUE"] as const).map((s) => (
                <Button
                  key={s}
                  variant="secondary"
                  onClick={() =>
                    withReason("NO_SHOW", s, `${words(s)} did not appear? Reason (optional)`, false)
                  }
                >
                  No-show: {words(s)}
                </Button>
              ))}
            </div>
          )}
          {inPlay && (
            <>
              <Button onClick={() => send({ type: live.status === "LIVE" ? "PAUSE" : "RESUME" })}>
                {live.status === "LIVE" ? "Yame · pause" : "Tsuzukete hajime · resume"}
              </Button>
              <div className="flex gap-3">
                {sidePad("RED")}
                {sidePad("BLUE")}
              </div>
              {live.timeUp && live.hanteiNeeded && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm">Level without senshu — hantei:</span>
                  {(["RED", "BLUE"] as const).map((s) => (
                    <Button key={s} onClick={() => send({ type: "DECISION", side: s })}>
                      {words(s)} wins
                    </Button>
                  ))}
                </div>
              )}
              {live.timeUp && !live.hanteiNeeded && (
                <Button onClick={() => send({ type: "FINISH" })}>Time up · confirm the result</Button>
              )}
              <div className="flex flex-wrap gap-2 text-sm">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => setEvents(await boutEventsAction(boutId))}
                >
                  Correct an event
                </Button>
                {(["RED", "BLUE"] as const).map((s) => (
                  <span key={s} className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        withReason("MEDICAL_WITHDRAWAL", s, `Medical withdrawal of ${words(s)}: reason`, true)
                      }
                    >
                      Medical · {words(s)}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        withReason("DISQUALIFY", s, `Disqualify ${words(s)} (shikkaku): reason`, true)
                      }
                    >
                      Shikkaku · {words(s)}
                    </Button>
                  </span>
                ))}
              </div>
              {events && (
                <ul className="flex flex-col gap-1 text-sm">
                  {events
                    .filter((e) => !e.corrected && ["SCORE", "PENALTY", "SENSHU_REVOKE"].includes(e.type))
                    .reverse()
                    .map((e) => (
                      <li key={e.id} className="flex items-center gap-2">
                        <span className="text-muted tabular-nums">
                          #{e.seq} · {clock(e.elapsedMs)}
                        </span>
                        <span>
                          {[
                            words(e.type),
                            e.side ? words(e.side) : null,
                            e.points ? `+${e.points}` : null,
                            e.penalty ? words(e.penalty) : null,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                        <Button variant="ghost" size="sm" onClick={() => correct(e)}>
                          Correct
                        </Button>
                      </li>
                    ))}
                </ul>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
