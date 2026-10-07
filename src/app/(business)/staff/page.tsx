import type { Metadata } from "next";
import { getMembers } from "@/features/org/api";
import { requireBusiness } from "@/features/org/context";
import { MembersPanel } from "@/features/org/MembersPanel";

export const metadata: Metadata = { title: "Coaches & staff" };

export default async function StaffPage() {
  const { session, org, manager, owner } = await requireBusiness();
  const members = await getMembers(org.id, session.accessToken);
  return (
    <div className="flex flex-col gap-6">
      <h1 className="display text-4xl leading-[1.05] sm:text-5xl">Coaches & staff</h1>
      <MembersPanel orgId={org.id} members={members} me={session.user.sub} manager={manager} owner={owner} />
    </div>
  );
}
