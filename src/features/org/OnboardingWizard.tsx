"use client";

import { useState, useTransition } from "react";
import { Button, Card, Input, Select } from "@/components/ui";
import { ActionFeedback, CheckboxGroup, type Choice, textareaClass } from "@/components/common/EditorSection";
import type { ActionResult } from "@/lib/actions/result";
import { createOrganizationAction, type DetailsInput } from "./actions";
import { CAPABILITIES, label, ORG_TYPES } from "./constants";
import { ServicesEditor } from "./ServicesEditor";

const STEPS = ["Business details", "Sports & services", "Review"];

/**
 * Business registration (spec §6): details → sports, capabilities and services → review. Documents are uploaded
 * right after, on the Settings page, before submitting for verification.
 */
export function OnboardingWizard({ sports, contactEmail }: { sports: Choice[]; contactEmail: string }) {
  const [step, setStep] = useState(0);
  const [details, setDetails] = useState<DetailsInput>({
    name: "",
    type: "ACADEMY",
    description: "",
    addressLine: "",
    city: "",
    state: "",
    postalCode: "",
    contactEmail,
    contactPhone: "",
    website: "",
  });
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [caps, setCaps] = useState<string[]>(["VENUE_OPERATOR"]);
  const [services, setServices] = useState<Array<{ name: string; description?: string }>>([]);
  const [result, setResult] = useState<ActionResult>({});
  const [pending, start] = useTransition();

  const set = (key: keyof DetailsInput) => (e: { target: { value: string } }) =>
    setDetails((d) => ({ ...d, [key]: e.target.value }));

  function next() {
    setResult({});
    if (step === 0 && (!details.name.trim() || !details.city.trim() || !details.contactPhone.trim())) {
      setResult({ error: "Name, city and contact phone are required." });
      return;
    }
    if (step === 1 && (selectedSports.length === 0 || caps.length === 0)) {
      setResult({ error: "Choose at least one sport and what your business does." });
      return;
    }
    setStep((s) => s + 1);
  }

  return (
    <div className="flex flex-col gap-6">
      <ol className="flex flex-wrap gap-2 text-sm" aria-label="Progress">
        {STEPS.map((name, i) => (
          <li
            key={name}
            aria-current={i === step ? "step" : undefined}
            className={`rounded-full px-3 py-1 ${i === step ? "bg-brand-600 text-white" : i < step ? "bg-brand-50 text-brand-700" : "bg-canvas text-muted"}`}
          >
            {i + 1}. {name}
          </li>
        ))}
      </ol>

      {step === 0 && (
        <Card className="grid gap-4 sm:grid-cols-2">
          <Input label="Business name" value={details.name} onChange={set("name")} required maxLength={120} />
          <Select label="Type of business" value={details.type} onChange={set("type")} options={ORG_TYPES} />
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label htmlFor="org-description" className="text-sm font-medium">
              Description
            </label>
            <textarea
              id="org-description"
              className={textareaClass}
              value={details.description}
              onChange={set("description")}
              maxLength={3000}
              placeholder="What you offer, who you train, what makes you special."
            />
          </div>
          <Input label="Address" value={details.addressLine} onChange={set("addressLine")} maxLength={200} />
          <Input label="City" value={details.city} onChange={set("city")} required maxLength={80} />
          <Input label="State" value={details.state} onChange={set("state")} maxLength={80} />
          <Input label="Postal code" value={details.postalCode} onChange={set("postalCode")} maxLength={12} />
          <Input
            label="Contact email"
            type="email"
            value={details.contactEmail}
            onChange={set("contactEmail")}
            required
          />
          <Input
            label="Contact phone"
            type="tel"
            value={details.contactPhone}
            onChange={set("contactPhone")}
            required
            placeholder="+91 98765 43210"
          />
          <Input
            label="Website"
            type="url"
            value={details.website}
            onChange={set("website")}
            placeholder="https://"
          />
        </Card>
      )}

      {step === 1 && (
        <Card className="flex flex-col gap-6">
          <CheckboxGroup
            legend="Sports you support"
            choices={sports}
            selected={selectedSports}
            onChange={setSelectedSports}
            columns={4}
          />
          <CheckboxGroup
            legend="What does your business do?"
            choices={CAPABILITIES}
            selected={caps}
            onChange={setCaps}
            columns={2}
          />
          <ServicesEditor items={services} onChange={setServices} />
        </Card>
      )}

      {step === 2 && (
        <Card className="flex flex-col gap-3 text-sm">
          <h2 className="text-lg font-semibold">{details.name}</h2>
          <p>
            {label(ORG_TYPES, details.type)} · {details.city}
            {details.state ? `, ${details.state}` : ""}
          </p>
          {details.description && <p className="text-muted">{details.description}</p>}
          <p>
            <strong>Sports:</strong>{" "}
            {sports
              .filter((s) => selectedSports.includes(s.value))
              .map((s) => s.label)
              .join(", ")}
          </p>
          <p>
            <strong>Activities:</strong> {caps.map((c) => label(CAPABILITIES, c)).join(", ")}
          </p>
          {services.length > 0 && (
            <p>
              <strong>Services:</strong> {services.map((s) => s.name).join(", ")}
            </p>
          )}
          <p className="text-muted">
            Next you will upload verification documents. Our team verifies every business before it can go
            live.
          </p>
        </Card>
      )}

      <div className="flex flex-wrap items-center gap-3">
        {step > 0 && (
          <Button variant="secondary" onClick={() => setStep((s) => s - 1)} disabled={pending}>
            Back
          </Button>
        )}
        {step < STEPS.length - 1 ? (
          <Button onClick={next}>Continue</Button>
        ) : (
          <Button
            loading={pending}
            onClick={() =>
              start(async () =>
                setResult(
                  await createOrganizationAction({
                    details,
                    sports: selectedSports,
                    capabilities: caps,
                    services: services.filter((s) => s.name.trim()),
                  }),
                ),
              )
            }
          >
            Create business
          </Button>
        )}
        <ActionFeedback result={result} />
      </div>
    </div>
  );
}
