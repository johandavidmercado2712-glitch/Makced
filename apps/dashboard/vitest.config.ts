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
    env: {
      NEXT_PUBLIC_INSFORGE_URL: "http://insforge.test",
      NEXT_PUBLIC_INSFORGE_ANON_KEY: "test-anon-key",
      NEXT_PUBLIC_TIENDA_URL: "http://localhost:3000",
    },
  },
});
