"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { type ActionResult, actionError } from "@/lib/actions/result";
import { gatewayFetch } from "@/lib/api/gateway";
import { getSession } from "@/lib/auth/session";

const uuid = z.uuid();
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a date.");
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => v || undefined);

async function send<T = unknown>(
  path: string,
  method: "POST" | "PUT" | "PATCH" | "DELETE",
  body: unknown,
  success: string,
  page: string,
): Promise<{ data?: T; result: ActionResult }> {
  const session = await getSession();
  if (!session) return { result: { error: "Please sign in again." } };
  try {
    const { data } = await gatewayFetch<T>(path, { method, body, accessToken: session.accessToken });
    revalidatePath(page, "layout");
    return { data, result: { success } };
  } catch (error) {
    return { result: actionError(error) };
  }
}

const ids = (...values: string[]) => values.every((v) => uuid.safeParse(v).success);
const b = (orgId: string) => `/business/${orgId}/karate`;

// ------------------------------------------------------------------ academy & students

export async function saveAcademyAction(
  orgId: string,
  input: {
    style: string;
    headInstructor?: string;
    affiliation?: string;
    description?: string;
    rankSystemId?: string;
  },
): Promise<ActionResult> {
  const parsed = z
    .object({
      style: z.enum(["SHOTOKAN", "GOJU_RYU", "WADO_RYU", "SHITO_RYU", "KYOKUSHIN", "OTHER"]),
      headInstructor: optionalText(120),
      affiliation: optionalText(150),
      description: optionalText(2000),
      rankSystemId: uuid.optional(),
    })
    .safeParse(input);
  if (!parsed.success || !ids(orgId)) return { error: "Check the form." };
  return (await send(`${b(orgId)}/academy`, "PUT", parsed.data, "Academy saved.", "/karate")).result;
}

const student = z.object({
  name: z.string().trim().min(2, "Enter the student's name.").max(120),
  dateOfBirth: date,
  gender: z.enum(["MALE", "FEMALE"]),
  beltRank: z.coerce.number().int().min(1).max(12),
  beltSince: z
    .union([z.literal(""), date])
    .optional()
    .transform((v) => v || undefined),
  email: z
    .union([z.literal(""), z.email("Enter a valid email address.")])
    .optional()
    .transform((v) => v || undefined),
});

/** Enrols a student, or updates [studentId] when given. */
export async function enrolAction(
  orgId: string,
  input: z.input<typeof student>,
  studentId?: string,
): Promise<ActionResult> {
  const parsed = student.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the form." };
  if (!ids(orgId)) return { error: "Invalid request." };
  if (studentId && !ids(studentId)) return { error: "Invalid request." };
  return (
    await send(
      studentId ? `${b(orgId)}/students/${studentId}` : `${b(orgId)}/students`,
      studentId ? "PATCH" : "POST",
      parsed.data,
      studentId ? "Student saved." : "Student enrolled.",
      "/karate",
    )
  ).result;
}

export async function leaveAction(orgId: string, studentId: string): Promise<ActionResult> {
  if (!ids(orgId, studentId)) return { error: "Invalid request." };
  return (await send(`${b(orgId)}/students/${studentId}`, "DELETE", undefined, "Student removed.", "/karate"))
    .result;
}

// ------------------------------------------------------------------ gradings

export async function createGradingAction(
  orgId: string,
  input: { title: string; heldOn: string; examiner: string },
): Promise<ActionResult & { id?: string }> {
  const parsed = z
    .object({
      title: z.string().trim().min(2, "Enter a title.").max(120),
      heldOn: date,
      examiner: z.string().trim().min(2, "Enter the examiner.").max(120),
    })
    .safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the form." };
  if (!ids(orgId)) return { error: "Invalid request." };
  const { data, result } = await send<{ id: string }>(
    `${b(orgId)}/gradings`,
    "POST",
    parsed.data,
    "Grading planned.",
    "/karate/gradings",
  );
  return { ...result, id: data?.id };
}

export async function candidateAction(orgId: string, gradingId: string, studentId: string, add: boolean) {
  if (!ids(orgId, gradingId, studentId)) return { error: "Invalid request." };
  return add
    ? (
        await send(
          `${b(orgId)}/gradings/${gradingId}/candidates`,
          "POST",
          { studentId },
          "Candidate added.",
          "/karate/gradings",
        )
      ).result
    : (
        await send(
          `${b(orgId)}/gradings/${gradingId}/candidates/${studentId}`,
          "DELETE",
          undefined,
          "Candidate removed.",
          "/karate/gradings",
        )
      ).result;
}

export async function gradeAction(
  orgId: string,
  gradingId: string,
  studentId: string,
  result: "PASSED" | "FAILED",
  note: string,
): Promise<ActionResult> {
  if (!ids(orgId, gradingId, studentId)) return { error: "Invalid request." };
  return (
    await send(
      `${b(orgId)}/gradings/${gradingId}/results`,
      "POST",
      { studentId, result, note: note.trim().slice(0, 300) || undefined },
      result === "PASSED" ? "Promoted." : "Recorded.",
      "/karate/gradings",
    )
  ).result;
}

// ------------------------------------------------------------------ tournaments

const tournament = z
  .object({
    name: z.string().trim().min(3, "Enter the tournament name.").max(120),
    description: optionalText(4000),
    rules: optionalText(4000),
    city: z.string().trim().min(2, "Enter the city.").max(80),
    venueId: z
      .union([z.literal(""), uuid])
      .optional()
      .transform((v) => v || undefined),
    startDate: date,
    endDate: date,
    registrationClosesAt: z.string().min(1, "Choose when registration closes."),
    entryFee: z.coerce.number().min(0).max(100000),
  })
  .refine((t) => t.endDate >= t.startDate, { message: "The tournament must end on or after its start." });

export async function saveKarateTournamentAction(
  orgId: string,
  id: string | null,
  input: z.input<typeof tournament>,
): Promise<ActionResult & { id?: string }> {
  const parsed = tournament.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the form." };
  if (!ids(orgId) || (id !== null && !ids(id))) return { error: "Invalid request." };
  const body = {
    ...parsed.data,
    registrationClosesAt: new Date(`${parsed.data.registrationClosesAt}:00+05:30`).toISOString(),
  };
  const { data, result } = await send<{ tournament: { id: string } }>(
    `${b(orgId)}/tournaments${id ? `/${id}` : ""}`,
    id ? "PUT" : "POST",
    body,
    id ? "Tournament saved." : "Tournament created.",
    "/karate/tournaments",
  );
  return { ...result, id: data?.tournament.id };
}

export async function karateStatusAction(orgId: string, id: string, to: string, reason?: string) {
  if (!ids(orgId, id) || !["OPEN", "CLOSED", "IN_PROGRESS", "COMPLETED", "CANCELLED"].includes(to)) {
    return { error: "Invalid request." };
  }
  return (
    await send(
      `${b(orgId)}/tournaments/${id}/status`,
      "POST",
      { to, reason: reason?.trim().slice(0, 300) || undefined },
      "Status updated.",
      "/karate/tournaments",
    )
  ).result;
}

const category = z.object({
  discipline: z.enum(["KATA", "KUMITE"]),
  name: z.string().trim().min(2, "Enter the category name.").max(120),
  gender: z.enum(["MALE", "FEMALE", "MIXED"]),
  minAge: z.coerce.number().int().min(3).max(99),
  maxAge: z.coerce.number().int().min(3).max(99),
  minBelt: z.coerce.number().int().min(1).max(12),
  maxBelt: z.coerce.number().int().min(1).max(12),
  minWeight: z
    .union([z.literal(""), z.coerce.number().min(10).max(250)])
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  maxWeight: z
    .union([z.literal(""), z.coerce.number().min(10).max(250)])
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  maxEntries: z.coerce.number().int().min(2).max(256),
});

export async function addCategoryAction(
  orgId: string,
  tournamentId: string,
  input: z.input<typeof category>,
  categoryId?: string,
): Promise<ActionResult> {
  const parsed = category.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the form." };
  if (!ids(orgId, tournamentId)) return { error: "Invalid request." };
  return (
    await send(
      categoryId
        ? `${b(orgId)}/categories/${categoryId}`
        : `${b(orgId)}/tournaments/${tournamentId}/categories`,
      categoryId ? "PUT" : "POST",
      parsed.data,
      categoryId ? "Category saved." : "Category added.",
      "/karate/tournaments",
    )
  ).result;
}

/** draw | finalise | delete | referee | remove-entry for one category / entry. */
export async function categoryOpAction(
  orgId: string,
  op: "draw" | "finalise" | "delete" | "referee" | "remove-entry",
  targetId: string,
  value?: string,
): Promise<ActionResult> {
  if (!ids(orgId, targetId) || (value && op === "referee" && !ids(value)))
    return { error: "Invalid request." };
  const page = "/karate/tournaments";
  switch (op) {
    case "draw":
      return (await send(`${b(orgId)}/categories/${targetId}/draw`, "POST", undefined, "Drawn.", page))
        .result;
    case "finalise":
      return (
        await send(`${b(orgId)}/categories/${targetId}/finalise`, "POST", undefined, "Results final.", page)
      ).result;
    case "delete":
      return (
        await send(`${b(orgId)}/categories/${targetId}`, "DELETE", undefined, "Category deleted.", page)
      ).result;
    case "referee":
      return (
        await send(
          `${b(orgId)}/categories/${targetId}/referee`,
          "PUT",
          { refereeProfileId: value || undefined },
          "Referee saved.",
          page,
        )
      ).result;
    case "remove-entry":
      return (
        await send(
          `${b(orgId)}/entries/${targetId}/remove`,
          "POST",
          { reason: value?.trim().slice(0, 300) || undefined },
          "Entry removed (refunded if paid).",
          page,
        )
      ).result;
  }
}

export async function kataScoreAction(
  orgId: string,
  categoryId: string,
  entryId: string,
  scores: string,
): Promise<ActionResult> {
  const list = scores
    .split(/[\s,;]+/)
    .filter(Boolean)
    .map(Number);
  if (!ids(orgId, categoryId, entryId) || list.some((n) => Number.isNaN(n))) {
    return { error: "Enter the judges' scores, e.g. 8.2 8.4 8.0" };
  }
  return (
    await send(
      `${b(orgId)}/categories/${categoryId}/kata-scores`,
      "POST",
      { entryId, scores: list },
      "Score saved.",
      "/karate/tournaments",
    )
  ).result;
}

// ------------------------------------------------------------------ bouts (organiser or referee)

export async function boutResultAction(
  boutId: string,
  input: { redScore: number; blueScore: number; winner: "RED" | "BLUE"; decision: string },
): Promise<ActionResult> {
  const parsed = z
    .object({
      redScore: z.number().int().min(0).max(99),
      blueScore: z.number().int().min(0).max(99),
      winner: z.enum(["RED", "BLUE"]),
      decision: z.enum(["POINTS", "SENSHU", "HANTEI", "KIKEN", "HANSOKU"]),
    })
    .safeParse(input);
  if (!parsed.success || !ids(boutId)) return { error: "Check the result." };
  return (await send(`/karate/bouts/${boutId}/result`, "POST", parsed.data, "Result recorded.", "/")).result;
}

/** Only a planned grading can be cancelled. */
export async function cancelGradingAction(orgId: string, gradingId: string): Promise<ActionResult> {
  if (!ids(orgId, gradingId)) return { error: "Invalid request." };
  return (
    await send(
      `${b(orgId)}/gradings/${gradingId}/cancel`,
      "POST",
      undefined,
      "Grading cancelled.",
      "/karate/gradings",
    )
  ).result;
}

// ------------------------------------------------------------------ rank systems (K2)

const rank = z.object({
  name: z.string().trim().min(1, "Enter the belt.").max(40),
  grade: z.string().trim().min(1, "Enter the grade.").max(40),
  kind: z.enum(["KYU", "DAN"]),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Choose the belt colour."),
  minMonths: z.coerce.number().int().min(0).max(240),
  minAge: z.coerce.number().int().min(0).max(99),
  description: optionalText(500),
});

export async function createRankSystemAction(
  orgId: string,
  input: { name: string; style?: string; copyDefault: boolean },
): Promise<ActionResult> {
  const parsed = z
    .object({
      name: z.string().trim().min(1, "Enter a name.").max(120),
      style: z
        .union([
          z.literal(""),
          z.enum(["SHOTOKAN", "GOJU_RYU", "WADO_RYU", "SHITO_RYU", "KYOKUSHIN", "OTHER"]),
        ])
        .optional()
        .transform((v) => v || undefined),
      copyDefault: z.boolean(),
    })
    .safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the form." };
  if (!ids(orgId)) return { error: "Invalid request." };
  return (
    await send(`${b(orgId)}/rank-systems`, "POST", parsed.data, "Rank system created.", "/karate/ranks")
  ).result;
}

/** Adds a rank at the top of [systemId], or updates [rankId]. */
export async function saveRankAction(
  orgId: string,
  target: { systemId?: string; rankId?: string },
  input: z.input<typeof rank>,
): Promise<ActionResult> {
  const parsed = rank.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the form." };
  const id = target.rankId ?? target.systemId;
  if (!id || !ids(orgId, id)) return { error: "Invalid request." };
  return (
    await send(
      target.rankId
        ? `${b(orgId)}/ranks/${target.rankId}`
        : `${b(orgId)}/rank-systems/${target.systemId}/ranks`,
      target.rankId ? "PUT" : "POST",
      parsed.data,
      target.rankId ? "Rank saved." : "Rank added.",
      "/karate/ranks",
    )
  ).result;
}

/** Ranks are deactivated, never deleted: history keeps referring to them. */
export async function activateRankAction(
  orgId: string,
  rankId: string,
  active: boolean,
): Promise<ActionResult> {
  if (!ids(orgId, rankId)) return { error: "Invalid request." };
  return (
    await send(
      `${b(orgId)}/ranks/${rankId}/active`,
      "POST",
      { active },
      active ? "Rank in use." : "Rank retired.",
      "/karate/ranks",
    )
  ).result;
}
