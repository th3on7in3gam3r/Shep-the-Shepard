import { test, expect } from "@playwright/test";

test("bible translations API responds", async ({ request }) => {
  const response = await request.get("/api/bible/translations");
  expect(response.ok()).toBeTruthy();
  const body = (await response.json()) as { translations?: unknown[] };
  expect(Array.isArray(body.translations)).toBeTruthy();
  expect(body.translations!.length).toBeGreaterThan(0);
});

test("chat API rejects empty body", async ({ request }) => {
  const response = await request.post("/api/chat", {
    data: { messages: [] },
  });
  expect(response.status()).toBe(400);
});
