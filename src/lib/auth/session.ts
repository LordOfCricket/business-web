import "server-only";
import { cookies } from "next/headers";
import { ACCESS_COOKIE, CHALLENGE_COOKIE, cookieOptions, REFRESH_COOKIE, type TokenPair } from "./cookies";
import { type AccessClaims, decodeAccessToken, isExpiring } from "./jwt";

export interface Session {
  accessToken: string;
  user: AccessClaims;
}

/** Current session from the httpOnly cookie (already refreshed by the proxy when needed). */
export async function getSession(): Promise<Session | null> {
  const token = (await cookies()).get(ACCESS_COOKIE)?.value;
  const claims = decodeAccessToken(token);
  if (!token || !claims || isExpiring(claims, 0)) return null;
  return { accessToken: token, user: claims };
}

export async function getRefreshToken(): Promise<string | undefined> {
  return (await cookies()).get(REFRESH_COOKIE)?.value;
}

/** Only callable from Server Actions and Route Handlers. */
export async function storeSession(tokens: TokenPair): Promise<void> {
  const jar = await cookies();
  jar.set(ACCESS_COOKIE, tokens.accessToken, cookieOptions(tokens.accessTokenExpiresAt));
  jar.set(REFRESH_COOKIE, tokens.refreshToken, cookieOptions(tokens.refreshTokenExpiresAt));
}

/**
 * Remembers the sign-in challenge while the code is fetched. It is httpOnly and expires with the challenge itself,
 * so a stale tab cannot be used to finish somebody else's sign-in.
 */
export async function storeChallenge(token: string, expiresAt: string): Promise<void> {
  (await cookies()).set(CHALLENGE_COOKIE, token, cookieOptions(expiresAt));
}

export async function getChallenge(): Promise<string | undefined> {
  return (await cookies()).get(CHALLENGE_COOKIE)?.value;
}

export async function clearChallenge(): Promise<void> {
  (await cookies()).delete(CHALLENGE_COOKIE);
}

export async function clearSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(ACCESS_COOKIE);
  jar.delete(REFRESH_COOKIE);
  jar.delete(CHALLENGE_COOKIE);
}

export function hasRole(session: Session | null, ...roles: string[]): boolean {
  return !!session && roles.some((r) => session.user.roles.includes(r));
}
