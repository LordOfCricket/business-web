import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Badge, Card } from "@/components/ui";
import { grading, students } from "@/features/karate/api";
import { CancelGradingButton, CandidatePicker, GradeButtons } from "@/features/karate/Forms";
import { requireBusiness } from "@/features/org/context";

export const metadata: Metadata = { title: "Grading" };

const TONE = { PENDING: "warning", PASSED: "success", FAILED: "danger" } as const;

/** Candidates (eligibility is checked when added) and results; a pass promotes the student one belt. */
export default async function GradingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { session, org, manager } = await requireBusiness();
  const g = await grading(org.id, id, session.accessToken);
  if (!g) notFound();
  const planned = g.status === "PLANNED";
  const taken = new Set(g.candidates.map((c) => c.studentId));
  const available =
    planned && manager
      ? (await students(org.id, session.accessToken)).filter((s) => s.active && !taken.has(s.id))
      : [];
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="display text-4xl leading-[1.05] sm:text-5xl">{g.title}</h1>
        <p className="text-sm text-muted">
          {g.heldOn} · examiner {g.examiner} · {g.status.toLowerCase()}
        </p>
        {planned && manager && <CancelGradingButton orgId={org.id} gradingId={g.id} />}
      </header>
      {planned && manager && (
        <Card className="flex flex-col gap-2">
          <h2 className="font-semibold">Add a candidate</h2>
          <p className="text-sm text-muted">
            Students go up one belt at a time, after the minimum time at their belt and from the minimum age.
          </p>
          <CandidatePicker
            orgId={org.id}
            gradingId={g.id}
            students={available.map((s) => ({ id: s.id, name: s.name, belt: s.belt.label }))}
          />
        </Card>
      )}
      {g.candidates.length === 0 ? (
        <p className="text-sm text-muted">No candidates yet.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-line rounded-xl border border-line">
          {g.candidates.map((c) => (
            <li key={c.studentId} className="flex flex-wrap items-center justify-between gap-2 p-3 text-sm">
              <span className="flex flex-wrap items-center gap-2">
                <strong>{c.studentName}</strong>
                <span className="text-muted">
                  {c.from.label} → {c.to.label}
                </span>
                <Badge tone={TONE[c.result]}>
                  {c.result === "PENDING" ? "to grade" : c.result.toLowerCase()}
                </Badge>
                {c.note && <span className="text-muted">· {c.note}</span>}
              </span>
              {manager && planned && c.result === "PENDING" && (
                <GradeButtons orgId={org.id} gradingId={g.id} studentId={c.studentId} />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
