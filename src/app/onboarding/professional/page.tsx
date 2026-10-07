import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getMyProfessionalProfile } from "@/features/professional/api";
import { OnboardingForm } from "@/features/professional/OnboardingForm";
import { sportsWithRoles } from "@/features/professional/sports";
import { getSession } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Become a coach or professional" };
export const dynamic = "force-dynamic";

/** Spec §8: coach / professional onboarding with sport selection. */
export default async function ProfessionalOnboardingPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/onboarding/professional");
  if (await getMyProfessionalProfile(session.accessToken)) redirect("/profile");

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="display text-4xl leading-[1.05] sm:text-5xl">Offer your services on LordOfSportz</h1>
        <p className="text-muted">
          Coaches, umpires, referees, scorers and trainers get a public profile that players can find by sport
          and city.
        </p>
      </header>
      <OnboardingForm sports={await sportsWithRoles()} />
    </div>
  );
}
