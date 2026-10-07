import "server-only";
import { notFound } from "next/navigation";
import { serverEnv } from "@/lib/env";

/**
 * Which sports are live on the platform (LAUNCHED_SPORTS, default "cricket,karate"). Businesses start new venues,
 * products, tournaments and professional roles only in launched sports; what they already have in other sports is
 * kept and stays editable, so nothing is dropped when a form is saved. Launch the next sport by adding its slug.
 */
export function launchedSports(): ReadonlySet<string> {
  return new Set(
    serverEnv()
      .LAUNCHED_SPORTS.split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function isLaunched(slug: string | undefined | null): boolean {
  return !!slug && launchedSports().has(slug.toLowerCase());
}

/** Launched sports plus the ones a record already uses (so editing never removes them). */
export function launchedOrKept<T extends { slug: string }>(
  items: readonly T[],
  keep: readonly string[] = [],
): T[] {
  return items.filter((s) => isLaunched(s.slug) || keep.includes(s.slug));
}

/** For a sport's own route folders: pages of a sport that is not launched answer 404. */
export function requireLaunched(slug: string): void {
  if (!isLaunched(slug)) notFound();
}
