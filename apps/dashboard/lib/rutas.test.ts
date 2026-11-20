import { describe, expect, it } from "vitest";
import { urlTienda } from "@/lib/rutas";

describe("urlTienda", () => {
  it("apunta a la raíz del tenant", () => {
    expect(urlTienda("makced")).toBe("http://localhost:3000/s/makced");
  });

  it("acepta rutas con y sin slash inicial", () => {
    expect(urlTienda("makced", "/productos")).toBe(
      "http://localhost:3000/s/makced/productos",
    );
    expect(urlTienda("makced", "productos")).toBe(
      "http://localhost:3000/s/makced/productos",
    );
  });

  it("cae a la base si no hay subdominio (nunca /s/undefined)", () => {
    expect(urlTienda(null)).toBe("http://localhost:3000/");
    expect(urlTienda(undefined)).toBe("http://localhost:3000/");
    expect(urlTienda("")).toBe("http://localhost:3000/");
    expect(urlTienda(null, "/productos")).toBe(
      "http://localhost:3000/productos",
    );
  });
});
