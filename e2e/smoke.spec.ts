import { expect, test } from "@playwright/test";

test("business home renders the onboarding call to action", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("link", { name: "Register your business" })).toBeVisible();
});

test("health endpoint is up", async ({ request }) => {
  expect((await request.get("/api/health")).ok()).toBeTruthy();
});

test("bff blocks cross-site mutations", async ({ request }) => {
  const response = await request.post("/api/bff/business/x/venues", {
    headers: { origin: "https://evil.example" },
    data: {},
  });
  expect(response.status()).toBe(403);
});
