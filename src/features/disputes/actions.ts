"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { type ActionResult, actionError } from "@/lib/actions/result";
import { gatewayFetch } from "@/lib/api/gateway";
import { getSession } from "@/lib/auth/session";

/** The business's reply on a dispute raised against it. The service checks it really is a party. */
export async function disputeReplyAction(_: ActionResult, form: FormData): Promise<ActionResult> {
  const parsed = z
    .object({ id: z.uuid(), body: z.string().trim().min(2, "Write a reply.").max(2000) })
    .safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the reply." };
  const session = await getSession();
  if (!session) return { error: "Please sign in again." };
  try {
    await gatewayFetch(`/disputes/${parsed.data.id}/messages`, {
      method: "POST",
      body: { body: parsed.data.body },
      accessToken: session.accessToken,
    });
  } catch (error) {
    return actionError(error);
  }
  revalidatePath(`/disputes/${parsed.data.id}`);
  revalidatePath("/disputes");
  return { success: "Reply sent." };
}
