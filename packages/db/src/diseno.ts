export type Tipografia = "Figtree" | "Poppins" | "Montserrat" | "Inter" | "Roboto";

export type SeccionDiseno =
  | "estilo"
  | "logo"
  | "banner"
  | "promo"
  | "titulos"
  | "pie";

export const TIPOGRAFIAS: readonly Tipografia[] = [
  "Figtree",
  "Poppins",
  "Montserrat",
  "Inter",
  "Roboto",
];

export const COLOR_PRINCIPAL_DEFECTO = "#4CE1AC";
export const COLOR_SECUNDARIO_DEFECTO = "#00E599";
export const RADIO_DEFECTO = 12;

export interface SlideConfig {
  palabra: string;
  parrafo: string;
  imagen: string;
  imagen_key: string | null;
}

export interface BannerPromoConfig {
  titulo: string;
  descripcion: string;
  imagen: string;
  imagen_key: string | null;
  boton: string;
  link: string;
}

export interface ConfigDiseno {
  color_secundario: string;
  radio: number;
  tipografia: Tipografia;
  logo_key: string | null;
  banner: { slides: SlideConfig[] };
  promo: BannerPromoConfig;
  newsletter: BannerPromoConfig;
  titulos: { categorias: string; productos: string };
  pie: { marca: string; copyright: string; mensaje: string };
  // Nueva opción: mostrar o ocultar precios en la tienda pública
  mostrar_precios?: boolean;
}

export const DEFAULT_DISENO: ConfigDiseno = {
  color_secundario: COLOR_SECUNDARIO_DEFECTO,
  radio: RADIO_DEFECTO,
  tipografia: "Figtree",
  logo_key: null,
  banner: {
    slides: [
      {
        palabra: "Innovador",
        parrafo:
          "Provident cupiditate voluptatem et in. Quaerat fugiat ut assumenda excepturi exercitationem quasi.",
        imagen: "/1-carousel.png",
        imagen_key: null,
      },
      {
        palabra: "Tendencia",
        parrafo:
          "In deleniti eaque aut repudiandae et a id nisi. Lorem ipsum dolor sit amet consectetur.",
        imagen: "/2-carousel.png",
        imagen_key: null,
      },
      {
        palabra: "Diseño",
        parrafo:
          "Temporibus quos facere necessitatibus molestias voluptatibus natus. Sed ut perspiciatis unde omnis.",
        imagen: "/3-carousel.png",
        imagen_key: null,
      },
    ],
  },
  promo: {
    titulo: "Nueva Colección 2026",
    descripcion:
      "Descubre las últimas tendencias en calzado deportivo. Diseños exclusivos que combinan estilo urbano con máximo confort para tu día a día.",
    imagen: "/info-coleccion.jpg",
    imagen_key: null,
    boton: "Ver Colección",
    link: "#",
  },
  newsletter: {
    titulo: "MANTENTE INFORMADO",
    descripcion:
      "Suscríbete para recibir ofertas exclusivas, lanzamientos anticipados y descuentos especiales directamente en tu correo.",
    imagen: "/informacion.jpg",
    imagen_key: null,
    boton: "Suscribirse",
    link: "#",
  },
  titulos: {
    categorias: "CATEGORIAS",
    productos: "PRODUCTOS",
  },
  pie: {
    marca: "MAKCED",
    copyright: "Todos los derechos reservados.",
    mensaje: "Hecho con 💚 para los amantes del calzado.",
  },
  // por defecto se muestran los precios
  mostrar_precios: true,
};

function esObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}

function mergeProfundo(
  base: Record<string, unknown>,
  extra: Record<string, unknown>
): Record<string, unknown> {
  const salida: Record<string, unknown> = { ...base };
  for (const [clave, valor] of Object.entries(extra)) {
    if (valor === undefined) continue;
    const actual = salida[clave];
    if (esObjeto(valor) && esObjeto(actual)) {
      salida[clave] = mergeProfundo(actual, valor);
    } else {
      salida[clave] = valor;
    }
  }
  return salida;
}

function hexValido(valor: unknown): valor is string {
  return typeof valor === "string" && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(valor);
}

function normalizarHex(valor: unknown, defecto: string): string {
  return hexValido(valor) ? valor : defecto;
}

function hexARgba(hex: string, alfa: number): string {
  let limpio = hex.slice(1);
  if (limpio.length === 3) {
    limpio = limpio
      .split("")
      .map((c) => c + c)
      .join("");
  }
  const r = parseInt(limpio.slice(0, 2), 16);
  const g = parseInt(limpio.slice(2, 4), 16);
  const b = parseInt(limpio.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alfa})`;
}

/**
 * Combina el config guardado en la DB con los defaults.
 * DB vacía ({}) => defaults completos; campos futuros ausentes => default.
 */
export function combinarDiseno(guardado: unknown): ConfigDiseno {
  const base = DEFAULT_DISENO as unknown as Record<string, unknown>;
  const extra = esObjeto(guardado) ? guardado : {};
  const combinado = mergeProfundo(base, extra) as unknown as ConfigDiseno;

  const slidesGuardados = Array.isArray(combinado.banner?.slides)
    ? combinado.banner.slides
    : [];
  combinado.banner = {
    ...DEFAULT_DISENO.banner,
    slides: DEFAULT_DISENO.banner.slides.map((defecto, i) => {
      const guardadoSlide = slidesGuardados[i];
      return esObjeto(guardadoSlide)
        ? { ...defecto, ...guardadoSlide }
        : defecto;
    }),
  };

  const radio = Number(combinado.radio);
  combinado.radio = Number.isFinite(radio)
    ? Math.min(24, Math.max(0, Math.round(radio)))
    : RADIO_DEFECTO;

  if (!TIPOGRAFIAS.includes(combinado.tipografia)) {
    combinado.tipografia = DEFAULT_DISENO.tipografia;
  }

  combinado.color_secundario = normalizarHex(
    combinado.color_secundario,
    COLOR_SECUNDARIO_DEFECTO
  );

  return combinado;
}

/**
 * Mapea config -> variables CSS que la tienda inyecta en <html>
 * (y que el dashboard usa para la vista previa en vivo).
 * Con los defaults reproduces exactamente los valores actuales de globals.css.
 */
export function varsDesdeConfig(
  colorPrincipal: string,
  config: ConfigDiseno
): Record<string, string> {
  const principal = normalizarHex(colorPrincipal, COLOR_PRINCIPAL_DEFECTO);
  const radio = Number.isFinite(Number(config.radio))
    ? Math.min(24, Math.max(0, Math.round(Number(config.radio))))
    : RADIO_DEFECTO;

  const vars: Record<string, string> = {
    "--primary-mint": principal,
    "--primary-turquoise": normalizarHex(
      config.color_secundario,
      COLOR_SECUNDARIO_DEFECTO
    ),
    "--radius-md": `${radio}px`,
    "--radius-sm": `${Math.round((radio * 8) / 12)}px`,
    "--radius-lg": `${Math.round((radio * 5) / 12)}px`,
    "--shadow-glow-mint": `0 8px 20px ${hexARgba(principal, 0.35)}`,
  };

  if (config.tipografia !== "Figtree") {
    vars["--font-figtree"] = config.tipografia;
  }

  return vars;
}
