import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, EmptyState } from "@/components/ui";
import { assignedMatches } from "@/features/cricket/api";
import { getSession } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Scoring" };
export const dynamic = "force-dynamic";

/** Matches the signed-in professional has been assigned to score. */
export default async function ScoringPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/scoring");
  const matches = await assignedMatches(session.accessToken);
  return (
    <div className="flex flex-col gap-6">
      <h1 className="display text-4xl leading-[1.05] sm:text-5xl">My scoring</h1>
      <p className="text-sm text-muted">
        Organisers assign you as the scorer or an umpire of a match; it appears here until the result is in.
      </p>
      {matches.length === 0 ? (
        <EmptyState
          title="No matches assigned"
          description="Ask the organiser to add you as the scorer or an umpire."
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {matches.map(({ match: m, tournament }) => (
            <li key={m.id}>
              <Card className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">
                    {m.home.name} v {m.away.name}
                  </p>
                  <p className="text-sm text-muted">
                    {tournament.name} · Match {m.number} ·{" "}
                    {new Date(m.startsAt).toLocaleString("en-IN", {
                      day: "numeric",
                      month: "short",
                      hour: "numeric",
                      minute: "2-digit",
                      timeZone: "Asia/Kolkata",
                    })}
                  </p>
                </div>
                <Link
                  href={`/scoring/${m.id}`}
                  className="rounded-full bg-ink px-3 py-1.5 text-sm font-medium text-paper hover:bg-brand-900"
                >
                  {m.status === "LIVE" ? "Continue scoring" : "Open"}
                </Link>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
