import { headers, cookies } from "next/headers";
import { insforge } from "../lib/insforge";
import { fetchWithRetry } from "../lib/fetch-utils";
import { combinarDiseno, COLOR_PRINCIPAL_DEFECTO } from "@makced/db/diseno";
import { notFound } from "next/navigation";

export interface TiendaActual {
  id: string;
  subdominio: string;
  nombreTienda: string;
  colorPrincipal: string;
  logoUrl: string | null;
  config: ReturnType<typeof combinarDiseno>;
}

// Resuelve la tienda a servir a partir del header inyectado por el middleware.
// Retorna null si no hay tienda activa con ese subdominio.
export async function resolverTienda(): Promise<TiendaActual | null> {
  let subdominio: string | null = null;
  // Header inyectado por middleware (fiable por request).
  try {
    const h = await headers();
    subdominio = h.get("x-tienda-subdominio");
  } catch {}
  if (!subdominio) {
    try {
      const c = await cookies();
      subdominio = c.get("tienda-subdominio")?.value ?? null;
    } catch {}
  }
  if (!subdominio) return null;

  try {
    const { data, error } = await fetchWithRetry(
      async () => {
        const result = await insforge.database
          .from("tiendas")
          .select("id, nombre_tienda, subdominio, color_principal, logo_url, diseno")
          .eq("subdominio", subdominio)
          .eq("activa", true)
          .maybeSingle();
        return result;
      },
      { timeout: 10000, retries: 2 }
    );
    // Solo se registra el fallo: loguear la fila entera en cada request
    // (como se hacía para depurar) ensuciaba los logs y exponía el diseño.
    if (error) {
      console.error(`[tenant] resolverTienda(${subdominio}):`, error.message);
      return null;
    }
    if (!data) return null;

    return {
      id: data.id as string,
      subdominio: data.subdominio as string,
      nombreTienda: (data.nombre_tienda as string) ?? "Tienda",
      colorPrincipal: (data.color_principal as string) || COLOR_PRINCIPAL_DEFECTO,
      logoUrl: (data.logo_url as string) ?? null,
      config: combinarDiseno(data.diseno),
    };
  } catch (err) {
    console.error(`[tenant] resolverTienda(${subdominio}):`, err);
    return null;
  }
}

// Lista de tiendas activas (para redirección de la raíz).
export async function listarTiendasActivas(): Promise<{ subdominio: string }[]> {
  try {
    const { data, error } = await fetchWithRetry(
      async () => {
        const result = await insforge.database
          .from("tiendas")
          .select("subdominio")
          // `anon` solo tiene SELECT sobre la proyección pública de `tiendas`
          // (ver 20261018213343_restringir-tiendas-select-anon.sql), y
          // `created_at` NO está incluida. Ordenar por una columna sin
          // privilegio aborta la consulta con 42501, así que se ordena por
          // `subdominio`, que sí está concedida y es determinista.
          .eq("activa", true)
          .order("subdominio", { ascending: true });
        return result;
      },
      { timeout: 10000, retries: 2 }
    );
    if (error) {
      console.error("[tenant] listarTiendasActivas:", error);
      return [];
    }
    if (!data) return [];
    return data.map((t: { subdominio: string }) => ({ subdominio: t.subdominio }));
  } catch (err) {
    console.error("[tenant] listarTiendasActivas:", err);
    return [];
  }
}

export async function subdominioSolicitado(): Promise<string | null> {
  try {
    const h = await headers();
    const v = h.get("x-tienda-subdominio");
    if (v) return v;
  } catch {}
  try {
    const c = await cookies();
    return c.get("tienda-subdominio")?.value ?? null;
  } catch {
    return null;
  }
}

export async function requerirTienda(): Promise<TiendaActual> {
  const tienda = await resolverTienda();
  if (!tienda) notFound();     // notFound() devuelve `never`: no necesita return
  return tienda;
}
