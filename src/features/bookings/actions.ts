"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { type ActionResult, actionError } from "@/lib/actions/result";
import { gatewayFetch } from "@/lib/api/gateway";
import { getSession } from "@/lib/auth/session";

const uuid = z.uuid();

async function token(): Promise<string> {
  const session = await getSession();
  if (!session) redirect("/login?next=/bookings");
  return session.accessToken;
}

async function post(path: string, body?: unknown): Promise<ActionResult> {
  try {
    await gatewayFetch(path, { method: "POST", body, accessToken: await token() });
  } catch (error) {
    return actionError(error);
  }
  revalidatePath("/bookings");
  return { success: "Done." };
}

export async function bookingAction(
  orgId: string,
  bookingId: string,
  action: "cancel" | "complete" | "no-show",
  reason?: string,
): Promise<ActionResult> {
  if (!uuid.safeParse(orgId).success || !uuid.safeParse(bookingId).success)
    return { error: "Invalid request." };
  return post(
    `/business/${orgId}/bookings/${bookingId}/${action}`,
    action === "cancel" ? { reason: reason?.trim() || undefined } : undefined,
  );
}

/** Walk-in / phone booking, paid at the venue. {@code startAt} is local "YYYY-MM-DDTHH:mm" in the venue's zone. */
export async function walkInAction(
  orgId: string,
  input: {
    facilityId: string;
    startAt: string;
    durationMinutes: number;
    name: string;
    phone?: string;
    note?: string;
  },
): Promise<ActionResult> {
  const parsed = z
    .object({
      facilityId: uuid,
      startAt: z.iso.datetime({ offset: true }),
      durationMinutes: z.number().int().min(15).max(720),
      name: z.string().trim().min(1, "Enter the customer's name.").max(120),
      phone: z
        .string()
        .trim()
        .regex(/^\+?[0-9 ]{7,20}$/, "Enter a valid phone number.")
        .optional()
        .or(z.literal("")),
      note: z.string().trim().max(300).optional(),
    })
    .safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const body = { ...parsed.data, phone: parsed.data.phone || undefined, note: parsed.data.note || undefined };
  const result = await post(`/business/${uuid.parse(orgId)}/bookings`, body);
  return result.error ? result : { success: "Walk-in booking added." };
}
