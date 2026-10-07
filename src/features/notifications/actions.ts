"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { type ActionResult, actionError } from "@/lib/actions/result";
import { gatewayFetch } from "@/lib/api/gateway";
import { getSession } from "@/lib/auth/session";

async function token(): Promise<string> {
  const session = await getSession();
  if (!session) redirect("/login?next=/notifications");
  return session.accessToken;
}

export async function markReadAction(id: string): Promise<void> {
  if (!z.uuid().safeParse(id).success) return;
  try {
    await gatewayFetch(`/notifications/${id}/read`, { method: "PATCH", accessToken: await token() });
  } catch {
    // marking as read is best-effort
  }
  revalidatePath("/", "layout");
}

export async function markAllReadAction(): Promise<void> {
  await gatewayFetch("/notifications/read-all", { method: "POST", accessToken: await token() });
  revalidatePath("/", "layout");
}

export async function savePreferencesAction(
  items: Array<{ category: string; email: boolean; inApp: boolean }>,
): Promise<ActionResult> {
  const parsed = z
    .array(
      z.object({
        category: z.enum(["BOOKINGS", "PAYMENTS", "ORDERS", "TOURNAMENTS", "BUSINESS", "ANNOUNCEMENTS"]),
        email: z.boolean(),
        inApp: z.boolean(),
      }),
    )
    .min(1)
    .max(10)
    .safeParse(items);
  if (!parsed.success) return { error: "Invalid preferences." };
  try {
    await gatewayFetch("/notifications/preferences", {
      method: "PUT",
      body: { items: parsed.data },
      accessToken: await token(),
    });
  } catch (error) {
    return actionError(error);
  }
  return { success: "Saved." };
}
