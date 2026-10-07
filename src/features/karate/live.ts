/** The Kumite engine's live view of a bout (K3), shared by the server actions and the console. */
export interface LiveSide {
  entryId: string;
  name: string;
  academyName?: string;
  score: number;
  penalty?: string;
  senshu: boolean;
}

export interface BoutLive {
  id: string;
  categoryName: string;
  tournament: { id: string; slug: string; name: string };
  tatami?: string;
  roundName: string;
  boutNumber: number;
  status: string;
  red?: LiveSide;
  blue?: LiveSide;
  clock: { durationMs: number; elapsedMs: number; remainingMs: number; running: boolean; serverTime: string };
  timeUp: boolean;
  hanteiNeeded: boolean;
  resultType?: string;
  decision?: string;
  winner?: "RED" | "BLUE";
  lastSeq: number;
  ruleSet?: string;
  canControl: boolean;
}

export interface BoutAction {
  clientActionId: string;
  type: string;
  side?: "RED" | "BLUE";
  points?: number;
  penalty?: string;
  correctsEventId?: string;
  reason?: string;
}

export interface BoutEventLine {
  id: string;
  seq: number;
  type: string;
  side?: string;
  points: number;
  penalty?: string;
  correctsSeq?: number;
  corrected: boolean;
  elapsedMs: number;
  actorRole: string;
  reason?: string;
  at: string;
}

export const DECIDED = [
  "COMPLETED",
  "WALKOVER",
  "NO_SHOW",
  "MEDICAL_WITHDRAWAL",
  "DISQUALIFIED",
  "CANCELLED",
];
