import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { resetServerEnvForTests, serverEnv } from "./env";

describe("serverEnv", () => {
  beforeEach(() => {
    resetServerEnvForTests();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    resetServerEnvForTests();
  });

  it("populates default values when env vars are not set", () => {
    vi.stubEnv("GATEWAY_URL", "");
    vi.stubEnv("GATEWAY_IAM_AUDIENCE", "");
    vi.stubEnv("ADMIN_SITE_URL", "");

    const env = serverEnv();
    expect(env.GATEWAY_URL).toBe("http://localhost:8080");
    expect(env.GATEWAY_IAM_AUDIENCE).toBeUndefined();
    expect(env.NEXT_PUBLIC_SITE_URL).toBe("http://localhost:3001");
    expect(env.CUSTOMER_SITE_URL).toBe("http://localhost:3000");
    expect(env.ADMIN_SITE_URL).toBeUndefined();
    expect(env.LAUNCHED_SPORTS).toBe("cricket,karate");
    expect(env.FRONTEND_PROXY_KEY).toBe("local-frontend-proxy-key");
  });

  it("parses valid URLs correctly", () => {
    vi.stubEnv("GATEWAY_URL", "https://gateway-test.run.app");
    vi.stubEnv("GATEWAY_IAM_AUDIENCE", "https://gateway-test.run.app");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://business-test.run.app");
    vi.stubEnv("CUSTOMER_SITE_URL", "https://customer-test.run.app");
    vi.stubEnv("ADMIN_SITE_URL", "https://admin-test.run.app");
    vi.stubEnv("FRONTEND_PROXY_KEY", "prod-secret-key");

    const env = serverEnv();
    expect(env.GATEWAY_URL).toBe("https://gateway-test.run.app");
    expect(env.GATEWAY_IAM_AUDIENCE).toBe("https://gateway-test.run.app");
    expect(env.NEXT_PUBLIC_SITE_URL).toBe("https://business-test.run.app");
    expect(env.CUSTOMER_SITE_URL).toBe("https://customer-test.run.app");
    expect(env.ADMIN_SITE_URL).toBe("https://admin-test.run.app");
    expect(env.FRONTEND_PROXY_KEY).toBe("prod-secret-key");
  });
});
