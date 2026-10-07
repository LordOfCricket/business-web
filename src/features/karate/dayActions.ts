"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { type ActionResult, actionError } from "@/lib/actions/result";
import { gatewayFetch } from "@/lib/api/gateway";
import { getSession } from "@/lib/auth/session";

const uuid = z.uuid();
const b = (orgId: string) => `/business/${orgId}/karate`;

async function call(
  path: string,
  method: "POST" | "PUT",
  body: unknown,
  success: string,
): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return { error: "Please sign in again." };
  try {
    await gatewayFetch(path, { method, body, accessToken: session.accessToken });
    revalidatePath("/karate", "layout");
    return { success };
  } catch (error) {
    return actionError(error);
  }
}

const drawConfig = z.object({
  format: z.enum(["KNOCKOUT", "ROUND_ROBIN", "POOLS_KNOCKOUT"]),
  pools: z.coerce.number().int().min(1).max(16),
  qualifiersPerPool: z.coerce.number().int().min(1).max(4),
  thirdPlace: z.boolean(),
  requireCheckIn: z.boolean(),
  tieBreaks: z.array(z.enum(["WINS", "HEAD_TO_HEAD", "POINT_DIFFERENCE", "POINTS_FOR"])).min(1),
  seeds: z.record(z.string(), z.coerce.number().int().min(1)),
});

/** Generates the draw on the server (secure random seed stored) for review. */
export async function generateDrawAction(
  orgId: string,
  categoryId: string,
  input: z.input<typeof drawConfig>,
): Promise<ActionResult> {
  const parsed = drawConfig.safeParse(input);
  if (!parsed.success || !uuid.safeParse(orgId).success || !uuid.safeParse(categoryId).success) {
    return { error: "Check the draw settings." };
  }
  const d = parsed.data;
  return call(
    `${b(orgId)}/categories/${categoryId}/draw/generate`,
    "POST",
    {
      ...d,
      pools: d.format === "POOLS_KNOCKOUT" ? d.pools : 1,
      thirdPlace: d.format !== "ROUND_ROBIN" && d.thirdPlace,
    },
    "Draw generated for review.",
  );
}

export async function swapDrawAction(orgId: string, categoryId: string, a: string, c: string) {
  if (![orgId, categoryId, a, c].every((v) => uuid.safeParse(v).success))
    return { error: "Invalid request." };
  return call(`${b(orgId)}/categories/${categoryId}/draw/swap`, "POST", { a, b: c }, "Swapped.");
}

export async function lockDrawAction(orgId: string, categoryId: string) {
  if (!uuid.safeParse(orgId).success || !uuid.safeParse(categoryId).success)
    return { error: "Invalid request." };
  return call(
    `${b(orgId)}/categories/${categoryId}/draw/lock`,
    "POST",
    undefined,
    "Draw locked: bouts created.",
  );
}

export async function unlockDrawAction(orgId: string, categoryId: string, reason: string) {
  if (!uuid.safeParse(orgId).success || !uuid.safeParse(categoryId).success)
    return { error: "Invalid request." };
  if (!reason.trim()) return { error: "Give the reason." };
  return call(
    `${b(orgId)}/categories/${categoryId}/draw/unlock`,
    "POST",
    { reason: reason.trim() },
    "Draw reopened.",
  );
}

export async function checkInAction(orgId: string, entryId: string) {
  if (!uuid.safeParse(orgId).success || !uuid.safeParse(entryId).success)
    return { error: "Invalid request." };
  return call(`${b(orgId)}/entries/${entryId}/check-in`, "POST", undefined, "Checked in.");
}

export async function weighInAction(orgId: string, entryId: string, kg: string) {
  const weight = Number(kg.replace(",", "."));
  if (!uuid.safeParse(orgId).success || !uuid.safeParse(entryId).success)
    return { error: "Invalid request." };
  if (!Number.isFinite(weight) || weight < 10 || weight > 250) return { error: "Enter the weight in kg." };
  return call(`${b(orgId)}/entries/${entryId}/weigh-in`, "POST", { weightKg: weight }, "Weighed.");
}

export async function overrideWeighInAction(orgId: string, entryId: string, reason: string) {
  if (!uuid.safeParse(orgId).success || !uuid.safeParse(entryId).success)
    return { error: "Invalid request." };
  if (!reason.trim()) return { error: "Give the reason." };
  return call(
    `${b(orgId)}/entries/${entryId}/weigh-in/override`,
    "POST",
    { reason: reason.trim() },
    "Overridden.",
  );
}

export async function addTatamiAction(orgId: string, tournamentId: string, name: string) {
  if (!uuid.safeParse(orgId).success || !uuid.safeParse(tournamentId).success)
    return { error: "Invalid request." };
  if (!name.trim()) return { error: "Name the tatami." };
  return call(
    `${b(orgId)}/tournaments/${tournamentId}/tatamis`,
    "POST",
    { name: name.trim() },
    "Tatami added.",
  );
}

export async function assignTatamiAction(orgId: string, boutId: string, tatamiId: string) {
  if (!uuid.safeParse(orgId).success || !uuid.safeParse(boutId).success) return { error: "Invalid request." };
  return call(
    `${b(orgId)}/bouts/${boutId}/tatami`,
    "PUT",
    { tatamiId: uuid.safeParse(tatamiId).success ? tatamiId : null },
    "Tatami saved.",
  );
}

export async function reorderQueueAction(orgId: string, tatamiId: string, boutIds: string[]) {
  if (![orgId, tatamiId, ...boutIds].every((v) => uuid.safeParse(v).success))
    return { error: "Invalid request." };
  return call(`${b(orgId)}/tatamis/${tatamiId}/queue`, "PUT", { boutIds }, "Queue saved.");
}
