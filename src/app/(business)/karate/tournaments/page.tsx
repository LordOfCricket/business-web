import type { Metadata } from "next";
import Link from "next/link";
import { Badge, Card, EmptyState } from "@/components/ui";
import { STATUS_TONE } from "@/features/cricket/constants";
import { karateTournaments } from "@/features/karate/api";
import { KarateTournamentForm } from "@/features/karate/Forms";
import { requireBusiness } from "@/features/org/context";
import { listVenues } from "@/features/venue/api";

export const metadata: Metadata = { title: "Karate tournaments" };

export default async function KarateTournamentsPage() {
  const { session, org, manager } = await requireBusiness();
  const eligible = org.status === "VERIFIED" && org.sports.includes("karate");
  const [list, venues] = await Promise.all([
    karateTournaments(org.id, session.accessToken),
    manager && eligible ? listVenues(org.id, session.accessToken).catch(() => []) : Promise.resolve([]),
  ]);
  return (
    <div className="flex flex-col gap-6">
      <h1 className="display text-4xl leading-[1.05] sm:text-5xl">Karate tournaments</h1>
      {list.length === 0 ? (
        <EmptyState
          title="No tournaments yet"
          description="Create a draft, add Kata and Kumite categories, open registration."
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {list.map((t) => (
            <li key={t.id}>
              <Card className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <Link href={`/karate/tournaments/${t.id}`} className="font-semibold hover:underline">
                    {t.name}
                  </Link>
                  <p className="text-sm text-muted">
                    {t.city} · {t.startDate} · {t.categories} categories · {t.athletes} athletes
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
          <KarateTournamentForm
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
