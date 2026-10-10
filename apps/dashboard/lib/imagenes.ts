import { insforge } from "@/lib/insforge";
import type { ImagenEstado } from "@/types/components";

export const BUCKET_IMAGENES = "productos";
export const MAX_IMAGEN_MB = 5;
export const TIPOS_IMAGEN = ["image/jpeg", "image/png", "image/webp"];
export const PLACEHOLDER_IMAGEN_URL = "https://ejemplo.com/imagen.jpg";

export const texto = (fd: FormData, key: string): string | null => {
  const valor = String(fd.get(key) ?? "").trim();
  return valor === "" ? null : valor;
};

export async function borrarArchivoStorage(key: string): Promise<void> {
  try {
    await insforge.storage.from(BUCKET_IMAGENES).remove(key);
  } catch {
    // best-effort: el archivo huérfano no debe romper la operación
  }
}

export interface ResolucionImagen {
  imagen_url: string | null;
  imagen_key: string | null;
  claveAnterior: string | null;
}

/**
 * Resuelve qué imagen queda guardada según el estado enviado por el modal.
 * `prefijo` es el prefijo de los campos del form ("pm", "mk", "ck", ...).
 */
export const resolverImagen = (
  formData: FormData,
  prefijo: string,
): ResolucionImagen => {
  const actualUrl = texto(formData, `${prefijo}-imagen-actual-url`);
  const actualKey = texto(formData, `${prefijo}-imagen-actual-key`);
  const quitar = formData.get(`${prefijo}-imagen-quitar`) === "true";

  if (quitar) {
    return { imagen_url: null, imagen_key: null, claveAnterior: actualKey };
  }

  const nuevaUrl = texto(formData, `${prefijo}-imagen`);
  if (nuevaUrl === null) {
    return { imagen_url: null, imagen_key: null, claveAnterior: actualKey };
  }

  if (nuevaUrl === actualUrl) {
    // sin cambios de URL → conserva la key actual (aunque no venga del form)
    return { imagen_url: nuevaUrl, imagen_key: actualKey, claveAnterior: actualKey };
  }

  // URL nueva (upload recién hecho o URL pegada) → key solo si vino del upload
  return {
    imagen_url: nuevaUrl,
    imagen_key: texto(formData, `${prefijo}-imagen-key`),
    claveAnterior: actualKey,
  };
};

export const validarImagen = (file: File): string | null => {
  if (!TIPOS_IMAGEN.includes(file.type)) {
    return "Formato no válido. Usa JPG, PNG o WebP.";
  }
  if (file.size > MAX_IMAGEN_MB * 1024 * 1024) {
    return `La imagen supera ${MAX_IMAGEN_MB} MB.`;
  }
  return null;
};

/**
 * Completa los campos `${prefijo}-imagen*` del FormData según el estado del
 * selector: sube el archivo si lo hay (a `carpeta/` dentro del bucket) o
 * deja la URL pegada. Lanza Error con mensaje amigable ante fallos.
 */
export async function subirImagenEnForm(
  formData: FormData,
  prefijo: string,
  estado: ImagenEstado,
  carpeta: "productos" | "marcas" | "categorias" | "diseno",
): Promise<void> {
  const actualUrl = texto(formData, `${prefijo}-imagen-actual-url`);
  const actualKey = texto(formData, `${prefijo}-imagen-actual-key`);

  if (estado.quitar) {
    formData.set(`${prefijo}-imagen`, "");
    formData.set(`${prefijo}-imagen-key`, "");
    formData.set(`${prefijo}-imagen-quitar`, "true");
    return;
  }
  formData.delete(`${prefijo}-imagen-quitar`);

  if (estado.modo === "archivo") {
    formData.set(`${prefijo}-imagen-key`, actualKey ?? "");
    if (estado.archivo) {
      const fallo = validarImagen(estado.archivo);
      if (fallo) throw new Error(fallo);
      const ext =
        estado.archivo.name.match(/\.([a-z0-9]+)$/i)?.[1]?.toLowerCase() ?? "jpg";
      const key = `${carpeta}/${crypto.randomUUID()}.${ext}`;
      const { data, error } = await insforge.storage
        .from(BUCKET_IMAGENES)
        .upload(key, estado.archivo);
      if (error || !data) {
        throw new Error(error?.message ?? "No se pudo subir la imagen");
      }
      formData.set(`${prefijo}-imagen`, data.url);
      formData.set(`${prefijo}-imagen-key`, data.key);
    } else {
      formData.set(`${prefijo}-imagen`, actualUrl ?? "");
    }
    return;
  }

  formData.set(`${prefijo}-imagen`, estado.url.trim());
  formData.set(`${prefijo}-imagen-key`, "");
}
