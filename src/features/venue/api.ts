import "server-only";
import { gatewayFetch, GatewayError } from "@/lib/api/gateway";

export type Day = "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY";

export interface Hours {
  day: Day;
  opensAt: string;
  closesAt: string;
}

export interface PriceRule {
  day: Day;
  startTime: string;
  endTime: string;
  pricePerHour: number;
  peak: boolean;
  label?: string;
}

export interface Rules {
  slotMinutes: number;
  minDurationMinutes: number;
  maxDurationMinutes: number;
  advanceDays: number;
  bufferMinutes: number;
  cancellationCutoffHours: number;
  cancellationRefundPercent: number;
  rescheduleAllowed: boolean;
  rescheduleCutoffHours: number;
}

export interface MediaItem {
  mediaId: string;
  kind: "IMAGE" | "VIDEO";
  url: string;
}

export interface Venue {
  id: string;
  orgId: string;
  slug: string;
  name: string;
  description?: string;
  addressLine: string;
  city: string;
  state?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  timezone: string;
  contactPhone?: string;
  status: "DRAFT" | "PENDING_APPROVAL" | "ACTIVE" | "INACTIVE" | "REJECTED" | "SUSPENDED";
  statusReason?: string;
  orgActive: boolean;
  isPublic: boolean;
  sports: string[];
  amenityIds: string[];
  media: MediaItem[];
  hours: Hours[];
  createdAt: string;
}

export interface Facility {
  id: string;
  venueId: string;
  name: string;
  sport: string;
  facilityType: string;
  description?: string;
  capacity?: number;
  indoor: boolean;
  status: "ACTIVE" | "INACTIVE";
  booked: boolean;
  amenityIds: string[];
  media: MediaItem[];
  hours: Hours[];
  currency: string;
  pricing: PriceRule[];
  rules: Rules;
}

export interface VenueSummary {
  id: string;
  slug: string;
  name: string;
  city: string;
  status: Venue["status"];
  isPublic: boolean;
  facilityCount: number;
}

export interface Amenity {
  id: string;
  slug: string;
  name: string;
  icon?: string;
}

export interface Block {
  id: string;
  startAt: string;
  endAt: string;
  type: "BLOCKED" | "MAINTENANCE";
  reason?: string;
}

export async function listVenues(orgId: string, accessToken: string): Promise<VenueSummary[]> {
  return (await gatewayFetch<VenueSummary[]>(`/business/${orgId}/venues`, { accessToken })).data;
}

export async function getVenue(
  orgId: string,
  venueId: string,
  accessToken: string,
): Promise<{ venue: Venue; facilities: Facility[] } | null> {
  try {
    return (
      await gatewayFetch<{ venue: Venue; facilities: Facility[] }>(`/business/${orgId}/venues/${venueId}`, {
        accessToken,
      })
    ).data;
  } catch (error) {
    if (error instanceof GatewayError && (error.status === 404 || error.status === 400)) return null;
    throw error;
  }
}

export async function getFacility(
  orgId: string,
  facilityId: string,
  accessToken: string,
): Promise<Facility | null> {
  try {
    return (await gatewayFetch<Facility>(`/business/${orgId}/facilities/${facilityId}`, { accessToken }))
      .data;
  } catch (error) {
    if (error instanceof GatewayError && (error.status === 404 || error.status === 400)) return null;
    throw error;
  }
}

export async function getBlocks(orgId: string, facilityId: string, accessToken: string): Promise<Block[]> {
  return (await gatewayFetch<Block[]>(`/business/${orgId}/facilities/${facilityId}/blocks`, { accessToken }))
    .data;
}

export async function listAmenities(): Promise<Amenity[]> {
  return (await gatewayFetch<Amenity[]>("/amenities", { revalidate: 300 })).data;
}
