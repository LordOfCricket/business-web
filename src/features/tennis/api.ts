import "server-only";
import { gatewayFetch, GatewayError } from "@/lib/api/gateway";

export interface PlayerRef {
  entryId: string;
  playerId: string;
  name: string;
  slug?: string;
  seed?: number;
  path?: string;
}

export interface EventView {
  id: string;
  name: string;
  gender: "MALE" | "FEMALE" | "OPEN";
  minAge: number;
  maxAge: number;
  bestOf: number;
  finalSet: "TIEBREAK" | "ADVANTAGE" | "MATCH_TIEBREAK";
  noAd: boolean;
  format: string;
  maxEntries: number;
  players: number;
  status: "OPEN" | "DRAWN" | "COMPLETED";
  umpireName?: string;
  champion?: PlayerRef;
  runnerUp?: PlayerRef;
}

export interface TennisCard {
  id: string;
  slug: string;
  name: string;
  city: string;
  surface: string;
  startDate: string;
  endDate: string;
  registrationClosesAt: string;
  entryFee: number;
  events: number;
  players: number;
  status: string;
  path: string;
}

export interface TennisEntry {
  id: string;
  eventId: string;
  eventName?: string;
  playerName: string;
  seed?: number;
  status: string;
  amount: number;
  reason?: string;
}

export interface OrgTennisTournament {
  tournament: TennisCard;
  description?: string;
  rules?: string;
  venueId?: string;
  events: EventView[];
  entries: TennisEntry[];
}

export interface MatchLine {
  id: string;
  round: number;
  position: number;
  roundName: string;
  player1?: PlayerRef;
  player2?: PlayerRef;
  winnerEntryId?: string;
  status: "WAITING" | "READY" | "LIVE" | "COMPLETED";
  outcome?: string;
  score?: string;
  court?: string;
  scheduledAt?: string;
  path: string;
}

export interface EventDetail {
  tournament: { id: string; slug: string; name: string; path: string; status: string };
  event: EventView;
  players: PlayerRef[];
  matches: MatchLine[];
  canUmpire: boolean;
}

export interface SetLine {
  games1: number;
  games2: number;
  tiebreak1?: number;
  tiebreak2?: number;
  label: string;
}

export interface MatchDetail {
  id: string;
  tournament: { id: string; slug: string; name: string; path: string; status: string };
  eventId: string;
  eventName: string;
  eventPath: string;
  roundName: string;
  format: string;
  bestOf: number;
  noAd: boolean;
  player1?: PlayerRef;
  player2?: PlayerRef;
  status: "WAITING" | "READY" | "LIVE" | "COMPLETED";
  outcome?: string;
  winnerEntryId?: string;
  sets: SetLine[];
  games1?: number;
  games2?: number;
  points1?: string;
  points2?: string;
  tiebreak: boolean;
  server?: 1 | 2;
  nextSeq: number;
  score?: string;
  court?: string;
  scheduledAt?: string;
  canUmpire: boolean;
}

export interface UmpireEvent {
  tournament: { id: string; slug: string; name: string; path: string; status: string };
  event: EventView;
  path: string;
}

const base = (orgId: string) => `/business/${orgId}/tennis`;

async function orNull<T>(call: () => Promise<T>): Promise<T | null> {
  try {
    return await call();
  } catch (error) {
    if (error instanceof GatewayError && error.status === 404) return null;
    throw error;
  }
}

export async function tennisTournaments(orgId: string, token: string): Promise<TennisCard[]> {
  return (await gatewayFetch<TennisCard[]>(`${base(orgId)}/tournaments?size=50`, { accessToken: token }))
    .data;
}

export async function tennisTournament(
  orgId: string,
  id: string,
  token: string,
): Promise<OrgTennisTournament | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  return orNull(
    async () =>
      (await gatewayFetch<OrgTennisTournament>(`${base(orgId)}/tournaments/${id}`, { accessToken: token }))
        .data,
  );
}

export async function eventDetail(slug: string, id: string, token: string): Promise<EventDetail | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  return orNull(
    async () =>
      (
        await gatewayFetch<EventDetail>(`/tennis/tournaments/${encodeURIComponent(slug)}/events/${id}`, {
          accessToken: token,
        })
      ).data,
  );
}

export async function matchDetail(id: string, token: string): Promise<MatchDetail | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  return orNull(
    async () => (await gatewayFetch<MatchDetail>(`/tennis/matches/${id}`, { accessToken: token })).data,
  );
}

/** Public tennis umpires, to assign to an event. */
export async function umpires(): Promise<Array<{ profileId: string; displayName: string; city?: string }>> {
  try {
    return (
      await gatewayFetch<Array<{ profileId: string; displayName: string; city?: string }>>(
        "/search/professionals?type=umpire&sport=tennis&size=60",
        { revalidate: 60 },
      )
    ).data;
  } catch {
    return [];
  }
}

/** Events the signed-in umpire is assigned to. */
export async function umpiring(token: string): Promise<UmpireEvent[]> {
  return (await gatewayFetch<UmpireEvent[]>("/tennis/umpiring", { accessToken: token })).data;
}
