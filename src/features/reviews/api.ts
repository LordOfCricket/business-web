import "server-only";
import { gatewayFetch } from "@/lib/api/gateway";
import type { PageMeta } from "@/types/api";

export interface ManagedReview {
  id: string;
  targetType: "VENUE" | "PROFESSIONAL" | "ORGANIZATION";
  targetId: string;
  targetName?: string;
  authorName: string;
  rating: number;
  title?: string;
  body?: string;
  verified: boolean;
  status: "PUBLISHED" | "HIDDEN";
  hiddenReason?: string;
  reply?: string;
  repliedAt?: string;
  reportCount: number;
  createdAt: string;
}

type Page<T> = { items: T[]; meta?: PageMeta };

/** Reviews of the business and its venues, newest first (any member). */
export async function businessReviews(
  orgId: string,
  token: string,
  page: number,
): Promise<Page<ManagedReview>> {
  const { data, meta } = await gatewayFetch<ManagedReview[]>(
    `/business/${orgId}/reviews?page=${page}&size=20`,
    { accessToken: token },
  );
  return { items: data, meta: meta as PageMeta | undefined };
}

/** Reviews of the caller's own professional profile. */
export async function receivedReviews(token: string, page: number): Promise<Page<ManagedReview>> {
  const { data, meta } = await gatewayFetch<ManagedReview[]>(`/reviews/received?page=${page}&size=20`, {
    accessToken: token,
  });
  return { items: data, meta: meta as PageMeta | undefined };
}
