import type { Metadata } from "next";
import { getSession } from "@/lib/auth/session";
import { getOrganization } from "@/features/org/api";
import { VenueWorkspace } from "@/features/venue/VenueWorkspace";

export const metadata: Metadata = {
  title: "Venue & Ground Workspace · LordOfSportz Business",
  description: "Manage natural turf pitches, practice nets, dynamic slot pricing, and venue amenities.",
};

export default async function VenueWorkspacePage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;
  const session = await getSession();

  let venueName = "LOS Sports Arena & Turf";
  if (session && orgId !== "demo") {
    try {
      const org = await getOrganization(orgId, session.accessToken);
      if (org) {
        venueName = org.name;
      }
    } catch {
      // fallback
    }
  }

  return <VenueWorkspace orgId={orgId} venueName={venueName} />;
}
