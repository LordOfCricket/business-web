import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { getSession, type Session } from "@/lib/auth/session";
import { approvedCapabilities, type Capability, getOrganization, type Organization } from "./api";
import { canManage, currentOrgId } from "./current";

export interface BusinessContext {
  session: Session;
  org: Organization;
  capabilities: Capability[];
  /** OWNER or MANAGER (or a platform admin). Staff get read-only screens. */
  manager: boolean;
  owner: boolean;
}

/** Loads the selected business once per request; redirects to onboarding when the user has none. */
export const requireBusiness = cache(async (): Promise<BusinessContext> => {
  const session = await getSession();
  if (!session) redirect("/login?next=/dashboard");
  const orgId = await currentOrgId(session);
  if (!orgId) redirect("/onboarding/business");
  const org = await getOrganization(orgId, session.accessToken);
  if (!org) redirect("/onboarding/business");
  const role = session.user.orgs.find((o) => o.id === orgId)?.role;
  return {
    session,
    org,
    capabilities: approvedCapabilities(org),
    manager: canManage(session, orgId),
    owner: role === "OWNER" || session.user.roles.includes("ADMIN"),
  };
});
