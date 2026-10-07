import type { Metadata } from "next";
import Link from "next/link";
import { Badge, Card, EmptyState } from "@/components/ui";
import { orgTournaments } from "@/features/cricket/api";
import { STATUS_TONE } from "@/features/cricket/constants";
import { TournamentForm } from "@/features/cricket/TournamentForm";
import { requireBusiness } from "@/features/org/context";
import { listVenues } from "@/features/venue/api";

export const metadata: Metadata = { title: "Tournaments" };

/** Cricket tournaments of the business (spec §26): verified businesses that list cricket can organise. */
export default async function TournamentsPage() {
  const { session, org, manager } = await requireBusiness();
  const eligible = org.status === "VERIFIED" && org.sports.includes("cricket");
  const [tournaments, venues] = await Promise.all([
    orgTournaments(org.id, session.accessToken),
    // the ground is optional: without the venue service the form simply offers none
    manager && eligible ? listVenues(org.id, session.accessToken).catch(() => []) : Promise.resolve([]),
  ]);
  return (
    <div className="flex flex-col gap-6">
      <h1 className="display text-4xl leading-[1.05] sm:text-5xl">Cricket tournaments</h1>
      {!eligible && (
        <p className="text-sm text-muted">
          Tournaments can be organised once the business is verified and lists cricket among its sports.
        </p>
      )}
      {tournaments.length === 0 ? (
        <EmptyState title="No tournaments yet" description="Create a draft, then open registration." />
      ) : (
        <ul className="flex flex-col gap-3">
          {tournaments.map((t) => (
            <li key={t.id}>
              <Card className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <Link href={`/tournaments/${t.id}`} className="font-semibold hover:underline">
                    {t.name}
                  </Link>
                  <p className="text-sm text-muted">
                    {t.city} · {t.startDate} · {t.teams}/{t.maxTeams} teams
                  </p>
                </div>
                <Badge tone={STATUS_TONE[t.status]}>{t.status.replace("_", " ").toLowerCase()}</Badge>
              </Card>
            </li>
          ))}
        </ul>
      )}
      {manager && eligible && (
        <Card className="flex flex-col gap-4">
          <h2 className="display text-2xl">New tournament</h2>
          <TournamentForm
            orgId={org.id}
            venues={venues
              .filter((v) => v.isPublic && v.status === "ACTIVE")
              .map((v) => ({ id: v.id, name: v.name }))}
          />
        </Card>
      )}
    </div>
  );
}
