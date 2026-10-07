import type { Metadata } from "next";
import Link from "next/link";
import { Badge, Card } from "@/components/ui";
import { CAPABILITIES, humanize, label, STATUS_TONE } from "@/features/org/constants";
import { requireBusiness } from "@/features/org/context";
import { listVenues, type VenueSummary } from "@/features/venue/api";

export const metadata: Metadata = { title: "Dashboard" };

const NEXT_STEP: Record<string, { text: string; href: string; cta: string }> = {
  DRAFT: {
    text: "Upload your verification documents and submit your business for review.",
    href: "/settings?tab=documents",
    cta: "Complete verification",
  },
  PENDING_VERIFICATION: {
    text: "Our team is reviewing your business. You will get an email when it is verified.",
    href: "/settings?tab=documents",
    cta: "View submission",
  },
  REJECTED: {
    text: "Your business was not approved. Update the details or documents and submit again.",
    href: "/settings?tab=documents",
    cta: "Fix and resubmit",
  },
  SUSPENDED: {
    text: "Your business is suspended and hidden from customers. Contact support for details.",
    href: "/settings",
    cta: "Business settings",
  },
};

/** Overview (spec §21): verification progress, approved activities and quick links. */
export default async function DashboardPage() {
  const { session, org, capabilities } = await requireBusiness();
  const venues: VenueSummary[] = capabilities.includes("VENUE_OPERATOR")
    ? await listVenues(org.id, session.accessToken)
    : [];
  const next = NEXT_STEP[org.status];
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="display text-4xl leading-[1.05] sm:text-5xl">{org.name}</h1>
        <p className="text-muted">
          {org.city} · {org.sports.length} {org.sports.length === 1 ? "sport" : "sports"}
        </p>
      </div>

      {next && (
        <Card className="flex flex-wrap items-center gap-4 border-amber-200 bg-amber-50">
          <Badge tone={STATUS_TONE[org.status]}>{humanize(org.status)}</Badge>
          <p className="flex-1 text-sm">
            {next.text}
            {org.statusReason && <span className="block text-danger">Reason: {org.statusReason}</span>}
          </p>
          <Link
            href={next.href}
            className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-brand-900"
          >
            {next.cta}
          </Link>
        </Card>
      )}

      <section className="grid gap-4 sm:grid-cols-3" aria-label="Summary">
        <Card>
          <p className="text-sm text-muted">Venues</p>
          <p className="text-3xl font-bold">{venues.length}</p>
          <p className="text-sm text-muted">{venues.filter((v) => v.isPublic).length} live</p>
        </Card>
        <Card>
          <p className="text-sm text-muted">Facilities</p>
          <p className="text-3xl font-bold">{venues.reduce((n, v) => n + v.facilityCount, 0)}</p>
        </Card>
        <Card>
          <p className="text-sm text-muted">Activities</p>
          <ul className="mt-1 flex flex-col gap-1 text-sm">
            {Object.entries(org.capabilities).map(([cap, status]) => (
              <li key={cap} className="flex items-center gap-2">
                {label(CAPABILITIES, cap)}
                <Badge tone={STATUS_TONE[status]}>{humanize(status)}</Badge>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      <section className="grid gap-4 sm:grid-cols-3" aria-label="Quick links">
        {capabilities.includes("VENUE_OPERATOR") && (
          <Link
            href="/venues"
            className="rounded-xl border border-line bg-surface p-4 font-medium hover:border-brand-600"
          >
            Manage venues & facilities →
          </Link>
        )}
        <Link
          href="/staff"
          className="rounded-xl border border-line bg-surface p-4 font-medium hover:border-brand-600"
        >
          Coaches & staff →
        </Link>
        <Link
          href="/settings"
          className="rounded-xl border border-line bg-surface p-4 font-medium hover:border-brand-600"
        >
          Business settings →
        </Link>
      </section>
    </div>
  );
}
