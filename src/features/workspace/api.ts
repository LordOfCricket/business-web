import "server-only";
import type { Session } from "@/lib/auth/session";
import { getMyOrganizations, type Membership } from "@/features/org/api";
import { getMyProfessionalProfile, type OwnProfile } from "@/features/professional/api";
import type { WorkspaceSummary, WorkspaceKind } from "./types";

export function orgToWorkspace(m: Membership): WorkspaceSummary {
  let kind: WorkspaceKind = "ACADEMY";
  let tagline = "Sports Academy Operations";
  let href = `/workspace/academy/${m.orgId}`;

  if (m.type === "VENUE_OWNER" || m.approvedCapabilities.includes("VENUE_OPERATOR")) {
    kind = "VENUE";
    tagline = "Ground & Venue Management";
    href = `/workspace/venue/${m.orgId}`;
  } else if (m.type === "SPORTS_CENTER") {
    kind = "SPORTS_CENTER";
    tagline = "Multi-Sport Center";
    href = `/workspace/sports-center/${m.orgId}`;
  } else if (m.type === "CLUB") {
    kind = "CLUB";
    tagline = "Sports Club & Teams";
    href = `/workspace/club/${m.orgId}`;
  } else if (m.approvedCapabilities.includes("SELLER")) {
    kind = "SHOP";
    tagline = "Official LordOfSportz Store";
    href = `/workspace/shop/${m.orgId}`;
  }

  return {
    id: m.orgId,
    kind,
    title: m.name,
    entityName: m.name,
    sport: "Multi-Sport",
    metrics: [
      { label: "Role", value: m.orgRole },
      { label: "Status", value: m.status },
    ],
    status: m.status === "VERIFIED" ? "VERIFIED" : m.status === "PENDING_VERIFICATION" ? "PENDING_VERIFICATION" : "DRAFT",
    href,
    role: m.orgRole,
    iconName: kind.toLowerCase(),
    tagline,
  };
}

export function profileToWorkspaces(p: OwnProfile): WorkspaceSummary[] {
  const result: WorkspaceSummary[] = [];

  const coachRole = p.roles.find((r) => r.type === "coach");
  if (coachRole) {
    result.push({
      id: `coach-${p.id}`,
      kind: "COACH",
      title: p.displayName,
      entityName: `${p.displayName} (Coach)`,
      sport: coachRole.sportName || coachRole.sport,
      sportDisciplines: p.specializations,
      metrics: [
        { label: "Experience", value: `${p.experienceYears ?? 0} yrs` },
        { label: "Certifications", value: `${p.certifications.length}` },
        { label: "Services", value: `${p.services.length}` },
      ],
      status: p.status === "PUBLISHED" ? "ACTIVE" : "DRAFT",
      href: "/workspace/coach",
      role: "Head Coach",
      iconName: "coach",
      tagline: p.headline ?? "Professional Sports Coaching",
    });
  }

  const officialRole = p.roles.find(
    (r) => ["umpire", "referee", "scorer", "judge", "official"].includes(r.type.toLowerCase())
  );
  if (officialRole) {
    result.push({
      id: `official-${p.id}`,
      kind: "OFFICIAL",
      title: p.displayName,
      entityName: `${p.displayName} (Official)`,
      sport: officialRole.sportName || officialRole.sport,
      metrics: [
        { label: "Role", value: officialRole.typeName || officialRole.type },
        { label: "Status", value: "Certified" },
      ],
      status: p.status === "PUBLISHED" ? "ACTIVE" : "DRAFT",
      href: "/workspace/official",
      role: officialRole.typeName || "Match Official",
      iconName: "official",
      tagline: "Certified Match Official",
    });
  }

  return result;
}

/** Demo/Seed workspaces illustrating the full multi-role platform experience */
export const SAMPLE_WORKSPACES: WorkspaceSummary[] = [
  {
    id: "sample-academy-1",
    kind: "ACADEMY",
    title: "LordOfSportz Karate Academy",
    entityName: "LordOfSportz Karate Academy",
    sport: "Karate / Shotokan",
    sportDisciplines: ["Shotokan", "Goju-Ryu", "Kumite", "Kata"],
    metrics: [
      { label: "Students", value: "248" },
      { label: "Coaches", value: "12" },
      { label: "Branches", value: "3" },
      { label: "Next Grading", value: "Nov 15" },
    ],
    status: "ACTIVE",
    href: "/workspace/academy/demo",
    role: "OWNER",
    iconName: "academy",
    tagline: "Premier Martial Arts & Belt Development",
    branchCount: 3,
  },
  {
    id: "sample-venue-1",
    kind: "VENUE",
    title: "LOS Sports Arena & Turf",
    entityName: "LOS Sports Arena & Turf",
    sport: "Cricket & Football",
    sportDisciplines: ["Natural Turf", "Practice Nets", "Astro Turf 7v7"],
    metrics: [
      { label: "Pitches", value: "3 Grounds" },
      { label: "Nets", value: "6 Nets" },
      { label: "Today's Slots", value: "14 Booked" },
      { label: "Weekend Occ.", value: "92%" },
    ],
    status: "ACTIVE",
    href: "/workspace/venue/demo",
    role: "OWNER",
    iconName: "venue",
    tagline: "BCCI Standard 68m Cricket Ground & Floodlights",
  },
  {
    id: "sample-coach-1",
    kind: "COACH",
    title: "Rahul Sharma",
    entityName: "Rahul Sharma (High-Performance Coach)",
    sport: "Cricket",
    sportDisciplines: ["Batting Biomechanics", "Power Hitting", "Level 3 High Performance"],
    metrics: [
      { label: "Experience", value: "12 Years" },
      { label: "Athletes Mentored", value: "850+" },
      { label: "Rating", value: "4.96 ★" },
    ],
    status: "ACTIVE",
    href: "/workspace/coach",
    role: "Head Coach",
    iconName: "coach",
    tagline: "Former Ranji Trophy Player & BCCI Level 3 Coach",
  },
  {
    id: "sample-official-1",
    kind: "OFFICIAL",
    title: "Suresh Menon",
    entityName: "Suresh Menon (BCCI Match Official)",
    sport: "Cricket & Football",
    sportDisciplines: ["BCCI Panel Umpire", "AIFF State Referee"],
    metrics: [
      { label: "Matches Officiated", value: "240+" },
      { label: "License", value: "BCCI #9482" },
      { label: "Status", value: "Duty Ready" },
    ],
    status: "ACTIVE",
    href: "/workspace/official",
    role: "Senior Umpire",
    iconName: "official",
    tagline: "Certified Match Official & Technical Committee",
  },
  {
    id: "sample-sports-center-1",
    kind: "SPORTS_CENTER",
    title: "Apex Multi-Sport Complex",
    entityName: "Apex Multi-Sport Complex",
    sport: "Multi-Sport",
    sportDisciplines: ["Badminton (6 Courts)", "Football Turf", "Gym & S&C"],
    metrics: [
      { label: "Disciplines", value: "4 Sports" },
      { label: "Active Members", value: "410" },
      { label: "Capacity", value: "85% Full" },
    ],
    status: "ACTIVE",
    href: "/workspace/sports-center/demo",
    role: "MANAGER",
    iconName: "sports_center",
    tagline: "Integrated Multi-Discipline Athletic Center",
  },
  {
    id: "sample-club-1",
    kind: "CLUB",
    title: "Royal Warriors Cricket Club",
    entityName: "Royal Warriors Cricket Club",
    sport: "Cricket",
    sportDisciplines: ["First XI", "Under-19 Squad", "Veterans XI"],
    metrics: [
      { label: "Squad Players", value: "36" },
      { label: "Trophy Wins", value: "8" },
      { label: "Next Fixture", value: "Sun 9 AM" },
    ],
    status: "ACTIVE",
    href: "/workspace/club/demo",
    role: "OWNER",
    iconName: "club",
    tagline: "Division 1 League Club & Academy Affiliate",
  },
  {
    id: "sample-tournament-1",
    kind: "TOURNAMENT",
    title: "LordOfSportz Champions Trophy 2026",
    entityName: "LordOfSportz Champions Trophy 2026",
    sport: "Cricket & Karate",
    sportDisciplines: ["T20 Knockout", "Kata Championship", "Kumite Bouts"],
    metrics: [
      { label: "Teams / Contenders", value: "32 Squads" },
      { label: "Fixtures", value: "64 Matches" },
      { label: "Prize Pool", value: "₹2.5 Lakh" },
    ],
    status: "ACTIVE",
    href: "/tournaments",
    role: "ORGANIZER",
    iconName: "tournament",
    tagline: "Annual Premier Invitational Championship",
  },
  {
    id: "sample-shop-1",
    kind: "SHOP",
    title: "LordOfSportz Official Store",
    entityName: "LordOfSportz Official Store",
    sport: "Sports Gear & Apparel",
    sportDisciplines: ["Cricket Gear", "Karate Gi", "Turf Footwear", "Tournament Merchandise"],
    metrics: [
      { label: "Products", value: "450+" },
      { label: "Active Orders", value: "34" },
      { label: "Fulfillment", value: "Pan-India" },
    ],
    status: "ACTIVE",
    href: "/shop",
    role: "LOS OPERATOR",
    iconName: "shop",
    tagline: "Centralized Equipment & Official Sports Shop",
  },
];

export async function getUserWorkspaces(session: Session | null): Promise<WorkspaceSummary[]> {
  if (!session) {
    return SAMPLE_WORKSPACES;
  }

  const workspaces: WorkspaceSummary[] = [];

  try {
    const orgs = await getMyOrganizations(session.accessToken);
    for (const org of orgs) {
      workspaces.push(orgToWorkspace(org));
    }
  } catch (e) {
    console.error("Failed fetching user organizations", e);
  }

  try {
    const profile = await getMyProfessionalProfile(session.accessToken);
    if (profile) {
      workspaces.push(...profileToWorkspaces(profile));
    }
  } catch (e) {
    console.error("Failed fetching user professional profile", e);
  }

  // If user has no workspaces registered yet, provide sample preview workspaces
  if (workspaces.length === 0) {
    return SAMPLE_WORKSPACES;
  }

  return workspaces;
}
