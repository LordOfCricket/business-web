import type { Metadata } from "next";
import { getSession } from "@/lib/auth/session";
import { getOrganization } from "@/features/org/api";
import { ClubWorkspace } from "@/features/club/ClubWorkspace";

export const metadata: Metadata = {
  title: "Sports Club Workspace · LordOfSportz Business",
  description: "Club squads, player rosters, league fixtures, and trophy honors.",
};

export default async function ClubWorkspacePage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;
  const session = await getSession();

  let name = "Royal Warriors Cricket Club";
  if (session && orgId !== "demo") {
    try {
      const org = await getOrganization(orgId, session.accessToken);
      if (org) name = org.name;
    } catch {
      // fallback
    }
  }

  return <ClubWorkspace orgId={orgId} name={name} />;
}
