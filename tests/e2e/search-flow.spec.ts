import { expect, test } from "@playwright/test";

const STORE = "http://127.0.0.1:3000";

test.describe("Flujo de búsqueda (E2E)", () => {
  test("abrir y cerrar búsqueda", async ({ page }) => {
    await page.goto(STORE, { waitUntil: "domcontentloaded" });

    // Abrir búsqueda
    const btnBuscar = page.getByRole("button", { name: "Buscar" });
    await btnBuscar.click();

    // Verificar que el input aparece
    const input = page.getByRole("textbox");
    await expect(input).toBeVisible();
    await expect(input).toBeFocused();

    // Cerrar búsqueda
    const btnCerrar = page.getByRole("button", { name: "Cerrar búsqueda" });
    await btnCerrar.click();

    // Verificar que el input desaparece
    await expect(input).not.toBeVisible();
  });

  test("búsqueda con término muestra resultados", async ({ page }) => {
    await page.goto(STORE, { waitUntil: "domcontentloaded" });

    // Abrir búsqueda
    await page.getByRole("button", { name: "Buscar" }).click();

    // Escribir término de búsqueda
    const input = page.getByRole("textbox");
    await input.fill("nike");

    // Esperar a que aparezcan resultados (debounce de 300ms)
    await page.waitForTimeout(500);

    // Verificar que aparece el dropdown de resultados o mensaje de vacío
    const resultados = page.locator(".search-dropdown, .search-empty");
    await expect(resultados).toBeVisible();
  });

  test("Escape cierra la búsqueda", async ({ page }) => {
    await page.goto(STORE, { waitUntil: "domcontentloaded" });

    // Abrir búsqueda
    await page.getByRole("button", { name: "Buscar" }).click();
    await expect(page.getByRole("textbox")).toBeVisible();

    // Presionar Escape
    await page.keyboard.press("Escape");

    // Esperar a que se cierre
    await page.waitForTimeout(200);

    // Verificar que la búsqueda se cerró
    await expect(page.getByRole("textbox")).not.toBeVisible();
  });

  test("búsqueda muestra mensaje cuando no hay resultados", async ({ page }) => {
    await page.goto(STORE, { waitUntil: "domcontentloaded" });

    // Abrir búsqueda
    await page.getByRole("button", { name: "Buscar" }).click();

    // Escribir término que no existe
    const input = page.getByRole("textbox");
    await input.fill("xyznonexistent123");

    // Esperar a que se procese la búsqueda
    await page.waitForTimeout(500);

    // Verificar mensaje de vacío
    await expect(page.getByText(/No encontramos productos/)).toBeVisible();
  });
});
