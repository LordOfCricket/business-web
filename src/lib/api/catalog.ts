import "server-only";
import { gatewayFetch, GatewayError } from "@/lib/api/gateway";
import type { PageMeta } from "@/types/api";

export interface SportCategory {
  id: string;
  slug: string;
  name: string;
}

export interface SportSummary {
  slug: string;
  name: string;
  description?: string;
  category?: SportCategory;
}

export interface SportDetail extends SportSummary {
  enabled: boolean;
  facilityTypes: Array<{ slug: string; name: string }>;
  professionalTypes: Array<{ slug: string; name: string }>;
  activities: Array<{ slug: string; name: string; description?: string }>;
}

export interface RoleView {
  type: string;
  typeName: string;
  sport: string;
  sportName: string;
}

export interface ProfessionalSummary {
  slug: string;
  displayName: string;
  headline?: string;
  city?: string;
  avatarUrl?: string;
  experienceYears?: number;
  roles: RoleView[];
  priceFrom?: number;
  currency?: string;
}

export interface PublicProfessional {
  slug: string;
  displayName: string;
  headline?: string;
  bio?: string;
  experienceYears?: number;
  city?: string;
  avatarUrl?: string;
  roles: RoleView[];
  certifications: Array<{ name: string; issuer?: string; yearAwarded?: number }>;
  specializations: string[];
  services: Array<{
    name: string;
    description?: string;
    priceAmount: number;
    currency: string;
    durationMinutes?: number;
  }>;
  availability: Array<{ dayOfWeek: number; startTime: string; endTime: string }>;
  publishedAt?: string;
}

/** Public catalog data is cached by Next.js for 5 minutes (ISR) — fast SEO pages, bounded staleness. */
export async function listSports(): Promise<SportSummary[]> {
  return (await gatewayFetch<SportSummary[]>("/sports", { revalidate: 300 })).data;
}

export async function getSport(slug: string): Promise<SportDetail | null> {
  try {
    return (await gatewayFetch<SportDetail>(`/sports/${encodeURIComponent(slug)}`, { revalidate: 300 })).data;
  } catch (error) {
    if (error instanceof GatewayError && error.status === 404) return null;
    throw error;
  }
}

export async function discoverProfessionals(filters: {
  type?: string;
  sport?: string;
  city?: string;
  page?: number;
}): Promise<{ items: ProfessionalSummary[]; meta?: PageMeta }> {
  const query = new URLSearchParams({ page: String(filters.page ?? 0), size: "12" });
  if (filters.type) query.set("type", filters.type);
  if (filters.sport) query.set("sport", filters.sport);
  if (filters.city) query.set("city", filters.city);
  const { data, meta } = await gatewayFetch<ProfessionalSummary[]>(`/professionals?${query}`, {
    revalidate: 60,
  });
  return { items: data, meta: meta as PageMeta | undefined };
}

export async function getProfessional(slug: string): Promise<PublicProfessional | null> {
  try {
    return (
      await gatewayFetch<PublicProfessional>(`/professionals/${encodeURIComponent(slug)}`, { revalidate: 60 })
    ).data;
  } catch (error) {
    if (error instanceof GatewayError && error.status === 404) return null;
    throw error;
  }
}

/** Lowercase, hyphenated URL segment ("New Delhi" → "new-delhi"). */
export function toSegment(value: string | undefined): string {
  return (
    (value ?? "anywhere")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "anywhere"
  );
}

/** SEO URL for a professional (spec §29): /coaches/delhi/cricket/rahul-sharma-k7p2 */
export function professionalPath(p: { slug: string; city?: string; roles: RoleView[] }): string {
  const primary = p.roles[0];
  const kind = primary?.type === "coach" || !primary ? "coaches" : "professionals";
  return `/${kind}/${toSegment(p.city)}/${primary?.sport ?? "sports"}/${p.slug}`;
}
