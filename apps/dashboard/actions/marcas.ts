"use server";
import { cookies } from "next/headers";
import { createServerClient } from "@insforge/sdk/ssr";
import { revalidatePath } from "next/cache";
import { borrarArchivoStorage, resolverImagen, texto } from "@/lib/imagenes";
import { generarSlugUnico } from "@/lib/slug";
import { requireAuth } from "./tienda";
import type { CategoriaAdmin, MarcaAdmin } from "@/types/database";
import type { GuardadoResultado } from "@/types/components";

const booleano = (fd: FormData, key: string) => fd.get(key) === "true";

/**
 * Invalida la caché de la tienda (aplicación Next.js separada en otro puerto).
 * Las funciones `unstable_cache` de la tienda usan tags como "marcas", "categorias", etc.
 * y no se invalidan con `revalidateTag()` del dashboard porque son apps independientes.
 */
async function invalidarCacheTienda(tags: string[], tiendaId?: string): Promise<void> {
  const storeUrl = process.env.NEXT_PUBLIC_TIENDA_URL ?? "http://localhost:3000";
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) return;
  try {
    await fetch(`${storeUrl}/api/revalidate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-revalidate-secret": secret,
      },
      body: JSON.stringify({ tags, tienda_id: tiendaId }),
    });
  } catch (error) {
    console.error("No se pudo invalidar caché de la tienda:", error);
  }
}

function errorInesperado(err: unknown, mensaje: string): GuardadoResultado {
  return { ok: false, error: err instanceof Error ? err.message : mensaje };
}

// ---------- listados (activas e inactivas, solo de SU tienda) ----------

export async function listarMarcas(): Promise<MarcaAdmin[]> {
  const { tienda } = await requireAuth();
  const insforge = createServerClient({ cookies: await cookies() });
  let query = insforge.database
    .from("marcas")
    .select("id, nombre, logo_url, logo_key, activa, created_at")
    .is("eliminado_en", null)
    .order("created_at", { ascending: false });
  if (tienda?.id) {
    query = query.eq("tienda_id", tienda.id);
  }
  const { data } = await query;
  return (data ?? []) as MarcaAdmin[];
}

export async function listarCategorias(): Promise<CategoriaAdmin[]> {
  const { tienda } = await requireAuth();
  const insforge = createServerClient({ cookies: await cookies() });
  let query = insforge.database
    .from("categorias")
    .select("id, nombre, slug, imagen_url, imagen_key, activa, created_at")
    .is("eliminado_en", null)
    .order("created_at", { ascending: false });
  if (tienda?.id) {
    query = query.eq("tienda_id", tienda.id);
  }
  const { data } = await query;
  return (data ?? []) as CategoriaAdmin[];
}

// ---------- guardar (crear / actualizar) ----------

export async function guardarMarca(formData: FormData): Promise<GuardadoResultado> {
  try {
    const { tienda, error: authError } = await requireAuth();
    if (!tienda) {
      return { ok: false, error: authError ?? "No autorizado. Inicia sesión." };
    }
    const server = createServerClient({ cookies: await cookies() });
    const nombre = texto(formData, "mk-nombre");
    if (!nombre) {
      return { ok: false, error: "El nombre de la marca es obligatorio" };
    }

    const imagen = resolverImagen(formData, "mk");
    const activa = booleano(formData, "activa");
    const id = texto(formData, "id");

    if (id) {
      const { data: propia } = await server.database
        .from("marcas")
        .select("id")
        .eq("id", id)
        .eq("tienda_id", tienda.id)
        .maybeSingle();
      if (!propia) {
        return { ok: false, error: "Marca no encontrada o no pertenece a tu tienda" };
      }
      const { error } = await server.database
        .from("marcas")
        .update({
          nombre,
          activa,
          logo_url: imagen.imagen_url,
          logo_key: imagen.imagen_key,
        })
        .eq("id", id)
        .select();

      if (error) {
        return { ok: false, error: `No se pudo actualizar la marca: ${error.message}` };
      }

      revalidatePath("/marcas");
      revalidatePath("/productos");
      await invalidarCacheTienda(["marcas", "productos"], tienda.id);
      if (imagen.claveAnterior && imagen.claveAnterior !== imagen.imagen_key) {
        await borrarArchivoStorage(imagen.claveAnterior);
      }
      return { ok: true };
    }

    const { error } = await server.database.from("marcas").insert([
      {
        tienda_id: tienda.id,
        nombre,
        activa,
        logo_url: imagen.imagen_url,
        logo_key: imagen.imagen_key,
      },
    ]);

    if (error) {
      return { ok: false, error: `No se pudo crear la marca: ${error.message}` };
    }

    revalidatePath("/marcas");
    revalidatePath("/productos");
    await invalidarCacheTienda(["marcas", "productos"], tienda.id);
    return { ok: true };
  } catch (err) {
    return errorInesperado(err, "No se pudo guardar la marca");
  }
}

export async function guardarCategoria(formData: FormData): Promise<GuardadoResultado> {
  try {
    const { tienda, error: authError } = await requireAuth();
    if (!tienda) {
      return { ok: false, error: authError ?? "No autorizado. Inicia sesión." };
    }
    const server = createServerClient({ cookies: await cookies() });
    const nombre = texto(formData, "ck-nombre");
    if (!nombre) {
      return { ok: false, error: "El nombre de la categoría es obligatorio" };
    }

    const imagen = resolverImagen(formData, "ck");
    const activa = booleano(formData, "activa");
    const id = texto(formData, "id");

    if (id) {
      const { data: propia } = await server.database
        .from("categorias")
        .select("id")
        .eq("id", id)
        .eq("tienda_id", tienda.id)
        .maybeSingle();
      if (!propia) {
        return { ok: false, error: "Categoría no encontrada o no pertenece a tu tienda" };
      }
      const { error } = await server.database
        .from("categorias")
        .update({
          nombre,
          activa,
          imagen_url: imagen.imagen_url,
          imagen_key: imagen.imagen_key,
        })
        .eq("id", id)
        .select();

      if (error) {
        return { ok: false, error: `No se pudo actualizar la categoría: ${error.message}` };
      }

      revalidatePath("/marcas");
      revalidatePath("/productos");
      await invalidarCacheTienda(["categorias", "productos"], tienda.id);
      if (imagen.claveAnterior && imagen.claveAnterior !== imagen.imagen_key) {
        await borrarArchivoStorage(imagen.claveAnterior);
      }
      return { ok: true };
    }

    const slug = await generarSlugUnico("categorias", nombre, "categoria");
    const { error } = await server.database.from("categorias").insert([
      {
        tienda_id: tienda.id,
        nombre,
        slug,
        activa,
        imagen_url: imagen.imagen_url,
        imagen_key: imagen.imagen_key,
      },
    ]);

    if (error) {
      return { ok: false, error: `No se pudo crear la categoría: ${error.message}` };
    }

    revalidatePath("/marcas");
    revalidatePath("/productos");
    await invalidarCacheTienda(["categorias", "productos"], tienda.id);
    return { ok: true };
  } catch (err) {
    return errorInesperado(err, "No se pudo guardar la categoría");
  }
}

// ---------- eliminar (bloquea si tiene productos) ----------

export async function eliminarMarca(id: string): Promise<GuardadoResultado> {
  try {
    const { tienda, error: authError } = await requireAuth();
    if (!tienda) {
      return { ok: false, error: authError ?? "No autorizado. Inicia sesión." };
    }
    const server = createServerClient({ cookies: await cookies() });
    const { count } = await server.database
      .from("productos")
      .select("id", { count: "exact", head: true })
      .eq("marca_id", id)
      .eq("tienda_id", tienda.id)
      .is("eliminado_en", null);
    const total = count ?? 0;
    if (total > 0) {
      return {
        ok: false,
        error: `No se puede eliminar: ${total} producto${total === 1 ? "" : "s"} usa${total === 1 ? "" : "n"} esta marca. Reasígnalos o elimínalos primero.`,
      };
    }

    const { data: fila } = await server.database
      .from("marcas")
      .select("id")
      .eq("id", id)
      .eq("tienda_id", tienda.id)
      .is("eliminado_en", null)
      .maybeSingle();

    if (!fila) {
      return { ok: false, error: "Marca no encontrada o no pertenece a tu tienda" };
    }

    const { error } = await server.database
      .from("marcas")
      .update({ eliminado_en: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      return { ok: false, error: `No se pudo eliminar la marca: ${error.message}` };
    }

    revalidatePath("/marcas");
    revalidatePath("/productos");
    await invalidarCacheTienda(["marcas", "productos"], tienda.id);
    return { ok: true };
  } catch (err) {
    return errorInesperado(err, "No se pudo eliminar la marca");
  }
}

export async function restaurarMarca(id: string): Promise<GuardadoResultado> {
  try {
    const { tienda, error: authError } = await requireAuth();
    if (!tienda) {
      return { ok: false, error: authError ?? "No autorizado. Inicia sesión." };
    }
    const server = createServerClient({ cookies: await cookies() });
    const { error } = await server.database
      .from("marcas")
      .update({ eliminado_en: null })
      .eq("id", id)
      .eq("tienda_id", tienda.id);

    if (error) {
      return { ok: false, error: `No se pudo restaurar la marca: ${error.message}` };
    }

    revalidatePath("/marcas");
    await invalidarCacheTienda(["marcas"], tienda.id);
    return { ok: true };
  } catch (err) {
    return errorInesperado(err, "No se pudo restaurar la marca");
  }
}

export async function eliminarCategoria(id: string): Promise<GuardadoResultado> {
  try {
    const { tienda, error: authError } = await requireAuth();
    if (!tienda) {
      return { ok: false, error: authError ?? "No autorizado. Inicia sesión." };
    }
    const server = createServerClient({ cookies: await cookies() });
    const { count } = await server.database
      .from("productos")
      .select("id", { count: "exact", head: true })
      .eq("categoria_id", id)
      .eq("tienda_id", tienda.id)
      .is("eliminado_en", null);
    const total = count ?? 0;
    if (total > 0) {
      return {
        ok: false,
        error: `No se puede eliminar: ${total} producto${total === 1 ? "" : "s"} usa${total === 1 ? "" : "n"} esta categoría. Reasígnalos o elimínalos primero.`,
      };
    }

    const { data: fila } = await server.database
      .from("categorias")
      .select("id")
      .eq("id", id)
      .eq("tienda_id", tienda.id)
      .is("eliminado_en", null)
      .maybeSingle();

    if (!fila) {
      return { ok: false, error: "Categoría no encontrada o no pertenece a tu tienda" };
    }

    const { error } = await server.database
      .from("categorias")
      .update({ eliminado_en: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      return { ok: false, error: `No se pudo eliminar la categoría: ${error.message}` };
    }

    revalidatePath("/marcas");
    revalidatePath("/productos");
    await invalidarCacheTienda(["categorias", "productos"], tienda.id);
    return { ok: true };
  } catch (err) {
    return errorInesperado(err, "No se pudo eliminar la categoría");
  }
}

export async function restaurarCategoria(id: string): Promise<GuardadoResultado> {
  try {
    const { tienda, error: authError } = await requireAuth();
    if (!tienda) {
      return { ok: false, error: authError ?? "No autorizado. Inicia sesión." };
    }
    const server = createServerClient({ cookies: await cookies() });
    const { error } = await server.database
      .from("categorias")
      .update({ eliminado_en: null })
      .eq("id", id)
      .eq("tienda_id", tienda.id);

    if (error) {
      return { ok: false, error: `No se pudo restaurar la categoría: ${error.message}` };
    }

    revalidatePath("/marcas");
    await invalidarCacheTienda(["categorias"], tienda.id);
    return { ok: true };
  } catch (err) {
    return errorInesperado(err, "No se pudo restaurar la categoría");
  }
}
