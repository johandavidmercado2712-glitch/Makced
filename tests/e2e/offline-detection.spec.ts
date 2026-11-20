import { expect, test } from "@playwright/test";

const STORE = "http://127.0.0.1:3000";

test.describe("Detección de conexión (E2E)", () => {
  test("banner offline aparece cuando se pierde la conexión", async ({ page }) => {
    await page.goto(STORE, { waitUntil: "domcontentloaded" });

    // Verificar que no hay banner inicialmente
    await expect(page.locator(".offline-banner")).not.toBeVisible();

    // Simular desconexión
    await page.evaluate(() => {
      Object.defineProperty(navigator, "onLine", { value: false, writable: true });
      window.dispatchEvent(new Event("offline"));
    });

    // Esperar a que el banner aparezca (el hook usa setTimeout(0))
    await page.waitForTimeout(300);

    // Verificar que el banner aparece
    await expect(page.locator(".offline-banner")).toBeVisible();
    await expect(page.locator(".offline-banner")).toContainText(
      "Sin conexión",
    );
  });

  test("banner desaparece cuando se recupera la conexión", async ({ page }) => {
    await page.goto(STORE, { waitUntil: "domcontentloaded" });

    // Simular desconexión
    await page.evaluate(() => {
      Object.defineProperty(navigator, "onLine", { value: false, writable: true });
      window.dispatchEvent(new Event("offline"));
    });
    await page.waitForTimeout(300);
    await expect(page.locator(".offline-banner")).toBeVisible();

    // Simular reconexión
    await page.evaluate(() => {
      Object.defineProperty(navigator, "onLine", { value: true, writable: true });
      window.dispatchEvent(new Event("online"));
    });
    await page.waitForTimeout(300);

    // Verificar que el banner desaparece
    await expect(page.locator(".offline-banner")).not.toBeVisible();
  });

  test("banner tiene icono de wifi-off", async ({ page, context }) => {
    await page.goto(STORE, { waitUntil: "domcontentloaded" });

    // Dispatch offline event manually
    await page.evaluate(() => {
      Object.defineProperty(navigator, "onLine", { value: false, writable: true });
      window.dispatchEvent(new Event("offline"));
    });
    await page.waitForTimeout(300);

    const banner = page.locator(".offline-banner");
    await expect(banner).toBeVisible();

    // Verificar que tiene un icono SVG
    const icon = banner.locator("svg");
    await expect(icon).toBeVisible();
  });
});
