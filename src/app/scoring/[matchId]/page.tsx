import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Card } from "@/components/ui";
import { customerSite, scorecard } from "@/features/cricket/api";
import { BallPad, TossForm, UndoOnly } from "@/features/cricket/ScoringConsole";
import { getSession } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Score a match" };
export const dynamic = "force-dynamic";

/** Live scoring console: toss, ball by ball, undo; the public scorecard updates as balls are recorded. */
export default async function ScoreMatchPage({ params }: { params: Promise<{ matchId: string }> }) {
  const { matchId } = await params;
  const session = await getSession();
  if (!session) redirect(`/login?next=/scoring/${matchId}`);
  const card = await scorecard(matchId, session.accessToken);
  if (!card) notFound();
  const m = card.match;
  const current = card.innings.at(-1);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <p className="text-sm text-muted">
          {card.tournament.name} · Match {m.number} · {m.stage} · {m.overs} overs
        </p>
        <h1 className="display text-4xl leading-[1.05] sm:text-5xl">
          {m.home.name} v {m.away.name}
        </h1>
        <a
          href={`${customerSite()}${card.tournament.path}/matches/${m.id}`}
          target="_blank"
          rel="noopener"
          className="self-start text-sm text-brand-700 hover:underline"
        >
          Public scorecard ↗
        </a>
      </header>

      {!card.canScore ? (
        <p className="text-sm">
          Only the match&apos;s scorer, its umpires or the organiser can score this match.
        </p>
      ) : (
        <>
          {card.innings.length > 0 && (
            <Card className="flex flex-col gap-2">
              {card.innings.map((inn) => (
                <p key={inn.number} className="flex justify-between gap-3 text-lg">
                  <span>{inn.battingTeam}</span>
                  <span className="font-semibold tabular-nums">
                    {inn.runs}/{inn.wickets}{" "}
                    <span className="text-sm font-normal text-muted">({inn.overs})</span>
                  </span>
                </p>
              ))}
              {current?.target && !current.closed && (
                <p className="text-sm">
                  Target {current.target} · needs {Math.max(0, current.target - current.runs)}
                </p>
              )}
              {current && current.thisOver.length > 0 && (
                <p className="text-sm text-muted">This over: {current.thisOver.join("  ")}</p>
              )}
              {card.toss && <p className="text-sm text-muted">{card.toss}</p>}
            </Card>
          )}
          {m.status === "SCHEDULED" && <TossForm card={card} />}
          {m.status === "LIVE" && card.next && (
            <BallPad key={card.next.seq + "-" + card.next.innings} card={card} />
          )}
          {m.status === "COMPLETED" && (
            <Card className="flex flex-col gap-3">
              <p className="text-lg font-semibold text-brand-700">{m.result}</p>
              <UndoOnly matchId={m.id} />
            </Card>
          )}
          {m.status === "ABANDONED" && <p className="text-sm">{m.result}</p>}
          {current && (
            <section className="grid gap-4 md:grid-cols-2">
              <Card className="flex flex-col gap-1 text-sm">
                <h2 className="font-semibold">Batting — {current.battingTeam}</h2>
                {current.batting.map((b) => (
                  <p key={b.playerId} className="flex justify-between gap-2">
                    <span>
                      {b.name} <span className="text-muted">{b.notOut ? "" : `· ${b.howOut}`}</span>
                    </span>
                    <span className="tabular-nums">
                      {b.runs} ({b.balls})
                    </span>
                  </p>
                ))}
              </Card>
              <Card className="flex flex-col gap-1 text-sm">
                <h2 className="font-semibold">Bowling</h2>
                {current.bowling.map((b) => (
                  <p key={b.playerId} className="flex justify-between gap-2">
                    <span>{b.name}</span>
                    <span className="tabular-nums">
                      {b.overs}-{b.runs}-{b.wickets}
                    </span>
                  </p>
                ))}
              </Card>
            </section>
          )}
        </>
      )}
    </div>
  );
}
