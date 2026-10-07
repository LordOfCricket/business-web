"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { type ActionResult, actionError } from "@/lib/actions/result";
import { gatewayFetch } from "@/lib/api/gateway";
import { getSession } from "@/lib/auth/session";

const uuid = z.uuid();
const slug = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/);
const amount = (label: string, min = 0) =>
  z.coerce
    .number({ error: `Enter ${label}.` })
    .min(min, `${label} must be at least ${min}.`)
    .max(1_000_000);
const optionalAmount = z
  .union([z.literal(""), z.coerce.number().min(1).max(1_000_000)])
  .optional()
  .transform((v) => (v === "" || v === undefined ? undefined : v));
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : undefined));

async function token(): Promise<string> {
  const session = await getSession();
  if (!session) redirect("/login?next=/shop");
  return session.accessToken;
}

function first(error: z.ZodError): ActionResult {
  return { error: error.issues[0]?.message ?? "Check the form." };
}

async function send<T = unknown>(
  path: string,
  method: "POST" | "PUT" | "PATCH" | "DELETE",
  body?: unknown,
): Promise<{ data?: T; result: ActionResult }> {
  try {
    const { data } = await gatewayFetch<T>(path, { method, body, accessToken: await token() });
    revalidatePath("/shop", "layout");
    return { data, result: { success: "Saved." } };
  } catch (error) {
    return { result: actionError(error) };
  }
}

const shop = (orgId: string) => `/business/${uuid.parse(orgId)}/shop`;

// ------------------------------------------------------------------ seller profile

const profile = z.object({
  displayName: z.string().trim().min(2, "Enter the shop name.").max(120),
  supportEmail: z.email("Enter a support email."),
  supportPhone: z
    .string()
    .trim()
    .regex(/^\+?[0-9 ]{7,20}$/, "Enter a valid phone number.")
    .optional()
    .or(z.literal(""))
    .transform((v) => v || undefined),
  pickupAddress: z.string().trim().min(5, "Enter the pickup address.").max(300),
  city: z.string().trim().min(2, "Enter the city.").max(80),
  gstin: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[0-9A-Z]{15}$/, "A GSTIN has 15 characters.")
    .optional()
    .or(z.literal(""))
    .transform((v) => v || undefined),
  returnPolicy: optionalText(1000),
  returnWindowDays: z.coerce.number().int().min(0).max(30),
  deliveryCharge: amount("the delivery charge"),
  freeDeliveryAbove: optionalAmount,
  dispatchDays: z.coerce.number().int().min(0).max(30),
});
export type SellerProfileInput = z.input<typeof profile>;

/** Seller onboarding (spec §13); the business must be verified with the Seller capability. */
export async function saveSellerProfileAction(
  orgId: string,
  input: SellerProfileInput,
): Promise<ActionResult> {
  const parsed = profile.safeParse(input);
  if (!parsed.success) return first(parsed.error);
  return (await send(`${shop(orgId)}/seller-profile`, "PUT", parsed.data)).result;
}

// ------------------------------------------------------------------ products

const productDetails = z.object({
  name: z.string().trim().min(3, "Enter the product name.").max(150),
  description: optionalText(5000),
  brandId: z
    .union([z.literal(""), uuid])
    .optional()
    .transform((v) => v || undefined),
  taxPercent: z.coerce.number().refine((v) => [0, 5, 12, 18, 28].includes(v), "Choose a GST rate."),
});
export type ProductDetailsInput = z.input<typeof productDetails>;

export async function createProductAction(
  orgId: string,
  input: ProductDetailsInput & { sports: string[]; categoryIds: string[] },
): Promise<ActionResult & { id?: string }> {
  const parsed = productDetails
    .extend({
      sports: z.array(slug).min(1, "Choose at least one sport.").max(5),
      categoryIds: z.array(uuid).max(10),
    })
    .safeParse(input);
  if (!parsed.success) return first(parsed.error);
  const { data, result } = await send<{ id: string }>(`${shop(orgId)}/products`, "POST", parsed.data);
  return { ...result, id: data?.id };
}

export async function updateProductAction(
  orgId: string,
  productId: string,
  input: ProductDetailsInput,
): Promise<ActionResult> {
  const parsed = productDetails.safeParse(input);
  if (!parsed.success) return first(parsed.error);
  return (await send(`${shop(orgId)}/products/${uuid.parse(productId)}`, "PATCH", parsed.data)).result;
}

export async function setProductSportsAction(
  orgId: string,
  productId: string,
  sports: string[],
): Promise<ActionResult> {
  const parsed = z.array(slug).min(1, "Choose at least one sport.").max(5).safeParse(sports);
  if (!parsed.success) return first(parsed.error);
  return (
    await send(`${shop(orgId)}/products/${uuid.parse(productId)}/sports`, "PUT", { sports: parsed.data })
  ).result;
}

export async function setProductCategoriesAction(
  orgId: string,
  productId: string,
  categoryIds: string[],
): Promise<ActionResult> {
  const parsed = z.array(uuid).max(10).safeParse(categoryIds);
  if (!parsed.success) return first(parsed.error);
  return (
    await send(`${shop(orgId)}/products/${uuid.parse(productId)}/categories`, "PUT", {
      categoryIds: parsed.data,
    })
  ).result;
}

export async function setProductMediaAction(
  orgId: string,
  productId: string,
  mediaIds: string[],
): Promise<ActionResult> {
  const parsed = z.array(uuid).max(10, "Up to 10 images.").safeParse(mediaIds);
  if (!parsed.success) return first(parsed.error);
  return (
    await send(`${shop(orgId)}/products/${uuid.parse(productId)}/media`, "PUT", { mediaIds: parsed.data })
  ).result;
}

export async function productStatusAction(
  orgId: string,
  productId: string,
  action: "activate" | "deactivate",
): Promise<ActionResult> {
  const { result } = await send(`${shop(orgId)}/products/${uuid.parse(productId)}/${action}`, "POST");
  if (result.error) return result;
  return { success: action === "activate" ? "The product is live." : "The product is hidden from the shop." };
}

const variant = z.object({
  sku: z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9._/-]{1,60}$/, "SKU: letters, digits and . _ / - only."),
  label: z.string().trim().min(1, "Enter the option name (e.g. Size 6).").max(80),
  price: amount("the price", 1),
  compareAtPrice: optionalAmount,
  onHand: z.coerce.number().int().min(0).max(100_000).optional(),
  lowStockAt: z.coerce.number().int().min(0).max(1000).optional(),
  enabled: z.boolean().optional(),
});
export type VariantInput = z.input<typeof variant>;

export async function saveVariantAction(
  orgId: string,
  productId: string,
  variantId: string | null,
  input: VariantInput,
): Promise<ActionResult> {
  const parsed = variant.safeParse(input);
  if (!parsed.success) return first(parsed.error);
  const path = `${shop(orgId)}/products/${uuid.parse(productId)}/variants`;
  return variantId
    ? (await send(`${path}/${uuid.parse(variantId)}`, "PATCH", parsed.data)).result
    : (await send(path, "POST", parsed.data)).result;
}

export async function deleteVariantAction(
  orgId: string,
  productId: string,
  variantId: string,
): Promise<ActionResult> {
  return (
    await send(`${shop(orgId)}/products/${uuid.parse(productId)}/variants/${uuid.parse(variantId)}`, "DELETE")
  ).result;
}

export async function addBrandAction(orgId: string, name: string): Promise<ActionResult & { id?: string }> {
  const parsed = z.string().trim().min(2, "Enter the brand name.").max(80).safeParse(name);
  if (!parsed.success) return first(parsed.error);
  const { data, result } = await send<{ id: string }>(`${shop(orgId)}/brands`, "POST", { name: parsed.data });
  return { ...result, id: data?.id };
}

// ------------------------------------------------------------------ inventory

export async function setStockAction(
  orgId: string,
  variantId: string,
  onHand: number,
): Promise<ActionResult> {
  const parsed = z.number().int().min(0).max(100_000).safeParse(onHand);
  if (!parsed.success) return { error: "Stock must be a whole number from 0 to 100000." };
  return (await send(`${shop(orgId)}/inventory/${uuid.parse(variantId)}`, "PATCH", { onHand: parsed.data }))
    .result;
}

// ------------------------------------------------------------------ discounts

const discount = z.object({
  code: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9_-]{3,30}$/, "Code: 3–30 letters, digits, - or _."),
  description: optionalText(200),
  type: z.enum(["PERCENT", "FLAT"]),
  value: amount("the discount", 0.01),
  minOrderAmount: z
    .union([z.literal(""), z.coerce.number().min(0)])
    .optional()
    .transform((v) => (v === "" || v === undefined ? undefined : v)),
  maxDiscount: optionalAmount,
  startsAt: z.iso.datetime({ offset: true }),
  endsAt: z.iso.datetime({ offset: true }).optional(),
  usageLimit: z
    .union([z.literal(""), z.coerce.number().int().min(1)])
    .optional()
    .transform((v) => (v === "" || v === undefined ? undefined : v)),
  productId: z
    .union([z.literal(""), uuid])
    .optional()
    .transform((v) => v || undefined),
  enabled: z.boolean().optional(),
});
export type DiscountInput = z.input<typeof discount>;

export async function saveDiscountAction(
  orgId: string,
  discountId: string | null,
  input: DiscountInput,
): Promise<ActionResult> {
  const parsed = discount.safeParse(input);
  if (!parsed.success) return first(parsed.error);
  return discountId
    ? (await send(`${shop(orgId)}/discounts/${uuid.parse(discountId)}`, "PATCH", parsed.data)).result
    : (await send(`${shop(orgId)}/discounts`, "POST", parsed.data)).result;
}

export async function deleteDiscountAction(orgId: string, discountId: string): Promise<ActionResult> {
  return (await send(`${shop(orgId)}/discounts/${uuid.parse(discountId)}`, "DELETE")).result;
}

// ------------------------------------------------------------------ orders and returns

export async function transitionOrderAction(
  orgId: string,
  orderId: string,
  input: { to: string; trackingCarrier?: string; trackingNo?: string; reason?: string },
): Promise<ActionResult> {
  const parsed = z
    .object({
      to: z.enum(["PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"]),
      trackingCarrier: optionalText(60),
      trackingNo: z
        .string()
        .trim()
        .regex(/^[A-Za-z0-9 -]{0,60}$/, "Tracking number: letters, digits, spaces and - only.")
        .optional()
        .transform((v) => v || undefined),
      reason: optionalText(300),
    })
    .safeParse(input);
  if (!parsed.success) return first(parsed.error);
  return (await send(`${shop(orgId)}/orders/${uuid.parse(orderId)}/transition`, "POST", parsed.data)).result;
}

export async function returnDecisionAction(
  orgId: string,
  returnId: string,
  decision: "approve" | "reject" | "received",
  note?: string,
): Promise<ActionResult> {
  const parsed = optionalText(300).safeParse(note);
  if (!parsed.success) return first(parsed.error);
  return (
    await send(`${shop(orgId)}/returns/${uuid.parse(returnId)}/${decision}`, "POST", { note: parsed.data })
  ).result;
}
