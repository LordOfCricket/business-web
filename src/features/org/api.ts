import "server-only";
import { gatewayFetch, GatewayError } from "@/lib/api/gateway";

export type OrgStatus = "DRAFT" | "PENDING_VERIFICATION" | "VERIFIED" | "REJECTED" | "SUSPENDED";
export type Capability = "VENUE_OPERATOR" | "SELLER" | "ACADEMY" | "PROFESSIONAL_SERVICES";

export interface Organization {
  id: string;
  slug: string;
  name: string;
  type: string;
  description?: string;
  addressLine?: string;
  city: string;
  state?: string;
  postalCode?: string;
  contactEmail: string;
  contactPhone: string;
  website?: string;
  status: OrgStatus;
  statusReason?: string;
  sports: string[];
  /** capability → REQUESTED | APPROVED | REJECTED */
  capabilities: Record<string, string>;
  services: Array<{ name: string; description?: string }>;
  submittedAt?: string;
  verifiedAt?: string;
  createdAt: string;
}

export interface Membership {
  orgId: string;
  slug: string;
  name: string;
  type: string;
  status: OrgStatus;
  orgRole: string;
  approvedCapabilities: Capability[];
}

export interface Member {
  userId: string;
  email: string;
  fullName?: string;
  orgRole: string;
  title?: string;
  addedAt: string;
}

export interface OrgDocument {
  id: string;
  docType: string;
  mediaId: string;
  uploadedAt: string;
}

export async function getMyOrganizations(accessToken: string): Promise<Membership[]> {
  return (await gatewayFetch<Membership[]>("/organizations/mine", { accessToken })).data;
}

export async function getOrganization(orgId: string, accessToken: string): Promise<Organization | null> {
  try {
    return (await gatewayFetch<Organization>(`/business/${orgId}/organization`, { accessToken })).data;
  } catch (error) {
    if (error instanceof GatewayError && (error.status === 403 || error.status === 404)) return null;
    throw error;
  }
}

export async function getMembers(orgId: string, accessToken: string): Promise<Member[]> {
  return (await gatewayFetch<Member[]>(`/business/${orgId}/members`, { accessToken })).data;
}

export async function getDocuments(orgId: string, accessToken: string): Promise<OrgDocument[]> {
  try {
    return (await gatewayFetch<OrgDocument[]>(`/business/${orgId}/organization/documents`, { accessToken }))
      .data;
  } catch (error) {
    if (error instanceof GatewayError && error.status === 403) return []; // staff cannot see documents
    throw error;
  }
}

/** Capabilities usable now: approved and the business is verified. */
export function approvedCapabilities(org: Organization): Capability[] {
  if (org.status !== "VERIFIED") return [];
  return Object.entries(org.capabilities)
    .filter(([, status]) => status === "APPROVED")
    .map(([cap]) => cap as Capability);
}
