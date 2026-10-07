import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getMyProfessionalProfile } from "@/features/professional/api";
import { ProfileEditor } from "@/features/professional/ProfileEditor";
import { sportsWithRoles } from "@/features/professional/sports";
import { getSession } from "@/lib/auth/session";

export const metadata: Metadata = { title: "My professional profile" };
export const dynamic = "force-dynamic";

function publicProfileUrl(profile: {
  slug: string;
  city?: string;
  roles: Array<{ type: string; sport: string }>;
}) {
  const base = process.env.CUSTOMER_SITE_URL ?? "http://localhost:3000";
  const primary = profile.roles[0];
  const city = (profile.city ?? "anywhere")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const kind = !primary || primary.type === "coach" ? "coaches" : "professionals";
  return `${base}/${kind}/${city || "anywhere"}/${primary?.sport ?? "sports"}/${profile.slug}`;
}

/** Spec §12: profile, sports, experience, certifications, specializations, location, availability, pricing, services. */
export default async function ProfessionalProfilePage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/profile");
  const profile = await getMyProfessionalProfile(session.accessToken);
  if (!profile) redirect("/onboarding/professional");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="display text-4xl leading-[1.05] sm:text-5xl">My professional profile</h1>
      <ProfileEditor
        profile={profile}
        sports={await sportsWithRoles(profile.roles.map((r) => r.sport))}
        publicUrl={publicProfileUrl(profile)}
      />
    </div>
  );
}
