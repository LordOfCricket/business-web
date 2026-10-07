import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireBusiness } from "@/features/org/context";
import { getVenue } from "@/features/venue/api";
import { amenityChoices, facilityTypesFor, publicVenueUrl, sportChoices } from "@/features/venue/catalog";
import { VenueEditor } from "@/features/venue/VenueForms";

export const metadata: Metadata = { title: "Venue" };

export default async function VenuePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { session, org, manager } = await requireBusiness();
  const data = await getVenue(org.id, id, session.accessToken);
  if (!data) notFound();
  const { venue, facilities } = data;
  const [sports, facilityTypes, amenities] = await Promise.all([
    sportChoices(org.sports, venue.sports),
    facilityTypesFor(venue.sports),
    amenityChoices(),
  ]);
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/venues" className="text-sm text-muted hover:underline">
          ← Venues
        </Link>
        <h1 className="display text-4xl leading-[1.05] sm:text-5xl">{venue.name}</h1>
        <p className="text-muted">
          {venue.addressLine}, {venue.city}
        </p>
      </div>
      <VenueEditor
        orgId={org.id}
        venue={venue}
        facilities={facilities}
        sports={sports}
        amenities={amenities}
        facilityTypes={facilityTypes}
        manager={manager}
        publicUrl={publicVenueUrl(venue)}
      />
    </div>
  );
}
