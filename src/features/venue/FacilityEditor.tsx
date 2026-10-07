"use client";

import { useState } from "react";
import { Badge, Card, Input, Select, Tabs } from "@/components/ui";
import {
  ActionButton,
  CheckboxGroup,
  type Choice,
  EditorSection,
  textareaClass,
} from "@/components/common/EditorSection";
import { humanize, STATUS_TONE } from "@/features/org/constants";
import type { ActionResult } from "@/lib/actions/result";
import {
  addBlockAction,
  deleteFacilityAction,
  facilityStatusAction,
  type FacilityInput,
  removeBlockAction,
  replaceFacilityAmenitiesAction,
  replaceFacilityHoursAction,
  replaceFacilityMediaAction,
  replacePricingAction,
  replaceRulesAction,
  updateFacilityAction,
} from "./actions";
import type { Block, Facility, Rules } from "./api";
import { MediaGallery } from "./MediaGallery";
import { hhmm, HoursEditor, type HoursRow, PricingEditor, type PriceRow } from "./ScheduleEditors";

/** Facility management: details, pricing (§9), booking rules (§10), hours, amenities, photos, blocks (§11). */
export function FacilityEditor({
  orgId,
  venueId,
  facility,
  blocks,
  sports,
  facilityTypes,
  amenities,
  timezone,
  manager,
}: {
  orgId: string;
  venueId: string;
  facility: Facility;
  blocks: Block[];
  sports: Choice[];
  facilityTypes: Record<string, Choice[]>;
  amenities: Choice[];
  timezone: string;
  manager: boolean;
}) {
  const [details, setDetails] = useState<FacilityInput>({
    sport: facility.sport,
    facilityType: facility.facilityType,
    name: facility.name,
    description: facility.description ?? "",
    capacity: facility.capacity?.toString() ?? "",
    indoor: facility.indoor,
  });
  const [pricing, setPricing] = useState<PriceRow[]>(
    facility.pricing.map((p) => ({
      day: p.day,
      startTime: hhmm(p.startTime),
      endTime: hhmm(p.endTime),
      pricePerHour: String(p.pricePerHour),
      peak: p.peak,
      label: p.label ?? "",
    })),
  );
  const [rules, setRules] = useState<Rules>(facility.rules);
  const [hours, setHours] = useState<HoursRow[]>(
    facility.hours.map((h) => ({ ...h, opensAt: hhmm(h.opensAt), closesAt: hhmm(h.closesAt) })),
  );
  const [selectedAmenities, setSelectedAmenities] = useState(facility.amenityIds);
  const [media, setMedia] = useState(facility.media);
  const save = (fn: () => Promise<ActionResult>) => (manager ? fn : undefined);
  const num = (key: keyof Rules) => (e: { target: { value: string } }) =>
    setRules({ ...rules, [key]: Number(e.target.value) });

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-wrap items-center gap-3 text-sm">
        <Badge tone={STATUS_TONE[facility.status]}>{humanize(facility.status)}</Badge>
        {facility.pricing.length === 0 && (
          <span className="text-warning">Add prices so customers can book.</span>
        )}
        <span className="flex-1" />
        {manager && facility.status === "ACTIVE" && (
          <ActionButton
            variant="secondary"
            action={() => facilityStatusAction(orgId, facility.id, "deactivate")}
          >
            Deactivate
          </ActionButton>
        )}
        {manager && facility.status === "INACTIVE" && (
          <ActionButton action={() => facilityStatusAction(orgId, facility.id, "activate")}>
            Activate
          </ActionButton>
        )}
        {manager && !facility.booked && (
          <ActionButton
            variant="danger"
            confirm={`Delete ${facility.name}? This cannot be undone.`}
            action={() => deleteFacilityAction(orgId, venueId, facility.id)}
          >
            Delete
          </ActionButton>
        )}
      </Card>
      <Tabs
        tabs={[
          {
            id: "pricing",
            label: "Pricing",
            content: (
              <EditorSection
                title="Hourly pricing (INR)"
                description={`Price bands per weekday in ${timezone}. Different facilities can have different prices.`}
                onSave={save(() => replacePricingAction(orgId, facility.id, pricing))}
              >
                <PricingEditor rows={pricing} onChange={setPricing} />
              </EditorSection>
            ),
          },
          {
            id: "rules",
            label: "Booking rules",
            content: (
              <EditorSection
                title="Booking rules"
                onSave={save(() => replaceRulesAction(orgId, facility.id, { ...rules }))}
              >
                <div className="grid gap-4 sm:grid-cols-3">
                  <Select
                    label="Slot size"
                    value={String(rules.slotMinutes)}
                    onChange={num("slotMinutes")}
                    options={[15, 30, 45, 60, 90, 120].map((m) => ({
                      value: String(m),
                      label: `${m} minutes`,
                    }))}
                  />
                  <Input
                    label="Minimum booking (minutes)"
                    type="number"
                    min={15}
                    value={rules.minDurationMinutes}
                    onChange={num("minDurationMinutes")}
                  />
                  <Input
                    label="Maximum booking (minutes)"
                    type="number"
                    min={15}
                    value={rules.maxDurationMinutes}
                    onChange={num("maxDurationMinutes")}
                  />
                  <Input
                    label="Book up to (days ahead)"
                    type="number"
                    min={1}
                    max={365}
                    value={rules.advanceDays}
                    onChange={num("advanceDays")}
                  />
                  <Input
                    label="Buffer between bookings (minutes)"
                    type="number"
                    min={0}
                    step={5}
                    value={rules.bufferMinutes}
                    onChange={num("bufferMinutes")}
                  />
                  <Input
                    label="Free cancellation until (hours before)"
                    type="number"
                    min={0}
                    value={rules.cancellationCutoffHours}
                    onChange={num("cancellationCutoffHours")}
                  />
                  <Input
                    label="Refund when cancelled in time (%)"
                    type="number"
                    min={0}
                    max={100}
                    value={rules.cancellationRefundPercent}
                    onChange={num("cancellationRefundPercent")}
                  />
                  <Input
                    label="Reschedule until (hours before)"
                    type="number"
                    min={0}
                    value={rules.rescheduleCutoffHours}
                    onChange={num("rescheduleCutoffHours")}
                  />
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={rules.rescheduleAllowed}
                      onChange={(e) => setRules({ ...rules, rescheduleAllowed: e.target.checked })}
                    />
                    Customers may reschedule
                  </label>
                </div>
              </EditorSection>
            ),
          },
          {
            id: "blocks",
            label: "Blocks & maintenance",
            content: (
              <BlocksPanel orgId={orgId} facilityId={facility.id} blocks={blocks} timezone={timezone} />
            ),
          },
          {
            id: "details",
            label: "Details",
            content: (
              <EditorSection
                title="Facility details"
                onSave={save(() => updateFacilityAction(orgId, facility.id, details))}
              >
                <fieldset disabled={!manager} className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Name"
                    value={details.name}
                    maxLength={120}
                    onChange={(e) => setDetails({ ...details, name: e.target.value })}
                  />
                  <Select
                    label="Sport"
                    value={details.sport}
                    options={sports}
                    onChange={(e) =>
                      setDetails({
                        ...details,
                        sport: e.target.value,
                        facilityType: facilityTypes[e.target.value]?.[0]?.value ?? "",
                      })
                    }
                  />
                  <Select
                    label="Facility type"
                    value={details.facilityType}
                    options={facilityTypes[details.sport] ?? []}
                    onChange={(e) => setDetails({ ...details, facilityType: e.target.value })}
                  />
                  <Input
                    label="Capacity (players)"
                    type="number"
                    min={1}
                    value={String(details.capacity ?? "")}
                    onChange={(e) => setDetails({ ...details, capacity: e.target.value })}
                  />
                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label htmlFor="facility-description" className="text-sm font-medium">
                      Description
                    </label>
                    <textarea
                      id="facility-description"
                      className={textareaClass}
                      value={details.description}
                      maxLength={3000}
                      onChange={(e) => setDetails({ ...details, description: e.target.value })}
                    />
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={details.indoor}
                      onChange={(e) => setDetails({ ...details, indoor: e.target.checked })}
                    />
                    Indoor
                  </label>
                </fieldset>
              </EditorSection>
            ),
          },
          {
            id: "hours",
            label: "Own hours",
            content: (
              <EditorSection
                title="Facility hours"
                description="Leave empty to use the venue's opening hours."
                onSave={save(() => replaceFacilityHoursAction(orgId, facility.id, hours))}
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
                onSave={save(() => replaceFacilityAmenitiesAction(orgId, facility.id, selectedAmenities))}
              >
                <CheckboxGroup
                  legend="Available with this facility"
                  choices={amenities}
                  selected={selectedAmenities}
                  onChange={setSelectedAmenities}
                />
              </EditorSection>
            ),
          },
          {
            id: "media",
            label: "Photos",
            content: (
              <EditorSection
                title="Photos"
                onSave={save(() =>
                  replaceFacilityMediaAction(
                    orgId,
                    facility.id,
                    media.map((m) => m.mediaId),
                  ),
                )}
              >
                <MediaGallery
                  items={media}
                  onChange={(items) => setMedia(items as typeof media)}
                  allowVideo={false}
                />
              </EditorSection>
            ),
          },
        ]}
      />
    </div>
  );
}

/** Owner-blocked slots and maintenance periods; staff can manage them too. */
function BlocksPanel({
  orgId,
  facilityId,
  blocks,
  timezone,
}: {
  orgId: string;
  facilityId: string;
  blocks: Block[];
  timezone: string;
}) {
  const [draft, setDraft] = useState({ start: "", end: "", type: "BLOCKED", reason: "" });
  const format = (iso: string) =>
    new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: timezone }).format(
      new Date(iso),
    );
  return (
    <EditorSection
      title="Blocked slots & maintenance"
      description={`Customers cannot book during these periods. Times use your browser's time zone; the venue is in ${timezone}.`}
      onSave={() =>
        addBlockAction(orgId, facilityId, {
          startAt: draft.start ? new Date(draft.start).toISOString() : "",
          endAt: draft.end ? new Date(draft.end).toISOString() : "",
          type: draft.type,
          reason: draft.reason || undefined,
        })
      }
      saveLabel="Add block"
    >
      {blocks.length === 0 ? (
        <p className="text-sm text-muted">No upcoming blocks.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-line text-sm">
          {blocks.map((b) => (
            <li key={b.id} className="flex flex-wrap items-center gap-3 py-2">
              <Badge tone={b.type === "MAINTENANCE" ? "warning" : "neutral"}>{humanize(b.type)}</Badge>
              <span>
                {format(b.startAt)} → {format(b.endAt)}
              </span>
              {b.reason && <span className="text-muted">{b.reason}</span>}
              <ActionButton variant="ghost" action={() => removeBlockAction(orgId, facilityId, b.id)}>
                Remove
              </ActionButton>
            </li>
          ))}
        </ul>
      )}
      <div className="grid gap-4 sm:grid-cols-4">
        <Input
          label="From"
          type="datetime-local"
          value={draft.start}
          onChange={(e) => setDraft({ ...draft, start: e.target.value })}
        />
        <Input
          label="Until"
          type="datetime-local"
          value={draft.end}
          onChange={(e) => setDraft({ ...draft, end: e.target.value })}
        />
        <Select
          label="Type"
          value={draft.type}
          onChange={(e) => setDraft({ ...draft, type: e.target.value })}
          options={[
            { value: "BLOCKED", label: "Blocked" },
            { value: "MAINTENANCE", label: "Maintenance" },
          ]}
        />
        <Input
          label="Reason"
          value={draft.reason}
          maxLength={300}
          onChange={(e) => setDraft({ ...draft, reason: e.target.value })}
        />
      </div>
    </EditorSection>
  );
}
