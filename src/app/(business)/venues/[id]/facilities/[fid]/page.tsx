import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireBusiness } from "@/features/org/context";
import { getBlocks, getFacility, getVenue } from "@/features/venue/api";
import { amenityChoices, facilityTypesFor, sportChoices } from "@/features/venue/catalog";
import { FacilityEditor } from "@/features/venue/FacilityEditor";

export const metadata: Metadata = { title: "Facility" };

export default async function FacilityPage({ params }: { params: Promise<{ id: string; fid: string }> }) {
  const { id, fid } = await params;
  const { session, org, manager } = await requireBusiness();
  const [venueData, facility] = await Promise.all([
    getVenue(org.id, id, session.accessToken),
    getFacility(org.id, fid, session.accessToken),
  ]);
  if (!venueData || !facility || facility.venueId !== venueData.venue.id) notFound();
  const { venue } = venueData;
  const [blocks, sports, facilityTypes, amenities] = await Promise.all([
    getBlocks(org.id, fid, session.accessToken),
    sportChoices(venue.sports, venue.sports),
    facilityTypesFor(venue.sports),
    amenityChoices(),
  ]);
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href={`/venues/${venue.id}`} className="text-sm text-muted hover:underline">
          ← {venue.name}
        </Link>
        <h1 className="display text-4xl leading-[1.05] sm:text-5xl">{facility.name}</h1>
      </div>
      <FacilityEditor
        orgId={org.id}
        venueId={venue.id}
        facility={facility}
        blocks={blocks}
        sports={sports}
        facilityTypes={facilityTypes}
        amenities={amenities}
        timezone={venue.timezone}
        manager={manager}
      />
    </div>
  );
}
