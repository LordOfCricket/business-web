"use client";

import { useState } from "react";
import { Input, Select } from "@/components/ui";
import { ActionButton, EditorSection, inputClass } from "@/components/common/EditorSection";
import { addMemberAction, removeMemberAction, updateMemberAction } from "./actions";
import type { Member } from "./api";
import { humanize, ORG_ROLES } from "./constants";

/**
 * Coaches, venue managers, trainers and staff (spec §21 "Coaches / Staff"). People are added by the email of
 * their LordOfSportz account. Managers can add staff and managers; only owners can add or change owners.
 */
export function MembersPanel({
  orgId,
  members,
  me,
  manager,
  owner,
}: {
  orgId: string;
  members: Member[];
  me: string;
  manager: boolean;
  owner: boolean;
}) {
  const [invite, setInvite] = useState({ email: "", orgRole: "STAFF", title: "" });
  const roles = owner ? ORG_ROLES : ORG_ROLES.filter((r) => r.value !== "OWNER");
  return (
    <div className="flex flex-col gap-4">
      {manager && (
        <EditorSection
          title="Add a team member"
          description="They must already have a LordOfSportz account. Their title is shown on your pages, e.g. Head Coach."
          onSave={() => addMemberAction(orgId, invite)}
          saveLabel="Add member"
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <Input
              label="Email"
              type="email"
              value={invite.email}
              onChange={(e) => setInvite({ ...invite, email: e.target.value })}
            />
            <Select
              label="Role"
              value={invite.orgRole}
              onChange={(e) => setInvite({ ...invite, orgRole: e.target.value })}
              options={roles}
            />
            <Input
              label="Title"
              value={invite.title}
              maxLength={80}
              placeholder="Coach, Venue manager, Trainer…"
              onChange={(e) => setInvite({ ...invite, title: e.target.value })}
            />
          </div>
        </EditorSection>
      )}
      <EditorSection title={`Team (${members.length})`}>
        <ul className="flex flex-col divide-y divide-line">
          {members.map((m) => (
            <MemberRow
              key={m.userId}
              orgId={orgId}
              member={m}
              self={m.userId === me}
              manager={manager}
              owner={owner}
            />
          ))}
        </ul>
      </EditorSection>
    </div>
  );
}

function MemberRow({
  orgId,
  member,
  self,
  manager,
  owner,
}: {
  orgId: string;
  member: Member;
  self: boolean;
  manager: boolean;
  owner: boolean;
}) {
  const [role, setRole] = useState(member.orgRole);
  const [title, setTitle] = useState(member.title ?? "");
  const editable = manager && (owner || member.orgRole !== "OWNER");
  return (
    <li className="flex flex-wrap items-center gap-3 py-3 text-sm">
      <div className="min-w-48 flex-1">
        <p className="font-medium">
          {member.fullName ?? member.email}
          {self && <span className="text-muted"> (you)</span>}
        </p>
        <p className="text-muted">{member.email}</p>
      </div>
      {editable ? (
        <>
          <select
            aria-label={`Role of ${member.email}`}
            className={inputClass}
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            {(owner ? ORG_ROLES : ORG_ROLES.filter((r) => r.value !== "OWNER")).map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
          <input
            aria-label={`Title of ${member.email}`}
            className={`${inputClass} w-40`}
            value={title}
            maxLength={80}
            onChange={(e) => setTitle(e.target.value)}
          />
          <ActionButton
            variant="secondary"
            action={() => updateMemberAction(orgId, member.userId, { orgRole: role, title })}
          >
            Save
          </ActionButton>
          <ActionButton
            variant="ghost"
            confirm={`Remove ${member.email} from the business?`}
            action={() => removeMemberAction(orgId, member.userId)}
          >
            Remove
          </ActionButton>
        </>
      ) : (
        <span className="text-muted">
          {humanize(member.orgRole)}
          {member.title ? ` · ${member.title}` : ""}
        </span>
      )}
    </li>
  );
}
