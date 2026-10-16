import type { ConfigDiseno, SeccionDiseno } from "@makced/db/diseno";
import type { ImagenEstado } from "@/types/components";

export const PREFIJOS_POR_SECCION: Record<SeccionDiseno, string[]> = {
  estilo: [],
  logo: ["lg"],
  banner: ["bn0", "bn1", "bn2"],
  promo: ["pr", "nl"],
  titulos: [],
  pie: [],
};

export function seccionDesde(config: ConfigDiseno, seccion: SeccionDiseno): Partial<ConfigDiseno> {
  switch (seccion) {
    case "estilo":
      return {
        color_secundario: config.color_secundario,
        radio: config.radio,
        tipografia: config.tipografia,
      };
    case "banner":
      return { banner: config.banner };
    case "promo":
      return { promo: config.promo, newsletter: config.newsletter };
    case "titulos":
      return { titulos: config.titulos };
    case "pie":
      return { pie: config.pie };
    case "logo":
      return {};
  }
}

function valorImagen(
  prefijo: string,
  imagenUrl: string | null,
  imagenKey: string | null,
  imagenes: Record<string, ImagenEstado>,
) {
  const estado = imagenes[prefijo];
  if (!estado) return [imagenUrl, imagenKey];
  if (estado.quitar) return [null, null];
  if (estado.archivo) {
    return [
      "archivo-pendiente",
      estado.archivo.name,
      estado.archivo.size,
      estado.archivo.lastModified,
      estado.archivo.type,
    ];
  }
  if (estado.modo === "archivo") return [imagenUrl, imagenKey];

  const url = estado.url.trim() || null;
  return [url, url === imagenUrl ? imagenKey : null];
}

export function snapshotSeccion(
  seccion: SeccionDiseno,
  configGuardada: ConfigDiseno,
  borrador: ConfigDiseno,
  colorPrincipal: string,
  imagenes: Record<string, ImagenEstado>,
  logoUrl: string | null,
): string {
  let valores: unknown;
  switch (seccion) {
    case "estilo":
      valores = [
        colorPrincipal,
        borrador.color_secundario,
        borrador.radio,
        borrador.tipografia,
      ];
      break;
    case "logo":
      valores = valorImagen("lg", logoUrl, configGuardada.logo_key, imagenes);
      break;
    case "banner":
      valores = borrador.banner.slides.map((slide, indice) => [
        slide.palabra,
        slide.parrafo,
        ...valorImagen(
          `bn${indice}`,
          configGuardada.banner.slides[indice]?.imagen ?? null,
          configGuardada.banner.slides[indice]?.imagen_key ?? null,
          imagenes,
        ),
      ]);
      break;
    case "promo":
      valores = [borrador.promo, borrador.newsletter].map((banner, indice) => {
        const prefijo = indice === 0 ? "pr" : "nl";
        const guardado = indice === 0 ? configGuardada.promo : configGuardada.newsletter;
        return [
          banner.titulo,
          banner.descripcion,
          banner.boton,
          banner.link,
          ...valorImagen(prefijo, guardado.imagen, guardado.imagen_key, imagenes),
        ];
      });
      break;
    case "titulos":
      valores = borrador.titulos;
      break;
    case "pie":
      valores = borrador.pie;
      break;
  }

  return JSON.stringify(valores);
}
