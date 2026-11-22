import { insforge } from "../../lib/insforge";
import { fetchWithRetry } from "../../lib/fetch-utils";
import { unstable_cache } from "next/cache";
import { COLOR_PRINCIPAL_DEFECTO, combinarDiseno } from "@makced/db/diseno";
import { leerPrevia } from "../../lib/preview";
import { configDesdeToken } from "../../lib/preview-config";

function logError(accion: string, error: unknown) {
  // PGRST116 = .single() sin filas: es un caso esperado (sin tienda activa).
  if ((error as { code?: string } | null)?.code === "PGRST116") return;
  console.error(`[store] ${accion}:`, error);
}

export const getCategorias = unstable_cache(
  async (tiendaId?: string | null) => {
    // Fail-closed: sin tienda resuelta no se devuelve NADA (nunca catálogo global).
    if (!tiendaId) return [];
    try {
    const { data, error } = await fetchWithRetry(
      async () => {
        let q = insforge.database
          .from("categorias")
          .select("id, nombre, slug, imagen_url")
          .eq("activa", true);
        q = q.eq("tienda_id", tiendaId);
        const result = await q;
        return result;
      },
      { timeout: 10000, retries: 2 }
    );

    if (error) {
      logError("getCategorias", error);
      return [];
    }
    return data || [];
  } catch (err) {
    logError("getCategorias", err);
    return [];
  }
  },
  ["categorias"],
  { revalidate: 300, tags: ["categorias"] }
);

export const getMarcas = unstable_cache(
  async (tiendaId?: string | null) => {
    // Fail-closed: sin tienda resuelta no se devuelve NADA.
    if (!tiendaId) return [];
    try {
    const { data, error } = await fetchWithRetry(
      async () => {
        let q = insforge.database
          .from("marcas")
          .select("id, nombre, logo_url, imagen_url")
          .eq("activa", true);
        q = q.eq("tienda_id", tiendaId);
        const result = await q;
        return result;
      },
      { timeout: 10000, retries: 2 }
    );

    if (error) {
      logError("getMarcas", error);
      return [];
    }
    return data || [];
  } catch (err) {
    logError("getMarcas", err);
    return [];
  }
  },
  ["marcas"],
  { revalidate: 300, tags: ["marcas"] }
);

export async function getCategoriaPorSlug(slug: string, tiendaId?: string | null) {
  // Fail-closed: sin tienda resuelta no se devuelve NADA.
  if (!tiendaId) return null;
  try {
    const { data, error } = await fetchWithRetry(
      async () => {
        let q = insforge.database
          .from("categorias")
          .select("nombre, slug")
          .eq("slug", slug)
          .eq("activa", true);
        q = q.eq("tienda_id", tiendaId);
        const result = await q.maybeSingle();
        return result;
      },
      { timeout: 10000, retries: 2 }
    );

    if (error) {
      logError("getCategoriaPorSlug", error);
      return null;
    }
    return data as { nombre: string; slug: string } | null;
  } catch (err) {
    logError("getCategoriaPorSlug", err);
    return null;
  }
}

export async function getMarcaPorNombre(nombre: string, tiendaId?: string | null) {
  // Fail-closed: sin tienda resuelta no se devuelve NADA.
  if (!tiendaId) return null;
  try {
    const { data, error } = await fetchWithRetry(
      async () => {
        let q = insforge.database
          .from("marcas")
          .select("nombre")
          .eq("nombre", nombre)
          .eq("activa", true);
        q = q.eq("tienda_id", tiendaId);
        const result = await q.maybeSingle();
        return result;
      },
      { timeout: 10000, retries: 2 }
    );

    if (error) {
      logError("getMarcaPorNombre", error);
      return null;
    }
    return data as { nombre: string } | null;
  } catch (err) {
    logError("getMarcaPorNombre", err);
    return null;
  }
}

export const getNavCategorias = unstable_cache(
  async (tiendaId?: string | null) => {
    // Fail-closed: sin tienda resuelta no se devuelve NADA.
    if (!tiendaId) return [];
    try {
      const { data, error } = await fetchWithRetry(
        async () => {
          let q = insforge.database
            .from("categorias")
            .select("id, nombre, slug")
            .eq("activa", true)
            .limit(3);
          q = q.eq("tienda_id", tiendaId);
          const result = await q;
          return result;
        },
        { timeout: 10000, retries: 2 }
      );

      if (error) {
        logError("getNavCategorias", error);
        return [];
      }
      return data || [];
    } catch (err) {
      logError("getNavCategorias", err);
      return [];
    }
  },
  ["nav-categorias"],
  { revalidate: 300, tags: ["categorias"] }
);

// Config de diseño GUARDADO (cacheado). No leer aquí el token de vista previa:
// `unstable_cache` no puede llamar a `headers()` y, además, el snapshot del
// preview no debe poblar la caché compartida de la tienda pública.
export const getConfigDisenoGuardado = unstable_cache(
  async (subdominio?: string) => {
    try {
    const { data, error } = await fetchWithRetry(
      async () => {
        let q = insforge.database
          .from("tiendas")
          .select("id, color_principal, logo_url, diseno");
        if (subdominio) {
          q = q.eq("subdominio", subdominio).eq("activa", true);
        } else {
          q = q.eq("activa", true);
        }
        const result = await q.maybeSingle();
        return result;
      },
      { timeout: 10000, retries: 2 }
    );

    if (error || !data) {
      // Sin tienda activa la web pública NO se cae: renderiza con defaults.
      return {
        id: null as string | null,
        colorPrincipal: COLOR_PRINCIPAL_DEFECTO,
        logoUrl: null as string | null,
        config: combinarDiseno(null),
      };
    }

    return {
      id: data.id as string,
      colorPrincipal: data.color_principal || COLOR_PRINCIPAL_DEFECTO,
      logoUrl: data.logo_url as string | null,
      config: combinarDiseno(data.diseno),
    };
  } catch (err) {
    logError("getConfigDiseno", err);
    // Fallback a defaults en caso de error
    return {
      id: null as string | null,
      colorPrincipal: COLOR_PRINCIPAL_DEFECTO,
      logoUrl: null as string | null,
      config: combinarDiseno(null),
    };
  }
  },
  ["config-diseno"],
  { revalidate: 300, tags: ["tiendas", "diseno"] }
);

export interface ConfigDisenoResultado {
  id: string | null;
  colorPrincipal: string;
  logoUrl: string | null;
  config: ReturnType<typeof combinarDiseno>;
  esPreview: boolean;
}

/**
 * Config de diseño que ve el visitante en ESTA request.
 *
 * Si la request trae un token de vista previa válido (firmado por el
 * dashboard, sin expirar y del mismo tenant), se devuelve el snapshot del
 * borrador: así el iframe del editor muestra los cambios sin guardar.
 * Si no, se devuelve el diseño guardado (cacheado).
 *
 * Ojo: esta función usa `headers()`, por lo que NO debe envolverse en
 * `unstable_cache`. Es intencionadamente síncrona con la request.
 */
export async function getConfigDiseno(
  subdominio?: string
): Promise<ConfigDisenoResultado> {
  const previa = await leerPrevia(subdominio);
  if (previa) {
    return configDesdeToken(previa);
  }
  const guardado = await getConfigDisenoGuardado(subdominio);
  return { ...guardado, esPreview: false };
}
