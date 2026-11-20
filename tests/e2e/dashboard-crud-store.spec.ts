import fs from "node:fs";
import path from "node:path";
import {
  expect,
  request as peticion,
  test,
  type APIRequestContext,
  type Page,
} from "@playwright/test";

test.describe.configure({ mode: "serial", timeout: 90_000 });

const DASH = "http://localhost:3002";
const STORE = "http://127.0.0.1:3000";
const EMAIL = process.env.E2E_DASHBOARD_EMAIL ?? "";
const PASSWORD = process.env.E2E_DASHBOARD_PASSWORD ?? "";
const RUN = Date.now();

// Este spec necesita una cuenta real del dashboard. Sin credenciales se omite
// (aparece como "skipped"), en vez de reventar el suite completo.
test.skip(
  !EMAIL || !PASSWORD,
  "Requiere E2E_DASHBOARD_EMAIL y E2E_DASHBOARD_PASSWORD",
);

const proyecto = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "..", ".insforge", "project.json"), "utf8"),
) as { api_key: string; oss_host: string };
const API = proyecto.oss_host.replace(/\/$/, "");
const CABECERAS = { Authorization: `Bearer ${proyecto.api_key}` };

async function limpiarResiduosE2E(ctx: APIRequestContext): Promise<void> {
  for (const tabla of ["productos", "marcas", "categorias"]) {
    await ctx.delete(`${API}/api/database/records/${tabla}?nombre=like.E2E*`, {
      headers: CABECERAS,
    });
  }
}

// El spec de Diseño cambia `titulos.productos` y lo restaura al final, pero si
// el test muere antes (timeout, servidor caído) el título de la tienda queda
// como "PRODUCTOS E2E <timestamp>". Esto lo revierte en el before/afterAll.
async function restaurarTituloProductos(ctx: APIRequestContext): Promise<void> {
  const res = await ctx.get(`${API}/api/database/records/tiendas?select=id,diseno`, {
    headers: CABECERAS,
  });
  if (!res.ok()) return;
  const filas = (await res.json()) as Array<{
    id: string;
    diseno: { titulos?: { productos?: string; categorias?: string } } | null;
  }>;
  for (const fila of filas) {
    const productos = fila.diseno?.titulos?.productos ?? "";
    if (!/^PRODUCTOS E2E /.test(productos)) continue;
    await ctx.patch(`${API}/api/database/records/tiendas?id=eq.${fila.id}`, {
      headers: CABECERAS,
      data: {
        diseno: {
          ...fila.diseno,
          titulos: { ...fila.diseno?.titulos, productos: "PRODUCTOS" },
        },
      },
    });
  }
}

async function restaurarWhatsapp(
  ctx: APIRequestContext,
  desde: string,
  hacia: string | null,
): Promise<void> {
  const res = await ctx.get(`${API}/api/database/records/tiendas?whatsapp_numero=eq.${desde}`, {
    headers: CABECERAS,
  });
  const filas = (await res.json()) as Array<{ id: string }>;
  for (const fila of filas) {
    await ctx.patch(`${API}/api/database/records/tiendas?id=eq.${fila.id}`, {
      headers: CABECERAS,
      data: { whatsapp_numero: hacia },
    });
  }
}

async function iniciarSesion(page: Page): Promise<void> {
  await page.goto(`${DASH}/productos`);
  if (page.url().includes(":3001")) {
    await page.getByLabel("Correo electrónico").fill(EMAIL);
    await page.getByLabel("Contraseña", { exact: true }).fill(PASSWORD);
    await page.getByRole("button", { name: "Iniciar sesión", exact: true }).click();
    await page.waitForURL(/:3002\/?$/);
  }
}

async function enviarModal(page: Page, etiqueta: string): Promise<void> {
  await page.getByRole("button", { name: etiqueta, exact: true }).click();
  await expect(page.locator("dialog.db-modal[open]")).toHaveCount(0);
}

test.beforeAll(async () => {
  if (!EMAIL || !PASSWORD) return;
  const ctx = await peticion.newContext();
  await limpiarResiduosE2E(ctx);
  await restaurarTituloProductos(ctx);
  await ctx.dispose();
});

test.afterAll(async () => {
  const ctx = await peticion.newContext();
  await limpiarResiduosE2E(ctx);
  await restaurarTituloProductos(ctx);
  await ctx.dispose();
});

test("Productos: crear, reflejar en tienda, editar precio, quitar novedad y eliminar", async ({
  page,
}) => {
  const nombre = `E2E Producto ${RUN}`;

  await iniciarSesion(page);
  await page.goto(`${DASH}/productos`);
  await expect(page.getByRole("heading", { name: "Productos", level: 1 })).toBeVisible();

  const interruptor = page.getByRole("switch", { name: "Mostrar precios en tienda" });
  const preciosOriginales = (await interruptor.getAttribute("aria-checked")) === "true";
  if (!preciosOriginales) {
    await interruptor.click();
    await expect(interruptor).toHaveAttribute("aria-checked", "true");
  }

  await page.getByRole("button", { name: "Nuevo producto" }).click();
  await page.locator("#pm-nombre").fill(nombre);
  await page.locator("#pm-precio").fill("99000");
  await page.locator("#pm-stock").fill("5");
  const switchNuevo = page.locator("label.db-switch").filter({ hasText: "Nuevo" });
  await switchNuevo.click();
  await expect(page.getByRole("checkbox", { name: /Nuevo/ })).toBeChecked();
  await enviarModal(page, "Crear producto");

  await expect(page.locator(".db-product-name", { hasText: nombre })).toBeVisible();

  await page.goto(`${STORE}/novedades`);
  const tarjeta = page.locator(".Productos-card").filter({ hasText: nombre });
  await expect(tarjeta).toBeVisible();
  await expect(tarjeta.locator(".product-precio")).toHaveText(/\$\s*99\.000/);

  const enlace = page.locator('a[href*="/verProducto?slug="]').filter({ hasText: nombre });
  const href = await enlace.first().getAttribute("href");
  const slug = new URL(href ?? "", STORE).searchParams.get("slug");
  expect(slug).toBeTruthy();

  await page.goto(`${STORE}/verProducto?slug=${slug}`);
  await expect(page.locator(".producto-titulo")).toHaveText(nombre);
  await expect(page.locator(".precio-actual")).toHaveText(/\$\s*99\.000/);

  await page.goto(`${DASH}/productos`);
  await page.getByRole("button", { name: `Editar ${nombre}` }).click();
  await page.locator("#pm-precio").fill("123000");
  await enviarModal(page, "Guardar cambios");

  await page.goto(`${STORE}/verProducto?slug=${slug}`);
  await expect(page.locator(".precio-actual")).toHaveText(/\$\s*123\.000/);

  await page.goto(`${DASH}/productos`);
  await page.getByRole("button", { name: `Editar ${nombre}` }).click();
  await page.locator("label.db-switch").filter({ hasText: "Nuevo" }).click();
  await expect(page.getByRole("checkbox", { name: /Nuevo/ })).not.toBeChecked();
  await enviarModal(page, "Guardar cambios");

  await page.goto(`${STORE}/novedades`);
  await expect(page.locator(".Productos-card").filter({ hasText: nombre })).toHaveCount(0);

  await page.goto(`${DASH}/productos`);
  await page.getByRole("button", { name: `Eliminar ${nombre}` }).click();
  
  // Esperar a que aparezca el modal de confirmación y hacer clic en "Eliminar"
  await expect(page.getByRole("button", { name: "Confirmar eliminación" })).toBeVisible();
  await page.getByRole("button", { name: "Confirmar eliminación" }).click();
  
  // Esperar a que el producto desaparezca de la lista
  await expect(page.locator(".db-product-name", { hasText: nombre })).toHaveCount(0);

  if (!preciosOriginales) {
    await page.goto(`${DASH}/productos`);
    await page
      .getByRole("switch", { name: "Mostrar precios en tienda" })
      .click();
    await expect(
      page.getByRole("switch", { name: "Mostrar precios en tienda" }),
    ).toHaveAttribute("aria-checked", "false");
  }
});

test("Diseño: cambiar el título de la sección de productos y verlo en la tienda", async ({
  page,
}) => {
  await iniciarSesion(page);
  await page.goto(`${DASH}/diseno`);
  await expect(
    page.getByRole("heading", { name: "Diseño de la tienda", level: 1 }),
  ).toBeVisible();

  await page.getByRole("tab", { name: /Títulos de secciones/ }).click();
  const campo = page.locator("#de-titulo-productos");
  const original = await campo.inputValue();
  const nuevo = `PRODUCTOS E2E ${RUN}`;

  await campo.fill(nuevo);
  await expect(campo).toHaveValue(nuevo);

  const guardarBtn = page.getByRole("button", { name: "Guardar cambios", exact: true });
  await expect(guardarBtn).toBeEnabled({ timeout: 10000 });
  await guardarBtn.click();
  await expect(page.getByText("Guardado ✓").first()).toBeVisible();
  await page.waitForTimeout(3000); // Wait for propagation

  await page.goto(STORE);
  await page.reload();
  await expect(page.locator("#productos-heading")).toHaveText(nuevo);

  await page.goto(`${DASH}/diseno`);
  await page.getByRole("tab", { name: /Títulos de secciones/ }).click();

  // Restaurar el valor original
  const campoRestaurar = page.locator("#de-titulo-productos");
  await campoRestaurar.fill(original);
  await expect(campoRestaurar).toHaveValue(original);

  const guardarBtn2 = page.getByRole("button", { name: "Guardar cambios", exact: true });
  await expect(guardarBtn2).toBeEnabled({ timeout: 10000 });
  await guardarBtn2.click();
  await expect(page.getByText("Guardado ✓").first()).toBeVisible();

  await page.goto(STORE);
  await expect(page.locator("#productos-heading")).toHaveText(original);
});

test("Marcas: crear, ver en tienda, editar y eliminar", async ({ page }) => {
  const nombre = `E2E Marca ${RUN}`;

  await iniciarSesion(page);
  await page.goto(`${DASH}/marcas`);
  await expect(
    page.getByRole("heading", { name: "Marcas y categorías", level: 1 }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Nueva marca" }).click();
  await page.locator("#mk-nombre").fill(nombre);
  await enviarModal(page, "Crear marca");
  await expect(page.locator("h3", { hasText: nombre })).toBeVisible();

  await page.goto(`${STORE}/marcas`);
  await expect(page.getByRole("heading", { name: nombre, exact: true })).toBeVisible();

  await page.goto(`${DASH}/marcas`);
  await page.getByRole("button", { name: `Editar ${nombre}` }).click();
  await page.locator("#mk-nombre").fill(`${nombre} v2`);
  await enviarModal(page, "Guardar cambios");
  await expect(page.locator("h3", { hasText: `${nombre} v2` })).toBeVisible();

  await page.goto(`${STORE}/marcas`);
  await expect(
    page.getByRole("heading", { name: `${nombre} v2`, exact: true }),
  ).toBeVisible();

  await page.goto(`${DASH}/marcas`);
  await page.getByRole("button", { name: `Eliminar ${nombre} v2` }).click();
  
  // Esperar a que aparezca el modal de confirmación y hacer clic en "Eliminar"
  await expect(page.getByRole("button", { name: "Confirmar eliminación" })).toBeVisible();
  await page.getByRole("button", { name: "Confirmar eliminación" }).click();
  
  // Esperar a que la marca desaparezca
  await expect(page.locator("h3", { hasText: `${nombre} v2` })).toHaveCount(0);

  await page.goto(`${STORE}/marcas`);
  await expect(
    page.getByRole("heading", { name: `${nombre} v2`, exact: true }),
  ).toHaveCount(0);
});

test("Categorías: crear, ver en tienda y eliminar", async ({ page }) => {
  const nombre = `E2E Cat ${RUN}`;

  await iniciarSesion(page);
  await page.goto(`${DASH}/marcas`);

  await page.getByRole("button", { name: "Nueva categoría" }).click();
  await page.locator("#ck-nombre").fill(nombre);
  await enviarModal(page, "Crear categoría");
  await expect(page.locator("h3", { hasText: nombre })).toBeVisible();

  await page.goto(`${STORE}/categoria`);
  await expect(page.getByRole("heading", { name: nombre, exact: true })).toBeVisible();

  await page.goto(`${DASH}/marcas`);
  await page.getByRole("button", { name: `Eliminar ${nombre}` }).click();
  
  // Esperar a que aparezca el modal de confirmación y hacer clic en "Eliminar"
  await expect(page.getByRole("button", { name: "Confirmar eliminación" })).toBeVisible();
  await page.getByRole("button", { name: "Confirmar eliminación" }).click();
  
  // Esperar a que la categoría desaparezca
  await expect(page.locator("h3", { hasText: nombre })).toHaveCount(0);

  await page.goto(`${STORE}/categoria`);
  await expect(page.getByRole("heading", { name: nombre, exact: true })).toHaveCount(0);
});

test("Mi tienda: cambiar el WhatsApp y verlo en el carrito", async ({ page, request }) => {
  const prueba = "573009998877";

  await iniciarSesion(page);
  await page.goto(`${DASH}/mi-tienda`);
  await expect(page.getByRole("heading", { name: "Mi tienda", level: 1 })).toBeVisible();

  const campo = page.locator("#mt-wsp-numero");
  const original = await campo.inputValue();
  await campo.fill(prueba);
  await page.getByRole("button", { name: "Guardar", exact: true }).click();
  await expect(page.getByText("Número guardado correctamente.")).toBeVisible();

  await page.addInitScript(() => {
    localStorage.setItem(
      "makced-cart",
      JSON.stringify([
        {
          id: "e2e-item",
          slug: "e2e-item",
          nombre: "Item E2E",
          precio: 10000,
          imagen_url: "",
          cantidad: 1,
        },
      ]),
    );
  });
  await page.goto(`${STORE}/carrito`);
  await expect(page.locator('a[href^="https://wa.me/"]')).toHaveAttribute(
    "href",
    new RegExp(`^https://wa.me/${prueba}`),
  );

  await restaurarWhatsapp(request, prueba, original || null);
  await page.goto(`${DASH}/mi-tienda`);
  await expect(page.locator("#mt-wsp-numero")).toHaveValue(original);
});

test("Toggle de precios: apagar y encender se refleja en el detalle de la tienda", async ({
  page,
}) => {
  await iniciarSesion(page);

  await page.goto(STORE);
  const enlace = page.locator('a[href*="/verProducto?slug="]').first();
  const href = await enlace.getAttribute("href");
  const slug = new URL(href ?? "", STORE).searchParams.get("slug");
  expect(slug).toBeTruthy();

  await page.goto(`${DASH}/productos`);
  const interruptor = page.getByRole("switch", { name: "Mostrar precios en tienda" });
  const original = (await interruptor.getAttribute("aria-checked")) === "true";

  if (original) {
    await interruptor.click();
    await expect(interruptor).toHaveAttribute("aria-checked", "false");
    await expect(page.getByText("Guardado")).toBeVisible();
  }
  await page.goto(`${STORE}/verProducto?slug=${slug}`);
  await page.reload();
  await expect(page.locator(".producto-precio")).toHaveCount(0);

  await page.goto(`${DASH}/productos`);
  const toggleSwitch = page.getByRole("switch", { name: "Mostrar precios en tienda" });
  await toggleSwitch.click();
  // Esperar a que la petición API se complete
  await page.waitForResponse(
    (response) => response.url().includes("/api/settings/mostrar-precios") && response.status() === 200
  );
  await expect(toggleSwitch).toHaveAttribute("aria-checked", "true");
  await expect(page.getByText("Guardado")).toBeVisible();
  
  // Esperar a que el caché se invalide
  await page.waitForTimeout(3000);
  
  // Navegar a la página de inicio primero para "resetear" el estado
  await page.goto(STORE);
  await page.waitForTimeout(2000);
  
  // Ahora navegar a la página del producto
  await page.goto(`${STORE}/verProducto?slug=${slug}&_t=${Date.now()}`);
  
  // Verificar que la página cargó correctamente (no hay error)
  const errorHeading = page.getByRole("heading", { name: "No pudimos cargar esta página" });
  const errorCount = await errorHeading.count();
  
  if (errorCount > 0) {
    // Si hay error, intentar recargar la página
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForTimeout(2000);
  }
  
  // Ahora verificar que el precio sea visible
  await expect(page.locator(".producto-precio")).toBeVisible({ timeout: 10000 });

  if (!original) {
    await page.goto(`${DASH}/productos`);
    await page.getByRole("switch", { name: "Mostrar precios en tienda" }).click();
    await expect(
      page.getByRole("switch", { name: "Mostrar precios en tienda" }),
    ).toHaveAttribute("aria-checked", "false");
  }
});
