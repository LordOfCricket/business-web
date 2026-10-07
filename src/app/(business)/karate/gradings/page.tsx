import type { Metadata } from "next";
import Link from "next/link";
import { Badge, Card, EmptyState } from "@/components/ui";
import { academy, gradings } from "@/features/karate/api";
import { GradingForm } from "@/features/karate/Forms";
import { requireBusiness } from "@/features/org/context";

export const metadata: Metadata = { title: "Gradings" };

export default async function GradingsPage() {
  const { session, org, manager } = await requireBusiness();
  const profile = await academy(org.id, session.accessToken);
  if (!profile) {
    return (
      <EmptyState
        title="Set up the academy first"
        description="Gradings belong to the karate academy of the business."
      />
    );
  }
  const list = await gradings(org.id, session.accessToken);
  return (
    <div className="flex flex-col gap-6">
      <h1 className="display text-4xl leading-[1.05] sm:text-5xl">Gradings</h1>
      {manager && (
        <Card>
          <GradingForm orgId={org.id} />
        </Card>
      )}
      {list.length === 0 ? (
        <EmptyState title="No gradings yet" />
      ) : (
        <ul className="flex flex-col gap-3">
          {list.map((g) => (
            <li key={g.id}>
              <Card className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <Link href={`/karate/gradings/${g.id}`} className="font-semibold hover:underline">
                    {g.title}
                  </Link>
                  <p className="text-sm text-muted">
                    {g.heldOn} · {g.examiner} · {g.candidates.length} candidates ·{" "}
                    {g.candidates.filter((c) => c.result === "PASSED").length} promoted
                  </p>
                </div>
                <Badge
                  tone={
                    g.status === "COMPLETED" ? "success" : g.status === "CANCELLED" ? "danger" : "warning"
                  }
                >
                  {g.status.toLowerCase()}
                </Badge>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
