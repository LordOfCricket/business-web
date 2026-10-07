import "server-only";
import { gatewayFetch, GatewayError } from "@/lib/api/gateway";

export interface RoleView {
  type: string;
  typeName: string;
  sport: string;
  sportName: string;
}

export interface OwnProfile {
  id: string;
  slug: string;
  status: "DRAFT" | "PUBLISHED" | "SUSPENDED";
  displayName: string;
  headline?: string;
  bio?: string;
  experienceYears?: number;
  city?: string;
  avatarMediaId?: string;
  avatarUrl?: string;
  roles: RoleView[];
  certifications: Array<{ name: string; issuer?: string; yearAwarded?: number; mediaId?: string }>;
  specializations: string[];
  services: Array<{
    name: string;
    description?: string;
    priceAmount: number;
    currency: string;
    durationMinutes?: number;
  }>;
  availability: Array<{ dayOfWeek: number; startTime: string; endTime: string }>;
}

export async function getMyProfessionalProfile(accessToken: string): Promise<OwnProfile | null> {
  try {
    return (await gatewayFetch<OwnProfile>("/professional-profile", { accessToken })).data;
  } catch (error) {
    if (error instanceof GatewayError && error.status === 404) return null;
    throw error;
  }
}
