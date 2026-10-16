import { describe, expect, it } from "vitest";
import { slugify } from "./slug";

describe("slugify", () => {
  it("convierte a minúsculas y reemplaza espacios por guiones", () => {
    expect(slugify("Zapatillas Running Air")).toBe("zapatillas-running-air");
  });

  it("quita acentos y caracteres especiales", () => {
    expect(slugify("¡Calzado Deportivo Ñúñez!")).toBe("calzado-deportivo-nunez");
    expect(slugify("Café Múnico")).toBe("cafe-munico");
  });

  it("colapsa separadores repetidos y limpia los extremos", () => {
    expect(slugify("  a--b  c  ")).toBe("a-b-c");
    expect(slugify("---")).toBe("");
    expect(slugify("Modelo 2024 X")).toBe("modelo-2024-x");
  });
});
