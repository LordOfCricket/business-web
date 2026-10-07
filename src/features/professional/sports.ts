import "server-only";
import { getSport, listSports } from "@/lib/api/catalog";
import { launchedOrKept } from "@/lib/sports/launch";
import type { SportRoles } from "./RolePicker";

/**
 * Launched sports with their configured professional types (for the role picker), plus `keep`: the sports a profile
 * already holds roles in, so editing it never removes them.
 */
export async function sportsWithRoles(keep: string[] = []): Promise<SportRoles[]> {
  const sports = launchedOrKept(await listSports(), keep);
  const details = await Promise.all(sports.map((s) => getSport(s.slug)));
  return details
    .filter((d) => d !== null && d.professionalTypes.length > 0)
    .map((d) => ({ slug: d!.slug, name: d!.name, professionalTypes: d!.professionalTypes }));
}
