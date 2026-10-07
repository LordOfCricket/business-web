import "server-only";
import { cookies } from "next/headers";
import type { Session } from "@/lib/auth/session";

/** Which of the user's businesses the dashboard shows. Not sensitive: every API call re-checks membership. */
export const ORG_COOKIE = "los_org";

/** The selected business if the token still lists it, otherwise the first one; null when the user has none. */
export async function currentOrgId(session: Session): Promise<string | null> {
  const selected = (await cookies()).get(ORG_COOKIE)?.value;
  const orgs = session.user.orgs;
  if (selected && orgs.some((o) => o.id === selected)) return selected;
  return orgs[0]?.id ?? null;
}

export function orgRole(session: Session, orgId: string): string | undefined {
  return session.user.orgs.find((o) => o.id === orgId)?.role;
}

export function canManage(session: Session, orgId: string): boolean {
  const role = orgRole(session, orgId);
  return role === "OWNER" || role === "MANAGER" || session.user.roles.includes("ADMIN");
}
