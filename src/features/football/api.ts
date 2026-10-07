import "server-only";
import { gatewayFetch, GatewayError } from "@/lib/api/gateway";

export type TournamentStatus = "DRAFT" | "OPEN" | "CLOSED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export interface TournamentCard {
  id: string;
  slug: string;
  name: string;
  city: string;
  surface: "GRASS" | "TURF" | "INDOOR";
  orgName: string;
  venueName?: string;
  startDate: string;
  endDate: string;
  registrationClosesAt: string;
  entryFee: number;
  currency: string;
  teams: number;
  maxTeams: number;
  status: TournamentStatus;
  registrationOpen: boolean;
  path: string;
}

export interface EntryView {
  id: string;
  teamId: string;
  teamName: string;
  status: "PENDING_PAYMENT" | "CONFIRMED" | "CANCELLED" | "WITHDRAWN" | "REMOVED";
  amount: number;
  reason?: string;
  createdAt: string;
}

export interface Side {
  teamId: string;
  name: string;
  goals?: number;
}

export interface OfficialView {
  profileId: string;
  role: "REFEREE" | "ASSISTANT";
  name: string;
}

export interface FixtureCard {
  id: string;
  number: number;
  stage: string;
  startsAt: string;
  pitch?: string;
  home: Side;
  away: Side;
  status: "SCHEDULED" | "LIVE" | "COMPLETED" | "ABANDONED";
  result?: string;
  winnerTeamId?: string;
  officials: OfficialView[];
  path?: string;
}

export interface OrgTournament {
  tournament: TournamentCard;
  description?: string;
  rules?: string;
  playersPerSide: number;
  minutesPerHalf: number;
  venueId?: string;
  entries: EntryView[];
  fixtures: FixtureCard[];
}

export interface PlayerRef {
  id: string;
  name: string;
  jerseyNumber?: number;
  role: string;
}

export interface EventView {
  id: string;
  seq: number;
  minute: number;
  teamId: string;
  playerId: string;
  playerName: string;
  type: string;
  assistName?: string;
  note?: string;
  sentOff: boolean;
}

export interface MatchReport {
  match: FixtureCard;
  tournament: { id: string; slug: string; name: string; path: string };
  minutesPerHalf: number;
  events: EventView[];
  sentOff: PlayerRef[];
  next: { seq: number; minute: number; homeSquad: PlayerRef[]; awaySquad: PlayerRef[] };
  canRecord: boolean;
}

export interface AssignedMatch {
  match: FixtureCard;
  tournament: { id: string; slug: string; name: string; path: string };
}

export interface Official {
  profileId: string;
  displayName: string;
  city?: string;
}

const base = (orgId: string) => `/business/${orgId}/football`;

async function orNull<T>(call: () => Promise<T>): Promise<T | null> {
  try {
    return await call();
  } catch (error) {
    if (error instanceof GatewayError && error.status === 404) return null;
    throw error;
  }
}

export async function tournaments(orgId: string, token: string): Promise<TournamentCard[]> {
  return (await gatewayFetch<TournamentCard[]>(`${base(orgId)}/tournaments?size=50`, { accessToken: token }))
    .data;
}

export async function tournament(orgId: string, id: string, token: string): Promise<OrgTournament | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  return orNull(
    async () =>
      (await gatewayFetch<OrgTournament>(`${base(orgId)}/tournaments/${id}`, { accessToken: token })).data,
  );
}

export async function matchReport(id: string, token: string): Promise<MatchReport | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  return orNull(
    async () => (await gatewayFetch<MatchReport>(`/football/matches/${id}`, { accessToken: token })).data,
  );
}

/** Matches the signed-in referee has been assigned to. */
export async function refereeing(token: string): Promise<AssignedMatch[]> {
  return (await gatewayFetch<AssignedMatch[]>("/football/refereeing/matches", { accessToken: token })).data;
}

/** Public football referees (from search) to choose officials from. */
export async function referees(): Promise<Official[]> {
  try {
    return (
      await gatewayFetch<Official[]>("/search/professionals?type=referee&sport=football&size=60", {
        revalidate: 60,
      })
    ).data;
  } catch {
    return [];
  }
}
