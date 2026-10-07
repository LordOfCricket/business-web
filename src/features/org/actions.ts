"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { type ActionResult, actionError } from "@/lib/actions/result";
import { gatewayFetch } from "@/lib/api/gateway";
import { refreshSessionNow, refreshUntilMember } from "@/lib/auth/refresh";
import { getSession } from "@/lib/auth/session";
import { ORG_COOKIE } from "./current";

const slug = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/);
const uuid = z.uuid();

const details = z.object({
  name: z.string().trim().min(2, "Enter the business name.").max(120),
  type: z.enum(["ACADEMY", "VENUE_OWNER", "SPORTS_CENTER", "TRAINING_CENTER", "CLUB", "OTHER"]),
  description: z.string().trim().max(3000).optional(),
  addressLine: z.string().trim().max(200).optional(),
  city: z.string().trim().min(2, "Enter the city.").max(80),
  state: z.string().trim().max(80).optional(),
  postalCode: z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9 -]{3,12}$/, "Enter a valid postal code.")
    .optional()
    .or(z.literal("")),
  contactEmail: z.email("Enter a valid contact email.").max(254),
  contactPhone: z
    .string()
    .trim()
    .regex(/^\+?[0-9 ]{7,20}$/, "Enter a valid phone number."),
  website: z
    .string()
    .trim()
    .regex(/^https?:\/\/.{3,190}$/, "Websites start with http:// or https://")
    .optional()
    .or(z.literal("")),
});
export type DetailsInput = z.input<typeof details>;

const services = z
  .array(
    z.object({
      name: z.string().trim().min(1, "Every service needs a name.").max(120),
      description: z.string().trim().max(500).optional(),
    }),
  )
  .max(30);
const capabilities = z
  .array(z.enum(["VENUE_OPERATOR", "SELLER", "ACADEMY", "PROFESSIONAL_SERVICES"]))
  .min(1, "Choose what your business does.");

async function token(): Promise<string> {
  const session = await getSession();
  if (!session) redirect("/login?next=/dashboard");
  return session.accessToken;
}

/** Empty strings from forms become absent fields. */
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
  revalidatePath("/", "layout");
  return { success: "Saved." };
}

/** Onboarding (spec §6). The creator becomes OWNER; we refresh the session until the token carries the business. */
export async function createOrganizationAction(input: {
  details: DetailsInput;
  sports: string[];
  capabilities: string[];
  services: Array<{ name: string; description?: string }>;
}): Promise<ActionResult & { orgId?: string }> {
  const parsed = z
    .object({
      details,
      sports: z.array(slug).min(1, "Choose at least one sport.").max(20),
      capabilities,
      services,
    })
    .safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  let orgId: string;
  try {
    const { data } = await gatewayFetch<{ id: string }>("/organizations", {
      method: "POST",
      body: { ...parsed.data, details: clean(parsed.data.details) },
      accessToken: await token(),
    });
    orgId = data.id;
  } catch (error) {
    return actionError(error);
  }
  (await cookies()).set(ORG_COOKIE, orgId, { path: "/", sameSite: "lax", httpOnly: true });
  const ready = await refreshUntilMember(orgId);
  if (!ready) {
    return {
      orgId,
      success: "Your business was created. It can take a moment to appear — please refresh the page shortly.",
    };
  }
  redirect("/settings?tab=documents");
}

export async function selectOrganizationAction(orgId: string): Promise<void> {
  uuid.parse(orgId);
  (await cookies()).set(ORG_COOKIE, orgId, { path: "/", sameSite: "lax", httpOnly: true });
  redirect("/dashboard");
}

/** Picks up memberships granted since the last login (e.g. after being added as staff). */
export async function reloadAccessAction(): Promise<void> {
  await refreshSessionNow();
  redirect("/dashboard");
}

export async function updateDetailsAction(orgId: string, input: DetailsInput): Promise<ActionResult> {
  const parsed = details.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  return send(`/business/${uuid.parse(orgId)}/organization`, "PATCH", clean(parsed.data));
}

export async function replaceSportsAction(orgId: string, sports: string[]): Promise<ActionResult> {
  const parsed = z.array(slug).min(1, "Choose at least one sport.").max(20).safeParse(sports);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  return send(`/business/${uuid.parse(orgId)}/organization/sports`, "PUT", { sports: parsed.data });
}

export async function replaceServicesAction(
  orgId: string,
  items: Array<{ name: string; description?: string }>,
): Promise<ActionResult> {
  const parsed = services.safeParse(items);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  return send(`/business/${uuid.parse(orgId)}/organization/services`, "PUT", { services: parsed.data });
}

export async function requestCapabilitiesAction(orgId: string, caps: string[]): Promise<ActionResult> {
  const parsed = capabilities.safeParse(caps);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  return send(`/business/${uuid.parse(orgId)}/organization/capabilities`, "POST", {
    capabilities: parsed.data,
  });
}

export async function addDocumentAction(
  orgId: string,
  docType: string,
  mediaId: string,
): Promise<ActionResult> {
  const parsed = z
    .object({
      docType: z.enum(["REGISTRATION_CERTIFICATE", "TAX_ID", "ID_PROOF", "ADDRESS_PROOF", "OTHER"]),
      mediaId: uuid,
    })
    .safeParse({ docType, mediaId });
  if (!parsed.success) return { error: "Choose a document type and upload the file." };
  return send(`/business/${uuid.parse(orgId)}/organization/documents`, "POST", parsed.data);
}

export async function removeDocumentAction(orgId: string, documentId: string): Promise<ActionResult> {
  return send(`/business/${uuid.parse(orgId)}/organization/documents/${uuid.parse(documentId)}`, "DELETE");
}

export async function submitForVerificationAction(orgId: string): Promise<ActionResult> {
  const result = await send(`/business/${uuid.parse(orgId)}/organization/submit`, "POST");
  return result.error ? result : { success: "Submitted. We will review your business shortly." };
}

const orgRole = z.enum(["OWNER", "MANAGER", "STAFF"]);

export async function addMemberAction(
  orgId: string,
  input: { email: string; orgRole: string; title?: string },
): Promise<ActionResult> {
  const parsed = z
    .object({
      email: z.email("Enter the person's LordOfSportz email.").max(254),
      orgRole,
      title: z.string().trim().max(80).optional(),
    })
    .safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const result = await send(`/business/${uuid.parse(orgId)}/members`, "POST", clean(parsed.data));
  return result.error ? result : { success: "Added. They will see the business next time they sign in." };
}

export async function updateMemberAction(
  orgId: string,
  userId: string,
  input: { orgRole: string; title?: string },
): Promise<ActionResult> {
  const parsed = z.object({ orgRole, title: z.string().trim().max(80).optional() }).safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  return send(`/business/${uuid.parse(orgId)}/members/${uuid.parse(userId)}`, "PATCH", clean(parsed.data));
}

export async function removeMemberAction(orgId: string, userId: string): Promise<ActionResult> {
  return send(`/business/${uuid.parse(orgId)}/members/${uuid.parse(userId)}`, "DELETE");
}
