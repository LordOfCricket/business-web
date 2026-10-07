import "server-only";
import { gatewayFetch, GatewayError } from "@/lib/api/gateway";

export interface BeltRef {
  rank: number;
  label: string;
  color: string;
}

export interface BeltView {
  rank: number;
  name: string;
  grade: string;
  color: string;
}

export interface AcademyView {
  orgId: string;
  rankSystemId?: string;
  orgName: string;
  style: string;
  headInstructor?: string;
  affiliation?: string;
  description?: string;
}

export interface StudentView {
  id: string;
  name: string;
  dateOfBirth: string;
  age: number;
  gender: "MALE" | "FEMALE";
  belt: BeltRef;
  beltSince: string;
  joinedOn: string;
  active: boolean;
  linked: boolean;
  nextBeltFrom?: string;
  history: Array<{ belt: BeltRef; awardedOn: string; examiner?: string }>;
}

export interface GradingView {
  id: string;
  title: string;
  heldOn: string;
  examiner: string;
  status: "PLANNED" | "COMPLETED" | "CANCELLED";
  candidates: Array<{
    studentId: string;
    studentName: string;
    from: BeltRef;
    to: BeltRef;
    result: "PENDING" | "PASSED" | "FAILED";
    note?: string;
  }>;
}

export interface KarateCard {
  id: string;
  slug: string;
  name: string;
  city: string;
  startDate: string;
  endDate: string;
  registrationClosesAt: string;
  entryFee: number;
  categories: number;
  athletes: number;
  status: string;
  path: string;
}

export interface CategoryView {
  id: string;
  rankSystemId?: string;
  discipline: "KATA" | "KUMITE";
  name: string;
  gender: string;
  minAge: number;
  maxAge: number;
  minBelt: BeltRef;
  maxBelt: BeltRef;
  minWeight?: number;
  maxWeight?: number;
  maxEntries: number;
  athletes: number;
  status: "OPEN" | "DRAWN" | "COMPLETED";
  refereeName?: string;
  podium: Array<{ place: number; athleteName: string; academyName?: string }>;
}

export interface KarateEntry {
  id: string;
  categoryId: string;
  categoryName?: string;
  athleteName: string;
  belt: BeltRef;
  beltVerified: boolean;
  status: string;
  amount: number;
  reason?: string;
}

export interface OrgKarateTournament {
  tournament: KarateCard;
  description?: string;
  rules?: string;
  venueId?: string;
  categories: CategoryView[];
  entries: KarateEntry[];
}

export interface AthleteLine {
  entryId: string;
  name: string;
  academyName?: string;
  belt: BeltRef;
}

export interface BoutView {
  id: string;
  round: number;
  roundName: string;
  red?: AthleteLine;
  blue?: AthleteLine;
  redScore?: number;
  blueScore?: number;
  winnerEntryId?: string;
  decision?: string;
  status:
    | "WAITING"
    | "READY"
    | "CALLED"
    | "LIVE"
    | "PAUSED"
    | "COMPLETED"
    | "WALKOVER"
    | "NO_SHOW"
    | "MEDICAL_WITHDRAWAL"
    | "DISQUALIFIED"
    | "CANCELLED";
  boutNumber?: number;
  tatami?: string;
  resultType?: string;
}

export interface CategoryDetail {
  tournament: { id: string; slug: string; name: string; path: string; status: string };
  category: CategoryView;
  athletes: AthleteLine[];
  bouts: BoutView[];
  kata: Array<{ entryId: string; name: string; scores: number[]; total?: number; rank?: number }>;
  canReferee: boolean;
}

const base = (orgId: string) => `/business/${orgId}/karate`;

export interface RankView {
  id: string;
  rank: number;
  name: string;
  grade: string;
  kind: "KYU" | "DAN";
  color: string;
  minMonths: number;
  minAge: number;
  description?: string;
  active: boolean;
}

/** A rank progression (K2): the platform default or one of the academy's own ([editable]). */
export interface RankSystemView {
  id: string;
  name: string;
  style?: string;
  isDefault: boolean;
  editable: boolean;
  active: boolean;
  ranks: RankView[];
}

export async function rankSystems(orgId: string, token: string): Promise<RankSystemView[]> {
  return (await gatewayFetch<RankSystemView[]>(`${base(orgId)}/rank-systems`, { accessToken: token })).data;
}

/** The ranks that can be given in [systemId] (none: the platform default). */
export async function ladder(systemId?: string): Promise<BeltView[]> {
  if (!systemId) return belts();
  const { data } = await gatewayFetch<RankSystemView>(`/karate/rank-systems/${systemId}`, { revalidate: 60 });
  return data.ranks.filter((r) => r.active);
}

export async function belts(): Promise<BeltView[]> {
  return (await gatewayFetch<BeltView[]>("/karate/belts", { revalidate: 3600 })).data;
}

export async function academy(orgId: string, token: string): Promise<AcademyView | null> {
  try {
    return (await gatewayFetch<AcademyView>(`${base(orgId)}/academy`, { accessToken: token })).data;
  } catch (error) {
    if (error instanceof GatewayError && error.status === 404) return null;
    throw error;
  }
}

export async function students(orgId: string, token: string): Promise<StudentView[]> {
  return (await gatewayFetch<StudentView[]>(`${base(orgId)}/students`, { accessToken: token })).data;
}

export async function gradings(orgId: string, token: string): Promise<GradingView[]> {
  return (await gatewayFetch<GradingView[]>(`${base(orgId)}/gradings`, { accessToken: token })).data;
}

export async function grading(orgId: string, id: string, token: string): Promise<GradingView | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  try {
    return (await gatewayFetch<GradingView>(`${base(orgId)}/gradings/${id}`, { accessToken: token })).data;
  } catch (error) {
    if (error instanceof GatewayError && error.status === 404) return null;
    throw error;
  }
}

export async function karateTournaments(orgId: string, token: string): Promise<KarateCard[]> {
  return (await gatewayFetch<KarateCard[]>(`${base(orgId)}/tournaments?size=50`, { accessToken: token }))
    .data;
}

export async function karateTournament(
  orgId: string,
  id: string,
  token: string,
): Promise<OrgKarateTournament | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  try {
    return (
      await gatewayFetch<OrgKarateTournament>(`${base(orgId)}/tournaments/${id}`, { accessToken: token })
    ).data;
  } catch (error) {
    if (error instanceof GatewayError && error.status === 404) return null;
    throw error;
  }
}

export async function categoryDetail(
  slug: string,
  id: string,
  token: string,
): Promise<CategoryDetail | null> {
  try {
    return (
      await gatewayFetch<CategoryDetail>(`/karate/tournaments/${encodeURIComponent(slug)}/categories/${id}`, {
        accessToken: token,
      })
    ).data;
  } catch (error) {
    if (error instanceof GatewayError && error.status === 404) return null;
    throw error;
  }
}

export async function refereeing(
  token: string,
): Promise<Array<{ tournament: CategoryDetail["tournament"]; category: CategoryView }>> {
  return (
    await gatewayFetch<Array<{ tournament: CategoryDetail["tournament"]; category: CategoryView }>>(
      "/karate/refereeing",
      { accessToken: token },
    )
  ).data;
}

/** Public karate referees (search) for assigning to categories. */
export async function referees(): Promise<Array<{ profileId: string; displayName: string; city?: string }>> {
  try {
    return (
      await gatewayFetch<Array<{ profileId: string; displayName: string; city?: string }>>(
        "/search/professionals?type=referee&sport=karate&size=60",
        { revalidate: 60 },
      )
    ).data;
  } catch {
    return [];
  }
}
