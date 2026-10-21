import { describe, expect, it } from "vitest";
import { formatCOP, precioEfectivo, tieneDescuento } from "./format";

const textoCOP = (valor: number) =>
  formatCOP(valor).replace(/\u00a0/g, " ");

describe("formatCOP", () => {
  it("formatea pesos colombianos sin decimales", () => {
    expect(textoCOP(95000)).toBe("$ 95.000");
    expect(textoCOP(0)).toBe("$ 0");
  });

  it("no rompe con valores no finitos", () => {
    expect(textoCOP(Number.NaN)).toBe("$ 0");
    expect(textoCOP(Number.POSITIVE_INFINITY)).toBe("$ 0");
  });
});

describe("precioEfectivo", () => {
  it("usa el descuento solo si es válido y menor", () => {
    expect(precioEfectivo(100000, 80000)).toBe(80000);
    expect(precioEfectivo(100000, 0)).toBe(0);
    expect(precioEfectivo(100000, null)).toBe(100000);
    expect(precioEfectivo(100000, 120000)).toBe(100000);
    expect(precioEfectivo(100000, Number.NaN)).toBe(100000);
  });
});

describe("tieneDescuento", () => {
  it("detecta descuentos reales", () => {
    expect(tieneDescuento(100000, 80000)).toBe(true);
    expect(tieneDescuento(100000, 100000)).toBe(false);
    expect(tieneDescuento(100000, null)).toBe(false);
  });
});
