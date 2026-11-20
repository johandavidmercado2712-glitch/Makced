import { expect, test } from "@playwright/test";

const STORE = "http://127.0.0.1:3000";

test.describe("Cambio de tema (E2E)", () => {
  test("cambiar tema en navbar actualiza la clase dark", async ({ page }) => {
    await page.goto(STORE, { waitUntil: "domcontentloaded" });

    // Verificar que el botón de tema existe
    const btnTema = page.getByRole("button", { name: "Cambiar tema" });
    await expect(btnTema).toBeVisible();

    // Obtener estado inicial del tema
    const esDarkInicial = await page.evaluate(() =>
      document.documentElement.classList.contains("dark"),
    );

    // Cambiar tema
    await btnTema.click();

    // Esperar a que la clase dark cambie (puede haber un delay por React)
    await expect(async () => {
      const esDarkDespues = await page.evaluate(() =>
        document.documentElement.classList.contains("dark"),
      );
      expect(esDarkDespues).not.toBe(esDarkInicial);
    }).toPass({ timeout: 5000 });
  });

  test("tema persiste al recargar la página", async ({ page }) => {
    await page.goto(STORE, { waitUntil: "domcontentloaded" });

    // Cambiar a dark
    const btnTema = page.getByRole("button", { name: "Cambiar tema" });
    await btnTema.click();

    // Verificar que se guardó en localStorage
    const temaGuardado = await page.evaluate(() =>
      localStorage.getItem("theme"),
    );
    expect(temaGuardado).toBe("dark");

    // Recargar la página
    await page.reload({ waitUntil: "domcontentloaded" });

    // Verificar que el tema persiste
    const esDark = await page.evaluate(() =>
      document.documentElement.classList.contains("dark"),
    );
    expect(esDark).toBe(true);
  });

  test("tema se aplica a todos los elementos", async ({ page }) => {
    await page.goto(STORE, { waitUntil: "domcontentloaded" });

    // Cambiar a dark
    await page.getByRole("button", { name: "Cambiar tema" }).click();

    // Verificar que la clase dark está en el html
    await expect(page.locator("html")).toHaveClass(/dark/);

    // Cambiar a light
    await page.getByRole("button", { name: "Cambiar tema" }).click();

    // Verificar que la clase dark se removió
    const esDark = await page.evaluate(() =>
      document.documentElement.classList.contains("dark"),
    );
    expect(esDark).toBe(false);
  });
});
