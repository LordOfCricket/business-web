import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { orgToWorkspace, profileToWorkspaces, SAMPLE_WORKSPACES } from "./api";
import type { Membership } from "@/features/org/api";
import type { OwnProfile } from "@/features/professional/api";

describe("workspace resolution", () => {
  it("maps ACADEMY organization membership to ACADEMY workspace", () => {
    const mem: Membership = {
      orgId: "org-1",
      slug: "los-karate",
      name: "LordOfSportz Karate Academy",
      type: "ACADEMY",
      status: "VERIFIED",
      orgRole: "OWNER",
      approvedCapabilities: ["ACADEMY"],
    };

    const ws = orgToWorkspace(mem);
    expect(ws.kind).toBe("ACADEMY");
    expect(ws.title).toBe("LordOfSportz Karate Academy");
    expect(ws.href).toBe("/workspace/academy/org-1");
    expect(ws.status).toBe("VERIFIED");
  });

  it("maps VENUE_OWNER organization membership to VENUE workspace", () => {
    const mem: Membership = {
      orgId: "org-2",
      slug: "los-arena",
      name: "LOS Sports Arena",
      type: "VENUE_OWNER",
      status: "VERIFIED",
      orgRole: "OWNER",
      approvedCapabilities: ["VENUE_OPERATOR"],
    };

    const ws = orgToWorkspace(mem);
    expect(ws.kind).toBe("VENUE");
    expect(ws.href).toBe("/workspace/venue/org-2");
  });

  it("maps professional profile roles to COACH and OFFICIAL workspaces", () => {
    const profile: OwnProfile = {
      id: "prof-1",
      slug: "rahul-sharma",
      status: "PUBLISHED",
      displayName: "Rahul Sharma",
      headline: "Senior Karate Coach & BCCI Umpire",
      experienceYears: 12,
      roles: [
        { type: "coach", typeName: "Head Coach", sport: "karate", sportName: "Karate" },
        { type: "umpire", typeName: "Cricket Umpire", sport: "cricket", sportName: "Cricket" },
      ],
      certifications: [],
      specializations: ["Shotokan", "Kumite"],
      services: [],
      availability: [],
    };

    const workspaces = profileToWorkspaces(profile);
    expect(workspaces).toHaveLength(2);

    const coachWs = workspaces.find((w) => w.kind === "COACH");
    expect(coachWs).toBeDefined();
    expect(coachWs?.title).toBe("Rahul Sharma");
    expect(coachWs?.href).toBe("/workspace/coach");

    const officialWs = workspaces.find((w) => w.kind === "OFFICIAL");
    expect(officialWs).toBeDefined();
    expect(officialWs?.title).toBe("Rahul Sharma");
    expect(officialWs?.href).toBe("/workspace/official");
  });

  it("provides comprehensive sample workspaces for preview and empty state", () => {
    expect(SAMPLE_WORKSPACES.length).toBeGreaterThanOrEqual(6);
    expect(SAMPLE_WORKSPACES.some((w) => w.kind === "ACADEMY")).toBe(true);
    expect(SAMPLE_WORKSPACES.some((w) => w.kind === "VENUE")).toBe(true);
    expect(SAMPLE_WORKSPACES.some((w) => w.kind === "COACH")).toBe(true);
    expect(SAMPLE_WORKSPACES.some((w) => w.kind === "OFFICIAL")).toBe(true);
    expect(SAMPLE_WORKSPACES.some((w) => w.kind === "SHOP")).toBe(true);
  });
});
