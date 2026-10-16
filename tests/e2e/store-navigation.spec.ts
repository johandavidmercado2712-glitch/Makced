import { expect, test } from "@playwright/test";

const fixedNavigationLabels = ["Inicio", "Novedades", "Marcas", "Categorias"];

test("móvil muestra solo los cuatro enlaces principales y categorías en cuadrícula", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const navigation = page.getByRole("navigation", {
    name: "Navegación principal",
  });
  await expect(navigation.getByRole("link")).toHaveText(fixedNavigationLabels);

  const mobileWidths = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    document: document.documentElement.scrollWidth,
    navigation: document.querySelector(".nav-session")?.scrollWidth,
    navigationViewport: document.querySelector(".nav-session")?.clientWidth,
  }));
  expect(mobileWidths.document).toBeLessThanOrEqual(mobileWidths.viewport);
  expect(mobileWidths.navigation).toBe(mobileWidths.navigationViewport);

  await navigation.getByRole("link", { name: "Categorias" }).click();
  await expect(page).toHaveURL(/\/categoria$/);
  await expect(page.getByRole("heading", { name: "Categorias" })).toBeVisible();

  const categoryGrid = page.locator(".categoria-cards");
  await expect(categoryGrid).toBeVisible();
  const columnCount = await categoryGrid.evaluate(
    (element) => getComputedStyle(element).gridTemplateColumns.trim().split(/\s+/).length,
  );
  expect(columnCount).toBe(2);
});

test("escritorio mantiene accesibles los enlaces de categorías dinámicas", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const navigation = page.getByRole("navigation", {
    name: "Navegación principal",
  });
  for (const label of fixedNavigationLabels) {
    await expect(navigation.getByRole("link", { name: label })).toBeVisible();
  }

  const dynamicLinks = navigation.locator(".nav-hide-mobile");
  for (const link of await dynamicLinks.all()) {
    await expect(link).toBeVisible();
  }
});
