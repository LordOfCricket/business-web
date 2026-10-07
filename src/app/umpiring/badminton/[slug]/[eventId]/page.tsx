import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Badge, Card, EmptyState } from "@/components/ui";
import { eventDetail } from "@/features/badminton/api";
import { getSession } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Umpiring" };
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string; eventId: string }> };

const when = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

/** The order of play of one event: pick a match to score. */
export default async function UmpiringEventPage({ params }: Params) {
  const { slug, eventId } = await params;
  const session = await getSession();
  if (!session) redirect(`/login?next=/umpiring/badminton/${slug}/${eventId}`);
  const detail = await eventDetail(slug, eventId, session.accessToken);
  if (!detail) notFound();
  const { event: e, matches } = detail;
  const playable = matches.filter((m) => m.outcome !== "BYE");
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="display text-4xl leading-[1.05] sm:text-5xl">{e.name}</h1>
        <p className="text-sm text-muted">
          {detail.tournament.name} · {e.format}
        </p>
        {!detail.canUmpire && (
          <p className="text-sm text-danger">
            You can follow this draw, but only its umpire or the organiser can score matches.
          </p>
        )}
      </header>

      {playable.length === 0 ? (
        <EmptyState
          title="No matches yet"
          description="The draw is made by the organiser once entries close."
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {playable.map((m) => (
            <li key={m.id}>
              <Card className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">
                    {m.player1?.name ?? "—"} v {m.player2?.name ?? "—"}
                  </p>
                  <p className="text-sm text-muted">
                    {m.roundName}
                    {m.court ? ` · ${m.court}` : ""}
                    {m.scheduledAt ? ` · ${when(m.scheduledAt)}` : ""}
                    {m.score ? ` · ${m.score}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={m.status === "LIVE" ? "warning" : "neutral"}>{m.status.toLowerCase()}</Badge>
                  <Link
                    href={`/umpiring/badminton/match/${m.id}`}
                    className="rounded-full bg-ink px-3 py-1.5 text-sm font-medium text-paper hover:bg-brand-900"
                  >
                    {m.status === "COMPLETED" ? "Result" : "Score"}
                  </Link>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
      <p className="text-sm">
        <Link href="/umpiring" className="text-brand-700 hover:underline">
          ← All events
        </Link>
      </p>
    </div>
  );
}
