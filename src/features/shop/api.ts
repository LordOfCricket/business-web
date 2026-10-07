import "server-only";
import { gatewayFetch, GatewayError } from "@/lib/api/gateway";
import type { PageMeta } from "@/types/api";

export interface SellerProfile {
  orgId: string;
  slug: string;
  displayName: string;
  supportEmail: string;
  supportPhone?: string;
  pickupAddress: string;
  city: string;
  gstin?: string;
  returnPolicy?: string;
  returnWindowDays: number;
  deliveryCharge: number;
  freeDeliveryAbove?: number;
  dispatchDays: number;
  status: "ACTIVE" | "SUSPENDED";
  suspensionReason?: string;
  orgActive: boolean;
  canSell: boolean;
}

export interface ShopCategory {
  id: string;
  sport: string;
  parentId?: string;
  slug: string;
  name: string;
}

export interface ShopSport {
  slug: string;
  name: string;
  categories: ShopCategory[];
}

export interface Brand {
  id: string;
  slug: string;
  name: string;
  enabled: boolean;
}

export interface SellerVariant {
  id: string;
  sku: string;
  label: string;
  attributes: Record<string, string>;
  price: number;
  compareAtPrice?: number;
  enabled: boolean;
  onHand: number;
  reserved: number;
  available: number;
  lowStockAt: number;
  lowStock: boolean;
  position: number;
}

export interface SellerProduct {
  id: string;
  slug: string;
  name: string;
  description?: string;
  brand?: Brand;
  taxPercent: number;
  status: "DRAFT" | "ACTIVE" | "INACTIVE";
  unlisted: boolean;
  unlistReason?: string;
  sports: string[];
  categories: ShopCategory[];
  media: Array<{ mediaId: string; url: string }>;
  variants: SellerVariant[];
  minPrice?: number;
  ratingAvg?: number;
  ratingCount: number;
  publiclyVisible: boolean;
}

export interface ProductRow {
  id: string;
  slug: string;
  name: string;
  status: SellerProduct["status"];
  unlisted: boolean;
  imageUrl?: string;
  minPrice?: number;
  updatedAt: string;
}

export interface InventoryRow {
  variantId: string;
  productId: string;
  productName: string;
  sku: string;
  label: string;
  onHand: number;
  reserved: number;
  available: number;
  lowStockAt: number;
  lowStock: boolean;
  enabled: boolean;
}

export interface Discount {
  id: string;
  scope: "SELLER" | "PLATFORM";
  productId?: string;
  code: string;
  description?: string;
  type: "PERCENT" | "FLAT";
  value: number;
  minOrderAmount: number;
  maxDiscount?: number;
  startsAt: string;
  endsAt?: string;
  usageLimit?: number;
  usedCount: number;
  enabled: boolean;
  active: boolean;
}

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED"
  | "RETURN_REQUESTED"
  | "RETURNED"
  | "REFUNDED";

export interface OrderRow {
  id: string;
  number: string;
  status: OrderStatus;
  customerName?: string;
  city?: string;
  total: number;
  currency: string;
  itemCount: number;
  openReturn: boolean;
  createdAt: string;
}

export interface OrderDetail {
  id: string;
  number: string;
  status: OrderStatus;
  items: Array<{
    productName: string;
    variantLabel: string;
    sku: string;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
    discount: number;
  }>;
  subtotal: number;
  discount: number;
  tax: number;
  deliveryCharge: number;
  total: number;
  currency: string;
  shipTo?: {
    name: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
  };
  trackingCarrier?: string;
  trackingNo?: string;
  refundAmount?: number;
  cancellationReason?: string;
  createdAt: string;
  history: Array<{ status: string; note?: string; at: string }>;
  returnRequest?: { id: string; reason: string; status: string; sellerNote?: string; createdAt: string };
  nextStatuses: OrderStatus[];
}

export interface Sales {
  from: string;
  to: string;
  orders: number;
  itemsSold: number;
  gross: number;
  discounts: number;
  refunded: number;
  net: number;
  currency: string;
  byDay: Array<{ date: string; orders: number; revenue: number }>;
  topProducts: Array<{ productId: string; name: string; units: number; revenue: number }>;
}

const base = (orgId: string) => `/business/${orgId}/shop`;

export async function getSellerProfile(orgId: string, token: string): Promise<SellerProfile | null> {
  return (await gatewayFetch<SellerProfile | null>(`${base(orgId)}/seller-profile`, { accessToken: token }))
    .data;
}

export async function listShopSports(): Promise<ShopSport[]> {
  return (await gatewayFetch<ShopSport[]>("/shop/sports", { revalidate: 60 })).data;
}

export async function listBrands(): Promise<Brand[]> {
  return (await gatewayFetch<Brand[]>("/shop/brands", { revalidate: 0 })).data;
}

export async function listProducts(
  orgId: string,
  token: string,
  f: { status?: string; q?: string; page: number },
): Promise<{ items: ProductRow[]; meta?: PageMeta }> {
  const q = new URLSearchParams({ page: String(f.page), size: "25" });
  if (f.status) q.set("status", f.status);
  if (f.q) q.set("q", f.q);
  const { data, meta } = await gatewayFetch<ProductRow[]>(`${base(orgId)}/products?${q}`, {
    accessToken: token,
  });
  return { items: data, meta: meta as PageMeta | undefined };
}

export async function getProduct(orgId: string, id: string, token: string): Promise<SellerProduct | null> {
  try {
    return (
      await gatewayFetch<SellerProduct>(`${base(orgId)}/products/${encodeURIComponent(id)}`, {
        accessToken: token,
      })
    ).data;
  } catch (error) {
    if (error instanceof GatewayError && (error.status === 404 || error.status === 400)) return null;
    throw error;
  }
}

export async function listInventory(
  orgId: string,
  token: string,
  lowOnly: boolean,
  page: number,
): Promise<{ items: InventoryRow[]; meta?: PageMeta }> {
  const { data, meta } = await gatewayFetch<InventoryRow[]>(
    `${base(orgId)}/inventory?lowOnly=${lowOnly}&page=${page}&size=50`,
    { accessToken: token },
  );
  return { items: data, meta: meta as PageMeta | undefined };
}

export async function listDiscounts(orgId: string, token: string): Promise<Discount[]> {
  return (await gatewayFetch<Discount[]>(`${base(orgId)}/discounts`, { accessToken: token })).data;
}

export async function listOrders(
  orgId: string,
  token: string,
  f: { status?: string; q?: string; page: number },
): Promise<{ items: OrderRow[]; meta?: PageMeta }> {
  const q = new URLSearchParams({ page: String(f.page), size: "25" });
  if (f.status) q.set("status", f.status);
  if (f.q) q.set("q", f.q);
  const { data, meta } = await gatewayFetch<OrderRow[]>(`${base(orgId)}/orders?${q}`, { accessToken: token });
  return { items: data, meta: meta as PageMeta | undefined };
}

export async function getOrder(orgId: string, id: string, token: string): Promise<OrderDetail | null> {
  try {
    return (
      await gatewayFetch<OrderDetail>(`${base(orgId)}/orders/${encodeURIComponent(id)}`, {
        accessToken: token,
      })
    ).data;
  } catch (error) {
    if (error instanceof GatewayError && (error.status === 404 || error.status === 400)) return null;
    throw error;
  }
}

export async function getSales(orgId: string, token: string, from: string, to: string): Promise<Sales> {
  return (await gatewayFetch<Sales>(`${base(orgId)}/sales?from=${from}&to=${to}`, { accessToken: token }))
    .data;
}

export const ORDER_STATUS: Record<OrderStatus, string> = {
  PENDING: "Awaiting payment",
  CONFIRMED: "New (paid)",
  PROCESSING: "Packing",
  SHIPPED: "Shipped",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  RETURN_REQUESTED: "Return requested",
  RETURNED: "Returned",
  REFUNDED: "Refunded",
};

export const TAX_RATES = [0, 5, 12, 18, 28] as const;

export function money(amount: number, currency = "INR"): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency, minimumFractionDigits: 2 }).format(
    amount,
  );
}
