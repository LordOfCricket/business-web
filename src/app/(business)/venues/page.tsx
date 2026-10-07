import type { Metadata } from "next";
import Link from "next/link";
import { Badge, Card, EmptyState } from "@/components/ui";
import { requireBusiness } from "@/features/org/context";
import { humanize, STATUS_TONE } from "@/features/org/constants";
import { listVenues } from "@/features/venue/api";

export const metadata: Metadata = { title: "Venues" };

/** Venues of the business (spec §7). Requires the approved VENUE_OPERATOR capability. */
export default async function VenuesPage() {
  const { session, org, capabilities, manager } = await requireBusiness();
  if (!capabilities.includes("VENUE_OPERATOR")) {
    return (
      <EmptyState
        title="Venues are not enabled for this business"
        description="Request the “Run venues” activity in Business settings. It becomes available once our team verifies your business and approves the activity."
      />
    );
  }
  const venues = await listVenues(org.id, session.accessToken);
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="display text-4xl leading-[1.05] sm:text-5xl">Venues</h1>
        {manager && (
          <Link
            href="/venues/new"
            className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-brand-900"
          >
            Add venue
          </Link>
        )}
      </div>
      {venues.length === 0 ? (
        <EmptyState title="No venues yet" description="Add your first ground, court or turf." />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {venues.map((v) => (
            <li key={v.id}>
              <Card className="flex flex-col gap-2">
                <Link
                  href={`/venues/${v.id}`}
                  className="text-lg font-semibold text-brand-700 hover:underline"
                >
                  {v.name}
                </Link>
                <p className="text-sm text-muted">
                  {v.city} · {v.facilityCount} {v.facilityCount === 1 ? "facility" : "facilities"}
                </p>
                <Badge tone={STATUS_TONE[v.status]} className="self-start">
                  {humanize(v.status)}
                </Badge>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
