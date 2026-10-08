import type { Metadata } from "next";
import { getSession } from "@/lib/auth/session";
import { getOrganization } from "@/features/org/api";
import { SportsCenterWorkspace } from "@/features/sports-center/SportsCenterWorkspace";

export const metadata: Metadata = {
  title: "Sports Center Workspace · LordOfSportz Business",
  description: "Multi-sport facility complex operations, shared scheduling, and membership passes.",
};

export default async function SportsCenterWorkspacePage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;
  const session = await getSession();

  let name = "Apex Multi-Sport Complex";
  if (session && orgId !== "demo") {
    try {
      const org = await getOrganization(orgId, session.accessToken);
      if (org) name = org.name;
    } catch {
      // fallback
    }
  }

  return <SportsCenterWorkspace orgId={orgId} name={name} />;
}
