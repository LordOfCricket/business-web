export interface CoachingHistoryEntry {
  id: string;
  academy: string;
  branch?: string;
  position: string;
  sport: string;
  discipline: string;
  startYear: string;
  endYear: string;
  isCurrent: boolean;
  responsibilities: string;
  achievements?: string;
}

export interface StructuredCoachAchievement {
  id: string;
  title: string;
  category: "COMPETITION" | "COACHING_AWARD" | "NATIONAL_TITLE" | "FEDERATION_HONOR";
  role: "COACH" | "ATHLETE";
  year: number;
  level: "DISTRICT" | "STATE" | "NATIONAL" | "INTERNATIONAL";
  description: string;
}

export interface NotableAthlete {
  id: string;
  name: string;
  sport: string;
  currentTitle: string;
  coachedSince: string;
}

export interface CoachOffering {
  id: string;
  name: string;
  type: "PRIVATE_1ON1" | "GROUP_CLINIC" | "ELITE_SQUAD";
  ageGroup: string;
  skillLevel: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "ALL_LEVELS";
  priceAmount: number;
  currency: string;
  durationMinutes: number;
  description: string;
}

export interface CoachQualification {
  id: string;
  name: string;
  issuer: string;
  yearAwarded: number;
  licenseNumber?: string;
  verified: boolean;
}
