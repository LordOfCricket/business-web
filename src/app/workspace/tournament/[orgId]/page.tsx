import type { Metadata } from "next";
import { getSession } from "@/lib/auth/session";
import { getOrganization } from "@/features/org/api";
import { TournamentWorkspace } from "@/features/tournament/TournamentWorkspace";

export const metadata: Metadata = {
  title: "Tournament Operations Workspace · LordOfSportz Business",
  description: "Manage tournament draws, fixtures, match officials, and live ball-by-ball scoring.",
};

export default async function TournamentWorkspacePage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;
  const session = await getSession();

  let name = "LordOfSportz Tournament Desk";
  if (session && orgId !== "demo") {
    try {
      const org = await getOrganization(orgId, session.accessToken);
      if (org) name = `${org.name} Tournament Operations`;
    } catch {
      // fallback
    }
  }

  return <TournamentWorkspace orgId={orgId} name={name} />;
}
