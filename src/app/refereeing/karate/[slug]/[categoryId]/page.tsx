import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Card } from "@/components/ui";
import { categoryDetail } from "@/features/karate/api";
import { BoutResultForm } from "@/features/karate/Forms";
import { getSession } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Kumite results" };
export const dynamic = "force-dynamic";

/** The referee records each ready bout; winners move on automatically. */
export default async function RefereeCategoryPage({
  params,
}: {
  params: Promise<{ slug: string; categoryId: string }>;
}) {
  const { slug, categoryId } = await params;
  const session = await getSession();
  if (!session) redirect(`/login?next=/refereeing/karate/${slug}/${categoryId}`);
  const d = await categoryDetail(slug, categoryId, session.accessToken);
  if (!d) notFound();
  const bouts = d.bouts.filter((b) => b.decision !== "BYE");
  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-sm text-muted">{d.tournament.name}</p>
        <h1 className="display text-4xl leading-[1.05] sm:text-5xl">{d.category.name}</h1>
      </header>
      {!d.canReferee ? (
        <p className="text-sm">Only the category&apos;s referee or the organiser can record results.</p>
      ) : bouts.length === 0 ? (
        <p className="text-sm text-muted">The bracket has not been drawn yet.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {bouts.map((b) => (
            <li key={b.id}>
              <Card className="flex flex-col gap-2">
                <p className="font-medium">
                  {b.roundName}: <span className="text-red-700">{b.red?.name ?? "—"}</span> v{" "}
                  <span className="text-blue-700">{b.blue?.name ?? "—"}</span>
                </p>
                {b.status === "COMPLETED" && (
                  <p className="text-sm">
                    {b.redScore}–{b.blueScore} · {b.decision?.toLowerCase()} · winner{" "}
                    {b.winnerEntryId === b.red?.entryId ? b.red?.name : b.blue?.name}
                  </p>
                )}
                {b.status === "WAITING" && (
                  <p className="text-sm text-muted">Waiting for the earlier bouts.</p>
                )}
                {b.status === "READY" && (
                  <BoutResultForm boutId={b.id} red={b.red!.name} blue={b.blue!.name} />
                )}
              </Card>
            </li>
          ))}
        </ul>
      )}
      {d.category.podium.length > 0 && (
        <Card>
          <p className="font-semibold">Podium</p>
          <p className="text-sm">
            {d.category.podium.map((p) => `${p.place}. ${p.athleteName}`).join(" · ")}
          </p>
        </Card>
      )}
    </div>
  );
}
