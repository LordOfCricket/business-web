import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Badge, Card, EmptyState } from "@/components/ui";
import { customerSite } from "@/features/cricket/api";
import { STATUS_TONE } from "@/features/cricket/constants";
import { academy, categoryDetail, karateTournament, ladder, referees } from "@/features/karate/api";
import {
  BoutResultForm,
  CategoryForm,
  CategoryOps,
  KarateStatusButtons,
  KarateTournamentForm,
  KataScoreForm,
  RemoveEntry,
} from "@/features/karate/Forms";
import { requireBusiness } from "@/features/org/context";
import { listVenues } from "@/features/venue/api";

export const metadata: Metadata = { title: "Karate tournament" };

function ist(iso: string) {
  return new Date(new Date(iso).getTime() + 5.5 * 3600_000).toISOString().slice(0, 16);
}

/** Categories, entries, draws, referees, Kumite results and Kata scores of one tournament. */
export default async function KarateTournamentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { session, org, manager } = await requireBusiness();
  const data = await karateTournament(org.id, id, session.accessToken);
  if (!data) notFound();
  const t = data.tournament;
  const editable = manager && ["DRAFT", "OPEN", "CLOSED"].includes(t.status);
  // the academy's ladder for new categories; each existing category keeps its own system
  const own = await academy(org.id, session.accessToken).catch(() => null);
  const systemIds = [...new Set(data.categories.map((c) => c.rankSystemId).filter((x): x is string => !!x))];
  const ladders = new Map(await Promise.all(systemIds.map(async (sid) => [sid, await ladder(sid)] as const)));
  const [beltList, refs, venues, details] = await Promise.all([
    ladder(own?.rankSystemId),
    manager ? referees() : Promise.resolve([]),
    editable ? listVenues(org.id, session.accessToken).catch(() => []) : Promise.resolve([]),
    t.status === "DRAFT"
      ? Promise.resolve([])
      : Promise.all(
          data.categories
            .filter((c) => c.status !== "OPEN")
            .map((c) => categoryDetail(t.slug, c.id, session.accessToken)),
        ),
  ]);
  const detailById = new Map(details.filter((d) => d !== null).map((d) => [d!.category.id, d!]));
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
          {t.city} · {t.startDate} · {t.categories} categories · {t.athletes} athletes · ₹{t.entryFee} per
          category
        </p>
        {manager && <KarateStatusButtons orgId={org.id} id={t.id} status={t.status} />}
        {manager && (t.status === "CLOSED" || t.status === "IN_PROGRESS") && (
          <Link
            href={`/karate/tournaments/${t.id}/day`}
            className="self-start text-sm font-medium text-brand-700 hover:underline"
          >
            Tournament day: check-in, weigh-in, tatamis →
          </Link>
        )}
      </header>

      <section aria-labelledby="categories" className="flex flex-col gap-3">
        <h2 id="categories" className="display text-2xl">
          Categories
        </h2>
        {manager && (t.status === "DRAFT" || t.status === "OPEN") && (
          <Card>
            <CategoryForm orgId={org.id} tournamentId={t.id} belts={beltList} />
          </Card>
        )}
        {data.categories.length === 0 && <EmptyState title="No categories yet" />}
        {data.categories.map((c) => {
          const d = detailById.get(c.id);
          const entries = data.entries.filter((e) => e.categoryId === c.id);
          return (
            <Card key={c.id} className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold">
                  {c.discipline === "KATA" ? "Kata" : "Kumite"} · {c.name}{" "}
                  <span className="text-sm font-normal text-muted">
                    ({c.minAge}–{c.maxAge} yrs, {c.minBelt.label}–{c.maxBelt.label}
                    {c.maxWeight != null ? `, under ${c.maxWeight} kg` : ""}) · {c.athletes}/{c.maxEntries}
                    {c.refereeName ? ` · referee ${c.refereeName}` : ""}
                  </span>
                </p>
                <Badge tone={c.status === "COMPLETED" ? "success" : "neutral"}>
                  {c.status.toLowerCase()}
                </Badge>
              </div>
              {manager && <CategoryOps orgId={org.id} category={c} referees={refs} canDraw={canDraw} />}
              {manager && canDraw && c.discipline === "KUMITE" && (
                <Link
                  href={`/karate/tournaments/${t.id}/draw/${c.id}`}
                  className="text-sm text-brand-700 hover:underline"
                >
                  {c.status === "OPEN" ? "Draw builder: formats, seeds, review →" : "Draw details →"}
                </Link>
              )}
              {manager && c.status === "OPEN" && (
                <details className="text-sm">
                  <summary className="cursor-pointer text-brand-700">Edit category</summary>
                  <div className="mt-3">
                    <CategoryForm
                      orgId={org.id}
                      tournamentId={t.id}
                      belts={(c.rankSystemId && ladders.get(c.rankSystemId)) || beltList}
                      category={c}
                    />
                  </div>
                </details>
              )}
              {c.podium.length > 0 && (
                <p className="text-sm">{c.podium.map((p) => `${p.place}. ${p.athleteName}`).join(" · ")}</p>
              )}
              {entries.length > 0 && (
                <details className="text-sm">
                  <summary className="cursor-pointer text-brand-700">Entries ({entries.length})</summary>
                  <ul className="mt-2 flex flex-col gap-1">
                    {entries.map((e) => (
                      <li key={e.id} className="flex flex-wrap items-center gap-2">
                        <span>
                          {e.athleteName} · {e.belt.label}
                          {e.beltVerified ? " ✓" : ""} · {e.status.replace("_", " ").toLowerCase()}
                          {e.reason ? ` (${e.reason})` : ""}
                        </span>
                        {manager &&
                          c.status === "OPEN" &&
                          (e.status === "CONFIRMED" || e.status === "PENDING_PAYMENT") && (
                            <RemoveEntry orgId={org.id} entryId={e.id} />
                          )}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
              {d && c.discipline === "KUMITE" && (
                <ul className="flex flex-col gap-2 text-sm">
                  {d.bouts
                    .filter((b) => b.decision !== "BYE")
                    .map((b) => (
                      <li key={b.id} className="flex flex-col gap-1 rounded-lg border border-line p-2">
                        <span>
                          <strong>{b.roundName}</strong>: {b.red?.name ?? "—"} v {b.blue?.name ?? "—"}
                          {b.status === "COMPLETED"
                            ? ` · ${b.redScore}–${b.blueScore} (${b.decision?.toLowerCase()})`
                            : ""}
                        </span>
                        {manager && ["READY", "CALLED", "LIVE", "PAUSED"].includes(b.status) && (
                          <Link href={`/karate/bouts/${b.id}`} className="text-brand-700 hover:underline">
                            Run the bout →
                          </Link>
                        )}
                        {manager && b.status === "READY" && (
                          <BoutResultForm boutId={b.id} red={b.red!.name} blue={b.blue!.name} />
                        )}
                      </li>
                    ))}
                </ul>
              )}
              {d && c.discipline === "KATA" && (
                <ul className="flex flex-col gap-1 text-sm">
                  {d.kata.map((k) => (
                    <li key={k.entryId} className="flex flex-wrap items-center gap-2">
                      <span className="w-6 tabular-nums">{k.rank ?? "–"}</span>
                      <span className="font-medium">{k.name}</span>
                      <span className="text-muted">
                        {k.total != null ? Number(k.total).toFixed(1) : "no score"}
                        {k.scores.length > 0 && ` · ${k.scores.map((s, i) => `J${i + 1} ${s}`).join(" · ")}`}
                      </span>
                      {manager && c.status === "DRAWN" && (
                        <KataScoreForm orgId={org.id} categoryId={c.id} entryId={k.entryId} />
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          );
        })}
      </section>

      {editable && (
        <section aria-labelledby="details" className="flex flex-col gap-3">
          <h2 id="details" className="display text-2xl">
            Details
          </h2>
          <Card>
            <KarateTournamentForm
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
