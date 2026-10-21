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

export const MAX_ENLACES_PIE = 8;
export const MAX_ETIQUETA_PIE = 40;
export const MAX_URL_PIE = 200;

export const ENLACES_INFORMACION_DEFECTO: readonly EnlacePie[] = [
  { etiqueta: "Nosotros", url: "" },
  { etiqueta: "Términos y Condiciones", url: "" },
  { etiqueta: "Política de Privacidad", url: "" },
];

export const ENLACES_AYUDA_DEFECTO: readonly EnlacePie[] = [
  { etiqueta: "Contacto", url: "" },
  { etiqueta: "Envíos", url: "" },
  { etiqueta: "Métodos de Pago", url: "" },
];

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

export interface EnlacePie {
  etiqueta: string;
  url: string;
}

export interface PieConfig {
  marca: string;
  copyright: string;
  mensaje: string;
  titulo_informacion: string;
  titulo_ayuda: string;
  web_url: string;
  instagram_url: string;
  whatsapp_url: string;
  informacion: EnlacePie[];
  ayuda: EnlacePie[];
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
  pie: PieConfig;
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
    titulo_informacion: "INFORMACIÓN",
    titulo_ayuda: "AYUDA",
    web_url: "",
    instagram_url: "",
    whatsapp_url: "",
    informacion: ENLACES_INFORMACION_DEFECTO.map((enlace) => ({ ...enlace })),
    ayuda: ENLACES_AYUDA_DEFECTO.map((enlace) => ({ ...enlace })),
  },
  // por defecto se muestran los precios
  mostrar_precios: true,
};

function esObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}

/**
 * URLs permitidas en el pie: rutas internas, http(s), mailto y tel.
 * Se rechazan los enlaces vacíos (no se publican) y esquemas peligrosos.
 */
export function esUrlPieValida(url: string): boolean {
  const valor = url.trim();
  if (!valor) return false;
  if (valor.startsWith("/") && !valor.startsWith("//")) return true;
  if (/^https?:\/\/[^\s]+$/i.test(valor)) return true;
  if (/^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(valor)) return true;
  if (/^tel:\+?[0-9][0-9\s().-]{5,}$/i.test(valor)) return true;
  return false;
}

export function esEnlacePieVisible(enlace: EnlacePie): boolean {
  return enlace.etiqueta.trim().length > 0 && esUrlPieValida(enlace.url);
}

/**
 * Normaliza las filas del pie sin perder borradores: conserva filas con
 * etiqueta o URL a medio completar, recorta longitudes y limita la cantidad.
 */
export function normalizarEnlacesPie(valor: unknown): EnlacePie[] {
  let lista: unknown = valor;
  if (typeof valor === "string") {
    try {
      lista = JSON.parse(valor);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(lista)) return [];

  const salida: EnlacePie[] = [];
  for (const item of lista) {
    if (!esObjeto(item)) continue;
    const etiqueta = String(item.etiqueta ?? "")
      .trim()
      .slice(0, MAX_ETIQUETA_PIE);
    const url = String(item.url ?? "")
      .trim()
      .slice(0, MAX_URL_PIE);
    if (!etiqueta && !url) continue;
    salida.push({ etiqueta, url });
    if (salida.length >= MAX_ENLACES_PIE) break;
  }
  return salida;
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

function textoContraste(hex: string): string {
  let limpio = hex.slice(1);
  if (limpio.length === 3) {
    limpio = limpio
      .split("")
      .map((c) => c + c)
      .join("");
  }

  const canales = [0, 2, 4].map((inicio) => {
    const canal = parseInt(limpio.slice(inicio, inicio + 2), 16) / 255;
    return canal <= 0.04045 ? canal / 12.92 : ((canal + 0.055) / 1.055) ** 2.4;
  });
  const luminancia = 0.2126 * canales[0] + 0.7152 * canales[1] + 0.0722 * canales[2];

  return luminancia > 0.179 ? "#121212" : "#FFFFFF";
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

  const pieGuardado: Record<string, unknown> = esObjeto(combinado.pie)
    ? combinado.pie
    : {};
  const pieDefecto = DEFAULT_DISENO.pie;
  const textoPie = (valor: unknown, max: number, defecto: string): string => {
    if (typeof valor !== "string") return defecto;
    return valor.trim().slice(0, max);
  };
  const copiarEnlaces = (enlaces: readonly EnlacePie[]): EnlacePie[] =>
    enlaces.map((enlace) => ({ ...enlace }));

  combinado.pie = {
    marca:
      textoPie(pieGuardado.marca, 40, pieDefecto.marca) || pieDefecto.marca,
    copyright: textoPie(pieGuardado.copyright, 80, pieDefecto.copyright),
    mensaje: textoPie(pieGuardado.mensaje, 120, pieDefecto.mensaje),
    titulo_informacion: textoPie(
      pieGuardado.titulo_informacion,
      40,
      pieDefecto.titulo_informacion
    ),
    titulo_ayuda: textoPie(
      pieGuardado.titulo_ayuda,
      40,
      pieDefecto.titulo_ayuda
    ),
    web_url: textoPie(pieGuardado.web_url, MAX_URL_PIE, ""),
    instagram_url: textoPie(pieGuardado.instagram_url, MAX_URL_PIE, ""),
    whatsapp_url: textoPie(pieGuardado.whatsapp_url, MAX_URL_PIE, ""),
    informacion: Array.isArray(pieGuardado.informacion)
      ? normalizarEnlacesPie(pieGuardado.informacion)
      : copiarEnlaces(pieDefecto.informacion),
    ayuda: Array.isArray(pieGuardado.ayuda)
      ? normalizarEnlacesPie(pieGuardado.ayuda)
      : copiarEnlaces(pieDefecto.ayuda),
  };

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
    "--on-action": textoContraste(principal),
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
