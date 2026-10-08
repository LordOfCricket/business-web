import type { Metadata } from "next";
import Link from "next/link";
import { Badge, Card } from "@/components/ui";
import { CAPABILITIES, humanize, label, STATUS_TONE } from "@/features/org/constants";
import { requireBusiness } from "@/features/org/context";
import { listVenues, type VenueSummary } from "@/features/venue/api";
import {
  AcademyIcon,
  VenueIcon,
  CoachIcon,
  ShopIcon,
  SparklesIcon,
} from "@/components/landing/LandingIcons";

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

/** Overview (spec §21 & §24): verification progress, dynamic workspaces, approved activities and quick links. */
export default async function DashboardPage() {
  const { session, org, capabilities } = await requireBusiness();
  const venues: VenueSummary[] = capabilities.includes("VENUE_OPERATOR")
    ? await listVenues(org.id, session.accessToken)
    : [];
  const next = NEXT_STEP[org.status];

  const userName = session.user.email ? session.user.email.split("@")[0] : "Partner";

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
        <div>
          <span className="kicker text-[11px] text-brand-700">BUSINESS DASHBOARD</span>
          <h1 className="display text-3xl font-normal leading-tight text-ink sm:text-5xl">
            Welcome back, <span className="capitalize">{userName}</span>
          </h1>
          <p className="mt-1 text-sm text-muted">
            Managing <strong className="text-ink">{org.name}</strong> · {org.city} · {org.sports.join(", ")}
          </p>
        </div>
        <Link
          href="/workspace"
          className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-4 py-2 text-xs font-semibold text-brand-800 hover:border-brand-600 hover:bg-brand-50"
        >
          <SparklesIcon className="size-3.5 text-brand-600" />
          Choose Workspace Hub →
        </Link>
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

      {/* Your Workspaces Section (Spec §24) */}
      <section aria-label="Your Workspaces" className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink">Your Active Sports Workspaces</h2>
          <Link href="/workspace" className="text-xs font-semibold text-brand-700 hover:underline">
            All workspaces →
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {/* Sports Academy Workspace Card */}
          <Card className="flex flex-col justify-between transition hover:border-brand-600/40 hover:shadow-xs">
            <div>
              <div className="flex items-center justify-between">
                <div className="rounded-xl bg-brand-50 p-2 text-brand-800">
                  <AcademyIcon className="size-5" />
                </div>
                <Badge tone="success">Academy Active</Badge>
              </div>
              <p className="kicker text-[10px] text-muted mt-3">SPORTS ACADEMY</p>
              <h3 className="font-semibold text-ink text-base">{org.name}</h3>
              <p className="text-xs text-muted mt-1">Students · Batches · Belt Gradings · Timetables</p>
            </div>
            <div className="mt-5 pt-3 border-t border-line">
              <Link
                href={`/workspace/academy/${org.id}`}
                className="inline-flex w-full items-center justify-center rounded-xl bg-ink py-2 text-xs font-semibold text-paper hover:bg-brand-900 transition"
              >
                Open Academy Workspace →
              </Link>
            </div>
          </Card>

          {/* Venue Workspace Card */}
          {capabilities.includes("VENUE_OPERATOR") ? (
            <Card className="flex flex-col justify-between transition hover:border-brand-600/40 hover:shadow-xs">
              <div>
                <div className="flex items-center justify-between">
                  <div className="rounded-xl bg-brand-50 p-2 text-brand-800">
                    <VenueIcon className="size-5" />
                  </div>
                  <Badge tone="success">{venues.length} Venues</Badge>
                </div>
                <p className="kicker text-[10px] text-muted mt-3">VENUE &amp; TURF</p>
                <h3 className="font-semibold text-ink text-base">Ground Operations</h3>
                <p className="text-xs text-muted mt-1">
                  {venues.reduce((n, v) => n + v.facilityCount, 0)} Facilities · Real-Time Slot Calendar
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-line">
                <Link
                  href={`/workspace/venue/${org.id}`}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-ink py-2 text-xs font-semibold text-paper hover:bg-brand-900 transition"
                >
                  Open Venue Workspace →
                </Link>
              </div>
            </Card>
          ) : (
            <Card className="flex flex-col justify-between transition hover:border-brand-600/40 hover:shadow-xs">
              <div>
                <div className="flex items-center justify-between">
                  <div className="rounded-xl bg-brand-50 p-2 text-brand-800">
                    <CoachIcon className="size-5" />
                  </div>
                  <Badge tone="neutral">Professional</Badge>
                </div>
                <p className="kicker text-[10px] text-muted mt-3">COACH PROFILE</p>
                <h3 className="font-semibold text-ink text-base">Coaching Practice</h3>
                <p className="text-xs text-muted mt-1">Timeline · Achievements · Booking Availability</p>
              </div>
              <div className="mt-5 pt-3 border-t border-line">
                <Link
                  href="/workspace/coach"
                  className="inline-flex w-full items-center justify-center rounded-xl bg-ink py-2 text-xs font-semibold text-paper hover:bg-brand-900 transition"
                >
                  Open Coach Profile →
                </Link>
              </div>
            </Card>
          )}

          {/* Official Store Card */}
          <Card className="flex flex-col justify-between transition hover:border-brand-600/40 hover:shadow-xs">
            <div>
              <div className="flex items-center justify-between">
                <div className="rounded-xl bg-brand-50 p-2 text-brand-800">
                  <ShopIcon className="size-5" />
                </div>
                <Badge tone="success">LOS Store</Badge>
              </div>
              <p className="kicker text-[10px] text-muted mt-3">OFFICIAL STORE</p>
              <h3 className="font-semibold text-ink text-base">LordOfSportz Gear &amp; Merch</h3>
              <p className="text-xs text-muted mt-1">Equipment · Orders · Pan-India Logistics</p>
            </div>
            <div className="mt-5 pt-3 border-t border-line">
              <Link
                href={`/workspace/shop/${org.id}`}
                className="inline-flex w-full items-center justify-center rounded-xl bg-ink py-2 text-xs font-semibold text-paper hover:bg-brand-900 transition"
              >
                Open Shop Operations →
              </Link>
            </div>
          </Card>
        </div>
      </section>

      {/* Operational Summary Grid */}
      <section className="grid gap-4 sm:grid-cols-3" aria-label="Summary">
        <Card>
          <p className="text-sm text-muted">Venues &amp; Grounds</p>
          <p className="text-3xl font-bold">{venues.length}</p>
          <p className="text-sm text-muted">{venues.filter((v) => v.isPublic).length} live on network</p>
        </Card>
        <Card>
          <p className="text-sm text-muted">Facilities &amp; Pitches</p>
          <p className="text-3xl font-bold">{venues.reduce((n, v) => n + v.facilityCount, 0)}</p>
        </Card>
        <Card>
          <p className="text-sm text-muted">Approved Platform Capabilities</p>
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

      {/* Quick links */}
      <section className="grid gap-4 sm:grid-cols-3" aria-label="Quick links">
        <Link
          href={`/workspace/academy/${org.id}`}
          className="rounded-xl border border-line bg-surface p-4 font-medium hover:border-brand-600 transition"
        >
          Sports Academy Suite →
        </Link>
        <Link
          href="/staff"
          className="rounded-xl border border-line bg-surface p-4 font-medium hover:border-brand-600 transition"
        >
          Coaches &amp; staff roles →
        </Link>
        <Link
          href="/settings"
          className="rounded-xl border border-line bg-surface p-4 font-medium hover:border-brand-600 transition"
        >
          Business settings &amp; verification →
        </Link>
      </section>
    </div>
  );
}
