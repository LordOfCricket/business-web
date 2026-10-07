import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge, Card, EmptyState } from "@/components/ui";
import { refereeing as footballMatches } from "@/features/football/api";
import { refereeing as karateCategories } from "@/features/karate/api";
import { getSession } from "@/lib/auth/session";
import { isLaunched } from "@/lib/sports/launch";

export const metadata: Metadata = { title: "Refereeing" };
export const dynamic = "force-dynamic";

const when = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

/** Karate categories and football matches the signed-in referee has been assigned to. */
export default async function RefereeingPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/refereeing");
  // one sport service being down must not hide the other sport's assignments
  const [karate, football] = await Promise.all([
    karateCategories(session.accessToken).catch(() => []),
    isLaunched("football") ? footballMatches(session.accessToken).catch(() => []) : [],
  ]);
  const empty = karate.length === 0 && football.length === 0;
  return (
    <div className="flex flex-col gap-6">
      <h1 className="display text-4xl leading-[1.05] sm:text-5xl">Refereeing</h1>
      {empty ? (
        <EmptyState
          title="Nothing assigned"
          description="Organisers assign referees to karate categories and football matches."
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {karate.map(({ tournament, category }) => (
            <li key={category.id}>
              <Card className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{category.name}</p>
                  <p className="text-sm text-muted">
                    {tournament.name} · {category.athletes} athletes
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge>Karate</Badge>
                  <Badge>{category.status.toLowerCase()}</Badge>
                  <Link
                    href={`/refereeing/karate/${tournament.slug}/${category.id}`}
                    className="rounded-full bg-ink px-3 py-1.5 text-sm font-medium text-paper hover:bg-brand-900"
                  >
                    Open
                  </Link>
                </div>
              </Card>
            </li>
          ))}
          {football.map(({ tournament, match }) => (
            <li key={match.id}>
              <Card className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">
                    {match.home.name} v {match.away.name}
                  </p>
                  <p className="text-sm text-muted">
                    {tournament.name} · {match.stage} · {when(match.startsAt)}
                    {match.pitch ? ` · ${match.pitch}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge>Football</Badge>
                  <Badge tone={match.status === "LIVE" ? "warning" : "neutral"}>
                    {match.status.toLowerCase()}
                  </Badge>
                  <Link
                    href={`/refereeing/football/match/${match.id}`}
                    className="rounded-full bg-ink px-3 py-1.5 text-sm font-medium text-paper hover:bg-brand-900"
                  >
                    {match.status === "COMPLETED" ? "Report" : "Record"}
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
