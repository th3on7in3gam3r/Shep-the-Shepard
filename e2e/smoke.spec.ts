import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "shepherd-profile",
      JSON.stringify({
        state: {
          name: "Test",
          bio: "",
          photoUrl: null,
          onboardingComplete: true,
        },
        version: 0,
      }),
    );
    localStorage.setItem("shepherd-pwa-dismissed", "1");
  });
});

test.describe("Shepherd smoke", () => {
  test("home loads with daily quest and verse", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /welcome|good day/i })).toBeVisible();
    await expect(page.getByText("Daily Quest")).toBeVisible();
    await expect(page.getByText("Verse of the Day")).toBeVisible();
  });

  test("chat page opens with Shep scene", async ({ page }) => {
    await page.goto("/chat");
    await expect(
      page.getByText(/Shep the Shepherd|Hold to Speak|Hold the button/i).first(),
    ).toBeVisible();
  });

  test("bible page loads reader", async ({ page }) => {
    await page.goto("/bible");
    await expect(page.getByRole("heading", { name: "Bible" })).toBeVisible();
  });
});
