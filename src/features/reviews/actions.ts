"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { type ActionResult, actionError } from "@/lib/actions/result";
import { gatewayFetch } from "@/lib/api/gateway";
import { getSession } from "@/lib/auth/session";

const reply = z.object({
  reviewId: z.uuid(),
  text: z.string().trim().min(2, "Write a reply.").max(1000, "Keep the reply under 1000 characters."),
});

/** Public reply to a review of the business, one of its venues, or the caller's professional profile. */
export async function replyToReviewAction(reviewId: string, text: string): Promise<ActionResult> {
  const parsed = reply.safeParse({ reviewId, text });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the reply." };
  const session = await getSession();
  if (!session) return { error: "Please sign in again." };
  try {
    await gatewayFetch(`/reviews/${parsed.data.reviewId}/reply`, {
      method: "POST",
      body: { text: parsed.data.text },
      accessToken: session.accessToken,
    });
    revalidatePath("/reviews");
    revalidatePath("/profile/reviews");
    return { success: "Reply published." };
  } catch (error) {
    return actionError(error);
  }
}
