import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BoutConsole } from "@/features/karate/BoutConsole";
import { boutLiveAction } from "@/features/karate/liveActions";

export const metadata: Metadata = { title: "Live bout" };
export const dynamic = "force-dynamic";

/** The live console of a Kumite bout for its referee or the organiser (K3). */
export default async function BoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const r = await boutLiveAction(id);
  if (!r.live) notFound();
  const live = r.live;
  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-col gap-1">
        <p className="text-sm text-muted">
          {[live.tournament.name, live.categoryName, live.tatami, live.ruleSet].filter(Boolean).join(" · ")}
        </p>
        <h1 className="display text-3xl">
          Bout {live.boutNumber} · {live.roundName}
        </h1>
      </header>
      <BoutConsole boutId={id} initial={live} />
    </div>
  );
}
