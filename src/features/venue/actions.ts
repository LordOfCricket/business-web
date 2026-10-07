"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { type ActionResult, actionError } from "@/lib/actions/result";
import { gatewayFetch } from "@/lib/api/gateway";
import { getSession } from "@/lib/auth/session";

const uuid = z.uuid();
const slug = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/);
const time = z.string().regex(/^\d{2}:\d{2}$/, "Use HH:MM times.");
const day = z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]);
const optionalText = (max: number) => z.string().trim().max(max).optional().or(z.literal(""));
const coordinate = (limit: number) =>
  z
    .union([z.literal(""), z.coerce.number().min(-limit).max(limit)])
    .optional()
    .transform((v) => (v === "" || v === undefined ? undefined : v));

const venueDetails = z.object({
  name: z.string().trim().min(2, "Enter the venue name.").max(120),
  description: optionalText(5000),
  addressLine: z.string().trim().min(3, "Enter the street address.").max(200),
  city: z.string().trim().min(2, "Enter the city.").max(80),
  state: optionalText(80),
  postalCode: z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9 -]{3,12}$/, "Enter a valid postal code.")
    .optional()
    .or(z.literal("")),
  latitude: coordinate(90),
  longitude: coordinate(180),
  contactPhone: z
    .string()
    .trim()
    .regex(/^\+?[0-9 ]{7,20}$/, "Enter a valid phone number.")
    .optional()
    .or(z.literal("")),
});
export type VenueDetailsInput = z.input<typeof venueDetails>;

const facilityDetails = z.object({
  sport: slug,
  facilityType: slug,
  name: z.string().trim().min(1, "Enter the facility name.").max(120),
  description: optionalText(3000),
  capacity: z
    .union([z.literal(""), z.coerce.number().int().min(1).max(10000)])
    .optional()
    .transform((v) => (v === "" || v === undefined ? undefined : v)),
  indoor: z.boolean(),
});
export type FacilityInput = z.input<typeof facilityDetails>;

async function token(): Promise<string> {
  const session = await getSession();
  if (!session) redirect("/login?next=/venues");
  return session.accessToken;
}

function clean<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(Object.entries(value).filter(([, v]) => v !== "" && v !== undefined)) as T;
}

async function send(
  path: string,
  method: "POST" | "PUT" | "PATCH" | "DELETE",
  body?: unknown,
): Promise<ActionResult> {
  try {
    await gatewayFetch(path, { method, body, accessToken: await token() });
  } catch (error) {
    return actionError(error);
  }
  revalidatePath("/venues", "layout");
  return { success: "Saved." };
}

function first(error: z.ZodError): ActionResult {
  return { error: error.issues[0]?.message ?? "Please check the form." };
}

// ------------------------------------------------------------------ venues

export async function createVenueAction(
  orgId: string,
  input: { details: VenueDetailsInput; sports: string[] },
): Promise<ActionResult> {
  const parsed = z
    .object({ details: venueDetails, sports: z.array(slug).min(1, "Choose at least one sport.").max(20) })
    .safeParse(input);
  if (!parsed.success) return first(parsed.error);
  let venueId: string;
  try {
    const { data } = await gatewayFetch<{ id: string }>(`/business/${uuid.parse(orgId)}/venues`, {
      method: "POST",
      body: { details: clean(parsed.data.details), sports: parsed.data.sports },
      accessToken: await token(),
    });
    venueId = data.id;
  } catch (error) {
    return actionError(error);
  }
  revalidatePath("/venues");
  redirect(`/venues/${venueId}`);
}

export async function updateVenueAction(
  orgId: string,
  venueId: string,
  input: VenueDetailsInput,
): Promise<ActionResult> {
  const parsed = venueDetails.safeParse(input);
  if (!parsed.success) return first(parsed.error);
  return send(`/business/${uuid.parse(orgId)}/venues/${uuid.parse(venueId)}`, "PATCH", clean(parsed.data));
}

export async function replaceVenueSportsAction(
  orgId: string,
  venueId: string,
  sports: string[],
): Promise<ActionResult> {
  const parsed = z.array(slug).min(1, "Choose at least one sport.").max(20).safeParse(sports);
  if (!parsed.success) return first(parsed.error);
  return send(`/business/${uuid.parse(orgId)}/venues/${uuid.parse(venueId)}/sports`, "PUT", {
    sports: parsed.data,
  });
}

const hoursList = z.array(z.object({ day, opensAt: time, closesAt: time })).max(50);

export async function replaceVenueHoursAction(
  orgId: string,
  venueId: string,
  hours: Array<{ day: string; opensAt: string; closesAt: string }>,
): Promise<ActionResult> {
  const parsed = hoursList.safeParse(hours);
  if (!parsed.success) return first(parsed.error);
  return send(`/business/${uuid.parse(orgId)}/venues/${uuid.parse(venueId)}/operating-hours`, "PUT", {
    hours: parsed.data,
  });
}

export async function replaceVenueAmenitiesAction(
  orgId: string,
  venueId: string,
  ids: string[],
): Promise<ActionResult> {
  const parsed = z.array(uuid).max(40).safeParse(ids);
  if (!parsed.success) return first(parsed.error);
  return send(`/business/${uuid.parse(orgId)}/venues/${uuid.parse(venueId)}/amenities`, "PUT", {
    amenityIds: parsed.data,
  });
}

export async function replaceVenueMediaAction(
  orgId: string,
  venueId: string,
  ids: string[],
): Promise<ActionResult> {
  const parsed = z.array(uuid).max(20, "Up to 20 photos and videos.").safeParse(ids);
  if (!parsed.success) return first(parsed.error);
  return send(`/business/${uuid.parse(orgId)}/venues/${uuid.parse(venueId)}/media`, "PUT", {
    mediaIds: parsed.data,
  });
}

export async function venueStatusAction(
  orgId: string,
  venueId: string,
  action: "submit" | "activate" | "deactivate",
): Promise<ActionResult> {
  const result = await send(`/business/${uuid.parse(orgId)}/venues/${uuid.parse(venueId)}/${action}`, "POST");
  if (result.error) return result;
  return {
    success: { submit: "Submitted for approval.", activate: "Venue reopened.", deactivate: "Venue closed." }[
      action
    ],
  };
}

// ------------------------------------------------------------------ facilities

export async function createFacilityAction(
  orgId: string,
  venueId: string,
  input: FacilityInput,
): Promise<ActionResult> {
  const parsed = facilityDetails.safeParse(input);
  if (!parsed.success) return first(parsed.error);
  let facilityId: string;
  try {
    const { data } = await gatewayFetch<{ id: string }>(
      `/business/${uuid.parse(orgId)}/venues/${uuid.parse(venueId)}/facilities`,
      { method: "POST", body: clean(parsed.data), accessToken: await token() },
    );
    facilityId = data.id;
  } catch (error) {
    return actionError(error);
  }
  revalidatePath("/venues", "layout");
  redirect(`/venues/${venueId}/facilities/${facilityId}`);
}

function facilityPath(orgId: string, facilityId: string, suffix = ""): string {
  return `/business/${uuid.parse(orgId)}/facilities/${uuid.parse(facilityId)}${suffix}`;
}

export async function updateFacilityAction(
  orgId: string,
  facilityId: string,
  input: FacilityInput,
): Promise<ActionResult> {
  const parsed = facilityDetails.safeParse(input);
  if (!parsed.success) return first(parsed.error);
  return send(facilityPath(orgId, facilityId), "PATCH", clean(parsed.data));
}

export async function replacePricingAction(
  orgId: string,
  facilityId: string,
  rules: Array<{
    day: string;
    startTime: string;
    endTime: string;
    pricePerHour: number | string;
    peak: boolean;
    label?: string;
  }>,
): Promise<ActionResult> {
  const parsed = z
    .array(
      z.object({
        day,
        startTime: time,
        endTime: time,
        pricePerHour: z.coerce.number().min(0, "Prices cannot be negative.").max(99_999_999),
        peak: z.boolean(),
        label: z.string().trim().max(40).optional(),
      }),
    )
    .max(100)
    .safeParse(rules);
  if (!parsed.success) return first(parsed.error);
  return send(facilityPath(orgId, facilityId, "/pricing"), "PUT", { currency: "INR", rules: parsed.data });
}

export async function replaceRulesAction(
  orgId: string,
  facilityId: string,
  input: Record<string, number | boolean>,
): Promise<ActionResult> {
  const n = (min: number, max: number) => z.coerce.number().int().min(min).max(max);
  const parsed = z
    .object({
      slotMinutes: n(15, 120),
      minDurationMinutes: n(15, 720),
      maxDurationMinutes: n(15, 720),
      advanceDays: n(1, 365),
      bufferMinutes: n(0, 120),
      cancellationCutoffHours: n(0, 168),
      cancellationRefundPercent: n(0, 100),
      rescheduleAllowed: z.boolean(),
      rescheduleCutoffHours: n(0, 168),
    })
    .safeParse(input);
  if (!parsed.success) return first(parsed.error);
  return send(facilityPath(orgId, facilityId, "/booking-rules"), "PUT", parsed.data);
}

export async function replaceFacilityHoursAction(
  orgId: string,
  facilityId: string,
  hours: Array<{ day: string; opensAt: string; closesAt: string }>,
): Promise<ActionResult> {
  const parsed = hoursList.safeParse(hours);
  if (!parsed.success) return first(parsed.error);
  return send(facilityPath(orgId, facilityId, "/operating-hours"), "PUT", { hours: parsed.data });
}

export async function replaceFacilityAmenitiesAction(
  orgId: string,
  facilityId: string,
  ids: string[],
): Promise<ActionResult> {
  const parsed = z.array(uuid).max(40).safeParse(ids);
  if (!parsed.success) return first(parsed.error);
  return send(facilityPath(orgId, facilityId, "/amenities"), "PUT", { amenityIds: parsed.data });
}

export async function replaceFacilityMediaAction(
  orgId: string,
  facilityId: string,
  ids: string[],
): Promise<ActionResult> {
  const parsed = z.array(uuid).max(20).safeParse(ids);
  if (!parsed.success) return first(parsed.error);
  return send(facilityPath(orgId, facilityId, "/media"), "PUT", { mediaIds: parsed.data });
}

export async function facilityStatusAction(
  orgId: string,
  facilityId: string,
  action: "activate" | "deactivate",
): Promise<ActionResult> {
  return send(facilityPath(orgId, facilityId, `/${action}`), "POST");
}

export async function deleteFacilityAction(
  orgId: string,
  venueId: string,
  facilityId: string,
): Promise<ActionResult> {
  const result = await send(facilityPath(orgId, facilityId), "DELETE");
  if (result.error) return result;
  redirect(`/venues/${uuid.parse(venueId)}`);
}

export async function addBlockAction(
  orgId: string,
  facilityId: string,
  input: { startAt: string; endAt: string; type: string; reason?: string },
): Promise<ActionResult> {
  const parsed = z
    .object({
      startAt: z.iso.datetime({ offset: true }),
      endAt: z.iso.datetime({ offset: true }),
      type: z.enum(["BLOCKED", "MAINTENANCE"]),
      reason: z.string().trim().max(300).optional(),
    })
    .safeParse(input);
  if (!parsed.success) return { error: "Choose a valid start and end." };
  const result = await send(facilityPath(orgId, facilityId, "/blocks"), "POST", clean(parsed.data));
  return result.error ? result : { success: "Blocked." };
}

export async function removeBlockAction(
  orgId: string,
  facilityId: string,
  blockId: string,
): Promise<ActionResult> {
  return send(facilityPath(orgId, facilityId, `/blocks/${uuid.parse(blockId)}`), "DELETE");
}
