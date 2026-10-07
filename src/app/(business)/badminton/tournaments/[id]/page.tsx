import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge, Card, EmptyState } from "@/components/ui";
import { customerSite } from "@/features/cricket/api";
import { STATUS_TONE } from "@/features/cricket/constants";
import { requireBusiness } from "@/features/org/context";
import { eventDetail, badmintonTournament, umpires } from "@/features/badminton/api";
import {
  EventForm,
  EventOps,
  RemoveEntry,
  ScheduleForm,
  BadmintonStatusButtons,
  BadmintonTournamentForm,
} from "@/features/badminton/Forms";
import { listVenues } from "@/features/venue/api";

export const metadata: Metadata = { title: "Badminton tournament" };

function ist(iso: string) {
  return new Date(new Date(iso).getTime() + 5.5 * 3600_000).toISOString().slice(0, 16);
}

/** Events, entries, draws, umpires and the order of play of one tournament. */
export default async function BusinessBadmintonTournamentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { session, org, manager } = await requireBusiness();
  const data = await badmintonTournament(org.id, id, session.accessToken);
  if (!data) notFound();
  const t = data.tournament;
  const editable = manager && ["DRAFT", "OPEN", "CLOSED"].includes(t.status);
  const [officials, venues, drawn] = await Promise.all([
    manager ? umpires() : Promise.resolve([]),
    editable ? listVenues(org.id, session.accessToken).catch(() => []) : Promise.resolve([]),
    t.status === "DRAFT"
      ? Promise.resolve([])
      : Promise.all(
          data.events
            .filter((e) => e.status !== "OPEN")
            .map((e) => eventDetail(t.slug, e.id, session.accessToken)),
        ),
  ]);
  const drawById = new Map(drawn.filter((d) => d !== null).map((d) => [d!.event.id, d!]));
  const canDraw = t.status === "CLOSED" || t.status === "IN_PROGRESS";

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={STATUS_TONE[t.status]}>{t.status.replace("_", " ").toLowerCase()}</Badge>
          {t.status !== "DRAFT" && (
            <a
              href={`${customerSite()}${t.path}`}
              target="_blank"
              rel="noopener"
              className="text-sm text-brand-700 hover:underline"
            >
              Public page ↗
            </a>
          )}
        </div>
        <h1 className="display text-4xl leading-[1.05] sm:text-5xl">{t.name}</h1>
        <p className="text-sm text-muted">
          {t.city} · {t.shuttle.toLowerCase()} shuttles · {t.startDate} · {t.events} events · {t.players}{" "}
          players · ₹{t.entryFee} per event
        </p>
        {manager && <BadmintonStatusButtons orgId={org.id} id={t.id} status={t.status} />}
      </header>

      <section aria-labelledby="events" className="flex flex-col gap-3">
        <h2 id="events" className="display text-2xl">
          Events
        </h2>
        {manager && (t.status === "DRAFT" || t.status === "OPEN") && (
          <Card>
            <EventForm orgId={org.id} tournamentId={t.id} />
          </Card>
        )}
        {data.events.length === 0 && <EmptyState title="No events yet" />}
        {data.events.map((e) => {
          const detail = drawById.get(e.id);
          const entries = data.entries.filter((x) => x.eventId === e.id);
          return (
            <Card key={e.id} className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold">
                  {e.name}{" "}
                  <span className="text-sm font-normal text-muted">
                    ({e.minAge}–{e.maxAge} yrs · {e.format}) · {e.players}/{e.maxEntries}
                    {e.umpireName ? ` · umpire ${e.umpireName}` : ""}
                  </span>
                </p>
                <Badge tone={e.status === "COMPLETED" ? "success" : "neutral"}>
                  {e.status.toLowerCase()}
                </Badge>
              </div>
              {manager && (
                <EventOps
                  orgId={org.id}
                  eventId={e.id}
                  status={e.status}
                  players={e.players}
                  umpires={officials}
                  canDraw={canDraw}
                />
              )}
              {e.champion && (
                <p className="text-sm">
                  🏆 {e.champion.name}
                  {e.runnerUp ? ` beat ${e.runnerUp.name}` : ""}
                </p>
              )}
              {detail && detail.matches.length > 0 && (
                <details className="text-sm">
                  <summary className="cursor-pointer text-brand-700">
                    Draw ({detail.matches.length} matches)
                  </summary>
                  <ul className="mt-2 flex flex-col gap-3">
                    {detail.matches.map((m) => (
                      <li key={m.id} className="flex flex-col gap-1 border-t border-line pt-2">
                        <p className="flex flex-wrap items-center gap-2">
                          <span className="text-muted">{m.roundName}:</span>
                          <span>
                            {m.player1?.name ?? "—"} v {m.player2?.name ?? "—"}
                          </span>
                          <span className="tabular-nums">{m.score ?? ""}</span>
                          <Badge tone={m.status === "LIVE" ? "warning" : "neutral"}>
                            {m.status.toLowerCase()}
                          </Badge>
                          {m.status !== "COMPLETED" && m.player1 && m.player2 && (
                            <Link
                              href={`/umpiring/badminton/match/${m.id}`}
                              className="text-brand-700 hover:underline"
                            >
                              Score →
                            </Link>
                          )}
                        </p>
                        {manager && m.status !== "COMPLETED" && (
                          <ScheduleForm
                            orgId={org.id}
                            matchId={m.id}
                            court={m.court}
                            scheduledAt={m.scheduledAt ? ist(m.scheduledAt) : undefined}
                          />
                        )}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
              {entries.length > 0 && (
                <details className="text-sm">
                  <summary className="cursor-pointer text-brand-700">Entries ({entries.length})</summary>
                  <ul className="mt-2 flex flex-col gap-1">
                    {entries.map((x) => (
                      <li key={x.id} className="flex flex-wrap items-center gap-2">
                        <span>
                          {x.playerName}
                          {x.seed != null ? ` (seed ${x.seed})` : ""} ·{" "}
                          {x.status.replace("_", " ").toLowerCase()}
                          {x.reason ? ` (${x.reason})` : ""}
                        </span>
                        {manager &&
                          e.status === "OPEN" &&
                          (x.status === "CONFIRMED" || x.status === "PENDING_PAYMENT") && (
                            <RemoveEntry orgId={org.id} entryId={x.id} />
                          )}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </Card>
          );
        })}
      </section>

      {editable && (
        <section aria-labelledby="edit" className="flex flex-col gap-3">
          <h2 id="edit" className="display text-2xl">
            Tournament details
          </h2>
          <Card>
            <BadmintonTournamentForm
              orgId={org.id}
              venues={venues
                .filter((v) => v.isPublic && v.status === "ACTIVE")
                .map((v) => ({ id: v.id, name: v.name }))}
              initial={{
                id: t.id,
                name: t.name,
                description: data.description,
                rules: data.rules,
                city: t.city,
                shuttle: t.shuttle,
                venueId: data.venueId,
                startDate: t.startDate,
                endDate: t.endDate,
                registrationClosesAt: ist(t.registrationClosesAt),
                entryFee: t.entryFee,
                status: t.status,
              }}
            />
          </Card>
        </section>
      )}
    </div>
  );
}
