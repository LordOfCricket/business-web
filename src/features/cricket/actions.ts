"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { type ActionResult, actionError } from "@/lib/actions/result";
import { gatewayFetch } from "@/lib/api/gateway";
import { getSession } from "@/lib/auth/session";

const uuid = z.uuid();

async function send<T = unknown>(
  path: string,
  method: "POST" | "PUT" | "PATCH" | "DELETE",
  body: unknown,
  success: string,
  revalidate: string,
): Promise<{ data?: T; result: ActionResult }> {
  const session = await getSession();
  if (!session) return { result: { error: "Please sign in again." } };
  try {
    const { data } = await gatewayFetch<T>(path, { method, body, accessToken: session.accessToken });
    revalidatePath(revalidate);
    return { data, result: { success } };
  } catch (error) {
    return { result: actionError(error) };
  }
}

// ------------------------------------------------------------------ organiser

const tournament = z
  .object({
    name: z.string().trim().min(3, "Enter the tournament name.").max(120),
    description: z.string().trim().max(4000).optional(),
    rules: z.string().trim().max(4000).optional(),
    city: z.string().trim().min(2, "Enter the city.").max(80),
    venueId: z.union([z.literal(""), uuid]).optional(),
    ballType: z.enum(["LEATHER", "TENNIS"]),
    overs: z.coerce.number().int().min(1).max(50),
    playersPerSide: z.coerce.number().int().min(2).max(11),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose the start date."),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose the end date."),
    registrationClosesAt: z.string().min(1, "Choose when registration closes."),
    entryFee: z.coerce.number().min(0).max(100000),
    maxTeams: z.coerce.number().int().min(2).max(128),
  })
  .refine((t) => t.endDate >= t.startDate, { message: "The tournament must end on or after its start." });

/** {@code registrationClosesAt} arrives as a local (IST) date-time from the form. */
export async function saveTournamentAction(
  orgId: string,
  id: string | null,
  input: z.input<typeof tournament>,
): Promise<ActionResult & { id?: string }> {
  const parsed = tournament.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the form." };
  if (!uuid.safeParse(orgId).success || (id !== null && !uuid.safeParse(id).success)) {
    return { error: "Invalid request." };
  }
  const t = parsed.data;
  const body = {
    ...t,
    description: t.description || undefined,
    rules: t.rules || undefined,
    venueId: t.venueId || undefined,
    registrationClosesAt: new Date(`${t.registrationClosesAt}:00+05:30`).toISOString(),
  };
  const path = `/business/${orgId}/cricket/tournaments${id ? `/${id}` : ""}`;
  const { data, result } = await send<{ tournament: { id: string } }>(
    path,
    id ? "PUT" : "POST",
    body,
    id ? "Tournament saved." : "Tournament created.",
    "/tournaments",
  );
  return { ...result, id: data?.tournament.id };
}

export async function tournamentStatusAction(
  orgId: string,
  id: string,
  to: "OPEN" | "CLOSED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED",
  reason?: string,
): Promise<ActionResult> {
  if (!uuid.safeParse(orgId).success || !uuid.safeParse(id).success) return { error: "Invalid request." };
  return (
    await send(
      `/business/${orgId}/cricket/tournaments/${id}/status`,
      "POST",
      { to, reason: reason?.trim().slice(0, 300) || undefined },
      "Status updated.",
      `/tournaments/${id}`,
    )
  ).result;
}

export async function removeEntryAction(
  orgId: string,
  tournamentId: string,
  entryId: string,
  reason: string,
) {
  if (![orgId, tournamentId, entryId].every((v) => uuid.safeParse(v).success))
    return { error: "Invalid request." };
  return (
    await send(
      `/business/${orgId}/cricket/entries/${entryId}/remove`,
      "POST",
      { reason: reason.trim().slice(0, 300) || undefined },
      "Team removed (refunded if paid).",
      `/tournaments/${tournamentId}`,
    )
  ).result;
}

const fixture = z.object({
  homeTeamId: uuid,
  awayTeamId: uuid,
  startsAt: z.string().min(1, "Choose the date and time."),
  stage: z.string().trim().min(1, "Enter the stage, e.g. League.").max(40),
  ground: z.string().trim().max(150).optional(),
});

export async function scheduleMatchAction(
  orgId: string,
  tournamentId: string,
  input: z.input<typeof fixture>,
): Promise<ActionResult> {
  const parsed = fixture.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the form." };
  if (!uuid.safeParse(orgId).success || !uuid.safeParse(tournamentId).success)
    return { error: "Invalid request." };
  const f = parsed.data;
  return (
    await send(
      `/business/${orgId}/cricket/tournaments/${tournamentId}/matches`,
      "POST",
      { ...f, ground: f.ground || undefined, startsAt: new Date(`${f.startsAt}:00+05:30`).toISOString() },
      "Match scheduled.",
      `/tournaments/${tournamentId}`,
    )
  ).result;
}

export async function officialsAction(
  orgId: string,
  tournamentId: string,
  matchId: string,
  umpires: string[],
  scorer: string,
): Promise<ActionResult> {
  const ids = [orgId, tournamentId, matchId, ...umpires, ...(scorer ? [scorer] : [])];
  if (!ids.every((v) => uuid.safeParse(v).success) || umpires.length > 2)
    return { error: "Invalid request." };
  return (
    await send(
      `/business/${orgId}/cricket/matches/${matchId}/officials`,
      "PUT",
      { umpireProfileIds: umpires, scorerProfileId: scorer || undefined },
      "Officials saved.",
      `/tournaments/${tournamentId}`,
    )
  ).result;
}

export async function abandonMatchAction(
  orgId: string,
  tournamentId: string,
  matchId: string,
  reason: string,
) {
  if (![orgId, tournamentId, matchId].every((v) => uuid.safeParse(v).success))
    return { error: "Invalid request." };
  return (
    await send(
      `/business/${orgId}/cricket/matches/${matchId}/abandon`,
      "POST",
      { reason: reason.trim().slice(0, 300) || undefined },
      "Match abandoned.",
      `/tournaments/${tournamentId}`,
    )
  ).result;
}

// ------------------------------------------------------------------ scoring

export async function tossAction(matchId: string, winnerTeamId: string, decision: "BAT" | "BOWL") {
  if (!uuid.safeParse(matchId).success || !uuid.safeParse(winnerTeamId).success)
    return { error: "Invalid request." };
  return (
    await send(
      `/cricket/matches/${matchId}/toss`,
      "POST",
      { winnerTeamId, decision },
      "Play!",
      `/scoring/${matchId}`,
    )
  ).result;
}

const delivery = z.object({
  seq: z.number().int().min(1),
  strikerId: uuid,
  nonStrikerId: uuid,
  bowlerId: uuid,
  batRuns: z.number().int().min(0).max(7),
  extra: z.enum(["NONE", "WIDE", "NO_BALL", "BYE", "LEG_BYE"]),
  extraRuns: z.number().int().min(0).max(7),
  wicket: z.enum(["BOWLED", "CAUGHT", "LBW", "STUMPED", "HIT_WICKET", "RUN_OUT"]).optional(),
  dismissedId: uuid.optional(),
  fielderId: uuid.optional(),
  // ground board: where the ball went (unit circle around the pitch), both or neither
  shotX: z.number().min(-1.05).max(1.05).optional(),
  shotY: z.number().min(-1.05).max(1.05).optional(),
});

export async function ballAction(matchId: string, input: z.input<typeof delivery>): Promise<ActionResult> {
  const parsed = delivery.safeParse(input);
  if (!parsed.success || !uuid.safeParse(matchId).success) {
    return { error: "Choose both batters and the bowler." };
  }
  return (
    await send(`/cricket/matches/${matchId}/balls`, "POST", parsed.data, "Recorded.", `/scoring/${matchId}`)
  ).result;
}

export async function undoBallAction(matchId: string): Promise<ActionResult> {
  if (!uuid.safeParse(matchId).success) return { error: "Invalid request." };
  return (
    await send(
      `/cricket/matches/${matchId}/balls/last`,
      "DELETE",
      undefined,
      "Last ball undone.",
      `/scoring/${matchId}`,
    )
  ).result;
}
