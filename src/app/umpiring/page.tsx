import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Badge, Card, EmptyState } from "@/components/ui";
import { umpiring as badmintonEvents } from "@/features/badminton/api";
import { umpiring as tennisEvents } from "@/features/tennis/api";
import { getSession } from "@/lib/auth/session";
import { isLaunched } from "@/lib/sports/launch";

export const metadata: Metadata = { title: "Umpiring" };
export const dynamic = "force-dynamic";

/** Tennis and badminton events the signed-in umpire has been assigned to. */
export default async function UmpiringPage() {
  // umpiring covers tennis and badminton: nothing to show until one of them is launched
  if (!isLaunched("tennis") && !isLaunched("badminton")) notFound();
  const session = await getSession();
  if (!session) redirect("/login?next=/umpiring");
  // one sport service being down must not hide the other sport's events
  const [tennis, badminton] = await Promise.all([
    isLaunched("tennis") ? tennisEvents(session.accessToken).catch(() => []) : [],
    isLaunched("badminton") ? badmintonEvents(session.accessToken).catch(() => []) : [],
  ]);
  const list = [
    ...tennis.map((x) => ({ ...x, sport: "tennis" as const })),
    ...badminton.map((x) => ({ ...x, sport: "badminton" as const })),
  ];
  return (
    <div className="flex flex-col gap-6">
      <h1 className="display text-4xl leading-[1.05] sm:text-5xl">Umpiring</h1>
      {list.length === 0 ? (
        <EmptyState
          title="No events assigned"
          description="Organisers assign umpires to the events of a draw."
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {list.map(({ tournament, event, sport }) => (
            <li key={event.id}>
              <Card className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{event.name}</p>
                  <p className="text-sm text-muted">
                    {tournament.name} · {event.players} players · {event.format}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge>{sport === "tennis" ? "Tennis" : "Badminton"}</Badge>
                  <Badge>{event.status.toLowerCase()}</Badge>
                  <Link
                    href={`/umpiring/${sport}/${tournament.slug}/${event.id}`}
                    className="rounded-full bg-ink px-3 py-1.5 text-sm font-medium text-paper hover:bg-brand-900"
                  >
                    Open
                  </Link>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
