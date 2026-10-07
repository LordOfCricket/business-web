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
  method: "POST" | "PUT" | "DELETE",
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
const b = (orgId: string) => `/business/${orgId}/tennis`;
const PAGE = "/tennis/tournaments";

// ------------------------------------------------------------------ tournaments

const tournament = z
  .object({
    name: z.string().trim().min(3, "Enter the tournament name.").max(120),
    description: optionalText(4000),
    rules: optionalText(4000),
    city: z.string().trim().min(2, "Enter the city.").max(80),
    surface: z.enum(["HARD", "CLAY", "GRASS", "CARPET"]),
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

export async function saveTennisTournamentAction(
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
    PAGE,
  );
  return { ...result, id: data?.tournament.id };
}

export async function tennisStatusAction(orgId: string, id: string, to: string, reason?: string) {
  if (!ids(orgId, id) || !["OPEN", "CLOSED", "IN_PROGRESS", "COMPLETED", "CANCELLED"].includes(to)) {
    return { error: "Invalid request." };
  }
  return (
    await send(
      `${b(orgId)}/tournaments/${id}/status`,
      "POST",
      { to, reason: reason?.trim().slice(0, 300) || undefined },
      "Status updated.",
      PAGE,
    )
  ).result;
}

// ------------------------------------------------------------------ events

const event = z
  .object({
    name: z.string().trim().min(2, "Enter the event name.").max(120),
    gender: z.enum(["MALE", "FEMALE", "OPEN"]),
    minAge: z.coerce.number().int().min(5).max(99),
    maxAge: z.coerce.number().int().min(5).max(99),
    bestOf: z.coerce
      .number()
      .int()
      .refine((v) => [1, 3, 5].includes(v), "Best of one, three or five sets."),
    finalSet: z.enum(["TIEBREAK", "ADVANTAGE", "MATCH_TIEBREAK"]),
    noAd: z.coerce.boolean(),
    maxEntries: z.coerce.number().int().min(2).max(128),
  })
  .refine((e) => e.maxAge >= e.minAge, { message: "Check the age range." });

export async function addEventAction(
  orgId: string,
  tournamentId: string,
  input: z.input<typeof event>,
): Promise<ActionResult> {
  const parsed = event.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the form." };
  if (!ids(orgId, tournamentId)) return { error: "Invalid request." };
  return (
    await send(`${b(orgId)}/tournaments/${tournamentId}/events`, "POST", parsed.data, "Event added.", PAGE)
  ).result;
}

/** draw | delete | umpire | remove-entry for one event / entry. */
export async function eventOpAction(
  orgId: string,
  op: "draw" | "delete" | "umpire" | "remove-entry",
  targetId: string,
  value?: string,
): Promise<ActionResult> {
  if (!ids(orgId, targetId) || (value && op === "umpire" && !ids(value)))
    return { error: "Invalid request." };
  switch (op) {
    case "draw":
      return (await send(`${b(orgId)}/events/${targetId}/draw`, "POST", undefined, "Draw made.", PAGE))
        .result;
    case "delete":
      return (await send(`${b(orgId)}/events/${targetId}`, "DELETE", undefined, "Event deleted.", PAGE))
        .result;
    case "umpire":
      return (
        await send(
          `${b(orgId)}/events/${targetId}/umpire`,
          "PUT",
          { umpireProfileId: value || undefined },
          "Umpire saved.",
          PAGE,
        )
      ).result;
    case "remove-entry":
      return (
        await send(
          `${b(orgId)}/entries/${targetId}/remove`,
          "POST",
          { reason: value?.trim().slice(0, 300) || undefined },
          "Entry removed (refunded if paid).",
          PAGE,
        )
      ).result;
  }
}

export async function scheduleMatchAction(
  orgId: string,
  matchId: string,
  court: string,
  scheduledAt: string,
): Promise<ActionResult> {
  if (!ids(orgId, matchId)) return { error: "Invalid request." };
  const body = {
    court: court.trim().slice(0, 40) || undefined,
    scheduledAt: scheduledAt ? new Date(`${scheduledAt}:00+05:30`).toISOString() : undefined,
  };
  return (await send(`${b(orgId)}/matches/${matchId}/schedule`, "PUT", body, "Order of play saved.", PAGE))
    .result;
}

// ------------------------------------------------------------------ scoring (umpire or organiser)

async function umpireCall(path: string, body: unknown, success: string): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return { error: "Please sign in again." };
  try {
    await gatewayFetch(path, { method: "POST", body, accessToken: session.accessToken });
    revalidatePath("/umpiring", "layout");
    return { success };
  } catch (error) {
    return actionError(error);
  }
}

export async function startMatchAction(matchId: string, firstServer: 1 | 2): Promise<ActionResult> {
  if (!ids(matchId)) return { error: "Invalid request." };
  return umpireCall(`/tennis/matches/${matchId}/start`, { firstServer }, "Match started.");
}

export async function pointAction(
  matchId: string,
  seq: number,
  winner: 1 | 2,
  kind: string,
): Promise<ActionResult> {
  const parsed = z
    .object({
      seq: z.number().int().min(1),
      winner: z.union([z.literal(1), z.literal(2)]),
      kind: z.enum(["RALLY", "ACE", "DOUBLE_FAULT", "WINNER", "UNFORCED_ERROR"]),
    })
    .safeParse({ seq, winner, kind });
  if (!parsed.success || !ids(matchId)) return { error: "Check the point." };
  return umpireCall(`/tennis/matches/${matchId}/points`, parsed.data, "Point recorded.");
}

export async function undoPointAction(matchId: string): Promise<ActionResult> {
  if (!ids(matchId)) return { error: "Invalid request." };
  return umpireCall(`/tennis/matches/${matchId}/undo`, undefined, "Last point taken back.");
}

export async function concedeAction(matchId: string, player: 1 | 2, reason: string): Promise<ActionResult> {
  if (!ids(matchId)) return { error: "Invalid request." };
  return umpireCall(
    `/tennis/matches/${matchId}/concede`,
    { player, reason: reason.trim().slice(0, 300) || undefined },
    "Recorded.",
  );
}
