import { describe, expect, it } from "vitest";
import { decodeAccessToken, isExpiring, safeNextPath } from "./jwt";

function fakeToken(claims: object): string {
  const encode = (value: object) =>
    btoa(JSON.stringify(value)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return `${encode({ alg: "RS256" })}.${encode(claims)}.signature`;
}

describe("safeNextPath", () => {
  it.each(["/account", "/venues/delhi?sport=cricket"])("allows same-site path %s", (path) => {
    expect(safeNextPath(path)).toBe(path);
  });

  it.each([
    "https://evil.example",
    "//evil.example",
    "/\\evil.example",
    "javascript:alert(1)",
    "",
    undefined,
  ])("rejects %s (open redirect)", (path) => {
    expect(safeNextPath(path, "/home")).toBe("/home");
  });
});

describe("decodeAccessToken", () => {
  it("reads roles, orgs and expiry", () => {
    const exp = Math.floor(Date.now() / 1000) + 600;
    const claims = decodeAccessToken(
      fakeToken({ sub: "u-1", roles: ["OWNER"], orgs: [{ id: "o-1", role: "OWNER" }], exp }),
    );
    expect(claims?.roles).toEqual(["OWNER"]);
    expect(claims?.orgs[0]?.id).toBe("o-1");
    expect(isExpiring(claims)).toBe(false);
  });

  it("treats garbage and expired tokens as no session", () => {
    expect(decodeAccessToken("not-a-token")).toBeNull();
    expect(decodeAccessToken(undefined)).toBeNull();
    const expired = decodeAccessToken(fakeToken({ sub: "u", roles: [], exp: 1 }));
    expect(isExpiring(expired)).toBe(true);
  });
});
