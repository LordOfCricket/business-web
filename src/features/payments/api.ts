import "server-only";
import { gatewayFetch } from "@/lib/api/gateway";
import type { PageMeta } from "@/types/api";

export interface OrgPayment {
  id: string;
  purpose: string;
  referenceId: string;
  amount: number;
  amountRefunded: number;
  currency: string;
  status: string;
  description?: string;
  createdAt: string;
  succeededAt?: string;
}

export interface OrgTotals {
  payments: number;
  gross: number;
  refunded: number;
  net: number;
}

export interface PaymentFilters {
  status?: string;
  from?: string;
  to?: string;
  page: number;
}

function query(f: PaymentFilters, paged: boolean): string {
  const q = new URLSearchParams();
  if (paged) {
    q.set("page", String(f.page));
    q.set("size", "25");
  }
  if (f.status) q.set("status", f.status);
  if (f.from) q.set("from", f.from);
  if (f.to) q.set("to", f.to);
  return q.toString();
}

/** Business transactions (spec §21 Payments) for bookings and orders of this business. */
export async function listOrgPayments(
  orgId: string,
  token: string,
  f: PaymentFilters,
): Promise<{ items: OrgPayment[]; meta?: PageMeta }> {
  const { data, meta } = await gatewayFetch<OrgPayment[]>(`/business/${orgId}/payments?${query(f, true)}`, {
    accessToken: token,
  });
  return { items: data, meta: meta as PageMeta | undefined };
}

export async function orgTotals(orgId: string, token: string, f: PaymentFilters): Promise<OrgTotals> {
  return (
    await gatewayFetch<OrgTotals>(`/business/${orgId}/payments/summary?${query(f, false)}`, {
      accessToken: token,
    })
  ).data;
}

export const money = (amount: number, currency = "INR") =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency, minimumFractionDigits: 2 }).format(amount);
