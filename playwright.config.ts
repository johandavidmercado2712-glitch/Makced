import { defineConfig, devices } from "@playwright/test";

const baseURL = "http://127.0.0.1:3000";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  reporter: "list",
  // 4 workers contra 3 `next dev` compilando en frío saturaban la máquina y
  // mataban tests por timeout (no por aserción). Con 2 el suite es estable.
  workers: 2,
  // Timeout por test: el default (30s) se quedaba corto cuando una ruta en
  // frío tarda ~20s en compilar y el test hace varias navegaciones.
  timeout: 90_000,
  use: {
    baseURL,
    ...devices["Desktop Chrome"],
    trace: "retain-on-failure",
    // Fail-closed (P0-2): sin tienda resuelta las rutas responden 404.
    // Cada test abre un contexto NUEVO, sin historial ni cookie, así que hay
    // que entregarle la cookie del tenant desde el principio. Sin esto, todo
    // el suite fallaría por 404 en lugar de probar lo que debe probar.
    storageState: {
      cookies: [
        {
          name: "tienda-subdominio",
          value: "makced",
          domain: "127.0.0.1",
          path: "/",
          expires: -1,
          httpOnly: false,
          secure: false,
          sameSite: "Lax",
        },
      ],
      origins: [],
    },
    // `next dev` compila on-demand: la primera petición a una ruta en frío
    // puede superar 30s, y los asserts por defecto (5s) quedaban cortos bajo
    // contención (4 workers + 3 dev servers).
    navigationTimeout: 60_000,
    actionTimeout: 30_000,
    expect: { timeout: 15_000 },
  },
  webServer: [
    {
      command: "npm run dev --workspace=@makced/store -- --hostname 127.0.0.1",
      url: baseURL,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: "npm run dev --workspace=@makced/login -- --hostname 127.0.0.1",
      url: "http://127.0.0.1:3001",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: "npm run dev --workspace=@makced/dashboard -- --hostname 127.0.0.1",
      url: "http://127.0.0.1:3002",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
