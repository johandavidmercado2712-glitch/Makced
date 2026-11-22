import { describe, expect, it } from "vitest";
import { combinarDiseno } from "@makced/db/diseno";
import type { ImagenEstado } from "@/types/components";
import { construirPayload } from "./useVistaPrevia";

const borrador = combinarDiseno({
  titulos: { categorias: "NOVEDADES", productos: "DESTACADOS" },
});

const estado = (
  parcial: Partial<ImagenEstado> & Pick<ImagenEstado, "modo">,
): ImagenEstado => ({ archivo: null, url: "", quitar: false, ...parcial });

const SIN_CAMBIOS: Record<string, ImagenEstado> = {};

describe("construirPayload", () => {
  it("pasa el borrador, el color y el logo tal cual", () => {
    const payload = construirPayload(borrador, "#7C53ED", SIN_CAMBIOS, "/logo.png");

    expect(payload.colorPrincipal).toBe("#7C53ED");
    expect(payload.logoUrl).toBe("/logo.png");
    expect(payload.config.titulos.categorias).toBe("NOVEDADES");
    expect(payload.config).toEqual(borrador);
  });

  it("aplica una imagen nueva elegida por URL en banner, promo y newsletter", () => {
    const imagenes: Record<string, ImagenEstado> = {
      bn0: estado({ modo: "url", url: "/nueva-0.png" }),
      bn2: estado({ modo: "url", url: "https://cdn.test/2.png" }),
      pr: estado({ modo: "url", url: "/promo-nueva.png" }),
      nl: estado({ modo: "url", url: "/news-nueva.png" }),
    };

    const payload = construirPayload(borrador, "#111111", SIN_CAMBIOS, null);
    expect(payload.config.banner.slides[0].imagen).toBe(
      borrador.banner.slides[0].imagen,
    );

    const conCambios = construirPayload(borrador, "#111111", imagenes, null);
    expect(conCambios.config.banner.slides[0].imagen).toBe("/nueva-0.png");
    expect(conCambios.config.banner.slides[1].imagen).toBe(
      borrador.banner.slides[1].imagen,
    );
    expect(conCambios.config.banner.slides[2].imagen).toBe(
      "https://cdn.test/2.png",
    );
    expect(conCambios.config.promo.imagen).toBe("/promo-nueva.png");
    expect(conCambios.config.newsletter.imagen).toBe("/news-nueva.png");
  });

  it("muestra la última guardada cuando la imagen está pendiente de subir", () => {
    const pendiente = construirPayload(
      borrador,
      "#111111",
      { bn0: estado({ modo: "archivo", archivo: new File([], "a.png") }) },
      null,
    );
    expect(pendiente.config.banner.slides[0].imagen).toBe(
      borrador.banner.slides[0].imagen,
    );

    const logoPendiente = construirPayload(
      borrador,
      "#111111",
      SIN_CAMBIOS,
      "/logo.png",
    );
    expect(logoPendiente.logoUrl).toBe("/logo.png");
  });

  it("vacía la imagen quitada (se guarda imagen_url null → cadena vacía)", () => {
    const payload = construirPayload(
      borrador,
      "#111111",
      {
        bn1: estado({ modo: "archivo", quitar: true }),
        pr: estado({ modo: "archivo", quitar: true }),
        lg: estado({ modo: "archivo", quitar: true }),
      },
      "/logo.png",
    );

    expect(payload.config.banner.slides[1].imagen).toBe("");
    expect(payload.config.promo.imagen).toBe("");
    expect(payload.logoUrl).toBeNull();
    // Los slides sin cambios conservan su imagen.
    expect(payload.config.banner.slides[0].imagen).toBe(
      borrador.banner.slides[0].imagen,
    );
  });

  it("nunca manda blob:/data: al servidor (no cargan en el iframe)", () => {
    const blob = "blob:http://localhost:3002/abc-123";
    const payload = construirPayload(
      borrador,
      "#111111",
      {
        bn0: estado({ modo: "url", url: blob }),
        lg: estado({ modo: "url", url: blob }),
      },
      "/logo.png",
    );

    expect(payload.config.banner.slides[0].imagen).toBe(
      borrador.banner.slides[0].imagen,
    );
    expect(payload.logoUrl).toBe("/logo.png");
  });

  it("ignora una URL de imagen vacía y conserva la guardada", () => {
    const payload = construirPayload(
      borrador,
      "#111111",
      { bn0: estado({ modo: "url", url: "   " }) },
      null,
    );
    expect(payload.config.banner.slides[0].imagen).toBe(
      borrador.banner.slides[0].imagen,
    );
  });

  it("no muta el borrador de entrada", () => {
    const original = JSON.stringify(borrador);
    construirPayload(
      borrador,
      "#111111",
      {
        bn0: estado({ modo: "url", url: "/x.png" }),
        lg: estado({ modo: "archivo", quitar: true }),
      },
      "/logo.png",
    );
    expect(JSON.stringify(borrador)).toBe(original);
  });
});
