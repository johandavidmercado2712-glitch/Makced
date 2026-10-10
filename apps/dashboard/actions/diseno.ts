"use server";
import { cookies } from "next/headers";
import { createServerClient } from "@insforge/sdk/ssr";
import { revalidatePath } from "next/cache";
import { borrarArchivoStorage, resolverImagen } from "@/lib/imagenes";
import { requireTiendaDelUsuario } from "./tienda";
import {
  COLOR_PRINCIPAL_DEFECTO,
  TIPOGRAFIAS,
  combinarDiseno,
  type ConfigDiseno,
  type SeccionDiseno,
  type Tipografia,
} from "@makced/db/diseno";
import type { GuardadoResultado } from "@/types/components";

const HEX = /^#[0-9a-fA-F]{6}$/;

const esClavePropia = (clave: string | null | undefined): clave is string =>
  Boolean(clave && clave.startsWith("diseno/"));

async function limpiarClaves(claves: (string | null | undefined)[]): Promise<void> {
  // Borrados independientes → en paralelo. borrarArchivoStorage es
  // best-effort (nunca rechaza), así que un fallo no afecta a los demás.
  await Promise.all(
    claves.filter(esClavePropia).map((clave) => borrarArchivoStorage(clave)),
  );
}

function errorInesperado(err: unknown, mensaje: string): GuardadoResultado {
  return { ok: false, error: err instanceof Error ? err.message : mensaje };
}

/**
 * Lee la imagen de una sección. Si el form no trae el campo (selector no
 * montado), conserva la imagen guardada en vez de borrarla.
 */
function leerImagen(
  formData: FormData,
  prefijo: string,
  guardada: { imagen: string; imagen_key: string | null },
): { imagen: string; imagen_key: string | null } {
  if (!formData.has(`${prefijo}-imagen`) && !formData.has(`${prefijo}-imagen-quitar`)) {
    return guardada;
  }
  const res = resolverImagen(formData, prefijo);
  return { imagen: res.imagen_url ?? "", imagen_key: res.imagen_key };
}

/**
 * Guarda UNA sección del diseño en la tienda activa (misma fila que lee la
 * store vía getConfigDiseno). El tienda_id NUNCA viene del cliente: sale de
 * getTienda(). Read-modify-write del jsonb para no tocar las otras secciones.
 */
export async function guardarDiseno(
  seccion: SeccionDiseno,
  formData: FormData,
): Promise<GuardadoResultado> {
  try {
    const { tienda, error: authError } = await requireTiendaDelUsuario();
    if (!tienda) {
      return { ok: false, error: authError ?? "No autorizado. Inicia sesión." };
    }

    const actual = combinarDiseno(tienda.diseno);
    const columna: Record<string, unknown> = {};
    let cambios: Partial<ConfigDiseno> = {};
    const clavesReemplazadas: (string | null | undefined)[] = [];

    switch (seccion) {
      case "estilo": {
        const principal = String(formData.get("color_principal") ?? "").trim();
        const secundario = String(formData.get("color_secundario") ?? "").trim();
        const radio = Math.round(Number(formData.get("radio")));
        const tipografia = String(formData.get("tipografia") ?? "");
        if (!HEX.test(principal)) {
          return { ok: false, error: "El color principal no es válido (formato #AABBCC)" };
        }
        if (!HEX.test(secundario)) {
          return { ok: false, error: "El color secundario no es válido (formato #AABBCC)" };
        }
        if (!Number.isFinite(radio) || radio < 0 || radio > 24) {
          return { ok: false, error: "El redondeo de esquinas debe estar entre 0 y 24 px" };
        }
        if (!TIPOGRAFIAS.includes(tipografia as Tipografia)) {
          return { ok: false, error: "La tipografía seleccionada no es válida" };
        }
        columna.color_principal = principal;
        cambios = {
          color_secundario: secundario,
          radio,
          tipografia: tipografia as Tipografia,
        };
        break;
      }

      case "logo": {
        if (formData.has("lg-imagen") || formData.has("lg-imagen-quitar")) {
          const imagen = resolverImagen(formData, "lg");
          if (imagen.imagen_url !== (tienda.logo_url ?? null)) {
            clavesReemplazadas.push(actual.logo_key);
          }
          columna.logo_url = imagen.imagen_url;
          cambios = { logo_key: imagen.imagen_key };
        }
        break;
      }

      case "banner": {
        const slides = [0, 1, 2].map((i) => {
          const palabra = String(formData.get(`bn${i}-palabra`) ?? "").trim();
          const parrafo = String(formData.get(`bn${i}-parrafo`) ?? "").trim();
          const anterior = actual.banner.slides[i];
          const imagen = leerImagen(formData, `bn${i}`, {
            imagen: anterior.imagen,
            imagen_key: anterior.imagen_key,
          });
          return { palabra, parrafo, imagen: imagen.imagen, imagen_key: imagen.imagen_key };
        });
        if (slides.some((s) => !s.palabra)) {
          return { ok: false, error: "Cada slide del banner necesita una palabra" };
        }
        slides.forEach((slide, i) => {
          const anterior = actual.banner.slides[i];
          if (slide.imagen !== anterior.imagen) {
            clavesReemplazadas.push(anterior.imagen_key);
          }
        });
        cambios = { banner: { slides } };
        break;
      }

      case "promo": {
        const leer = (campo: "promo" | "newsletter", prefijo: string) => {
          const titulo = String(formData.get(`${campo}-titulo`) ?? "").trim();
          const descripcion = String(formData.get(`${campo}-descripcion`) ?? "").trim();
          const boton = String(formData.get(`${campo}-boton`) ?? "").trim();
          const link = String(formData.get(`${campo}-link`) ?? "").trim() || "#";
          const anterior = campo === "promo" ? actual.promo : actual.newsletter;
          const imagen = leerImagen(formData, prefijo, {
            imagen: anterior.imagen,
            imagen_key: anterior.imagen_key,
          });
          return {
            titulo,
            descripcion,
            boton,
            link,
            imagen: imagen.imagen,
            imagen_key: imagen.imagen_key,
          };
        };
        const promo = leer("promo", "pr");
        const newsletter = leer("newsletter", "nl");
        if (!promo.titulo || !promo.boton) {
          return { ok: false, error: "El banner promocional necesita título y texto de botón" };
        }
        if (!newsletter.titulo || !newsletter.boton) {
          return { ok: false, error: "El banner de newsletter necesita título y texto de botón" };
        }
        if (promo.imagen !== actual.promo.imagen) {
          clavesReemplazadas.push(actual.promo.imagen_key);
        }
        if (newsletter.imagen !== actual.newsletter.imagen) {
          clavesReemplazadas.push(actual.newsletter.imagen_key);
        }
        cambios = { promo, newsletter };
        break;
      }

      case "titulos": {
        const categorias = String(formData.get("titulo-categorias") ?? "").trim();
        const productos = String(formData.get("titulo-productos") ?? "").trim();
        if (!categorias || !productos) {
          return { ok: false, error: "Los dos títulos de sección son obligatorios" };
        }
        cambios = { titulos: { categorias, productos } };
        break;
      }

      case "pie": {
        const marca = String(formData.get("pie-marca") ?? "").trim();
        const copyright = String(formData.get("pie-copyright") ?? "").trim();
        const mensaje = String(formData.get("pie-mensaje") ?? "").trim();
        if (!marca) {
          return { ok: false, error: "El nombre de marca del pie es obligatorio" };
        }
        cambios = { pie: { marca, copyright, mensaje } };
        break;
      }
    }

    const diseno = { ...actual, ...cambios };
    const insforge = createServerClient({ cookies: await cookies() });
    const { error } = await insforge.database
      .from("tiendas")
      .update({ ...columna, diseno })
      .eq("id", tienda.id);

    if (error) {
      return { ok: false, error: `No se pudieron guardar los cambios: ${error.message}` };
    }

    revalidatePath("/", "layout");
    await limpiarClaves(clavesReemplazadas);
    return { ok: true };
  } catch (err) {
    return errorInesperado(err, "No se pudieron guardar los cambios");
  }
}

/**
 * Restaura el diseño original: diseno = {} (defaults del código),
 * color_principal al valor de la DB y logo quitado. Borra los archivos
 * subidos (keys propias de diseno/) que queden huérfanos.
 */
export async function restaurarDiseno(): Promise<GuardadoResultado> {
  try {
    const { tienda, error: authError } = await requireTiendaDelUsuario();
    if (!tienda) {
      return { ok: false, error: authError ?? "No autorizado. Inicia sesión." };
    }

    const actual = combinarDiseno(tienda.diseno);
    const insforge = createServerClient({ cookies: await cookies() });
    const { error } = await insforge.database
      .from("tiendas")
      .update({
        color_principal: COLOR_PRINCIPAL_DEFECTO,
        logo_url: null,
        diseno: {},
      })
      .eq("id", tienda.id);

    if (error) {
      return { ok: false, error: `No se pudo restaurar el diseño: ${error.message}` };
    }

    revalidatePath("/", "layout");
    await limpiarClaves([
      actual.logo_key,
      ...actual.banner.slides.map((s) => s.imagen_key),
      actual.promo.imagen_key,
      actual.newsletter.imagen_key,
    ]);
    return { ok: true };
  } catch (err) {
    return errorInesperado(err, "No se pudo restaurar el diseño");
  }
}
