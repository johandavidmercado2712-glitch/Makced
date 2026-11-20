import { expect, test } from "@playwright/test";

const STORE = "http://127.0.0.1:3000";

test.describe("Flujo completo del carrito (E2E)", () => {
  test.beforeEach(async ({ page }) => {
    // Limpiar localStorage antes de cada test
    await page.goto(STORE);
    await page.evaluate(() => localStorage.clear());
  });

  test("agregar producto al carrito y verlo en la página de carrito", async ({
    page,
  }) => {
    // Usar addInitScript para sembrar localStorage antes de que la página cargue
    await page.addInitScript(() => {
      localStorage.setItem(
        "makced-cart",
        JSON.stringify([
          {
            id: "test-product",
            slug: "test-product",
            nombre: "Producto de prueba",
            precio: 95000,
            imagen_url: "/producto.jpg",
            cantidad: 1,
            talla: 40,
            color: "Negro",
          },
        ]),
      );
    });

    await page.goto(`${STORE}/carrito`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);

    // Verificar que el producto aparece en el carrito
    await expect(page.getByText("Producto de prueba")).toBeVisible();
    await expect(page.getByText("Talla: 40")).toBeVisible();
    await expect(page.getByText("Negro")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Tu Carrito \(1 producto\)/ }),
    ).toBeVisible();
  });

  test("carrito vacío muestra estado vacío", async ({ page }) => {
    await page.goto(`${STORE}/carrito`, { waitUntil: "domcontentloaded" });

    // Esperar a que la página se hidrate
    await page.waitForTimeout(500);

    // Verificar estado vacío
    await expect(page.getByText("Tu carrito está vacío")).toBeVisible();
    await expect(page.getByRole("link", { name: "Ver catálogo" })).toBeVisible();
  });

  test("modificar cantidad en el carrito actualiza el total", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        "makced-cart",
        JSON.stringify([
          {
            id: "test-product",
            slug: "test-product",
            nombre: "Producto de prueba",
            precio: 95000,
            imagen_url: "/producto.jpg",
            cantidad: 1,
            talla: 40,
          },
        ]),
      );
    });

    await page.goto(`${STORE}/carrito`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);

    // Verificar que el producto aparece
    await expect(page.getByText("Producto de prueba")).toBeVisible();

    // Aumentar cantidad
    const btnAumentar = page.getByRole("button", { name: "Aumentar cantidad" });
    await btnAumentar.click();

    // Esperar a que se actualice
    await page.waitForTimeout(500);

    // Verificar que ahora hay 2 productos
    await expect(page.getByRole("heading", { name: /Tu Carrito \(2 productos\)/ })).toBeVisible();
  });

  test("carrito con subtotal >= $200.000 muestra mensaje de pedido completo", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        "makced-cart",
        JSON.stringify([
          {
            id: "test-product",
            slug: "test-product",
            nombre: "Producto caro",
            precio: 250000,
            imagen_url: "/producto.jpg",
            cantidad: 1,
            talla: 40,
          },
        ]),
      );
    });

    await page.goto(`${STORE}/carrito`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);

    // Verificar que el producto aparece
    await expect(page.getByText("Producto caro")).toBeVisible();

    // Verificar mensaje de pedido completo
    await expect(
      page.getByText("¡Tu pedido está completo, listo para enviar!"),
    ).toBeVisible();
  });

  test("carrito con subtotal < $200.000 muestra mensaje de ánimo", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        "makced-cart",
        JSON.stringify([
          {
            id: "test-product",
            slug: "test-product",
            nombre: "Producto barato",
            precio: 95000,
            imagen_url: "/producto.jpg",
            cantidad: 1,
            talla: 40,
          },
        ]),
      );
    });

    await page.goto(`${STORE}/carrito`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);

    // Verificar mensaje de ánimo
    await expect(
      page.getByText("¡Ya casi! Revisa tu pedido y envíalo por WhatsApp"),
    ).toBeVisible();
  });
});
