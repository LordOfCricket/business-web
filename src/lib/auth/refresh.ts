import "server-only";
import { gatewayFetch } from "@/lib/api/gateway";
import type { TokenPair } from "./cookies";
import { decodeAccessToken } from "./jwt";
import { getRefreshToken, storeSession } from "./session";

/**
 * Rotates the session now (Server Actions only) so new roles / org memberships appear in the access token.
 * Returns the new claims, or null when the refresh token is missing or rejected.
 */
export async function refreshSessionNow() {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return null;
  try {
    const { data } = await gatewayFetch<TokenPair>("/auth/refresh", {
      method: "POST",
      body: { refreshToken },
    });
    await storeSession(data);
    return decodeAccessToken(data.accessToken);
  } catch {
    return null;
  }
}

/**
 * Membership reaches identity asynchronously (organization → Pub/Sub → identity), so after creating a business we
 * refresh a few times until the token carries it. Usually the first or second attempt succeeds.
 */
export async function refreshUntilMember(orgId: string, attempts = 8, delayMs = 750): Promise<boolean> {
  for (let i = 0; i < attempts; i++) {
    const claims = await refreshSessionNow();
    if (claims?.orgs.some((o) => o.id === orgId) && claims.roles.includes("OWNER")) return true;
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
  return false;
}
