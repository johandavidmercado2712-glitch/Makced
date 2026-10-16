import { describe, expect, it } from "vitest";
import { esFallo, etiquetaSubmit, mensajeFallo } from "./modal-utils";

describe("esFallo", () => {
  it("detecta resultados fallidos", () => {
    expect(esFallo({ ok: false, error: "x" })).toBe(true);
    expect(esFallo({ ok: true })).toBe(false);
    expect(esFallo(undefined)).toBe(false);
    // defensa ante entradas fuera del tipo (el typeof las tolera en runtime)
    expect(esFallo(null as never)).toBe(false);
    expect(esFallo("texto" as never)).toBe(false);
  });
});

describe("mensajeFallo", () => {
  it("usa el mensaje del Error si lo es", () => {
    expect(mensajeFallo(new Error("boom"), "fallback")).toBe("boom");
  });

  it("usa el fallback para cualquier otra causa", () => {
    expect(mensajeFallo("algo raro", "No se pudo guardar")).toBe(
      "No se pudo guardar",
    );
    expect(mensajeFallo(undefined, "No se pudo guardar")).toBe(
      "No se pudo guardar",
    );
    expect(mensajeFallo({ mensaje: "obj" }, "No se pudo guardar")).toBe(
      "No se pudo guardar",
    );
  });
});

describe("etiquetaSubmit", () => {
  it("prioriza la fase subiendo", () => {
    expect(etiquetaSubmit("subiendo", true, "categoría")).toBe(
      "Subiendo imagen...",
    );
    expect(etiquetaSubmit("subiendo", false, "producto")).toBe(
      "Subiendo imagen...",
    );
  });

  it("distingue alta y edición en guardando", () => {
    expect(etiquetaSubmit("guardando", true, "categoría")).toBe("Creando...");
    expect(etiquetaSubmit("guardando", false, "categoría")).toBe("Guardando...");
  });

  it("en idle muestra la etiqueta final", () => {
    expect(etiquetaSubmit("idle", true, "marca")).toBe("Crear marca");
    expect(etiquetaSubmit("idle", false, "marca")).toBe("Guardar cambios");
  });
});
