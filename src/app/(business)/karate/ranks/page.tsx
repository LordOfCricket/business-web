import type { Metadata } from "next";
import Link from "next/link";
import { Badge, Card } from "@/components/ui";
import { RankActiveButton, RankForm, RankSystemForm, UseRankSystemButton } from "@/features/karate/Forms";
import { academy, rankSystems } from "@/features/karate/api";
import { requireBusiness } from "@/features/org/context";

export const metadata: Metadata = { title: "Rank systems" };
export const dynamic = "force-dynamic";

/** The kyu/dan ladders the academy can use (K2): the platform standard and its own. Ranks are retired, never deleted. */
export default async function RankSystemsPage() {
  const { session, org, manager } = await requireBusiness();
  const [profile, systems] = await Promise.all([
    academy(org.id, session.accessToken),
    rankSystems(org.id, session.accessToken).catch(() => []),
  ]);
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <Link href="/karate" className="text-sm text-brand-700 hover:underline">
          ← Karate academy
        </Link>
        <h1 className="display text-4xl leading-[1.05] sm:text-5xl">Rank systems</h1>
        <p className="text-sm text-muted">
          New students join the academy&apos;s chosen system. Existing students keep theirs, and tournament
          entries keep the rank they held when they entered.
        </p>
      </header>
      {systems.map((s) => (
        <Card key={s.id} className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold">{s.name}</h2>
              {s.isDefault && <Badge>standard</Badge>}
              {s.style && <Badge>{s.style.replace("_", "-").toLowerCase()}</Badge>}
              {profile?.rankSystemId === s.id && <Badge tone="success">new students join this</Badge>}
            </div>
            {manager && profile && profile.rankSystemId !== s.id && (
              <UseRankSystemButton orgId={org.id} academy={profile} systemId={s.id} />
            )}
          </div>
          <ol className="flex flex-col divide-y divide-line text-sm">
            {s.ranks.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center gap-3 py-2">
                <span
                  className="h-3 w-8 rounded ring-1 ring-line"
                  style={{ background: r.color }}
                  aria-hidden="true"
                />
                <span className="w-6 text-muted tabular-nums">{r.rank}</span>
                <span className="font-medium">
                  {r.name} · {r.grade}
                </span>
                <span className="text-muted">
                  {r.minMonths} months · from age {r.minAge}
                  {!r.active && " · retired"}
                </span>
                {manager && s.editable && (
                  <span className="ml-auto flex items-center gap-2">
                    <details>
                      <summary className="cursor-pointer text-brand-700">Edit</summary>
                      <div className="mt-2">
                        <RankForm orgId={org.id} systemId={s.id} rank={r} />
                      </div>
                    </details>
                    <RankActiveButton orgId={org.id} rankId={r.id} active={r.active} />
                  </span>
                )}
              </li>
            ))}
          </ol>
          {manager && s.editable && (
            <details>
              <summary className="cursor-pointer text-sm text-brand-700">Add a rank at the top</summary>
              <div className="mt-3">
                <RankForm orgId={org.id} systemId={s.id} />
              </div>
            </details>
          )}
        </Card>
      ))}
      {manager && profile && (
        <Card className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">New rank system</h2>
          <RankSystemForm orgId={org.id} />
        </Card>
      )}
    </div>
  );
}
