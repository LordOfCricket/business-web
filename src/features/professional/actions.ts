"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { gatewayFetch, GatewayError } from "@/lib/api/gateway";
import { getSession } from "@/lib/auth/session";

export interface ActionResult {
  error?: string;
  success?: string;
}

const slug = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/);
const roleSchema = z
  .array(z.object({ type: slug, sport: slug }))
  .min(1, "Choose at least one role.")
  .max(20);

async function token(): Promise<string> {
  const session = await getSession();
  if (!session) redirect("/login?next=/profile");
  return session.accessToken;
}

async function send(path: string, method: "POST" | "PUT" | "PATCH", body?: unknown): Promise<ActionResult> {
  try {
    await gatewayFetch(`/professional-profile${path}`, { method, body, accessToken: await token() });
  } catch (error) {
    if (error instanceof GatewayError) {
      const fields = error.body.details?.fields as Record<string, string> | undefined;
      const first = fields ? Object.entries(fields)[0] : undefined;
      return { error: first ? `${first[0]}: ${first[1]}` : error.body.message };
    }
    return { error: "Something went wrong. Please try again." };
  }
  revalidatePath("/profile");
  return { success: "Saved." };
}

export async function onboardAction(input: {
  displayName: string;
  city: string;
  roles: Array<{ type: string; sport: string }>;
}): Promise<ActionResult> {
  const parsed = z
    .object({
      displayName: z.string().trim().min(2, "Enter the name clients will see.").max(120),
      city: z.string().trim().min(2, "Enter your city.").max(80),
      roles: roleSchema,
    })
    .safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const result = await send("", "POST", parsed.data);
  if (result.error) return result;
  redirect("/profile");
}

export async function updateDetailsAction(input: {
  displayName: string;
  headline?: string;
  bio?: string;
  experienceYears?: number | null;
  city?: string;
  avatarMediaId?: string | null;
}): Promise<ActionResult> {
  const parsed = z
    .object({
      displayName: z.string().trim().min(2).max(120),
      headline: z.string().trim().max(160).optional(),
      bio: z.string().trim().max(3000).optional(),
      experienceYears: z.number().int().min(0).max(70).nullable().optional(),
      city: z.string().trim().max(80).optional(),
      avatarMediaId: z.uuid().nullable().optional(),
    })
    .safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  return send("", "PATCH", parsed.data);
}

export async function replaceRolesAction(
  roles: Array<{ type: string; sport: string }>,
): Promise<ActionResult> {
  const parsed = roleSchema.safeParse(roles);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  return send("/roles", "PUT", { roles: parsed.data });
}

export async function replaceServicesAction(
  items: Array<{ name: string; description?: string; priceAmount: number; durationMinutes?: number }>,
): Promise<ActionResult> {
  const parsed = z
    .array(
      z.object({
        name: z.string().trim().min(1, "Every service needs a name.").max(120),
        description: z.string().trim().max(1000).optional(),
        priceAmount: z.number().min(0, "Prices cannot be negative.").max(99_999_999),
        durationMinutes: z.number().int().min(15).max(1440).optional(),
      }),
    )
    .max(20)
    .safeParse(items);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  return send("/services", "PUT", { items: parsed.data.map((s) => ({ ...s, currency: "INR" })) });
}

export async function replaceAvailabilityAction(
  items: Array<{ dayOfWeek: number; startTime: string; endTime: string }>,
): Promise<ActionResult> {
  const time = z.string().regex(/^\d{2}:\d{2}$/, "Use HH:MM times.");
  const parsed = z
    .array(z.object({ dayOfWeek: z.number().int().min(1).max(7), startTime: time, endTime: time }))
    .max(50)
    .safeParse(items);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  return send("/availability", "PUT", { items: parsed.data });
}

export async function replaceSpecializationsAction(items: string[]): Promise<ActionResult> {
  const parsed = z.array(z.string().trim().min(1).max(80)).max(20).safeParse(items);
  if (!parsed.success) return { error: "Up to 20 specializations of 80 characters each." };
  return send("/specializations", "PUT", { items: parsed.data });
}

export async function replaceCertificationsAction(
  items: Array<{ name: string; issuer?: string; yearAwarded?: number; mediaId?: string }>,
): Promise<ActionResult> {
  const parsed = z
    .array(
      z.object({
        name: z.string().trim().min(1, "Every certification needs a name.").max(160),
        issuer: z.string().trim().max(160).optional(),
        yearAwarded: z.number().int().min(1950).max(2100).optional(),
        mediaId: z.uuid().optional(),
      }),
    )
    .max(20)
    .safeParse(items);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  return send("/certifications", "PUT", { items: parsed.data });
}

export async function setPublishedAction(publish: boolean): Promise<ActionResult> {
  return send(publish ? "/publish" : "/unpublish", "POST");
}
