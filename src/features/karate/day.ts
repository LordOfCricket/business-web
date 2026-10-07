import "server-only";
import { GatewayError, gatewayFetch } from "@/lib/api/gateway";
import type { BoutLive } from "./live";
import type { BoutView } from "./api";

/** A Kumite draw (K4) and how it was made: the stored seed and algorithm reproduce it. */
export interface DrawView {
  id: string;
  format: "KNOCKOUT" | "ROUND_ROBIN" | "POOLS_KNOCKOUT";
  status: "GENERATED" | "LOCKED" | "IN_PROGRESS" | "COMPLETED";
  pools: number;
  qualifiersPerPool: number;
  thirdPlace: boolean;
  tieBreaks: string[];
  requireCheckIn: boolean;
  randomSeed: number;
  algorithm: string;
  generatedAt: string;
  lockedAt?: string;
  places: Array<{
    entryId: string;
    name: string;
    academyName?: string;
    seed?: number;
    pool: number;
    position: number;
  }>;
}

export interface CheckInLine {
  entryId: string;
  athleteName: string;
  categoryId: string;
  categoryName: string;
  discipline: string;
  checkedIn: boolean;
  minWeight?: number;
  maxWeight?: number;
  weighedKg?: number;
  weighResult?: "PASSED" | "FAILED";
  overrideReason?: string;
}

export interface TatamiView {
  id: string;
  name: string;
  position: number;
  current?: BoutLive;
  queue: BoutView[];
}

export interface OperationsView {
  confirmed: number;
  checkedIn: number;
  weighPassed: number;
  weighFailed: number;
  categories: Array<{
    id: string;
    name: string;
    discipline: string;
    status: string;
    drawStatus?: string;
    athletes: number;
    bouts: number;
    waiting: number;
    ready: number;
    called: number;
    live: number;
    decided: number;
    noShows: number;
    medical: number;
  }>;
  tatamis: TatamiView[];
  alerts: string[];
}

const base = (orgId: string) => `/business/${orgId}/karate`;

export async function orgDraw(orgId: string, categoryId: string, token: string): Promise<DrawView | null> {
  try {
    return (
      await gatewayFetch<DrawView>(`${base(orgId)}/categories/${categoryId}/draw`, { accessToken: token })
    ).data;
  } catch (error) {
    if (error instanceof GatewayError && error.status === 404) return null;
    throw error;
  }
}

export async function checkInList(
  orgId: string,
  tournamentId: string,
  token: string,
): Promise<CheckInLine[]> {
  return (
    await gatewayFetch<CheckInLine[]>(`${base(orgId)}/tournaments/${tournamentId}/check-in`, {
      accessToken: token,
    })
  ).data;
}

export async function operations(
  orgId: string,
  tournamentId: string,
  token: string,
): Promise<OperationsView> {
  return (
    await gatewayFetch<OperationsView>(`${base(orgId)}/tournaments/${tournamentId}/operations`, {
      accessToken: token,
    })
  ).data;
}
