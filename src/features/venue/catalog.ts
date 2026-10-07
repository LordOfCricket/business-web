import "server-only";
import type { Choice } from "@/components/common/EditorSection";
import { getSport, listSports } from "@/lib/api/catalog";
import { launchedOrKept } from "@/lib/sports/launch";
import { listAmenities } from "./api";

/**
 * Sport choices restricted to the given slugs (the business's or venue's sports), in catalog order: launched sports,
 * plus `keep` (what the record already uses, so saving an existing venue never drops a sport).
 */
export async function sportChoices(slugs: string[], keep: string[] = []): Promise<Choice[]> {
  const sports = launchedOrKept(await listSports(), keep);
  return sports.filter((s) => slugs.includes(s.slug)).map((s) => ({ value: s.slug, label: s.name }));
}

/** sport slug → facility types configured on the sport (Super Admin config, spec §2). */
export async function facilityTypesFor(slugs: string[]): Promise<Record<string, Choice[]>> {
  const details = await Promise.all(slugs.map((s) => getSport(s)));
  return Object.fromEntries(
    details
      .filter((d) => d !== null)
      .map((d) => [d!.slug, d!.facilityTypes.map((t) => ({ value: t.slug, label: t.name }))]),
  );
}

export async function amenityChoices(): Promise<Choice[]> {
  return (await listAmenities()).map((a) => ({ value: a.id, label: a.name }));
}

export function citySegment(city: string): string {
  return (
    city
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "india"
  );
}

export function publicVenueUrl(venue: { slug: string; city: string }): string {
  const base = process.env.CUSTOMER_SITE_URL ?? "http://localhost:3000";
  return `${base}/venues/${citySegment(venue.city)}/${venue.slug}`;
}
