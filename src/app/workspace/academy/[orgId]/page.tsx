import type { Metadata } from "next";
import { getSession } from "@/lib/auth/session";
import { getOrganization } from "@/features/org/api";
import { AcademyDashboard } from "@/features/academy/AcademyDashboard";

export const metadata: Metadata = {
  title: "Sports Academy Workspace · LordOfSportz Business",
  description: "Manage academy students, branches, batches, coaches, belt gradings, and achievements.",
};

export default async function AcademyWorkspacePage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;
  const session = await getSession();

  let orgName = "LordOfSportz Karate Academy";
  if (session && orgId !== "demo") {
    try {
      const org = await getOrganization(orgId, session.accessToken);
      if (org) {
        orgName = org.name;
      }
    } catch {
      // fallback to default name
    }
  }

  return <AcademyDashboard orgId={orgId} orgName={orgName} />;
}
