import { expect, test } from "@playwright/test";

const dashboardSections = [
  { path: "/", name: "Resumen" },
  { path: "/productos", name: "Productos" },
  { path: "/marcas", name: "Marcas y categorías" },
  { path: "/diseno", name: "Diseño" },
  { path: "/mi-tienda", name: "Mi tienda" },
];

for (const section of dashboardSections) {
  test(`sin sesión, ${section.name} redirige al login`, async ({ page }) => {
    await page.goto(`http://127.0.0.1:3002${section.path}`);

    await expect(page).toHaveURL(/:3001\/?$/);
    await expect(page.getByLabel("Correo electrónico")).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Navegación principal" })).toHaveCount(0);
  });
}
