import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./test.setup.ts"],
    include: ["**/*.test.{ts,tsx}"],
    exclude: ["node_modules/**", ".next/**"],
    // Turbo ejecuta los 5 workspaces en paralelo: la creación de jsdom se
    // contiende por CPU y el default de 5000ms resultaba arbitrario.
    // 30000 (no 15000): con varios `next dev` o el runner de CI en frío, los
    // tests de carrito (userEvent + waitFor) superaban 15s por contención y
    // fallaban como timeout, no como aserción.
    testTimeout: 30000,
    hookTimeout: 30000,
  },
});
