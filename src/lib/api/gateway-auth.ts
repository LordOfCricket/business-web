/**
 * NewSports runs the API gateway as a private Cloud Run service: only callers holding a Google-signed ID token for it
 * get through, as the backend services already do among themselves (platform IdTokenProvider). When
 * GATEWAY_IAM_AUDIENCE is set (the gateway's URL), every server-side call to the gateway carries such a token in
 * X-Serverless-Authorization, fetched from the Cloud Run metadata server for this app's service account. The user's
 * own session stays in Authorization, untouched. Unset (local development, a public gateway): nothing is added.
 */

const METADATA_URL =
  "http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/identity?audience=";

/** Tokens live for an hour; reuse one for 50 minutes, like the services do. */
const TOKEN_TTL_MS = 50 * 60 * 1000;

let cached: { audience: string; token: string; expiresAt: number } | undefined;

async function idToken(audience: string): Promise<string | undefined> {
  if (cached && cached.audience === audience && cached.expiresAt > Date.now()) return cached.token;
  try {
    const res = await fetch(METADATA_URL + encodeURIComponent(audience), {
      headers: { "Metadata-Flavor": "Google" },
      cache: "no-store",
      signal: AbortSignal.timeout(3_000),
    });
    if (!res.ok) throw new Error(`metadata server answered ${res.status}`);
    const token = (await res.text()).trim();
    cached = { audience, token, expiresAt: Date.now() + TOKEN_TTL_MS };
    return token;
  } catch (error) {
    // the gateway refuses the call without it, and says so; nothing more to do here than report it
    console.error(`Could not get an ID token for the gateway (${audience}):`, error);
    return undefined;
  }
}

/** Headers that let this app through a private gateway; empty when the gateway is not private. */
export async function gatewayAuthHeaders(): Promise<Record<string, string>> {
  const audience = process.env.GATEWAY_IAM_AUDIENCE;
  if (!audience) return {};
  const token = await idToken(audience);
  return token ? { "X-Serverless-Authorization": `Bearer ${token}` } : {};
}

/** Tests only: forget the cached token. */
export function resetGatewayAuthForTests(): void {
  cached = undefined;
}
