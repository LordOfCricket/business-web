import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge, Card } from "@/components/ui";
import { AddTatamiForm, CheckInRow, QueueEditor } from "@/features/karate/DayForms";
import { karateTournament } from "@/features/karate/api";
import { checkInList, operations } from "@/features/karate/day";
import { requireBusiness } from "@/features/org/context";

export const metadata: Metadata = { title: "Tournament day" };
export const dynamic = "force-dynamic";

/** Tournament day (K4): figures and alerts, categories, tatamis with their queues, check-in and weigh-in. */
export default async function TournamentDayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { session, org, manager } = await requireBusiness();
  if (!manager) notFound();
  const data = await karateTournament(org.id, id, session.accessToken);
  if (!data) notFound();
  const [ops, lines] = await Promise.all([
    operations(org.id, id, session.accessToken),
    checkInList(org.id, id, session.accessToken),
  ]);
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <Link href={`/karate/tournaments/${id}`} className="text-sm text-brand-700 hover:underline">
          ← {data.tournament.name}
        </Link>
        <h1 className="display text-4xl">Tournament day</h1>
      </header>
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["Athletes", ops.confirmed],
          ["Checked in", ops.checkedIn],
          ["Weigh-in passed", ops.weighPassed],
          ["Weigh-in failed", ops.weighFailed],
        ].map(([l, v]) => (
          <Card key={l} className="flex flex-col">
            <span className="text-sm text-muted">{l}</span>
            <span className="text-3xl font-semibold tabular-nums">{v}</span>
          </Card>
        ))}
      </section>
      {ops.alerts.length > 0 && (
        <ul className="flex flex-col gap-1 text-sm text-warning" aria-label="Alerts">
          {ops.alerts.map((a) => (
            <li key={a}>⚠ {a}</li>
          ))}
        </ul>
      )}
      <section className="flex flex-col gap-3">
        <h2 className="display text-2xl">Categories</h2>
        <table className="text-sm">
          <thead className="text-left text-muted">
            <tr>
              <th className="py-1">Category</th>
              <th>Status</th>
              <th>Draw</th>
              <th>Bouts decided</th>
              <th>Live</th>
              <th>No-shows</th>
            </tr>
          </thead>
          <tbody>
            {ops.categories.map((c) => (
              <tr key={c.id} className="border-t border-line">
                <td className="py-1">
                  {c.discipline === "KUMITE" ? (
                    <Link
                      href={`/karate/tournaments/${id}/draw/${c.id}`}
                      className="text-brand-700 hover:underline"
                    >
                      {c.name}
                    </Link>
                  ) : (
                    c.name
                  )}
                </td>
                <td>{c.status.toLowerCase()}</td>
                <td>{c.drawStatus?.toLowerCase().replace("_", " ") ?? "—"}</td>
                <td className="tabular-nums">
                  {c.decided}/{c.bouts}
                </td>
                <td className="tabular-nums">{c.live}</td>
                <td className="tabular-nums">{c.noShows}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section className="flex flex-col gap-3">
        <h2 className="display text-2xl">Tatamis</h2>
        <AddTatamiForm orgId={org.id} tournamentId={id} />
        <div className="grid gap-3 md:grid-cols-2">
          {ops.tatamis.map((t) => (
            <Card key={t.id} className="flex flex-col gap-2">
              <h3 className="font-semibold">{t.name}</h3>
              {t.current ? (
                <Link
                  href={`/karate/bouts/${t.current.id}`}
                  className="text-sm text-brand-700 hover:underline"
                >
                  Now: {t.current.red?.name ?? "?"} v {t.current.blue?.name ?? "?"} ·{" "}
                  {t.current.status.toLowerCase()} →
                </Link>
              ) : (
                <p className="text-sm text-muted">Nothing on the tatami now.</p>
              )}
              <QueueEditor
                orgId={org.id}
                tatamiId={t.id}
                bouts={t.queue.map((b) => ({
                  id: b.id,
                  label: `Bout ${b.boutNumber} · ${b.roundName} · ${b.red?.name ?? "?"} v ${b.blue?.name ?? "?"}`,
                }))}
              />
            </Card>
          ))}
        </div>
      </section>
      <section className="flex flex-col gap-3">
        <h2 className="display text-2xl">Check-in and weigh-in</h2>
        <ul className="flex flex-col divide-y divide-line text-sm">
          {lines.map((l) => (
            <li key={l.entryId} className="flex flex-wrap items-center justify-between gap-2 py-2">
              <span>
                <span className="font-medium">{l.athleteName}</span> · {l.categoryName}
                {l.weighedKg != null && ` · ${l.weighedKg} kg`}
                {l.weighResult && (
                  <Badge tone={l.weighResult === "PASSED" ? "success" : "danger"}>
                    {l.weighResult.toLowerCase()}
                  </Badge>
                )}
                {l.overrideReason && <span className="text-muted"> · override: {l.overrideReason}</span>}
              </span>
              <CheckInRow
                orgId={org.id}
                entryId={l.entryId}
                checkedIn={l.checkedIn}
                weighed={l.minWeight != null || l.maxWeight != null}
                weighResult={l.weighResult}
              />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
