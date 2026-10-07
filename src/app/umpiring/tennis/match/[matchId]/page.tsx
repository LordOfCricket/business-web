import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { matchDetail } from "@/features/tennis/api";
import { ScoringConsole } from "@/features/tennis/ScoringConsole";
import { getSession } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Scoring" };
export const dynamic = "force-dynamic";

/** The umpire's chair for one match. */
export default async function UmpiringMatchPage({ params }: { params: Promise<{ matchId: string }> }) {
  const { matchId } = await params;
  const session = await getSession();
  if (!session) redirect(`/login?next=/umpiring/tennis/match/${matchId}`);
  const match = await matchDetail(matchId, session.accessToken);
  if (!match) notFound();
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="display text-4xl leading-[1.05] sm:text-5xl">
          {match.player1?.name ?? "—"} v {match.player2?.name ?? "—"}
        </h1>
        <p className="text-sm text-muted">
          {match.tournament.name} · {match.eventName}
          {match.court ? ` · ${match.court}` : ""}
        </p>
      </header>
      {match.canUmpire ? (
        <ScoringConsole match={match} />
      ) : (
        <p className="text-sm text-danger">
          Only the event&apos;s umpire or a manager of the organising business can score this match.
        </p>
      )}
      <p className="text-sm">
        <Link
          href={`/umpiring/tennis/${match.tournament.slug}/${match.eventId}`}
          className="text-brand-700 hover:underline"
        >
          ← Order of play
        </Link>
      </p>
    </div>
  );
}
