"use client";

import Image from "next/image";
import { useState, useTransition, type ReactNode } from "react";
import { Badge, Button, Card, Input } from "@/components/ui";
import { FileUpload } from "@/features/media/FileUpload";
import {
  type ActionResult,
  replaceAvailabilityAction,
  replaceCertificationsAction,
  replaceRolesAction,
  replaceServicesAction,
  replaceSpecializationsAction,
  setPublishedAction,
  updateDetailsAction,
} from "./actions";
import type { OwnProfile } from "./api";
import { type Role, RolePicker, type SportRoles } from "./RolePicker";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

/** One editable section with its own Save button and feedback. */
function Section({
  title,
  description,
  onSave,
  children,
}: {
  title: string;
  description?: string;
  onSave: () => Promise<ActionResult>;
  children: ReactNode;
}) {
  const [pending, start] = useTransition();
  const [result, setResult] = useState<ActionResult>({});
  return (
    <Card className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        {description && <p className="text-sm text-muted">{description}</p>}
      </div>
      {children}
      <div className="flex items-center gap-3">
        <Button loading={pending} onClick={() => start(async () => setResult(await onSave()))}>
          Save
        </Button>
        {result.error && (
          <span role="alert" className="text-sm text-danger">
            {result.error}
          </span>
        )}
        {result.success && (
          <span role="status" className="text-sm text-brand-700">
            {result.success}
          </span>
        )}
      </div>
    </Card>
  );
}

const inputClass = "h-10 rounded-xl border border-ink/15 bg-surface px-3 text-sm hover:border-ink/35";

export function ProfileEditor({
  profile,
  sports,
  publicUrl,
}: {
  profile: OwnProfile;
  sports: SportRoles[];
  publicUrl: string;
}) {
  const [details, setDetails] = useState({
    displayName: profile.displayName,
    headline: profile.headline ?? "",
    bio: profile.bio ?? "",
    experienceYears: profile.experienceYears?.toString() ?? "",
    city: profile.city ?? "",
    avatarMediaId: profile.avatarMediaId ?? null,
    avatarUrl: profile.avatarUrl,
  });
  const [roles, setRoles] = useState<Role[]>(profile.roles.map((r) => ({ type: r.type, sport: r.sport })));
  const [services, setServices] = useState(
    profile.services.map((s) => ({
      ...s,
      description: s.description ?? "",
      durationMinutes: s.durationMinutes ?? 60,
    })),
  );
  const [slots, setSlots] = useState(
    profile.availability.map((a) => ({
      ...a,
      startTime: a.startTime.slice(0, 5),
      endTime: a.endTime.slice(0, 5),
    })),
  );
  const [specializations, setSpecializations] = useState(profile.specializations.join(", "));
  const [certs, setCerts] = useState(
    profile.certifications.map((c) => ({
      ...c,
      issuer: c.issuer ?? "",
      yearAwarded: c.yearAwarded?.toString() ?? "",
    })),
  );
  const [publishing, startPublishing] = useTransition();
  const [publishError, setPublishError] = useState<string>();
  const suspended = profile.status === "SUSPENDED";

  return (
    <div className="flex flex-col gap-6">
      <Card className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted">Status</span>
          <Badge tone={profile.status === "PUBLISHED" ? "success" : suspended ? "danger" : "warning"}>
            {profile.status}
          </Badge>
          {profile.status === "PUBLISHED" && (
            <a href={publicUrl} className="text-sm text-brand-700 underline" target="_blank" rel="noreferrer">
              View public profile
            </a>
          )}
        </div>
        {!suspended && (
          <div className="flex items-center gap-3">
            {publishError && (
              <span role="alert" className="text-sm text-danger">
                {publishError}
              </span>
            )}
            <Button
              variant={profile.status === "PUBLISHED" ? "secondary" : "primary"}
              loading={publishing}
              onClick={() =>
                startPublishing(async () => {
                  const r = await setPublishedAction(profile.status !== "PUBLISHED");
                  setPublishError(r.error);
                })
              }
            >
              {profile.status === "PUBLISHED" ? "Unpublish" : "Publish profile"}
            </Button>
          </div>
        )}
      </Card>
      {suspended && (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-danger">
          This profile was suspended by the LordOfSportz team and cannot be edited.
        </p>
      )}

      <Section
        title="Profile"
        onSave={() =>
          updateDetailsAction({
            displayName: details.displayName,
            headline: details.headline || undefined,
            bio: details.bio || undefined,
            experienceYears: details.experienceYears === "" ? null : Number(details.experienceYears),
            city: details.city || undefined,
            avatarMediaId: details.avatarMediaId,
          })
        }
      >
        <div className="flex items-center gap-4">
          <div className="relative size-20 overflow-hidden rounded-full bg-canvas">
            {details.avatarUrl && (
              <Image
                src={details.avatarUrl}
                alt="Profile photo"
                fill
                sizes="80px"
                unoptimized
                className="object-cover"
              />
            )}
          </div>
          <FileUpload
            label="Photo"
            purpose="PROFESSIONAL_IMAGE"
            onUploaded={(m) => setDetails({ ...details, avatarMediaId: m.id, avatarUrl: m.url })}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Name"
            value={details.displayName}
            onChange={(e) => setDetails({ ...details, displayName: e.target.value })}
          />
          <Input
            label="City"
            value={details.city}
            onChange={(e) => setDetails({ ...details, city: e.target.value })}
          />
          <Input
            label="Headline"
            value={details.headline}
            maxLength={160}
            onChange={(e) => setDetails({ ...details, headline: e.target.value })}
          />
          <Input
            label="Years of experience"
            type="number"
            min={0}
            max={70}
            value={details.experienceYears}
            onChange={(e) => setDetails({ ...details, experienceYears: e.target.value })}
          />
        </div>
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          About you
          <textarea
            rows={5}
            maxLength={3000}
            value={details.bio}
            onChange={(e) => setDetails({ ...details, bio: e.target.value })}
            className="rounded-lg border border-line bg-surface p-3 font-normal"
          />
        </label>
      </Section>

      <Section title="Roles & sports" onSave={() => replaceRolesAction(roles)}>
        <RolePicker sports={sports} value={roles} onChange={setRoles} />
      </Section>

      <Section
        title="Services & pricing"
        description="Prices in INR."
        onSave={() =>
          replaceServicesAction(
            services.map((s) => ({
              name: s.name,
              description: s.description || undefined,
              priceAmount: Number(s.priceAmount),
              durationMinutes: Number(s.durationMinutes) || undefined,
            })),
          )
        }
      >
        {services.map((s, i) => (
          <div
            key={i}
            className="grid gap-2 rounded-xl border border-line p-3 sm:grid-cols-[2fr_1fr_1fr_auto]"
          >
            <input
              aria-label="Service name"
              placeholder="Service"
              value={s.name}
              className={inputClass}
              onChange={(e) =>
                setServices(services.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))
              }
            />
            <input
              aria-label="Price"
              type="number"
              min={0}
              value={s.priceAmount}
              className={inputClass}
              onChange={(e) =>
                setServices(
                  services.map((x, j) => (j === i ? { ...x, priceAmount: Number(e.target.value) } : x)),
                )
              }
            />
            <input
              aria-label="Minutes"
              type="number"
              min={15}
              max={1440}
              value={s.durationMinutes}
              className={inputClass}
              onChange={(e) =>
                setServices(
                  services.map((x, j) => (j === i ? { ...x, durationMinutes: Number(e.target.value) } : x)),
                )
              }
            />
            <Button variant="ghost" size="sm" onClick={() => setServices(services.filter((_, j) => j !== i))}>
              Remove
            </Button>
          </div>
        ))}
        <div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              setServices([
                ...services,
                { name: "", description: "", priceAmount: 0, currency: "INR", durationMinutes: 60 },
              ])
            }
          >
            Add service
          </Button>
        </div>
      </Section>

      <Section title="Weekly availability" onSave={() => replaceAvailabilityAction(slots)}>
        {slots.map((s, i) => (
          <div key={i} className="flex flex-wrap items-center gap-2">
            <select
              aria-label="Day"
              value={s.dayOfWeek}
              className={inputClass}
              onChange={(e) =>
                setSlots(slots.map((x, j) => (j === i ? { ...x, dayOfWeek: Number(e.target.value) } : x)))
              }
            >
              {DAYS.map((d, index) => (
                <option key={d} value={index + 1}>
                  {d}
                </option>
              ))}
            </select>
            <input
              aria-label="From"
              type="time"
              value={s.startTime}
              className={inputClass}
              onChange={(e) =>
                setSlots(slots.map((x, j) => (j === i ? { ...x, startTime: e.target.value } : x)))
              }
            />
            <input
              aria-label="To"
              type="time"
              value={s.endTime}
              className={inputClass}
              onChange={(e) =>
                setSlots(slots.map((x, j) => (j === i ? { ...x, endTime: e.target.value } : x)))
              }
            />
            <Button variant="ghost" size="sm" onClick={() => setSlots(slots.filter((_, j) => j !== i))}>
              Remove
            </Button>
          </div>
        ))}
        <div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setSlots([...slots, { dayOfWeek: 6, startTime: "07:00", endTime: "10:00" }])}
          >
            Add time slot
          </Button>
        </div>
      </Section>

      <Section
        title="Specializations"
        description="Comma separated, e.g. Fast bowling, Wicket keeping."
        onSave={() =>
          replaceSpecializationsAction(
            specializations
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
          )
        }
      >
        <input
          aria-label="Specializations"
          value={specializations}
          className={inputClass}
          onChange={(e) => setSpecializations(e.target.value)}
        />
      </Section>

      <Section
        title="Certifications"
        description="Certificate files stay private — only you and the LordOfSportz team can open them."
        onSave={() =>
          replaceCertificationsAction(
            certs.map((c) => ({
              name: c.name,
              issuer: c.issuer || undefined,
              yearAwarded: c.yearAwarded ? Number(c.yearAwarded) : undefined,
              mediaId: c.mediaId,
            })),
          )
        }
      >
        {certs.map((c, i) => (
          <div key={i} className="flex flex-col gap-2 rounded-xl border border-line p-3">
            <div className="grid gap-2 sm:grid-cols-[2fr_2fr_1fr_auto]">
              <input
                aria-label="Certification"
                placeholder="Certification"
                value={c.name}
                className={inputClass}
                onChange={(e) =>
                  setCerts(certs.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))
                }
              />
              <input
                aria-label="Issuer"
                placeholder="Issued by"
                value={c.issuer}
                className={inputClass}
                onChange={(e) =>
                  setCerts(certs.map((x, j) => (j === i ? { ...x, issuer: e.target.value } : x)))
                }
              />
              <input
                aria-label="Year"
                placeholder="Year"
                value={c.yearAwarded}
                className={inputClass}
                onChange={(e) =>
                  setCerts(certs.map((x, j) => (j === i ? { ...x, yearAwarded: e.target.value } : x)))
                }
              />
              <Button variant="ghost" size="sm" onClick={() => setCerts(certs.filter((_, j) => j !== i))}>
                Remove
              </Button>
            </div>
            {c.mediaId ? (
              <span className="text-xs text-muted">Document attached</span>
            ) : (
              <FileUpload
                label="Certificate document (PDF or image)"
                purpose="CERTIFICATE"
                onUploaded={(m) => setCerts(certs.map((x, j) => (j === i ? { ...x, mediaId: m.id } : x)))}
              />
            )}
          </div>
        ))}
        <div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setCerts([...certs, { name: "", issuer: "", yearAwarded: "" }])}
          >
            Add certification
          </Button>
        </div>
      </Section>
    </div>
  );
}
