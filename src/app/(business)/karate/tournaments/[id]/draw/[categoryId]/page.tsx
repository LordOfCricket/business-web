import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge, Card } from "@/components/ui";
import { DrawConfigForm, DrawReview, UnlockDrawButton } from "@/features/karate/DayForms";
import { categoryDetail, karateTournament } from "@/features/karate/api";
import { orgDraw } from "@/features/karate/day";
import { requireBusiness } from "@/features/org/context";

export const metadata: Metadata = { title: "Draw" };
export const dynamic = "force-dynamic";

const FORMATS: Record<string, string> = {
  KNOCKOUT: "Knockout",
  ROUND_ROBIN: "Round robin",
  POOLS_KNOCKOUT: "Pools → knockout",
};

/** A Kumite category's draw (K4): configure and seed, review and swap, lock; reopen before any bout. */
export default async function DrawPage({ params }: { params: Promise<{ id: string; categoryId: string }> }) {
  const { id, categoryId } = await params;
  const { session, org, manager } = await requireBusiness();
  if (!manager) notFound();
  const data = await karateTournament(org.id, id, session.accessToken);
  const category = data?.categories.find((c) => c.id === categoryId);
  if (!data || !category || category.discipline !== "KUMITE") notFound();
  const [draw, detail] = await Promise.all([
    orgDraw(org.id, categoryId, session.accessToken),
    categoryDetail(data.tournament.slug, categoryId, session.accessToken),
  ]);
  const athletes = (detail?.athletes ?? []).map((a) => ({ entryId: a.entryId, name: a.name }));
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <Link href={`/karate/tournaments/${id}`} className="text-sm text-brand-700 hover:underline">
          ← {data.tournament.name}
        </Link>
        <h1 className="display text-4xl">Draw · {category.name}</h1>
        {draw && (
          <p className="flex flex-wrap items-center gap-2 text-sm text-muted">
            <Badge tone={draw.status === "GENERATED" ? "warning" : "success"}>
              {draw.status.toLowerCase()}
            </Badge>
            {FORMATS[draw.format]}
            {draw.pools > 1 && ` · ${draw.pools} pools, ${draw.qualifiersPerPool} qualify`}
            {draw.thirdPlace && " · bronze bout"} · {draw.algorithm} with seed {draw.randomSeed}{" "}
            (reproducible)
          </p>
        )}
      </header>
      {(!draw || draw.status === "GENERATED") && (
        <Card className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">{draw ? "Generate again" : "Configure"}</h2>
          <DrawConfigForm orgId={org.id} categoryId={categoryId} athletes={athletes} />
        </Card>
      )}
      {draw?.status === "GENERATED" && (
        <Card className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">Review</h2>
          <DrawReview orgId={org.id} categoryId={categoryId} draw={draw} />
        </Card>
      )}
      {draw?.status === "LOCKED" && <UnlockDrawButton orgId={org.id} categoryId={categoryId} />}
    </div>
  );
}
