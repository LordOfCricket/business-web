import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { matchReport } from "@/features/football/api";
import { MatchConsole } from "@/features/football/MatchConsole";
import { getSession } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Match" };
export const dynamic = "force-dynamic";

/** The referee's console for one football match. */
export default async function RefereeMatchPage({ params }: { params: Promise<{ matchId: string }> }) {
  const { matchId } = await params;
  const session = await getSession();
  if (!session) redirect(`/login?next=/refereeing/football/match/${matchId}`);
  const report = await matchReport(matchId, session.accessToken);
  if (!report) notFound();
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="display text-4xl leading-[1.05] sm:text-5xl">
          {report.match.home.name} v {report.match.away.name}
        </h1>
        <p className="text-sm text-muted">
          {report.tournament.name} · {report.match.stage}
        </p>
      </header>
      {report.canRecord ? (
        <MatchConsole report={report} />
      ) : (
        <p className="text-sm text-danger">
          Only the match&apos;s referee or a manager of the organising business can record this match.
        </p>
      )}
      <p className="text-sm">
        <Link href="/refereeing" className="text-brand-700 hover:underline">
          ← All assignments
        </Link>
      </p>
    </div>
  );
}
