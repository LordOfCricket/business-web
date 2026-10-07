import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge, Card, EmptyState } from "@/components/ui";
import { customerSite } from "@/features/cricket/api";
import { STATUS_TONE } from "@/features/cricket/constants";
import { referees, tournament } from "@/features/football/api";
import {
  AbandonButton,
  GenerateFixtures,
  OfficialsForm,
  RemoveEntryButton,
  ScheduleForm,
  StatusButtons,
} from "@/features/football/Controls";
import { TournamentForm } from "@/features/football/TournamentForm";
import { requireBusiness } from "@/features/org/context";
import { listVenues } from "@/features/venue/api";

export const metadata: Metadata = { title: "Football tournament" };

function ist(iso: string) {
  return new Date(new Date(iso).getTime() + 5.5 * 3600_000).toISOString().slice(0, 16);
}

const when = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

/** Entries, fixtures, officials and the order of play of one tournament. */
export default async function BusinessFootballTournamentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { session, org, manager } = await requireBusiness();
  const data = await tournament(org.id, id, session.accessToken);
  if (!data) notFound();
  const t = data.tournament;
  const editable = manager && ["DRAFT", "OPEN", "CLOSED"].includes(t.status);
  const [officials, venues] = await Promise.all([
    manager ? referees() : Promise.resolve([]),
    editable ? listVenues(org.id, session.accessToken).catch(() => []) : Promise.resolve([]),
  ]);
  const confirmed = data.entries.filter((e) => e.status === "CONFIRMED").length;
  const canDraw = manager && (t.status === "CLOSED" || t.status === "IN_PROGRESS");

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
          {t.city} · {t.surface.toLowerCase()} · {t.startDate} · {data.playersPerSide}-a-side ·{" "}
          {data.minutesPerHalf} minutes each half · {t.teams}/{t.maxTeams} teams · ₹{t.entryFee}
        </p>
        {manager && <StatusButtons orgId={org.id} id={t.id} status={t.status} />}
      </header>

      <section aria-labelledby="entries" className="flex flex-col gap-3">
        <h2 id="entries" className="display text-2xl">
          Entries
        </h2>
        {data.entries.length === 0 ? (
          <EmptyState title="No entries yet" />
        ) : (
          <ul className="flex flex-col gap-2">
            {data.entries.map((e) => (
              <li key={e.id}>
                <Card className="flex flex-wrap items-center justify-between gap-3 text-sm">
                  <span>
                    <strong>{e.teamName}</strong> · {e.status.replace("_", " ").toLowerCase()}
                    {e.reason ? ` (${e.reason})` : ""}
                  </span>
                  {manager && (e.status === "CONFIRMED" || e.status === "PENDING_PAYMENT") && (
                    <RemoveEntryButton orgId={org.id} entryId={e.id} />
                  )}
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="fixtures" className="flex flex-col gap-3">
        <h2 id="fixtures" className="display text-2xl">
          Fixtures
        </h2>
        {canDraw && data.fixtures.length === 0 && (
          <GenerateFixtures orgId={org.id} id={t.id} teams={confirmed} />
        )}
        {data.fixtures.length === 0 ? (
          <EmptyState
            title="No fixtures yet"
            description="Close registration, then draw up the league in one step."
          />
        ) : (
          <ul className="flex flex-col gap-3">
            {data.fixtures.map((f) => (
              <li key={f.id}>
                <Card className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium">
                      {f.stage}: {f.home.name}{" "}
                      <span className="tabular-nums">
                        {f.home.goals == null || f.away.goals == null
                          ? "v"
                          : `${f.home.goals}-${f.away.goals}`}
                      </span>{" "}
                      {f.away.name}
                      <span className="text-sm font-normal text-muted">
                        {" "}
                        · {when(f.startsAt)}
                        {f.pitch ? ` · ${f.pitch}` : ""}
                        {f.result ? ` · ${f.result}` : ""}
                      </span>
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge tone={f.status === "LIVE" ? "warning" : "neutral"}>
                        {f.status.toLowerCase()}
                      </Badge>
                      {f.status !== "COMPLETED" && f.status !== "ABANDONED" && (
                        <Link
                          href={`/refereeing/football/match/${f.id}`}
                          className="text-sm font-medium text-brand-700 hover:underline"
                        >
                          Record →
                        </Link>
                      )}
                    </div>
                  </div>
                  {manager && f.status !== "COMPLETED" && f.status !== "ABANDONED" && (
                    <>
                      <ScheduleForm
                        orgId={org.id}
                        matchId={f.id}
                        stage={f.stage}
                        startsAt={ist(f.startsAt)}
                        pitch={f.pitch}
                      />
                      <details className="text-sm">
                        <summary className="cursor-pointer font-medium text-brand-700">Officials</summary>
                        <div className="mt-2">
                          <OfficialsForm
                            orgId={org.id}
                            matchId={f.id}
                            referees={officials}
                            current={f.officials}
                          />
                        </div>
                      </details>
                      <AbandonButton orgId={org.id} matchId={f.id} />
                    </>
                  )}
                  {f.officials.length > 0 && (
                    <p className="text-sm text-muted">
                      {f.officials.map((o) => `${o.name} (${o.role.toLowerCase()})`).join(", ")}
                    </p>
                  )}
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      {editable && (
        <section aria-labelledby="edit" className="flex flex-col gap-3">
          <h2 id="edit" className="display text-2xl">
            Tournament details
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
                surface: t.surface,
                venueId: data.venueId,
                minutesPerHalf: data.minutesPerHalf,
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
