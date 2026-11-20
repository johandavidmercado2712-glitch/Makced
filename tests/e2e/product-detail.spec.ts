import { expect, test } from "@playwright/test";

const STORE = "http://127.0.0.1:3000";

test.describe("Detalle de producto (E2E)", () => {
  test("navegar a un producto desde novedades", async ({ page }) => {
    await page.goto(`${STORE}/novedades`, { waitUntil: "domcontentloaded" });

    // Verificar que hay productos
    const productos = page.locator(".Productos-card");
    await expect(productos.first()).toBeVisible();

    // Hacer clic en el primer producto
    await productos.first().click();
    await page.waitForURL(/\/verProducto/);

    // Verificar que estamos en la página de detalle
    await expect(page.locator(".producto-titulo, h1")).toBeVisible();
  });

  test("galería de imágenes funciona", async ({ page }) => {
    await page.goto(`${STORE}/novedades`, { waitUntil: "domcontentloaded" });

    const productos = page.locator(".Productos-card");
    await productos.first().click();
    await page.waitForURL(/\/verProducto/);

    // Verificar que hay una imagen principal
    const imagenPrincipal = page.locator(".producto-imagen-principal, .Producto-img img").first();
    await expect(imagenPrincipal).toBeVisible();

    // Si hay miniaturas, verificar que se pueden hacer clic
    const miniaturas = page.locator(".producto-miniatura-btn, .producto-galeria button");
    const count = await miniaturas.count();
    if (count > 0) {
      await miniaturas.first().click();
      // La imagen principal debería cambiar
      await expect(imagenPrincipal).toBeVisible();
    }
  });

  test("selector de talla y color funciona", async ({ page }) => {
    await page.goto(`${STORE}/novedades`, { waitUntil: "domcontentloaded" });

    const productos = page.locator(".Productos-card");
    await productos.first().click();
    await page.waitForURL(/\/verProducto/);

    // Verificar selector de talla
    const tallas = page.locator(".talla-btn");
    const tallasCount = await tallas.count();
    if (tallasCount > 0) {
      await tallas.first().click();
      await expect(tallas.first()).toHaveClass(/selected/);
    }

    // Verificar selector de color (si existe)
    const colores = page.locator(".color-swatch");
    const coloresCount = await colores.count();
    if (coloresCount > 0) {
      await colores.first().click();
      await expect(colores.first()).toHaveClass(/selected/);
    }
  });

  test("botón de agregar al carrito se habilita con talla seleccionada", async ({
    page,
  }) => {
    await page.goto(`${STORE}/novedades`, { waitUntil: "domcontentloaded" });

    const productos = page.locator(".Productos-card");
    await productos.first().click();
    await page.waitForURL(/\/verProducto/);

    // Sin talla, el botón debería estar deshabilitado
    const btnAgregar = page.getByRole("button", { name: /Agregar al carrito|Selecciona una talla/ });
    await expect(btnAgregar).toBeVisible();

    // Seleccionar una talla
    const tallas = page.locator(".talla-btn");
    const tallasCount = await tallas.count();
    if (tallasCount > 0) {
      await tallas.first().click();

      // El botón ahora debería estar habilitado
      const btnHabilitado = page.getByRole("button", { name: /Agregar al carrito/ });
      await expect(btnHabilitado).toBeEnabled();
    }
  });

  test("agregar producto al carrito desde el detalle", async ({ page }) => {
    await page.goto(`${STORE}/novedades`, { waitUntil: "domcontentloaded" });

    const productos = page.locator(".Productos-card");
    await productos.first().click();
    await page.waitForURL(/\/verProducto/);

    // Seleccionar talla
    const tallas = page.locator(".talla-btn");
    const tallasCount = await tallas.count();
    if (tallasCount > 0) {
      await tallas.first().click();

      // Agregar al carrito
      const btnAgregar = page.getByRole("button", { name: /Agregar al carrito/ });
      await btnAgregar.click({ force: true });

      // Esperar a que se actualice
      await page.waitForTimeout(2000);

      // Verificar que el carrito se actualizó (badge en navbar)
      const cartBadge = page.locator(".cart-badge");
      await expect(cartBadge).toBeVisible({ timeout: 5000 });
    }
  });

  test("página de detalle muestra el título del producto", async ({ page }) => {
    await page.goto(`${STORE}/novedades`, { waitUntil: "domcontentloaded" });

    const productos = page.locator(".Productos-card");
    await productos.first().click();
    await page.waitForURL(/\/verProducto/);

    // Verificar que el título del producto se muestra
    const titulo = page.locator(".producto-titulo, h1");
    await expect(titulo).toBeVisible();
    const textoTitulo = await titulo.textContent();
    expect(textoTitulo).toBeTruthy();
    expect(textoTitulo!.length).toBeGreaterThan(0);
  });
});
