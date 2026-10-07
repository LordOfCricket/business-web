import "server-only";
import { gatewayFetch } from "@/lib/api/gateway";

export interface OrgBooking {
  id: string;
  status: string;
  source: "ONLINE" | "WALK_IN";
  venueId: string;
  venueName: string;
  facilityId: string;
  facilityName: string;
  startAt: string;
  endAt: string;
  timezone: string;
  price: number;
  currency: string;
  customerId?: string;
  walkInName?: string;
  walkInPhone?: string;
  note?: string;
  refundAmount?: number;
}

/** Bookings starting on a local date (venue time zone). */
export async function listOrgBookings(
  orgId: string,
  token: string,
  f: { venueId?: string; from: string; to?: string; tz: string },
): Promise<OrgBooking[]> {
  const q = new URLSearchParams({ from: f.from, tz: f.tz });
  if (f.to) q.set("to", f.to);
  if (f.venueId) q.set("venueId", f.venueId);
  return (await gatewayFetch<OrgBooking[]>(`/business/${orgId}/bookings?${q}`, { accessToken: token })).data;
}
