import type { ConfigDiseno } from "@makced/db/diseno";
import type { ImagenEstado } from "@/types/components";
import { URL_TIENDA, urlImagen } from "@/lib/imagenes";

export { URL_TIENDA, urlImagen };

export const HEX = /^#[0-9a-fA-F]{6}$/;

export const PALETAS = [
  { nombre: "Turquesa", principal: "#4CE1AC", secundario: "#00E599" },
  { nombre: "Violeta", principal: "#7C53ED", secundario: "#A78BFA" },
  { nombre: "Naranja", principal: "#F97316", secundario: "#FDBA74" },
  { nombre: "Rosa", principal: "#EC4899", secundario: "#F9A8D4" },
  { nombre: "Azul", principal: "#3B82F6", secundario: "#93C5FD" },
  { nombre: "Rojo", principal: "#EF4444", secundario: "#FCA5A5" },
  { nombre: "Verde", principal: "#22C55E", secundario: "#86EFAC" },
  { nombre: "Grafito", principal: "#6B7280", secundario: "#CBD5E1" },
];

// Slides del banner: slots fijos (siempre 3, editados in-place). Cada uno
// tiene una key estable por posición — NO se usa el índice de iteración como
// key (rompe al editar si se usa contenido, y react-doctor lo marca).
export const SLIDES_BANNER = [
  { slideKey: "slide-0", pos: 0 },
  { slideKey: "slide-1", pos: 1 },
  { slideKey: "slide-2", pos: 2 },
] as const;

export const imagenVista = (
  imagenes: Record<string, ImagenEstado>,
  prefijo: string,
  guardada: string | null,
): string | null => {
  const est = imagenes[prefijo];
  if (!est) return guardada;
  if (est.quitar) return null;
  if (est.modo === "url") return est.url.trim() || guardada;
  return guardada;
};

/** Estado y setters compartidos por todos los paneles de formulario y preview. */
export interface EditorDisenoApi {
  config: ConfigDiseno;
  borrador: ConfigDiseno;
  colorP: string;
  imagenes: Record<string, ImagenEstado>;
  logoUrl: string | null;
  version: number;
  setColorP: (color: string) => void;
  marcarCambio: () => void;
  setCampo: <K extends keyof ConfigDiseno>(clave: K, valor: ConfigDiseno[K]) => void;
  setTitulos: (campo: "categorias" | "productos", valor: string) => void;
  setPie: (campo: "marca" | "copyright" | "mensaje", valor: string) => void;
  setSlide: (indice: number, campo: "palabra" | "parrafo", valor: string) => void;
  setBanner: (
    seccion: "promo" | "newsletter",
    campo: "titulo" | "descripcion" | "boton" | "link",
    valor: string,
  ) => void;
  notificarImagen: (prefijo: string, estado: ImagenEstado) => void;
  setError: (mensaje: string | null) => void;
}
