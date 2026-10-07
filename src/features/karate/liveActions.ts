"use server";

import { z } from "zod";
import { actionError } from "@/lib/actions/result";
import { GatewayError, gatewayFetch } from "@/lib/api/gateway";
import { getSession } from "@/lib/auth/session";
import type { BoutAction, BoutEventLine, BoutLive } from "./live";

const uuid = z.uuid();

/** A transient failure (network, timeout, 5xx) keeps the action queued; anything else is a refusal. */
export type LiveResult = { live?: BoutLive; error?: string; transient?: boolean };

export async function boutLiveAction(boutId: string): Promise<LiveResult> {
  if (!uuid.safeParse(boutId).success) return { error: "Invalid request." };
  const session = await getSession();
  try {
    const { data } = await gatewayFetch<BoutLive>(`/karate/bouts/${boutId}/live`, {
      accessToken: session?.accessToken,
    });
    return { live: data };
  } catch (error) {
    return failure(error);
  }
}

const action = z.object({
  clientActionId: uuid,
  type: z.enum([
    "CALL",
    "START",
    "PAUSE",
    "RESUME",
    "SCORE",
    "PENALTY",
    "SENSHU_REVOKE",
    "CORRECTION",
    "FINISH",
    "DECISION",
    "WALKOVER",
    "NO_SHOW",
    "MEDICAL_WITHDRAWAL",
    "DISQUALIFY",
    "CANCEL",
  ]),
  side: z.enum(["RED", "BLUE"]).optional(),
  points: z.number().int().min(1).max(3).optional(),
  penalty: z.enum(["CHUI_1", "CHUI_2", "CHUI_3", "HANSOKU_CHUI", "HANSOKU"]).optional(),
  correctsEventId: uuid.optional(),
  reason: z.string().trim().max(300).optional(),
});

/** Sends one live action; the same client action id sent again is not applied twice by the server. */
export async function boutActAction(boutId: string, input: BoutAction): Promise<LiveResult> {
  const parsed = action.safeParse(input);
  if (!parsed.success || !uuid.safeParse(boutId).success) return { error: "Invalid action." };
  const session = await getSession();
  if (!session) return { error: "Please sign in again.", transient: true };
  try {
    const { data } = await gatewayFetch<BoutLive>(`/karate/bouts/${boutId}/actions`, {
      method: "POST",
      body: parsed.data,
      accessToken: session.accessToken,
    });
    return { live: data };
  } catch (error) {
    return failure(error);
  }
}

export async function boutEventsAction(boutId: string): Promise<BoutEventLine[]> {
  if (!uuid.safeParse(boutId).success) return [];
  const session = await getSession();
  if (!session) return [];
  try {
    return (
      await gatewayFetch<BoutEventLine[]>(`/karate/bouts/${boutId}/events`, {
        accessToken: session.accessToken,
      })
    ).data;
  } catch {
    return [];
  }
}

/** Corrects a finalised result (organiser); the reason is kept with the result before and after. */
export async function correctBoutAction(
  orgId: string,
  boutId: string,
  input: { reason: string; winner: "RED" | "BLUE"; decision: string; redScore: number; blueScore: number },
): Promise<{ error?: string; success?: string }> {
  const parsed = z
    .object({
      reason: z.string().trim().min(3, "Give the reason.").max(300),
      winner: z.enum(["RED", "BLUE"]),
      decision: z.enum(["POINTS", "SENSHU", "HANTEI", "KIKEN", "HANSOKU", "SHIKKAKU", "FUSEN"]),
      redScore: z.number().int().min(0).max(99),
      blueScore: z.number().int().min(0).max(99),
    })
    .safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the form." };
  if (!uuid.safeParse(orgId).success || !uuid.safeParse(boutId).success) return { error: "Invalid request." };
  const session = await getSession();
  if (!session) return { error: "Please sign in again." };
  try {
    await gatewayFetch(`/business/${orgId}/karate/bouts/${boutId}/correction`, {
      method: "POST",
      body: parsed.data,
      accessToken: session.accessToken,
    });
    return { success: "Result corrected." };
  } catch (error) {
    return actionError(error);
  }
}

function failure(error: unknown): LiveResult {
  if (error instanceof GatewayError && error.status < 500 && error.status !== 0) {
    return { error: actionError(error).error };
  }
  return { error: "No connection: the action is kept and sent again.", transient: true };
}
