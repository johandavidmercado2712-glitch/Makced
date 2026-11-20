import { expect, test } from "@playwright/test";

const STORE = "http://127.0.0.1:3000";

test.describe("Carrito vacío (E2E)", () => {
  test.beforeEach(async ({ page }) => {
    // Limpiar localStorage antes de cada test
    await page.goto(STORE);
    await page.evaluate(() => localStorage.clear());
  });

  test("carrito vacío muestra estado vacío con CTAs", async ({ page }) => {
    await page.goto(`${STORE}/carrito`, { waitUntil: "domcontentloaded" });

    // Esperar a que la página se hidrate
    await page.waitForTimeout(500);

    // Verificar estado vacío
    await expect(page.getByText("Tu carrito está vacío")).toBeVisible();
    await expect(
      page.getByText("Explora nuestro catálogo y encuentra lo que buscas."),
    ).toBeVisible();

    // Verificar CTA principal
    const ctaCatalogo = page.getByRole("link", { name: "Ver catálogo" });
    await expect(ctaCatalogo).toBeVisible();
    // Con multitienda el CTA sale de rutaTienda() -> /s/<subdominio>
    await expect(ctaCatalogo).toHaveAttribute("href", "/s/makced");

    // Verificar links de categorías (pueden ser links con clase específica)
    const categoriaLinks = page.locator(".carrito-vacio-categoria-link");
    await expect(categoriaLinks).toHaveCount(3);
  });

  test("CTA de catálogo navega a la tienda", async ({ page }) => {
    await page.goto(`${STORE}/carrito`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(500);

    // Hacer clic en "Ver catálogo"
    await page.getByRole("link", { name: "Ver catálogo" }).click();

    // Verificar que navegó a la tienda.
    // Con multitienda path-based el CTA sale de rutaTienda() y apunta a
    // /s/<subdominio>, no a "/": por eso se compara contra el prefijo.
    await expect(page).toHaveURL(/\/s\/makced\/?$/);
  });

  test("carrito vacío no muestra resumen de pedido", async ({ page }) => {
    await page.goto(`${STORE}/carrito`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(500);

    // Verificar que no hay resumen
    await expect(page.getByText("Resumen del pedido")).not.toBeVisible();
    await expect(page.getByText("Subtotal")).not.toBeVisible();
    await expect(page.getByText("Total")).not.toBeVisible();
  });

  test("carrito vacío no muestra botón de WhatsApp", async ({ page }) => {
    await page.goto(`${STORE}/carrito`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(500);

    // Verificar que no hay botón de WhatsApp (el elemento no existe en el DOM)
    await expect(
      page.getByRole("link", { name: /Pedir por WhatsApp/ }),
    ).toHaveCount(0);
  });
});
