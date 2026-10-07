import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge, Card, EmptyState } from "@/components/ui";
import { customerSite, officials, orgTournament } from "@/features/cricket/api";
import { STATUS_TONE } from "@/features/cricket/constants";
import {
  AbandonButton,
  OfficialsForm,
  RemoveEntryButton,
  ScheduleForm,
  StatusButtons,
} from "@/features/cricket/TournamentControls";
import { TournamentForm } from "@/features/cricket/TournamentForm";
import { requireBusiness } from "@/features/org/context";
import { listVenues } from "@/features/venue/api";

export const metadata: Metadata = { title: "Tournament" };

const ENTRY_TONE: Record<string, "neutral" | "warning" | "success" | "danger"> = {
  PENDING_PAYMENT: "warning",
  CONFIRMED: "success",
  CANCELLED: "danger",
  WITHDRAWN: "neutral",
  REMOVED: "danger",
};

/** "2026-10-01T09:30:00Z" → "2026-10-01T15:00" (IST) for datetime-local inputs. */
function ist(iso: string) {
  const d = new Date(new Date(iso).getTime() + 5.5 * 3600_000);
  return d.toISOString().slice(0, 16);
}

const when = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });

export default async function TournamentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { session, org, manager } = await requireBusiness();
  const data = await orgTournament(org.id, id, session.accessToken);
  if (!data) notFound();
  const t = data.tournament;
  const editable = manager && ["DRAFT", "OPEN", "CLOSED"].includes(t.status);
  const [venues, umpires, scorers] = await Promise.all([
    editable ? listVenues(org.id, session.accessToken).catch(() => []) : Promise.resolve([]),
    manager ? officials("umpire") : Promise.resolve([]),
    manager ? officials("scorer") : Promise.resolve([]),
  ]);
  const confirmed = data.entries.filter((e) => e.status === "CONFIRMED");
  const canSchedule =
    manager && (t.status === "CLOSED" || t.status === "IN_PROGRESS") && confirmed.length >= 2;

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
          {t.city} · {t.startDate} – {t.endDate} · {t.overs} overs · {t.teams}/{t.maxTeams} teams · entry ₹
          {t.entryFee}
        </p>
        {manager && <StatusButtons orgId={org.id} id={t.id} status={t.status} />}
      </header>

      <section aria-labelledby="entries" className="flex flex-col gap-3">
        <h2 id="entries" className="display text-2xl">
          Teams
        </h2>
        {data.entries.length === 0 ? (
          <EmptyState title="No entries yet" description="Teams appear here as captains register." />
        ) : (
          <ul className="flex flex-col divide-y divide-line rounded-xl border border-line">
            {data.entries.map((e) => (
              <li key={e.id} className="flex flex-wrap items-center justify-between gap-2 p-3 text-sm">
                <span>
                  <strong>{e.teamName}</strong>{" "}
                  <Badge tone={ENTRY_TONE[e.status]}>{e.status.replace("_", " ").toLowerCase()}</Badge>
                  {e.reason && <span className="text-muted"> · {e.reason}</span>}
                </span>
                {manager && (e.status === "CONFIRMED" || e.status === "PENDING_PAYMENT") && (
                  <RemoveEntryButton orgId={org.id} tournamentId={t.id} entryId={e.id} />
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="fixtures" className="flex flex-col gap-3">
        <h2 id="fixtures" className="display text-2xl">
          Fixtures
        </h2>
        {canSchedule ? (
          <Card>
            <ScheduleForm
              orgId={org.id}
              tournamentId={t.id}
              teams={confirmed.map((e) => ({ id: e.teamId, name: e.teamName }))}
            />
          </Card>
        ) : (
          manager && (
            <p className="text-sm text-muted">
              Close registration with at least two confirmed teams to schedule matches.
            </p>
          )
        )}
        {data.fixtures.length > 0 && (
          <ul className="flex flex-col gap-3">
            {data.fixtures.map((f) => (
              <li key={f.id}>
                <Card className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium">
                      Match {f.number} · {f.stage}: {f.home.name}
                      {f.home.score ? ` ${f.home.score}` : ""} v {f.away.name}
                      {f.away.score ? ` ${f.away.score}` : ""}
                    </p>
                    <span className="text-sm text-muted">{when(f.startsAt)}</span>
                  </div>
                  {f.result && <p className="text-sm font-medium text-brand-700">{f.result}</p>}
                  <div className="flex flex-wrap items-center gap-3">
                    <Link
                      href={`/scoring/${f.id}`}
                      className="rounded-full bg-ink px-3 py-1.5 text-sm font-medium text-paper hover:bg-brand-900"
                    >
                      {f.status === "SCHEDULED"
                        ? "Toss & score"
                        : f.status === "LIVE"
                          ? "Score"
                          : "Scorecard"}
                    </Link>
                    {manager && (f.status === "SCHEDULED" || f.status === "LIVE") && (
                      <AbandonButton orgId={org.id} tournamentId={t.id} matchId={f.id} />
                    )}
                  </div>
                  {manager && (f.status === "SCHEDULED" || f.status === "LIVE") && (
                    <OfficialsForm
                      orgId={org.id}
                      tournamentId={t.id}
                      matchId={f.id}
                      umpires={umpires}
                      scorers={scorers}
                      current={f.officials}
                    />
                  )}
                  {!manager && f.officials.length > 0 && (
                    <p className="text-sm text-muted">{f.officials.map((o) => o.name).join(", ")}</p>
                  )}
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      {editable && (
        <section aria-labelledby="details" className="flex flex-col gap-3">
          <h2 id="details" className="display text-2xl">
            Details
          </h2>
          <Card>
            <TournamentForm
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
                venueId: data.venueId,
                ballType: t.ballType,
                overs: t.overs,
                playersPerSide: data.playersPerSide,
                startDate: t.startDate,
                endDate: t.endDate,
                registrationClosesAt: ist(t.registrationClosesAt),
                entryFee: t.entryFee,
                maxTeams: t.maxTeams,
                status: t.status,
              }}
            />
          </Card>
        </section>
      )}
    </div>
  );
}
