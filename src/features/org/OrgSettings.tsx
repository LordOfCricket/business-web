"use client";

import { useState } from "react";
import { Badge, Button, Input, Select, Tabs } from "@/components/ui";
import {
  ActionButton,
  CheckboxGroup,
  type Choice,
  EditorSection,
  textareaClass,
} from "@/components/common/EditorSection";
import { FileUpload } from "@/features/media/FileUpload";
import type { UploadedMedia } from "@/features/media/actions";
import {
  addDocumentAction,
  type DetailsInput,
  removeDocumentAction,
  replaceServicesAction,
  replaceSportsAction,
  requestCapabilitiesAction,
  submitForVerificationAction,
  updateDetailsAction,
} from "./actions";
import type { Organization, OrgDocument } from "./api";
import { CAPABILITIES, DOC_TYPES, humanize, label, ORG_TYPES, STATUS_TONE } from "./constants";
import { ServicesEditor } from "./ServicesEditor";

export function OrgSettings({
  org,
  documents,
  sports,
  manager,
  owner,
  initialTab,
}: {
  org: Organization;
  documents: OrgDocument[];
  sports: Choice[];
  manager: boolean;
  owner: boolean;
  initialTab?: string;
}) {
  return (
    <Tabs
      initialTab={initialTab}
      tabs={[
        { id: "details", label: "Details", content: <DetailsTab org={org} manager={manager} /> },
        {
          id: "sports",
          label: "Sports & services",
          content: <SportsTab org={org} sports={sports} manager={manager} />,
        },
        { id: "activities", label: "Activities", content: <ActivitiesTab org={org} owner={owner} /> },
        {
          id: "documents",
          label: "Documents & verification",
          content: <DocumentsTab org={org} documents={documents} manager={manager} owner={owner} />,
        },
      ]}
    />
  );
}

function DetailsTab({ org, manager }: { org: Organization; manager: boolean }) {
  const [d, setD] = useState<DetailsInput>({
    name: org.name,
    type: org.type as DetailsInput["type"],
    description: org.description ?? "",
    addressLine: org.addressLine ?? "",
    city: org.city,
    state: org.state ?? "",
    postalCode: org.postalCode ?? "",
    contactEmail: org.contactEmail,
    contactPhone: org.contactPhone,
    website: org.website ?? "",
  });
  const set = (key: keyof DetailsInput) => (e: { target: { value: string } }) =>
    setD((v) => ({ ...v, [key]: e.target.value }));
  return (
    <EditorSection
      title="Business details"
      description="Shown on your public pages once your business is verified."
      onSave={manager ? () => updateDetailsAction(org.id, d) : undefined}
    >
      <fieldset disabled={!manager} className="grid gap-4 sm:grid-cols-2">
        <Input label="Business name" value={d.name} onChange={set("name")} maxLength={120} />
        <Select label="Type" value={d.type} onChange={set("type")} options={ORG_TYPES} />
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label htmlFor="settings-description" className="text-sm font-medium">
            Description
          </label>
          <textarea
            id="settings-description"
            className={textareaClass}
            value={d.description}
            onChange={set("description")}
            maxLength={3000}
          />
        </div>
        <Input label="Address" value={d.addressLine} onChange={set("addressLine")} maxLength={200} />
        <Input label="City" value={d.city} onChange={set("city")} maxLength={80} />
        <Input label="State" value={d.state} onChange={set("state")} maxLength={80} />
        <Input label="Postal code" value={d.postalCode} onChange={set("postalCode")} maxLength={12} />
        <Input label="Contact email" type="email" value={d.contactEmail} onChange={set("contactEmail")} />
        <Input label="Contact phone" type="tel" value={d.contactPhone} onChange={set("contactPhone")} />
        <Input label="Website" type="url" value={d.website} onChange={set("website")} />
      </fieldset>
    </EditorSection>
  );
}

function SportsTab({ org, sports, manager }: { org: Organization; sports: Choice[]; manager: boolean }) {
  const [selected, setSelected] = useState(org.sports);
  const [services, setServices] = useState(org.services);
  return (
    <div className="flex flex-col gap-4">
      <EditorSection
        title="Sports"
        description="Your venues and coaches can only use sports listed here."
        onSave={manager ? () => replaceSportsAction(org.id, selected) : undefined}
      >
        <CheckboxGroup
          legend="Sports you support"
          choices={sports}
          selected={selected}
          onChange={setSelected}
          columns={4}
        />
      </EditorSection>
      <EditorSection
        title="Services"
        onSave={
          manager
            ? () =>
                replaceServicesAction(
                  org.id,
                  services.filter((s) => s.name.trim()),
                )
            : undefined
        }
      >
        <ServicesEditor items={services} onChange={setServices} />
      </EditorSection>
    </div>
  );
}

function ActivitiesTab({ org, owner }: { org: Organization; owner: boolean }) {
  const [requested, setRequested] = useState<string[]>([]);
  const available = CAPABILITIES.filter((c) => !(c.value in org.capabilities));
  return (
    <EditorSection
      title="What your business does"
      description="Each activity is approved by our team. Approved activities unlock dashboard modules."
      onSave={owner && available.length > 0 ? () => requestCapabilitiesAction(org.id, requested) : undefined}
      saveLabel="Request approval"
    >
      <ul className="flex flex-col gap-2 text-sm">
        {Object.entries(org.capabilities).map(([cap, status]) => (
          <li key={cap} className="flex items-center gap-3">
            <span className="font-medium">{label(CAPABILITIES, cap)}</span>
            <Badge tone={STATUS_TONE[status]}>{humanize(status)}</Badge>
          </li>
        ))}
      </ul>
      {owner && available.length > 0 && (
        <CheckboxGroup
          legend="Request more activities"
          choices={available}
          selected={requested}
          onChange={setRequested}
          columns={2}
        />
      )}
    </EditorSection>
  );
}

function DocumentsTab({
  org,
  documents,
  manager,
  owner,
}: {
  org: Organization;
  documents: OrgDocument[];
  manager: boolean;
  owner: boolean;
}) {
  const [docType, setDocType] = useState("REGISTRATION_CERTIFICATE");
  const [uploaded, setUploaded] = useState<UploadedMedia | null>(null);
  const canSubmit = org.status === "DRAFT" || org.status === "REJECTED";
  return (
    <div className="flex flex-col gap-4">
      <EditorSection title="Verification status">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Badge tone={STATUS_TONE[org.status]}>{humanize(org.status)}</Badge>
          {org.status === "DRAFT" && (
            <span>Upload your documents, then submit your business for verification.</span>
          )}
          {org.status === "PENDING_VERIFICATION" && <span>Our team is reviewing your business.</span>}
          {org.status === "VERIFIED" && <span>Your business is verified.</span>}
          {(org.status === "REJECTED" || org.status === "SUSPENDED") && org.statusReason && (
            <span className="text-danger">Reason: {org.statusReason}</span>
          )}
        </div>
        {owner && canSubmit && (
          <div>
            <ActionButton action={() => submitForVerificationAction(org.id)}>
              Submit for verification
            </ActionButton>
          </div>
        )}
      </EditorSection>

      <EditorSection
        title="Verification documents"
        description="PDF, JPG or PNG up to 10 MB. Documents are private: only your managers and our verification team can open them."
        onSave={manager && uploaded ? () => addDocumentAction(org.id, docType, uploaded.id) : undefined}
        saveLabel="Add document"
      >
        {documents.length === 0 ? (
          <p className="text-sm text-muted">No documents yet.</p>
        ) : (
          <ul className="flex flex-col gap-2 text-sm">
            {documents.map((doc) => (
              <li key={doc.id} className="flex flex-wrap items-center gap-3">
                <span className="font-medium">{label(DOC_TYPES, doc.docType)}</span>
                <span className="text-muted">{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                {manager && canSubmit && (
                  <ActionButton variant="ghost" action={() => removeDocumentAction(org.id, doc.id)}>
                    Remove
                  </ActionButton>
                )}
              </li>
            ))}
          </ul>
        )}
        {manager && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Document type"
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              options={DOC_TYPES}
            />
            {uploaded ? (
              <div className="flex items-end gap-2 text-sm">
                <span className="text-brand-700">File uploaded — click “Add document”.</span>
                <Button variant="ghost" size="sm" onClick={() => setUploaded(null)}>
                  Change
                </Button>
              </div>
            ) : (
              <FileUpload label="File" purpose="ORG_DOCUMENT" onUploaded={setUploaded} />
            )}
          </div>
        )}
      </EditorSection>
    </div>
  );
}
