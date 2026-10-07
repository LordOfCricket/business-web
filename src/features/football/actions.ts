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

const PAGE = "/football/tournaments";
const ids = (...values: string[]) => values.every((v) => uuid.safeParse(v).success);
const b = (orgId: string) => `/business/${orgId}/football`;

async function send<T = unknown>(
  path: string,
  method: "POST" | "PUT" | "PATCH" | "DELETE",
  body: unknown,
  success: string,
  page = PAGE,
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

// ------------------------------------------------------------------ tournaments

const tournament = z
  .object({
    name: z.string().trim().min(3, "Enter the tournament name.").max(120),
    description: optionalText(4000),
    rules: optionalText(4000),
    city: z.string().trim().min(2, "Enter the city.").max(80),
    surface: z.enum(["GRASS", "TURF", "INDOOR"]),
    venueId: z
      .union([z.literal(""), uuid])
      .optional()
      .transform((v) => v || undefined),
    minutesPerHalf: z.coerce.number().int().min(10).max(45),
    playersPerSide: z.coerce.number().int().min(5).max(11),
    startDate: date,
    endDate: date,
    registrationClosesAt: z.string().min(1, "Choose when registration closes."),
    maxTeams: z.coerce.number().int().min(2).max(64),
    entryFee: z.coerce.number().min(0).max(100000),
  })
  .refine((t) => t.endDate >= t.startDate, { message: "The tournament must end on or after its start." });

export async function saveTournamentAction(
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
  );
  return { ...result, id: data?.tournament.id };
}

export async function statusAction(orgId: string, id: string, to: string, reason?: string) {
  if (!ids(orgId, id) || !["OPEN", "CLOSED", "IN_PROGRESS", "COMPLETED", "CANCELLED"].includes(to)) {
    return { error: "Invalid request." };
  }
  return (
    await send(
      `${b(orgId)}/tournaments/${id}/status`,
      "POST",
      { to, reason: reason?.trim().slice(0, 300) || undefined },
      "Status updated.",
    )
  ).result;
}

export async function removeEntryAction(
  orgId: string,
  entryId: string,
  reason: string,
): Promise<ActionResult> {
  if (!ids(orgId, entryId)) return { error: "Invalid request." };
  return (
    await send(
      `${b(orgId)}/entries/${entryId}/remove`,
      "POST",
      { reason: reason.trim().slice(0, 300) || undefined },
      "Entry removed (refunded if paid).",
    )
  ).result;
}

// ------------------------------------------------------------------ fixtures

export async function generateFixturesAction(orgId: string, tournamentId: string): Promise<ActionResult> {
  if (!ids(orgId, tournamentId)) return { error: "Invalid request." };
  return (
    await send(`${b(orgId)}/tournaments/${tournamentId}/fixtures`, "POST", undefined, "Fixtures drawn up.")
  ).result;
}

export async function rescheduleAction(
  orgId: string,
  matchId: string,
  stage: string,
  startsAt: string,
  pitch: string,
): Promise<ActionResult> {
  if (!ids(orgId, matchId) || !startsAt) return { error: "Choose a kick-off time." };
  return (
    await send(
      `${b(orgId)}/matches/${matchId}`,
      "PATCH",
      {
        stage: stage.trim().slice(0, 40) || "Round",
        startsAt: new Date(`${startsAt}:00+05:30`).toISOString(),
        pitch: pitch.trim().slice(0, 120) || undefined,
      },
      "Match rescheduled.",
    )
  ).result;
}

export async function officialsAction(
  orgId: string,
  matchId: string,
  referee: string,
  assistants: string[],
): Promise<ActionResult> {
  const chosen = [orgId, matchId, ...(referee ? [referee] : []), ...assistants];
  if (!ids(...chosen) || assistants.length > 2) return { error: "Invalid request." };
  return (
    await send(
      `${b(orgId)}/matches/${matchId}/officials`,
      "PUT",
      { refereeProfileId: referee || undefined, assistantProfileIds: assistants },
      "Officials saved.",
    )
  ).result;
}

export async function abandonAction(orgId: string, matchId: string, reason: string): Promise<ActionResult> {
  if (!ids(orgId, matchId)) return { error: "Invalid request." };
  return (
    await send(
      `${b(orgId)}/matches/${matchId}/abandon`,
      "POST",
      { reason: reason.trim().slice(0, 300) || undefined },
      "Match abandoned.",
    )
  ).result;
}

// ------------------------------------------------------------------ the match (referee or organiser)

async function refereeCall(path: string, method: "POST" | "DELETE", body: unknown, success: string) {
  const session = await getSession();
  if (!session) return { error: "Please sign in again." };
  try {
    await gatewayFetch(path, { method, body, accessToken: session.accessToken });
    revalidatePath("/refereeing", "layout");
    return { success };
  } catch (error) {
    return actionError(error);
  }
}

export async function startMatchAction(matchId: string): Promise<ActionResult> {
  if (!ids(matchId)) return { error: "Invalid request." };
  return refereeCall(`/football/matches/${matchId}/start`, "POST", undefined, "Kick-off.");
}

const incident = z.object({
  seq: z.number().int().min(1),
  minute: z.coerce.number().int().min(0).max(130),
  teamId: uuid,
  playerId: uuid,
  type: z.enum(["GOAL", "PENALTY_GOAL", "OWN_GOAL", "PENALTY_MISSED", "YELLOW_CARD", "RED_CARD"]),
  assistPlayerId: z
    .union([z.literal(""), uuid])
    .optional()
    .transform((v) => v || undefined),
  note: optionalText(200),
});

export async function recordEventAction(
  matchId: string,
  input: z.input<typeof incident>,
): Promise<ActionResult> {
  const parsed = incident.safeParse(input);
  if (!parsed.success || !ids(matchId)) {
    return {
      error: parsed.success ? "Invalid request." : (parsed.error.issues[0]?.message ?? "Check the form."),
    };
  }
  return refereeCall(`/football/matches/${matchId}/events`, "POST", parsed.data, "Recorded.");
}

export async function undoEventAction(matchId: string): Promise<ActionResult> {
  if (!ids(matchId)) return { error: "Invalid request." };
  return refereeCall(
    `/football/matches/${matchId}/events/last`,
    "DELETE",
    undefined,
    "Last incident taken back.",
  );
}

export async function finishMatchAction(matchId: string): Promise<ActionResult> {
  if (!ids(matchId)) return { error: "Invalid request." };
  return refereeCall(`/football/matches/${matchId}/finish`, "POST", undefined, "Full time.");
}
