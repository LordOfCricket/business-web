import type { Metadata } from "next";
import { getDocuments } from "@/features/org/api";
import { requireBusiness } from "@/features/org/context";
import { OrgSettings } from "@/features/org/OrgSettings";
import { listSports } from "@/lib/api/catalog";
import { launchedOrKept } from "@/lib/sports/launch";

export const metadata: Metadata = { title: "Business settings" };

/** Organization profile, sports, activities (capabilities) and verification documents (spec §21 Settings). */
export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { session, org, manager, owner } = await requireBusiness();
  const [{ tab }, documents, sports] = await Promise.all([
    searchParams,
    manager ? getDocuments(org.id, session.accessToken) : Promise.resolve([]),
    listSports(),
  ]);
  return (
    <div className="flex flex-col gap-6">
      <h1 className="display text-4xl leading-[1.05] sm:text-5xl">Business settings</h1>
      <OrgSettings
        org={org}
        documents={documents}
        sports={launchedOrKept(sports, org.sports).map((s) => ({ value: s.slug, label: s.name }))}
        manager={manager}
        owner={owner}
        initialTab={tab}
      />
    </div>
  );
}
