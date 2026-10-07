import "server-only";
import { gatewayFetch, GatewayError } from "@/lib/api/gateway";

export type TournamentStatus = "DRAFT" | "OPEN" | "CLOSED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export interface TournamentCard {
  id: string;
  slug: string;
  name: string;
  city: string;
  orgName: string;
  venueName?: string;
  ballType: "LEATHER" | "TENNIS";
  overs: number;
  startDate: string;
  endDate: string;
  registrationClosesAt: string;
  entryFee: number;
  currency: string;
  maxTeams: number;
  teams: number;
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
  score?: string;
}

export interface FixtureCard {
  id: string;
  number: number;
  stage: string;
  startsAt: string;
  ground?: string;
  overs: number;
  home: Side;
  away: Side;
  status: "SCHEDULED" | "LIVE" | "COMPLETED" | "ABANDONED";
  result?: string;
  winnerTeamId?: string;
  officials: Array<{ profileId: string; role: "UMPIRE" | "SCORER"; name: string }>;
}

export interface OrgTournament {
  tournament: TournamentCard;
  description?: string;
  rules?: string;
  playersPerSide: number;
  venueId?: string;
  entries: EntryView[];
  fixtures: FixtureCard[];
}

export interface InningsCard {
  number: number;
  battingTeamId: string;
  battingTeam: string;
  runs: number;
  wickets: number;
  overs: string;
  target?: number;
  closed: boolean;
  batting: Array<{
    playerId: string;
    name: string;
    howOut: string;
    notOut: boolean;
    runs: number;
    balls: number;
  }>;
  bowling: Array<{ playerId: string; name: string; overs: string; runs: number; wickets: number }>;
  thisOver: string[];
}

export interface NextBall {
  seq: number;
  innings: number;
  battingTeamId: string;
  bowlingTeamId: string;
  strikerId?: string;
  nonStrikerId?: string;
  bowlerId?: string;
  lastOverBowlerId?: string;
  over: string;
  dismissed: string[];
}

export interface Scorecard {
  match: FixtureCard;
  tournament: { id: string; slug: string; name: string; path: string };
  toss?: string;
  innings: InningsCard[];
  squads: Record<string, Array<{ id: string; name: string; leftHanded?: boolean }>>;
  next?: NextBall;
  canScore: boolean;
}

export interface Official {
  profileId: string;
  displayName: string;
  city?: string;
}

export const customerSite = () => process.env.CUSTOMER_SITE_URL ?? "http://localhost:3000";

export async function orgTournaments(orgId: string, token: string): Promise<TournamentCard[]> {
  return (
    await gatewayFetch<TournamentCard[]>(`/business/${orgId}/cricket/tournaments?size=50`, {
      accessToken: token,
    })
  ).data;
}

export async function orgTournament(orgId: string, id: string, token: string): Promise<OrgTournament | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  try {
    return (
      await gatewayFetch<OrgTournament>(`/business/${orgId}/cricket/tournaments/${id}`, {
        accessToken: token,
      })
    ).data;
  } catch (error) {
    if (error instanceof GatewayError && error.status === 404) return null;
    throw error;
  }
}

export async function scorecard(matchId: string, token: string): Promise<Scorecard | null> {
  if (!/^[0-9a-f-]{36}$/i.test(matchId)) return null;
  try {
    return (await gatewayFetch<Scorecard>(`/cricket/matches/${matchId}`, { accessToken: token })).data;
  } catch (error) {
    if (error instanceof GatewayError && error.status === 404) return null;
    throw error;
  }
}

export async function assignedMatches(
  token: string,
): Promise<Array<{ match: FixtureCard; tournament: Scorecard["tournament"] }>> {
  return (
    await gatewayFetch<Array<{ match: FixtureCard; tournament: Scorecard["tournament"] }>>(
      "/cricket/scoring/matches",
      { accessToken: token },
    )
  ).data;
}

/** Public cricket umpires / scorers (from search) to choose officials from. */
export async function officials(type: "umpire" | "scorer", city?: string): Promise<Official[]> {
  const q = new URLSearchParams({ type, sport: "cricket", size: "60" });
  if (city) q.set("city", city);
  try {
    return (await gatewayFetch<Official[]>(`/search/professionals?${q}`, { revalidate: 60 })).data;
  } catch {
    return [];
  }
}
