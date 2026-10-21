import { describe, expect, it } from "vitest";
import {
  DEFAULT_DISENO,
  COLOR_PRINCIPAL_DEFECTO,
  ENLACES_AYUDA_DEFECTO,
  ENLACES_INFORMACION_DEFECTO,
  MAX_ENLACES_PIE,
  combinarDiseno,
  esEnlacePieVisible,
  esUrlPieValida,
  normalizarEnlacesPie,
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

  it("inyecta los enlaces por defecto del pie y no comparte referencias", () => {
    const config = combinarDiseno(null);
    expect(config.pie.informacion).toEqual(ENLACES_INFORMACION_DEFECTO);
    expect(config.pie.ayuda).toEqual(ENLACES_AYUDA_DEFECTO);
    expect(config.pie.web_url).toBe("");
    expect(config.pie.titulo_informacion).toBe("INFORMACIÓN");

    config.pie.informacion[0].etiqueta = "Modificado";
    expect(ENLACES_INFORMACION_DEFECTO[0].etiqueta).toBe("Nosotros");
    expect(combinarDiseno(null).pie.informacion[0].etiqueta).toBe("Nosotros");
  });

  it("fusiona los campos editables del pie y conserva URLs para corregir", () => {
    const config = combinarDiseno({
      pie: {
        marca: "  Otra marca  ",
        copyright: "",
        titulo_informacion: " Info ",
        instagram_url: "https://instagram.com/tienda",
        informacion: [
          { etiqueta: " Nosotros ", url: "/nosotros" },
          { etiqueta: "", url: "" },
          { etiqueta: "Correo", url: "mailto:hola@tienda.com" },
        ],
        ayuda: [],
      },
    });

    expect(config.pie.marca).toBe("Otra marca");
    expect(config.pie.copyright).toBe("");
    expect(config.pie.titulo_informacion).toBe("Info");
    expect(config.pie.instagram_url).toBe("https://instagram.com/tienda");
    expect(config.pie.informacion).toEqual([
      { etiqueta: "Nosotros", url: "/nosotros" },
      { etiqueta: "Correo", url: "mailto:hola@tienda.com" },
    ]);
    expect(config.pie.ayuda).toEqual([]);
  });

  it("si el pie guardado trae basura usa defaults y filtra filas inválidas", () => {
    const config = combinarDiseno({
      pie: { informacion: "no-es-array", ayuda: [null, 42, { etiqueta: "X" }] },
    });
    expect(config.pie.informacion).toEqual(ENLACES_INFORMACION_DEFECTO);
    expect(config.pie.ayuda).toEqual([{ etiqueta: "X", url: "" }]);
  });
});

describe("enlaces del pie", () => {
  it("acepta rutas internas, http(s), mailto y tel; rechaza el resto", () => {
    expect(esUrlPieValida("/nosotros")).toBe(true);
    expect(esUrlPieValida("/categoriaProductos?slug=nike")).toBe(true);
    expect(esUrlPieValida("https://wa.me/573001234567")).toBe(true);
    expect(esUrlPieValida("mailto:hola@tienda.com")).toBe(true);
    expect(esUrlPieValida("tel:+573001234567")).toBe(true);
    expect(esUrlPieValida("")).toBe(false);
    expect(esUrlPieValida("   ")).toBe(false);
    expect(esUrlPieValida("#")).toBe(false);
    expect(esUrlPieValida("//evil.com")).toBe(false);
    expect(esUrlPieValida("javascript:alert(1)")).toBe(false);
  });

  it("normaliza desde JSON y desde array, recorta y limita cantidad", () => {
    const desdeJson = normalizarEnlacesPie(
      JSON.stringify([
        { etiqueta: "  Uno  ", url: " /uno " },
        { etiqueta: "", url: "" },
        { etiqueta: "Dos", url: "https://dos.com" },
      ]),
    );
    expect(desdeJson).toEqual([
      { etiqueta: "Uno", url: "/uno" },
      { etiqueta: "Dos", url: "https://dos.com" },
    ]);

    const muchos = Array.from({ length: MAX_ENLACES_PIE + 5 }, (_, i) => ({
      etiqueta: `E${i}`,
      url: `/e${i}`,
    }));
    expect(normalizarEnlacesPie(muchos)).toHaveLength(MAX_ENLACES_PIE);
    expect(normalizarEnlacesPie("no-json")).toEqual([]);
    expect(normalizarEnlacesPie({})).toEqual([]);
  });

  it("un enlace solo es visible si tiene etiqueta y URL válida", () => {
    expect(esEnlacePieVisible({ etiqueta: "Uno", url: "/uno" })).toBe(true);
    expect(esEnlacePieVisible({ etiqueta: "Uno", url: "" })).toBe(false);
    expect(esEnlacePieVisible({ etiqueta: "", url: "/uno" })).toBe(false);
    expect(esEnlacePieVisible({ etiqueta: "X", url: "#" })).toBe(false);
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
