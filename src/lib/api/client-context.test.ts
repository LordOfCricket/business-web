import { afterEach, describe, expect, it, vi } from "vitest";
import { clientContextFrom, lastForwardedFor } from "./client-context";

afterEach(() => vi.unstubAllEnvs());

describe("client context forwarding", () => {
  it("takes the last X-Forwarded-For entry (the one the load balancer appended)", () => {
    expect(lastForwardedFor("1.1.1.1, 203.0.113.5")).toBe("203.0.113.5");
    expect(lastForwardedFor("not-an-ip")).toBeUndefined();
    expect(lastForwardedFor(null)).toBeUndefined();
  });

  it("only sends X-Client-IP together with the shared key", () => {
    const headers = new Headers({ "x-forwarded-for": "203.0.113.5", "user-agent": "Firefox" });
    expect(clientContextFrom(headers)).toEqual({ "User-Agent": "Firefox" });

    vi.stubEnv("FRONTEND_PROXY_KEY", "secret");
    expect(clientContextFrom(headers)).toEqual({
      "User-Agent": "Firefox",
      "X-Client-IP": "203.0.113.5",
      "X-Frontend-Key": "secret",
    });
  });
});
