import type { Metadata } from "next";
import Link from "next/link";
import { Badge, Card, EmptyState } from "@/components/ui";
import { BookingRowActions, WalkInForm } from "@/features/bookings/BookingControls";
import { listOrgBookings } from "@/features/bookings/api";
import { requireBusiness } from "@/features/org/context";
import { humanize, STATUS_TONE } from "@/features/org/constants";
import { getVenue, listVenues } from "@/features/venue/api";

export const metadata: Metadata = { title: "Bookings" };

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const money = (amount: number, currency: string) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);

/** Server component: rendered once per request, so "now" is the request time. */
function requestTime(): number {
  return Date.now();
}

function shift(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Day view of a venue's bookings by facility (spec §7 "View bookings", "Manage bookings"). */
export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ venue?: string; date?: string }>;
}) {
  const { session, org, capabilities } = await requireBusiness();
  if (!capabilities.includes("VENUE_OPERATOR")) {
    return <EmptyState title="Bookings need an approved venue operator business" />;
  }
  const sp = await searchParams;
  const venues = await listVenues(org.id, session.accessToken);
  if (venues.length === 0) {
    return (
      <EmptyState title="No venues yet" description="Add a venue and its facilities to take bookings." />
    );
  }
  const venueId = venues.some((v) => v.id === sp.venue) ? sp.venue! : venues[0]!.id;
  const venueData = await getVenue(org.id, venueId, session.accessToken);
  const timezone = venueData?.venue.timezone ?? "Asia/Kolkata";
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: timezone }).format(new Date());
  const date = DATE.test(sp.date ?? "") ? sp.date! : today;
  const bookings = await listOrgBookings(org.id, session.accessToken, { venueId, from: date, tz: timezone });
  const facilities = venueData?.facilities ?? [];
  const now = requestTime();
  const time = (iso: string) =>
    new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit", timeZone: timezone }).format(
      new Date(iso),
    );
  const href = (d: string) => `/bookings?venue=${venueId}&date=${d}`;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="display text-4xl leading-[1.05] sm:text-5xl">Bookings</h1>
      <form className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-sm font-medium">
          Venue
          <select
            name="venue"
            defaultValue={venueId}
            className="h-10 rounded-xl border border-ink/15 bg-surface px-3 font-normal hover:border-ink/35"
          >
            {venues.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Date
          <input
            type="date"
            name="date"
            defaultValue={date}
            className="h-10 rounded-xl border border-ink/15 bg-surface px-3 font-normal hover:border-ink/35"
          />
        </label>
        <button type="submit" className="h-10 rounded-full bg-ink px-4 text-sm font-medium text-paper">
          Show
        </button>
        <span className="flex gap-2 text-sm">
          <Link
            href={href(shift(date, -1))}
            className="rounded-full border border-ink/15 px-3 py-2 hover:border-ink/40"
          >
            ← Previous day
          </Link>
          <Link
            href={href(today)}
            className="rounded-full border border-ink/15 px-3 py-2 hover:border-ink/40"
          >
            Today
          </Link>
          <Link
            href={href(shift(date, 1))}
            className="rounded-full border border-ink/15 px-3 py-2 hover:border-ink/40"
          >
            Next day →
          </Link>
        </span>
      </form>

      <div className="grid gap-4 lg:grid-cols-2">
        {facilities.map((f) => {
          const rows = bookings.filter((b) => b.facilityId === f.id);
          return (
            <Card key={f.id} className="flex flex-col gap-3">
              <h2 className="text-lg font-semibold">
                {f.name}{" "}
                <span className="text-sm font-normal text-muted">
                  ({rows.filter((b) => b.status === "CONFIRMED").length} confirmed)
                </span>
              </h2>
              {rows.length === 0 ? (
                <p className="text-sm text-muted">No bookings.</p>
              ) : (
                <ul className="flex flex-col divide-y divide-line">
                  {rows.map((b) => (
                    <li key={b.id} className="flex flex-wrap items-center gap-2 py-2 text-sm">
                      <span className="w-32 font-medium">
                        {time(b.startAt)}–{time(b.endAt)}
                      </span>
                      <span className="min-w-32 flex-1">
                        {b.source === "WALK_IN" ? (
                          <>
                            {b.walkInName} <Badge>Walk-in</Badge>
                            {b.walkInPhone && <span className="block text-muted">{b.walkInPhone}</span>}
                          </>
                        ) : (
                          <>Online · {money(b.price, b.currency)}</>
                        )}
                      </span>
                      <Badge tone={STATUS_TONE[b.status] ?? "neutral"}>{humanize(b.status)}</Badge>
                      <BookingRowActions
                        orgId={org.id}
                        bookingId={b.id}
                        status={b.status}
                        started={new Date(b.startAt).getTime() <= now}
                        ended={new Date(b.endAt).getTime() <= now}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          );
        })}
      </div>

      {facilities.length > 0 && (
        <Card className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">Walk-in or phone booking</h2>
          <p className="text-sm text-muted">
            Paid at the venue. The slot is checked against online bookings and blocks.
          </p>
          <WalkInForm
            orgId={org.id}
            date={date}
            timezone={timezone}
            facilities={facilities.map((f) => ({ value: f.id, label: f.name }))}
          />
        </Card>
      )}
    </div>
  );
}
