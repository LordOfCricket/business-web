"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Badge, Button, Card, Input, Select, Tabs } from "@/components/ui";
import {
  ActionButton,
  ActionFeedback,
  CheckboxGroup,
  type Choice,
  EditorSection,
  textareaClass,
} from "@/components/common/EditorSection";
import { humanize, STATUS_TONE } from "@/features/org/constants";
import type { ActionResult } from "@/lib/actions/result";
import {
  createFacilityAction,
  createVenueAction,
  type FacilityInput,
  replaceVenueAmenitiesAction,
  replaceVenueHoursAction,
  replaceVenueMediaAction,
  replaceVenueSportsAction,
  updateVenueAction,
  type VenueDetailsInput,
  venueStatusAction,
} from "./actions";
import type { Facility, Venue } from "./api";
import { MediaGallery } from "./MediaGallery";
import { hhmm, HoursEditor, type HoursRow } from "./ScheduleEditors";

export type FacilityTypes = Record<string, Choice[]>;

function detailsOf(venue?: Venue): VenueDetailsInput {
  return {
    name: venue?.name ?? "",
    description: venue?.description ?? "",
    addressLine: venue?.addressLine ?? "",
    city: venue?.city ?? "",
    state: venue?.state ?? "",
    postalCode: venue?.postalCode ?? "",
    latitude: venue?.latitude?.toString() ?? "",
    longitude: venue?.longitude?.toString() ?? "",
    contactPhone: venue?.contactPhone ?? "",
  };
}

function DetailsFields({
  value,
  onChange,
}: {
  value: VenueDetailsInput;
  onChange: (v: VenueDetailsInput) => void;
}) {
  const set = (key: keyof VenueDetailsInput) => (e: { target: { value: string } }) =>
    onChange({ ...value, [key]: e.target.value });
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Input label="Venue name" value={value.name} onChange={set("name")} maxLength={120} />
      <Input label="Contact phone" type="tel" value={value.contactPhone} onChange={set("contactPhone")} />
      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <label htmlFor="venue-description" className="text-sm font-medium">
          Description
        </label>
        <textarea
          id="venue-description"
          className={textareaClass}
          value={value.description}
          onChange={set("description")}
          maxLength={5000}
        />
      </div>
      <Input label="Street address" value={value.addressLine} onChange={set("addressLine")} maxLength={200} />
      <Input label="City" value={value.city} onChange={set("city")} maxLength={80} />
      <Input label="State" value={value.state} onChange={set("state")} maxLength={80} />
      <Input label="Postal code" value={value.postalCode} onChange={set("postalCode")} maxLength={12} />
      <Input
        label="Latitude"
        inputMode="decimal"
        value={String(value.latitude ?? "")}
        onChange={set("latitude")}
        hint="Optional — used for the map and distance search."
      />
      <Input
        label="Longitude"
        inputMode="decimal"
        value={String(value.longitude ?? "")}
        onChange={set("longitude")}
      />
    </div>
  );
}

/** New venue: details + sports (a subset of the business's sports). */
export function VenueCreateForm({ orgId, sports }: { orgId: string; sports: Choice[] }) {
  const [details, setDetails] = useState(detailsOf());
  const [selected, setSelected] = useState<string[]>([]);
  const [result, setResult] = useState<ActionResult>({});
  const [pending, start] = useTransition();
  return (
    <Card className="flex flex-col gap-6">
      <DetailsFields value={details} onChange={setDetails} />
      <CheckboxGroup
        legend="Sports played here"
        choices={sports}
        selected={selected}
        onChange={setSelected}
        columns={4}
      />
      <div className="flex items-center gap-3">
        <Button
          loading={pending}
          onClick={() =>
            start(async () => setResult(await createVenueAction(orgId, { details, sports: selected })))
          }
        >
          Create venue
        </Button>
        <ActionFeedback result={result} />
      </div>
    </Card>
  );
}

export function VenueEditor({
  orgId,
  venue,
  facilities,
  sports,
  amenities,
  facilityTypes,
  manager,
  publicUrl,
}: {
  orgId: string;
  venue: Venue;
  facilities: Facility[];
  sports: Choice[];
  amenities: Choice[];
  facilityTypes: FacilityTypes;
  manager: boolean;
  publicUrl: string;
}) {
  const [details, setDetails] = useState(detailsOf(venue));
  const [selectedSports, setSelectedSports] = useState(venue.sports);
  const [hours, setHours] = useState<HoursRow[]>(
    venue.hours.map((h) => ({ ...h, opensAt: hhmm(h.opensAt), closesAt: hhmm(h.closesAt) })),
  );
  const [selectedAmenities, setSelectedAmenities] = useState(venue.amenityIds);
  const [media, setMedia] = useState(venue.media);
  const venueSports = sports.filter((s) => venue.sports.includes(s.value));
  const save = (fn: () => Promise<ActionResult>) => (manager ? fn : undefined);

  return (
    <div className="flex flex-col gap-4">
      <StatusBar orgId={orgId} venue={venue} manager={manager} publicUrl={publicUrl} />
      <Tabs
        tabs={[
          {
            id: "facilities",
            label: `Facilities (${facilities.length})`,
            content: (
              <FacilitiesTab
                orgId={orgId}
                venueId={venue.id}
                facilities={facilities}
                sports={venueSports}
                facilityTypes={facilityTypes}
                manager={manager}
              />
            ),
          },
          {
            id: "details",
            label: "Details",
            content: (
              <EditorSection
                title="Venue details"
                onSave={save(() => updateVenueAction(orgId, venue.id, details))}
              >
                <fieldset disabled={!manager}>
                  <DetailsFields value={details} onChange={setDetails} />
                </fieldset>
              </EditorSection>
            ),
          },
          {
            id: "sports",
            label: "Sports",
            content: (
              <EditorSection
                title="Sports played here"
                description="Only your business's sports can be chosen. A sport used by a facility cannot be removed."
                onSave={save(() => replaceVenueSportsAction(orgId, venue.id, selectedSports))}
              >
                <CheckboxGroup
                  legend="Sports"
                  choices={sports}
                  selected={selectedSports}
                  onChange={setSelectedSports}
                  columns={4}
                />
              </EditorSection>
            ),
          },
          {
            id: "hours",
            label: "Opening hours",
            content: (
              <EditorSection
                title="Opening hours"
                description={`Times are in ${venue.timezone}. Facilities use these hours unless they have their own.`}
                onSave={save(() => replaceVenueHoursAction(orgId, venue.id, hours))}
              >
                <HoursEditor rows={hours} onChange={setHours} />
              </EditorSection>
            ),
          },
          {
            id: "amenities",
            label: "Amenities",
            content: (
              <EditorSection
                title="Amenities"
                onSave={save(() => replaceVenueAmenitiesAction(orgId, venue.id, selectedAmenities))}
              >
                <CheckboxGroup
                  legend="Available at this venue"
                  choices={amenities}
                  selected={selectedAmenities}
                  onChange={setSelectedAmenities}
                  columns={3}
                />
              </EditorSection>
            ),
          },
          {
            id: "media",
            label: "Photos & videos",
            content: (
              <EditorSection
                title="Photos & videos"
                description="The first photo is the cover image in search results."
                onSave={save(() =>
                  replaceVenueMediaAction(
                    orgId,
                    venue.id,
                    media.map((m) => m.mediaId),
                  ),
                )}
              >
                <MediaGallery
                  items={media}
                  onChange={(items) => setMedia(items as typeof media)}
                  allowVideo
                />
              </EditorSection>
            ),
          },
        ]}
      />
    </div>
  );
}

function StatusBar({
  orgId,
  venue,
  manager,
  publicUrl,
}: {
  orgId: string;
  venue: Venue;
  manager: boolean;
  publicUrl: string;
}) {
  return (
    <Card className="flex flex-wrap items-center gap-3 text-sm">
      <Badge tone={STATUS_TONE[venue.status]}>{humanize(venue.status)}</Badge>
      {venue.status === "DRAFT" && (
        <span>Add opening hours and at least one facility with prices, then submit.</span>
      )}
      {venue.status === "PENDING_APPROVAL" && <span>Waiting for approval by the LordOfSportz team.</span>}
      {venue.status === "REJECTED" && <span className="text-danger">Rejected: {venue.statusReason}</span>}
      {venue.status === "SUSPENDED" && <span className="text-danger">Suspended: {venue.statusReason}</span>}
      {venue.status === "INACTIVE" && <span>Temporarily closed — hidden from customers.</span>}
      {venue.isPublic && (
        <a
          href={publicUrl}
          target="_blank"
          rel="noreferrer"
          className="font-medium text-brand-700 hover:underline"
        >
          View public page ↗
        </a>
      )}
      {venue.status === "ACTIVE" && !venue.orgActive && (
        <span className="text-warning">
          Hidden: your business is not currently verified as a venue operator.
        </span>
      )}
      <span className="flex-1" />
      {manager && (venue.status === "DRAFT" || venue.status === "REJECTED") && (
        <ActionButton action={() => venueStatusAction(orgId, venue.id, "submit")}>
          Submit for approval
        </ActionButton>
      )}
      {manager && venue.status === "ACTIVE" && (
        <ActionButton
          variant="secondary"
          confirm="Close this venue? Customers will not see it until you reopen it."
          action={() => venueStatusAction(orgId, venue.id, "deactivate")}
        >
          Close temporarily
        </ActionButton>
      )}
      {manager && venue.status === "INACTIVE" && (
        <ActionButton action={() => venueStatusAction(orgId, venue.id, "activate")}>Reopen</ActionButton>
      )}
    </Card>
  );
}

function FacilitiesTab({
  orgId,
  venueId,
  facilities,
  sports,
  facilityTypes,
  manager,
}: {
  orgId: string;
  venueId: string;
  facilities: Facility[];
  sports: Choice[];
  facilityTypes: FacilityTypes;
  manager: boolean;
}) {
  const firstSport = sports[0]?.value ?? "";
  const [draft, setDraft] = useState<FacilityInput>({
    sport: firstSport,
    facilityType: facilityTypes[firstSport]?.[0]?.value ?? "",
    name: "",
    description: "",
    capacity: "",
    indoor: false,
  });
  const types = facilityTypes[draft.sport] ?? [];
  return (
    <div className="flex flex-col gap-4">
      {facilities.length > 0 && (
        <Card>
          <ul className="flex flex-col divide-y divide-line">
            {facilities.map((f) => (
              <li key={f.id} className="flex flex-wrap items-center gap-3 py-3 text-sm">
                <Link
                  href={`/venues/${venueId}/facilities/${f.id}`}
                  className="font-medium text-brand-700 hover:underline"
                >
                  {f.name}
                </Link>
                <span className="text-muted">
                  {sports.find((s) => s.value === f.sport)?.label ?? f.sport} · {f.facilityType}
                </span>
                <Badge tone={STATUS_TONE[f.status]}>{humanize(f.status)}</Badge>
                {f.pricing.length === 0 && <Badge tone="warning">No prices</Badge>}
              </li>
            ))}
          </ul>
        </Card>
      )}
      {manager && (
        <EditorSection
          title="Add a facility"
          description="A court, turf, pitch, net or hall that customers book separately."
          onSave={() => createFacilityAction(orgId, venueId, draft)}
          saveLabel="Add facility"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Name"
              value={draft.name}
              placeholder="Court 1"
              maxLength={120}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            />
            <Select
              label="Sport"
              value={draft.sport}
              options={sports}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  sport: e.target.value,
                  facilityType: facilityTypes[e.target.value]?.[0]?.value ?? "",
                })
              }
            />
            <Select
              label="Facility type"
              value={draft.facilityType}
              options={types}
              onChange={(e) => setDraft({ ...draft, facilityType: e.target.value })}
            />
            <Input
              label="Capacity (players)"
              type="number"
              min={1}
              value={String(draft.capacity ?? "")}
              onChange={(e) => setDraft({ ...draft, capacity: e.target.value })}
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={draft.indoor}
                onChange={(e) => setDraft({ ...draft, indoor: e.target.checked })}
              />
              Indoor
            </label>
          </div>
        </EditorSection>
      )}
    </div>
  );
}
