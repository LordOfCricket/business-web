/** Session cookie names and options, shared by server actions, route handlers and the proxy. */
export const ACCESS_COOKIE = "los_at";
export const REFRESH_COOKIE = "los_rt";
/** Holds the short-lived token between a correct password and the code from the authenticator app. */
export const CHALLENGE_COOKIE = "los_mfa";

/** A correct password earns either the session or a challenge that must be answered first. */
export interface LoginResult {
  tokens: TokenPair | null;
  challenge: { type: "VERIFY" | "ENROL"; challengeToken: string; expiresAt: string } | null;
}

export interface TokenPair {
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
}

/** httpOnly: never readable by browser JS · Secure in production · SameSite=Lax blocks cross-site POSTs. */
export function cookieOptions(expiresAt: string) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    expires: new Date(expiresAt),
  };
}
