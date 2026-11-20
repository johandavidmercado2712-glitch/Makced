import { expect, test } from "@playwright/test";

// P0-2 (fail-closed): si no se puede resolver la tienda, la app NO debe
// servir datos globales. Debe responder 404 / estado vacío, nunca el
// catálogo de todas las tiendas mezclado.
//
// Estos tests se salen del `storageState` del config (que trae la cookie
// `tienda-subdominio`) porque justamente prueban lo que pasa SIN ella.
//
// OJO: en Playwright Test, `browser.newContext()` HEREDA el `use` del config
// (incluido storageState). Para tener un contexto realmente limpio hay que
// pasarle `storageState: { cookies: [], origins: [] }` explícitamente.
const contextoSinTenant = { storageState: { cookies: [], origins: [] } };

test.describe("Aislamiento de tenant (fail-closed)", () => {
  test("sin cookie, /novedades responde 404 y no lista productos globales", async ({
    browser,
  }) => {
    const context = await browser.newContext(contextoSinTenant);
    const page = await context.newPage();

    await page.goto("/novedades", { waitUntil: "domcontentloaded" });

    // 404 de Next (notFound()) en vez de un listado sin filtrar.
    await expect(page.locator("h1")).toContainText(/no existe|404|not found/i);
    await expect(page.locator(".product-card, .producto-card")).toHaveCount(0);

    await context.close();
  });

  test("sin cookie, /categoria responde 404", async ({ browser }) => {
    const context = await browser.newContext(contextoSinTenant);
    const page = await context.newPage();

    await page.goto("/categoria", { waitUntil: "domcontentloaded" });

    await expect(page.locator("h1")).toContainText(/no existe|404|not found/i);

    await context.close();
  });

  // Regresión: listarTiendasActivas() ordenaba por `created_at`, columna que
  // `anon` no puede leer, así que devolvía [] y "/" acababa en un 404 en vez
  // de redirigir a la tienda.
  test("sin cookie, / redirige a la primera tienda activa", async ({
    browser,
  }) => {
    const context = await browser.newContext(contextoSinTenant);
    const page = await context.newPage();

    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.waitForURL(/\/s\/makced/, { timeout: 30_000 });

    await expect(page.locator("h1").first()).not.toContainText(/no existe/i);

    await context.close();
  });

  test("con cookie, /novedades sí renderiza (regresión del fix)", async ({
    page,
  }) => {
    // Usa el context con storageState heredado del config.
    await page.goto("/novedades", { waitUntil: "domcontentloaded" });

    await expect(page.locator("h1")).not.toContainText(/no existe|404|not found/i);
  });

  test("con cookie, /s/makced redirige al contenido de la tienda", async ({
    page,
  }) => {
    await page.goto("/s/makced", { waitUntil: "domcontentloaded" });

    await expect(page).toHaveURL(/\/s\/makced/);
    await expect(page.locator("h1")).not.toContainText(/no existe|404|not found/i);
  });
});
