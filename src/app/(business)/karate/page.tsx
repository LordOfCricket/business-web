import Link from "next/link";
import type { Metadata } from "next";
import { Badge, Card, EmptyState } from "@/components/ui";
import { academy, ladder, students } from "@/features/karate/api";
import { AcademyForm, EnrolForm, LeaveButton } from "@/features/karate/Forms";
import { requireBusiness } from "@/features/org/context";

export const metadata: Metadata = { title: "Karate academy" };

function Chip({ label, color }: { label: string; color: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        aria-hidden="true"
        className="inline-block h-2.5 w-5 rounded-sm border border-line"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}

/** The academy (dojo) profile and its students with their belts (spec §26 Karate). */
export default async function KarateAcademyPage() {
  const { session, org, manager } = await requireBusiness();
  const eligible = org.status === "VERIFIED" && org.sports.includes("karate");
  const profile = await academy(org.id, session.accessToken);
  const beltList = await ladder(profile?.rankSystemId);
  const list = profile ? await students(org.id, session.accessToken) : [];
  return (
    <div className="flex flex-col gap-8">
      <h1 className="display text-4xl leading-[1.05] sm:text-5xl">Karate academy</h1>
      {profile && (
        <Link href="/karate/ranks" className="self-start text-sm text-brand-700 hover:underline">
          Rank systems →
        </Link>
      )}
      {!eligible && (
        <p className="text-sm text-muted">
          The academy is available to verified businesses that list karate.
        </p>
      )}
      {manager && eligible && (
        <Card className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">Academy profile</h2>
          <AcademyForm orgId={org.id} initial={profile ?? undefined} />
        </Card>
      )}
      {profile && (
        <section aria-labelledby="students" className="flex flex-col gap-3">
          <h2 id="students" className="display text-2xl">
            Students ({list.filter((s) => s.active).length})
          </h2>
          {manager && (
            <Card>
              <EnrolForm orgId={org.id} belts={beltList} />
            </Card>
          )}
          {list.length === 0 ? (
            <EmptyState title="No students yet" description="Enrol students with their current belt." />
          ) : (
            <ul className="flex flex-col divide-y divide-line rounded-xl border border-line">
              {list.map((s) => (
                <li key={s.id} className="flex flex-col gap-1 p-3 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="flex flex-wrap items-center gap-2">
                      <strong>{s.name}</strong>
                      <span className="text-muted">
                        {s.age} yrs · {s.gender === "FEMALE" ? "F" : "M"}
                      </span>
                      <Chip label={s.belt.label} color={s.belt.color} />
                      {s.linked && <Badge tone="success">account linked</Badge>}
                      {!s.active && <Badge>left</Badge>}
                    </span>
                    {manager && s.active && <LeaveButton orgId={org.id} studentId={s.id} name={s.name} />}
                    {manager && s.active && (
                      <details className="w-full text-sm">
                        <summary className="cursor-pointer text-brand-700">Edit</summary>
                        <div className="mt-3">
                          <EnrolForm orgId={org.id} belts={beltList} student={s} />
                        </div>
                      </details>
                    )}
                  </div>
                  <p className="text-muted">
                    Since {s.beltSince}
                    {s.nextBeltFrom ? ` · next belt from ${s.nextBeltFrom}` : " · top belt"} ·{" "}
                    {s.history.length} belt{s.history.length === 1 ? "" : "s"} on record
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
