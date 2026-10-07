import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { gatewayAuthHeaders, resetGatewayAuthForTests } from "./gateway-auth";

describe("gatewayAuthHeaders", () => {
  beforeEach(() => resetGatewayAuthForTests());

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("adds nothing when the gateway is not private", async () => {
    vi.stubEnv("GATEWAY_IAM_AUDIENCE", "");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    expect(await gatewayAuthHeaders()).toEqual({});
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("asks the metadata server for a token for the gateway and reuses it", async () => {
    vi.stubEnv("GATEWAY_IAM_AUDIENCE", "https://gateway.example.run.app");
    const fetchMock = vi.fn().mockResolvedValue(new Response("id-token\n"));
    vi.stubGlobal("fetch", fetchMock);

    expect(await gatewayAuthHeaders()).toEqual({ "X-Serverless-Authorization": "Bearer id-token" });
    expect(await gatewayAuthHeaders()).toEqual({ "X-Serverless-Authorization": "Bearer id-token" });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(
      "http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/identity" +
        "?audience=https%3A%2F%2Fgateway.example.run.app",
    );
    expect(init.headers).toEqual({ "Metadata-Flavor": "Google" });
  });

  it("goes on without the header when no token can be had", async () => {
    vi.stubEnv("GATEWAY_IAM_AUDIENCE", "https://gateway.example.run.app");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("", { status: 404 })));
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(await gatewayAuthHeaders()).toEqual({});
  });
});
