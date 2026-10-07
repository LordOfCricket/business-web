"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ActionFeedback, inputClass, textareaClass } from "@/components/common/EditorSection";
import { Button } from "@/components/ui";
import type { ActionResult } from "@/lib/actions/result";
import {
  addCategoryAction,
  activateRankAction,
  cancelGradingAction,
  createRankSystemAction,
  saveRankAction,
  saveAcademyAction as saveAcademy,
  boutResultAction,
  candidateAction,
  categoryOpAction,
  createGradingAction,
  enrolAction,
  gradeAction,
  karateStatusAction,
  kataScoreAction,
  leaveAction,
  saveAcademyAction,
  saveKarateTournamentAction,
} from "./actions";

type Belt = { rank: number; name: string; grade: string };

function useAction() {
  const router = useRouter();
  const [result, setResult] = useState<ActionResult>({});
  const [pending, start] = useTransition();
  const run = (fn: () => Promise<ActionResult>, after?: (r: ActionResult) => void) =>
    start(async () => {
      const r = await fn();
      setResult(r);
      if (r.success) {
        after?.(r);
        router.refresh();
      }
    });
  return { result, pending, run, router };
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-sm font-medium">
      {label}
      {children}
    </label>
  );
}

const value = (f: FormData, k: string) => String(f.get(k) ?? "");

function BeltSelect({ name, belts, defaultValue }: { name: string; belts: Belt[]; defaultValue?: number }) {
  return (
    <select name={name} defaultValue={defaultValue} className={inputClass}>
      {belts.map((b) => (
        <option key={b.rank} value={b.rank}>
          {b.name} ({b.grade})
        </option>
      ))}
    </select>
  );
}

// ------------------------------------------------------------------ academy

export function AcademyForm({
  orgId,
  initial,
}: {
  orgId: string;
  initial?: { style: string; headInstructor?: string; affiliation?: string; description?: string };
}) {
  const { result, pending, run } = useAction();
  return (
    <form
      className="grid gap-3 md:grid-cols-3"
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        run(() =>
          saveAcademyAction(orgId, {
            style: value(f, "style"),
            headInstructor: value(f, "headInstructor"),
            affiliation: value(f, "affiliation"),
            description: value(f, "description"),
          }),
        );
      }}
    >
      <Field label="Style">
        <select name="style" defaultValue={initial?.style ?? "SHOTOKAN"} className={inputClass}>
          {["SHOTOKAN", "GOJU_RYU", "WADO_RYU", "SHITO_RYU", "KYOKUSHIN", "OTHER"].map((s) => (
            <option key={s} value={s}>
              {s.replace("_", "-").toLowerCase()}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Head instructor">
        <input
          name="headInstructor"
          maxLength={120}
          defaultValue={initial?.headInstructor}
          className={inputClass}
        />
      </Field>
      <Field label="Affiliation">
        <input
          name="affiliation"
          maxLength={150}
          defaultValue={initial?.affiliation}
          className={inputClass}
        />
      </Field>
      <div className="md:col-span-3">
        <Field label="About the dojo">
          <textarea
            name="description"
            rows={3}
            maxLength={2000}
            defaultValue={initial?.description}
            className={textareaClass}
          />
        </Field>
      </div>
      <div className="flex items-center gap-3 md:col-span-3">
        <Button type="submit" loading={pending}>
          {initial ? "Save academy" : "Set up academy"}
        </Button>
        <ActionFeedback result={result} />
      </div>
    </form>
  );
}

/** Enrols a student, or edits [student]. */
export function EnrolForm({
  orgId,
  belts,
  student,
}: {
  orgId: string;
  belts: Belt[];
  student?: {
    id: string;
    name: string;
    dateOfBirth: string;
    gender: string;
    belt: { rank: number };
    beltSince?: string;
  };
}) {
  const { result, pending, run } = useAction();
  return (
    <form
      className="grid gap-3 md:grid-cols-3"
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const target = e.currentTarget;
        run(
          () =>
            enrolAction(
              orgId,
              {
                name: value(f, "name"),
                dateOfBirth: value(f, "dateOfBirth"),
                gender: value(f, "gender") as "FEMALE",
                beltRank: student ? String(student.belt.rank) : value(f, "beltRank"),
                beltSince: value(f, "beltSince"),
                email: value(f, "email"),
              },
              student?.id,
            ),
          () => {
            if (!student) target.reset();
          },
        );
      }}
    >
      <Field label="Name">
        <input name="name" required maxLength={120} defaultValue={student?.name} className={inputClass} />
      </Field>
      <Field label="Date of birth">
        <input
          name="dateOfBirth"
          type="date"
          required
          defaultValue={student?.dateOfBirth}
          className={inputClass}
        />
      </Field>
      <Field label="Gender">
        <select name="gender" defaultValue={student?.gender} className={inputClass}>
          <option value="FEMALE">Female</option>
          <option value="MALE">Male</option>
        </select>
      </Field>
      {student ? (
        <p className="self-end text-sm text-muted">Belts change through gradings.</p>
      ) : (
        <>
          <Field label="Current belt">
            <BeltSelect name="beltRank" belts={belts} />
          </Field>
          <Field label="Belt held since (optional)">
            <input name="beltSince" type="date" className={inputClass} />
          </Field>
        </>
      )}
      <Field label="Account email (optional, links the student)">
        <input name="email" type="email" maxLength={200} className={inputClass} />
      </Field>
      <div className="flex items-center gap-3 md:col-span-3">
        <Button type="submit" loading={pending}>
          {student ? "Save student" : "Enrol student"}
        </Button>
        <ActionFeedback result={result} />
      </div>
    </form>
  );
}

export function LeaveButton({ orgId, studentId, name }: { orgId: string; studentId: string; name: string }) {
  const { result, pending, run } = useAction();
  return (
    <span className="inline-flex items-center gap-2">
      <Button
        size="sm"
        variant="ghost"
        disabled={pending}
        onClick={() =>
          confirm(`Remove ${name} from the academy? The belt history is kept.`) &&
          run(() => leaveAction(orgId, studentId))
        }
      >
        Remove
      </Button>
      <ActionFeedback result={result} />
    </span>
  );
}

// ------------------------------------------------------------------ gradings

export function GradingForm({ orgId }: { orgId: string }) {
  const { result, pending, run, router } = useAction();
  return (
    <form
      className="grid gap-3 md:grid-cols-[2fr_1fr_2fr_auto] md:items-end"
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        run(
          () =>
            createGradingAction(orgId, {
              title: value(f, "title"),
              heldOn: value(f, "heldOn"),
              examiner: value(f, "examiner"),
            }),
          (r) => {
            const id = (r as ActionResult & { id?: string }).id;
            if (id) router.push(`/karate/gradings/${id}`);
          },
        );
      }}
    >
      <Field label="Title">
        <input name="title" required maxLength={120} placeholder="Autumn grading" className={inputClass} />
      </Field>
      <Field label="Date">
        <input name="heldOn" type="date" required className={inputClass} />
      </Field>
      <Field label="Examiner">
        <input name="examiner" required maxLength={120} className={inputClass} />
      </Field>
      <Button type="submit" loading={pending}>
        Plan grading
      </Button>
      <div className="md:col-span-4">
        <ActionFeedback result={result} />
      </div>
    </form>
  );
}

export function CandidatePicker({
  orgId,
  gradingId,
  students,
}: {
  orgId: string;
  gradingId: string;
  students: Array<{ id: string; name: string; belt: string }>;
}) {
  const { result, pending, run } = useAction();
  const [studentId, setStudentId] = useState(students[0]?.id ?? "");
  if (students.length === 0)
    return <p className="text-sm text-muted">Every active student is a candidate.</p>;
  return (
    <div className="flex flex-wrap items-end gap-3">
      <Field label="Student">
        <select value={studentId} onChange={(e) => setStudentId(e.target.value)} className={inputClass}>
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} — {s.belt}
            </option>
          ))}
        </select>
      </Field>
      <Button loading={pending} onClick={() => run(() => candidateAction(orgId, gradingId, studentId, true))}>
        Add candidate
      </Button>
      <ActionFeedback result={result} />
    </div>
  );
}

export function GradeButtons({
  orgId,
  gradingId,
  studentId,
}: {
  orgId: string;
  gradingId: string;
  studentId: string;
}) {
  const { result, pending, run } = useAction();
  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <Button
        size="sm"
        disabled={pending}
        onClick={() => run(() => gradeAction(orgId, gradingId, studentId, "PASSED", ""))}
      >
        Passed
      </Button>
      <Button
        size="sm"
        variant="secondary"
        disabled={pending}
        onClick={() => {
          const note = prompt("Feedback for the student (optional):");
          if (note === null) return;
          run(() => gradeAction(orgId, gradingId, studentId, "FAILED", note));
        }}
      >
        Not yet
      </Button>
      <Button
        size="sm"
        variant="ghost"
        disabled={pending}
        onClick={() => run(() => candidateAction(orgId, gradingId, studentId, false))}
      >
        Remove
      </Button>
      <ActionFeedback result={result} />
    </span>
  );
}

// ------------------------------------------------------------------ tournaments

export function KarateTournamentForm({
  orgId,
  initial,
  venues,
}: {
  orgId: string;
  venues: Array<{ id: string; name: string }>;
  initial?: {
    id: string;
    name: string;
    description?: string;
    rules?: string;
    city: string;
    venueId?: string;
    startDate: string;
    endDate: string;
    registrationClosesAt: string;
    entryFee: number;
    status: string;
  };
}) {
  const { result, pending, run, router } = useAction();
  const feeLocked = initial !== undefined && initial.status !== "DRAFT";
  return (
    <form
      className="grid gap-3 md:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        run(
          () =>
            saveKarateTournamentAction(orgId, initial?.id ?? null, {
              name: value(f, "name"),
              description: value(f, "description"),
              rules: value(f, "rules"),
              city: value(f, "city"),
              venueId: value(f, "venueId"),
              startDate: value(f, "startDate"),
              endDate: value(f, "endDate"),
              registrationClosesAt: value(f, "registrationClosesAt"),
              entryFee: feeLocked ? String(initial!.entryFee) : value(f, "entryFee"),
            }),
          (r) => {
            const id = (r as ActionResult & { id?: string }).id;
            if (!initial && id) router.push(`/karate/tournaments/${id}`);
          },
        );
      }}
    >
      <Field label="Name">
        <input name="name" required maxLength={120} defaultValue={initial?.name} className={inputClass} />
      </Field>
      <Field label="City">
        <input name="city" required maxLength={80} defaultValue={initial?.city} className={inputClass} />
      </Field>
      <Field label="Venue (optional)">
        <select name="venueId" defaultValue={initial?.venueId ?? ""} className={inputClass}>
          <option value="">Not on LordOfSportz</option>
          {venues.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Entry fee per category (₹)">
        <input
          name="entryFee"
          type="number"
          min={0}
          max={100000}
          required
          disabled={feeLocked}
          defaultValue={initial?.entryFee ?? 0}
          className={inputClass}
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Starts">
          <input
            name="startDate"
            type="date"
            required
            defaultValue={initial?.startDate}
            className={inputClass}
          />
        </Field>
        <Field label="Ends">
          <input name="endDate" type="date" required defaultValue={initial?.endDate} className={inputClass} />
        </Field>
      </div>
      <Field label="Registration closes (IST)">
        <input
          name="registrationClosesAt"
          type="datetime-local"
          required
          defaultValue={initial?.registrationClosesAt}
          className={inputClass}
        />
      </Field>
      <Field label="About">
        <textarea
          name="description"
          rows={3}
          maxLength={4000}
          defaultValue={initial?.description}
          className={textareaClass}
        />
      </Field>
      <Field label="Rules">
        <textarea
          name="rules"
          rows={3}
          maxLength={4000}
          defaultValue={initial?.rules}
          className={textareaClass}
        />
      </Field>
      <div className="flex items-center gap-3 md:col-span-2">
        <Button type="submit" loading={pending}>
          {initial ? "Save changes" : "Create tournament"}
        </Button>
        <ActionFeedback result={result} />
      </div>
    </form>
  );
}

const NEXT: Record<string, Array<{ to: string; label: string; danger?: boolean }>> = {
  DRAFT: [
    { to: "OPEN", label: "Open registration" },
    { to: "CANCELLED", label: "Cancel", danger: true },
  ],
  OPEN: [
    { to: "CLOSED", label: "Close registration" },
    { to: "CANCELLED", label: "Cancel", danger: true },
  ],
  CLOSED: [
    { to: "OPEN", label: "Reopen registration" },
    { to: "IN_PROGRESS", label: "Start" },
    { to: "CANCELLED", label: "Cancel", danger: true },
  ],
  IN_PROGRESS: [
    { to: "COMPLETED", label: "Mark completed" },
    { to: "CANCELLED", label: "Cancel", danger: true },
  ],
};

export function KarateStatusButtons({ orgId, id, status }: { orgId: string; id: string; status: string }) {
  const { result, pending, run } = useAction();
  return (
    <div className="flex flex-wrap items-center gap-2">
      {(NEXT[status] ?? []).map((m) => (
        <Button
          key={m.to}
          size="sm"
          variant={m.danger ? "danger" : "secondary"}
          disabled={pending}
          onClick={() => {
            let reason: string | undefined;
            if (m.to === "CANCELLED") {
              const answer = prompt("Why is the tournament cancelled? Paid entries are refunded in full.");
              if (answer === null) return;
              reason = answer;
            }
            run(() => karateStatusAction(orgId, id, m.to, reason));
          }}
        >
          {m.label}
        </Button>
      ))}
      <ActionFeedback result={result} />
    </div>
  );
}

export function CategoryForm({
  orgId,
  tournamentId,
  belts,
  category,
}: {
  orgId: string;
  tournamentId: string;
  belts: Belt[];
  /** Edits this category instead of adding one. */
  category?: {
    id: string;
    discipline: "KATA" | "KUMITE";
    name: string;
    gender: string;
    minAge: number;
    maxAge: number;
    minBelt: { rank: number };
    maxBelt: { rank: number };
    minWeight?: number;
    maxWeight?: number;
    maxEntries: number;
  };
}) {
  const { result, pending, run } = useAction();
  const [discipline, setDiscipline] = useState<"KATA" | "KUMITE">(category?.discipline ?? "KUMITE");
  return (
    <form
      className="grid gap-3 md:grid-cols-4"
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        run(() =>
          addCategoryAction(
            orgId,
            tournamentId,
            {
              discipline,
              name: value(f, "name"),
              gender: value(f, "gender") as "MIXED",
              minAge: value(f, "minAge"),
              maxAge: value(f, "maxAge"),
              minBelt: value(f, "minBelt"),
              maxBelt: value(f, "maxBelt"),
              minWeight: discipline === "KUMITE" ? value(f, "minWeight") : "",
              maxWeight: discipline === "KUMITE" ? value(f, "maxWeight") : "",
              maxEntries: value(f, "maxEntries"),
            },
            category?.id,
          ),
        );
      }}
    >
      <Field label="Discipline">
        <select
          value={discipline}
          onChange={(e) => setDiscipline(e.target.value as "KATA")}
          className={inputClass}
        >
          <option value="KUMITE">Kumite</option>
          <option value="KATA">Kata</option>
        </select>
      </Field>
      <Field label="Name">
        <input
          name="name"
          required
          maxLength={120}
          placeholder="Cadet girls -45 kg"
          defaultValue={category?.name}
          className={inputClass}
        />
      </Field>
      <Field label="Gender">
        <select name="gender" defaultValue={category?.gender} className={inputClass}>
          <option value="FEMALE">Girls / women</option>
          <option value="MALE">Boys / men</option>
          <option value="MIXED">Mixed</option>
        </select>
      </Field>
      <Field label="Max athletes">
        <input
          name="maxEntries"
          type="number"
          min={2}
          max={256}
          defaultValue={category?.maxEntries ?? 16}
          className={inputClass}
        />
      </Field>
      <Field label="Age from">
        <input
          name="minAge"
          type="number"
          min={3}
          max={99}
          defaultValue={category?.minAge ?? 12}
          className={inputClass}
        />
      </Field>
      <Field label="Age to">
        <input
          name="maxAge"
          type="number"
          min={3}
          max={99}
          defaultValue={category?.maxAge ?? 15}
          className={inputClass}
        />
      </Field>
      <Field label="Belt from">
        <BeltSelect name="minBelt" belts={belts} defaultValue={category?.minBelt.rank ?? 1} />
      </Field>
      <Field label="Belt to">
        <BeltSelect name="maxBelt" belts={belts} defaultValue={category?.maxBelt.rank ?? 12} />
      </Field>
      {discipline === "KUMITE" && (
        <>
          <Field label="Weight from (kg, optional)">
            <input
              name="minWeight"
              inputMode="decimal"
              defaultValue={category?.minWeight}
              className={inputClass}
            />
          </Field>
          <Field label="Weight under (kg, optional)">
            <input
              name="maxWeight"
              inputMode="decimal"
              defaultValue={category?.maxWeight}
              className={inputClass}
            />
          </Field>
        </>
      )}
      <div className="flex items-center gap-3 md:col-span-4">
        <Button type="submit" variant="secondary" loading={pending}>
          {category ? "Save category" : "Add category"}
        </Button>
        <ActionFeedback result={result} />
      </div>
    </form>
  );
}

export function CategoryOps({
  orgId,
  category,
  referees,
  canDraw,
}: {
  orgId: string;
  category: { id: string; discipline: string; status: string; athletes: number };
  referees: Array<{ profileId: string; displayName: string }>;
  canDraw: boolean;
}) {
  const { result, pending, run } = useAction();
  const [referee, setReferee] = useState("");
  return (
    <div className="flex flex-wrap items-center gap-2">
      {category.status === "OPEN" && canDraw && (
        <Button
          size="sm"
          disabled={pending}
          onClick={() => run(() => categoryOpAction(orgId, "draw", category.id))}
        >
          {category.discipline === "KUMITE" ? "Draw bracket" : "Start scoring"}
        </Button>
      )}
      {category.status === "DRAWN" && category.discipline === "KATA" && (
        <Button
          size="sm"
          disabled={pending}
          onClick={() => run(() => categoryOpAction(orgId, "finalise", category.id))}
        >
          Finalise results
        </Button>
      )}
      {category.status === "OPEN" && category.athletes === 0 && (
        <Button
          size="sm"
          variant="ghost"
          disabled={pending}
          onClick={() => run(() => categoryOpAction(orgId, "delete", category.id))}
        >
          Delete
        </Button>
      )}
      {category.discipline === "KUMITE" && category.status !== "COMPLETED" && (
        <span className="inline-flex items-center gap-2">
          <select
            aria-label="Referee"
            value={referee}
            onChange={(e) => setReferee(e.target.value)}
            className={`${inputClass} h-8`}
          >
            <option value="">Referee…</option>
            {referees.map((r) => (
              <option key={r.profileId} value={r.profileId}>
                {r.displayName}
              </option>
            ))}
          </select>
          <Button
            size="sm"
            variant="secondary"
            disabled={pending || !referee}
            onClick={() => run(() => categoryOpAction(orgId, "referee", category.id, referee))}
          >
            Assign
          </Button>
        </span>
      )}
      <ActionFeedback result={result} />
    </div>
  );
}

export function RemoveEntry({ orgId, entryId }: { orgId: string; entryId: string }) {
  const { result, pending, run } = useAction();
  return (
    <span className="inline-flex items-center gap-2">
      <Button
        size="sm"
        variant="ghost"
        disabled={pending}
        onClick={() => {
          const reason = prompt("Reason (shown to the athlete):");
          if (reason === null) return;
          run(() => categoryOpAction(orgId, "remove-entry", entryId, reason));
        }}
      >
        Remove
      </Button>
      <ActionFeedback result={result} />
    </span>
  );
}

export function KataScoreForm({
  orgId,
  categoryId,
  entryId,
}: {
  orgId: string;
  categoryId: string;
  entryId: string;
}) {
  const { result, pending, run } = useAction();
  const [scores, setScores] = useState("");
  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <input
        aria-label="Judges' scores"
        placeholder="8.2 8.4 8.0"
        value={scores}
        onChange={(e) => setScores(e.target.value)}
        className={`${inputClass} h-8 w-40`}
      />
      <Button
        size="sm"
        variant="secondary"
        disabled={pending || !scores.trim()}
        onClick={() => run(() => kataScoreAction(orgId, categoryId, entryId, scores))}
      >
        Save
      </Button>
      <ActionFeedback result={result} />
    </span>
  );
}

/** Kumite result for one bout (organiser or the category's referee). */
export function BoutResultForm({ boutId, red, blue }: { boutId: string; red: string; blue: string }) {
  const { result, pending, run } = useAction();
  return (
    <form
      className="flex flex-wrap items-end gap-2 text-sm"
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        run(() =>
          boutResultAction(boutId, {
            redScore: Number(value(f, "red")),
            blueScore: Number(value(f, "blue")),
            winner: value(f, "winner") as "RED",
            decision: value(f, "decision"),
          }),
        );
      }}
    >
      <Field label={`Aka: ${red}`}>
        <input
          name="red"
          type="number"
          min={0}
          max={99}
          defaultValue={0}
          className={`${inputClass} h-8 w-20`}
        />
      </Field>
      <Field label={`Ao: ${blue}`}>
        <input
          name="blue"
          type="number"
          min={0}
          max={99}
          defaultValue={0}
          className={`${inputClass} h-8 w-20`}
        />
      </Field>
      <Field label="Winner">
        <select name="winner" className={`${inputClass} h-8`}>
          <option value="RED">{red}</option>
          <option value="BLUE">{blue}</option>
        </select>
      </Field>
      <Field label="By">
        <select name="decision" className={`${inputClass} h-8`}>
          <option value="POINTS">Points</option>
          <option value="SENSHU">Senshu</option>
          <option value="HANTEI">Hantei</option>
          <option value="KIKEN">Kiken</option>
          <option value="HANSOKU">Hansoku</option>
        </select>
      </Field>
      <Button type="submit" size="sm" loading={pending}>
        Record
      </Button>
      <ActionFeedback result={result} />
    </form>
  );
}

export function CancelGradingButton({ orgId, gradingId }: { orgId: string; gradingId: string }) {
  const { result, pending, run } = useAction();
  return (
    <div className="flex items-center gap-3">
      <Button
        variant="danger"
        size="sm"
        loading={pending}
        onClick={() => {
          if (confirm("Cancel this grading?")) run(() => cancelGradingAction(orgId, gradingId));
        }}
      >
        Cancel grading
      </Button>
      <ActionFeedback result={result} />
    </div>
  );
}

// ------------------------------------------------------------------ rank systems (K2)

export function RankSystemForm({ orgId }: { orgId: string }) {
  const { result, pending, run } = useAction();
  return (
    <form
      className="grid gap-3 md:grid-cols-4"
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        run(() =>
          createRankSystemAction(orgId, {
            name: value(f, "name"),
            style: value(f, "style"),
            copyDefault: f.get("copyDefault") === "on",
          }),
        );
      }}
    >
      <Field label="Name">
        <input name="name" required maxLength={120} placeholder="Deccan Shotokan" className={inputClass} />
      </Field>
      <Field label="Style (optional)">
        <select name="style" className={inputClass}>
          <option value="">Any style</option>
          {["SHOTOKAN", "GOJU_RYU", "WADO_RYU", "SHITO_RYU", "KYOKUSHIN", "OTHER"].map((s) => (
            <option key={s} value={s}>
              {s.replace("_", "-").toLowerCase()}
            </option>
          ))}
        </select>
      </Field>
      <label className="flex items-center gap-2 self-end text-sm">
        <input type="checkbox" name="copyDefault" defaultChecked /> Start from the standard ladder
      </label>
      <div className="flex items-center gap-3 self-end">
        <Button type="submit" loading={pending}>
          Create
        </Button>
        <ActionFeedback result={result} />
      </div>
    </form>
  );
}

/** Adds a rank at the top of [systemId], or edits [rank]. */
export function RankForm({
  orgId,
  systemId,
  rank,
}: {
  orgId: string;
  systemId: string;
  rank?: {
    id: string;
    name: string;
    grade: string;
    kind: string;
    color: string;
    minMonths: number;
    minAge: number;
  };
}) {
  const { result, pending, run } = useAction();
  return (
    <form
      className="grid gap-3 md:grid-cols-6"
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        run(() =>
          saveRankAction(orgId, rank ? { rankId: rank.id } : { systemId }, {
            name: value(f, "name"),
            grade: value(f, "grade"),
            kind: value(f, "kind") as "KYU",
            color: value(f, "color"),
            minMonths: value(f, "minMonths"),
            minAge: value(f, "minAge"),
          }),
        );
      }}
    >
      <Field label="Grade">
        <input
          name="grade"
          required
          maxLength={40}
          defaultValue={rank?.grade}
          placeholder="4th Dan"
          className={inputClass}
        />
      </Field>
      <Field label="Belt">
        <input
          name="name"
          required
          maxLength={40}
          defaultValue={rank?.name}
          placeholder="Black"
          className={inputClass}
        />
      </Field>
      <Field label="Kind">
        <select name="kind" defaultValue={rank?.kind ?? "KYU"} className={inputClass}>
          <option value="KYU">Kyu</option>
          <option value="DAN">Dan</option>
        </select>
      </Field>
      <Field label="Colour">
        <input
          name="color"
          type="color"
          defaultValue={rank?.color ?? "#000000"}
          className="h-11 w-full rounded-xl"
        />
      </Field>
      <Field label="Months at previous">
        <input
          name="minMonths"
          type="number"
          min={0}
          max={240}
          defaultValue={rank?.minMonths ?? 6}
          className={inputClass}
        />
      </Field>
      <Field label="Minimum age">
        <input
          name="minAge"
          type="number"
          min={0}
          max={99}
          defaultValue={rank?.minAge ?? 0}
          className={inputClass}
        />
      </Field>
      <div className="flex items-center gap-3 md:col-span-6">
        <Button type="submit" variant="secondary" size="sm" loading={pending}>
          {rank ? "Save rank" : "Add rank"}
        </Button>
        <ActionFeedback result={result} />
      </div>
    </form>
  );
}

export function RankActiveButton({
  orgId,
  rankId,
  active,
}: {
  orgId: string;
  rankId: string;
  active: boolean;
}) {
  const { result, pending, run } = useAction();
  return (
    <span className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        loading={pending}
        onClick={() => run(() => activateRankAction(orgId, rankId, !active))}
      >
        {active ? "Retire" : "Use again"}
      </Button>
      <ActionFeedback result={result} />
    </span>
  );
}

/** New students join [systemId]; existing students keep theirs. */
export function UseRankSystemButton({
  orgId,
  academy,
  systemId,
}: {
  orgId: string;
  academy: { style: string; headInstructor?: string; affiliation?: string; description?: string };
  systemId: string;
}) {
  const { result, pending, run } = useAction();
  return (
    <span className="flex items-center gap-2">
      <Button
        size="sm"
        variant="secondary"
        loading={pending}
        onClick={() => run(() => saveAcademy(orgId, { ...academy, rankSystemId: systemId }))}
      >
        Use for new students
      </Button>
      <ActionFeedback result={result} />
    </span>
  );
}
