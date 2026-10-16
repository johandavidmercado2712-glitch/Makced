import { describe, expect, it } from "vitest";
import {
  DEFAULT_DISENO,
  COLOR_PRINCIPAL_DEFECTO,
  combinarDiseno,
  varsDesdeConfig,
} from "./diseno";

describe("combinarDiseno", () => {
  it("retorna defaults cuando no hay config guardada (null, {} o basura)", () => {
    for (const guardado of [null, {}, "texto", 42, [1, 2], undefined]) {
      const config = combinarDiseno(guardado);
      expect(config.mostrar_precios).toBe(true);
      expect(config.tipografia).toBe("Figtree");
      expect(config.color_secundario).toBe(DEFAULT_DISENO.color_secundario);
      expect(config.radio).toBe(DEFAULT_DISENO.radio);
      expect(config.banner.slides).toHaveLength(3);
    }
  });

  it("respeta mostrar_precios guardado (true y false)", () => {
    expect(combinarDiseno({ mostrar_precios: false }).mostrar_precios).toBe(false);
    expect(combinarDiseno({ mostrar_precios: true }).mostrar_precios).toBe(true);
  });

  it("mergea profundo sin pisar campos no enviados", () => {
    const config = combinarDiseno({ titulos: { categorias: "OFERTAS" } });
    expect(config.titulos.categorias).toBe("OFERTAS");
    expect(config.titulos.productos).toBe(DEFAULT_DISENO.titulos.productos);
    expect(config.pie).toEqual(DEFAULT_DISENO.pie);
    expect(config.promo).toEqual(DEFAULT_DISENO.promo);
  });

  it("recorta radio fuera de rango y descarta valores inválidos", () => {
    expect(combinarDiseno({ radio: 999 }).radio).toBe(24);
    expect(combinarDiseno({ radio: -5 }).radio).toBe(0);
    expect(combinarDiseno({ radio: 13.6 }).radio).toBe(14);
    expect(combinarDiseno({ radio: "no-numero" }).radio).toBe(DEFAULT_DISENO.radio);
    expect(combinarDiseno({ tipografia: "Comic Sans" }).tipografia).toBe("Figtree");
    expect(combinarDiseno({ color_secundario: "azul" }).color_secundario).toBe(
      DEFAULT_DISENO.color_secundario,
    );
  });

  it("las slides guardadas se fusionan por posición y siempre quedan 3", () => {
    const config = combinarDiseno({
      banner: { slides: [{ palabra: "Custom", imagen: "/nueva.png" }] },
    });
    expect(config.banner.slides).toHaveLength(3);
    expect(config.banner.slides[0].palabra).toBe("Custom");
    expect(config.banner.slides[0].imagen).toBe("/nueva.png");
    expect(config.banner.slides[0].parrafo).toBe(
      DEFAULT_DISENO.banner.slides[0].parrafo,
    );
    expect(config.banner.slides[1]).toEqual(DEFAULT_DISENO.banner.slides[1]);
    expect(config.banner.slides[2]).toEqual(DEFAULT_DISENO.banner.slides[2]);
  });

  it("no muta DEFAULT_DISENO entre llamadas", () => {
    const antes = JSON.stringify(DEFAULT_DISENO);
    combinarDiseno({ mostrar_precios: false, titulos: { productos: "X" }, radio: 20 });
    combinarDiseno(null);
    expect(JSON.stringify(DEFAULT_DISENO)).toBe(antes);
  });
});

describe("varsDesdeConfig", () => {
  it("con defaults genera las variables de radio y color", () => {
    const vars = varsDesdeConfig(COLOR_PRINCIPAL_DEFECTO, DEFAULT_DISENO);
    expect(vars["--radius-md"]).toBe("12px");
    expect(vars["--primary-mint"]).toBe(COLOR_PRINCIPAL_DEFECTO);
    expect(vars["--primary-turquoise"]).toBe(DEFAULT_DISENO.color_secundario);
    // tipografía por defecto (Figtree) no sobreescribe la var de fuente
    expect(vars["--font-figtree"]).toBeUndefined();
  });

  it("normaliza color principal inválido y expone tipografía distinta de Figtree", () => {
    const config = combinarDiseno({ tipografia: "Poppins" });
    const vars = varsDesdeConfig("no-es-hex", config);
    expect(vars["--primary-mint"]).toBe(COLOR_PRINCIPAL_DEFECTO);
    expect(vars["--font-figtree"]).toBe("Poppins");
  });
});
