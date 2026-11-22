import { describe, expect, it } from "vitest";
import {
  COLOR_PRINCIPAL_DEFECTO,
  DEFAULT_DISENO,
  combinarDiseno,
} from "@makced/db/diseno";
import type { PayloadPreview } from "@makced/db/preview";
import { configDesdeToken } from "./preview-config";

const payload = (extra: Partial<PayloadPreview> = {}): PayloadPreview => ({
  v: 1,
  exp: 1_700_000_900,
  sub: "makced",
  tid: "tienda-1",
  color: "#7C53ED",
  logo: "/logo.png",
  cfg: {
    titulos: { categorias: "NOVEDADES", productos: "DESTACADOS" },
    radio: 8,
  },
  ...extra,
});

describe("configDesdeToken", () => {
  it("devuelve el snapshot tal como se firmó", () => {
    const resultado = configDesdeToken(payload());

    expect(resultado.esPreview).toBe(true);
    expect(resultado.id).toBe("tienda-1");
    expect(resultado.colorPrincipal).toBe("#7C53ED");
    expect(resultado.logoUrl).toBe("/logo.png");
    expect(resultado.config.titulos.categorias).toBe("NOVEDADES");
    expect(resultado.config.radio).toBe(8);
  });

  it("rellena con defaults lo que el config no traiga", () => {
    const resultado = configDesdeToken(payload({ cfg: {} }));

    expect(resultado.config.titulos.categorias).toBe(
      DEFAULT_DISENO.titulos.categorias,
    );
    expect(resultado.config.pie.marca).toBe(DEFAULT_DISENO.pie.marca);
    expect(resultado.config.banner.slides).toHaveLength(3);
  });

  it("cae a defaults con un color inválido o ausente", () => {
    expect(configDesdeToken(payload({ color: "" })).colorPrincipal).toBe(
      COLOR_PRINCIPAL_DEFECTO,
    );
    expect(
      configDesdeToken(payload({ color: "javascript:alert(1)" })).colorPrincipal,
    ).toBe(COLOR_PRINCIPAL_DEFECTO);
  });

  it("tolera un logo de tipo raro sin romper el render", () => {
    const sinLogo = configDesdeToken(
      payload({ logo: null as unknown as string }),
    );
    expect(sinLogo.logoUrl).toBeNull();

    const logoNumerico = configDesdeToken(
      payload({ logo: 42 as unknown as string }),
    );
    expect(logoNumerico.logoUrl).toBeNull();
  });

  it("no muta el config guardado por defecto entre llamadas", () => {
    const primera = configDesdeToken(payload());
    primera.config.pie.marca = "TAMAÑO";
    primera.config.banner.slides[0].imagen = "/alterada.png";

    const segunda = configDesdeToken(payload());
    expect(segunda.config.pie.marca).toBe(DEFAULT_DISENO.pie.marca);
    expect(segunda.config.banner.slides[0].imagen).toBe(
      DEFAULT_DISENO.banner.slides[0].imagen,
    );
  });

  it("es equivalente a combinarDiseno sobre el mismo cfg", () => {
    const cfg = { tipografia: "Poppins" as const, promo: { titulo: "Hola" } };
    expect(configDesdeToken(payload({ cfg })).config).toEqual(
      combinarDiseno(cfg),
    );
  });
});
