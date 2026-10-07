import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge, Card } from "@/components/ui";
import { getMyOrganizations } from "@/features/org/api";
import { humanize, STATUS_TONE } from "@/features/org/constants";
import { OnboardingWizard } from "@/features/org/OnboardingWizard";
import { listSports } from "@/lib/api/catalog";
import { launchedOrKept } from "@/lib/sports/launch";
import { getSession } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Register your business" };
export const dynamic = "force-dynamic";

/** Business onboarding (spec §5–§6). Any signed-in user can register a business and becomes its owner. */
export default async function BusinessOnboardingPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/onboarding/business");
  const [mine, catalog] = await Promise.all([getMyOrganizations(session.accessToken), listSports()]);
  // a new business chooses among launched sports only
  const sports = launchedOrKept(catalog);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="display text-4xl leading-[1.05] sm:text-5xl">Register your sports business</h1>
        <p className="mt-2 text-muted">
          Academies, grounds, sports centers, training centers and clubs. You can support several sports and
          add venues, coaches and staff once your business is verified.
        </p>
      </div>

      {mine.length > 0 && (
        <Card className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">Your businesses</h2>
          <ul className="flex flex-col gap-2">
            {mine.map((m) => (
              <li key={m.orgId} className="flex flex-wrap items-center gap-3 text-sm">
                <span className="font-medium">{m.name}</span>
                <Badge tone={STATUS_TONE[m.status]}>{humanize(m.status)}</Badge>
                <span className="text-muted">{humanize(m.orgRole)}</span>
              </li>
            ))}
          </ul>
          <Link href="/dashboard" className="text-sm font-medium text-brand-700 hover:underline">
            Go to the dashboard →
          </Link>
        </Card>
      )}

      <OnboardingWizard
        sports={sports.map((s) => ({ value: s.slug, label: s.name }))}
        contactEmail={session.user.email ?? ""}
      />
    </div>
  );
}
