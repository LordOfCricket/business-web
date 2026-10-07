import "server-only";
import { gatewayFetch, GatewayError } from "@/lib/api/gateway";
import type { PageMeta } from "@/types/api";

/** Disputes raised against this business (spec §22 Platform → Disputes). */
export type DisputeStatus = "OPEN" | "IN_REVIEW" | "RESOLVED" | "REJECTED" | "WITHDRAWN";

export interface DisputeSummary {
  id: string;
  number: string;
  type: "BOOKING" | "ORDER" | "PAYMENT";
  referenceId: string;
  referenceLabel: string;
  subject: string;
  status: DisputeStatus;
  raisedBy: string;
  raisedByName: string;
  orgId?: string;
  orgName?: string;
  amount?: number;
  currency?: string;
  refundable: boolean;
  refundAmount?: number;
  lastMessageAt: string;
  createdAt: string;
}

export interface DisputeMessage {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: "CUSTOMER" | "OWNER" | "ADMIN";
  body: string;
  createdAt: string;
}

export interface DisputeDetail {
  dispute: DisputeSummary;
  resolution?: string;
  resolvedAt?: string;
  messages: DisputeMessage[];
  canMessage: boolean;
  canWithdraw: boolean;
}

export const STATUS_LABEL: Record<DisputeStatus, string> = {
  OPEN: "Needs your reply",
  IN_REVIEW: "With LordOfSportz",
  RESOLVED: "Resolved",
  REJECTED: "Closed",
  WITHDRAWN: "Withdrawn",
};

export async function orgDisputes(
  orgId: string,
  token: string,
  page = 0,
): Promise<{ items: DisputeSummary[]; meta?: PageMeta }> {
  const { data, meta } = await gatewayFetch<DisputeSummary[]>(
    `/business/${orgId}/disputes?page=${page}&size=20`,
    { accessToken: token },
  );
  return { items: data, meta: meta as PageMeta | undefined };
}

export async function getDispute(token: string, id: string): Promise<DisputeDetail | null> {
  try {
    return (await gatewayFetch<DisputeDetail>(`/disputes/${id}`, { accessToken: token })).data;
  } catch (error) {
    if (error instanceof GatewayError && (error.status === 404 || error.status === 403)) return null;
    throw error;
  }
}
