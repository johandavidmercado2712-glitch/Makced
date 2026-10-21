"use server";

import { insforge } from "../../lib/insforge";
import { COLOR_PRINCIPAL_DEFECTO, combinarDiseno } from "@makced/db/diseno";

function logError(accion: string, error: unknown) {
  // PGRST116 = .single() sin filas: es un caso esperado (sin tienda activa).
  if ((error as { code?: string } | null)?.code === "PGRST116") return;
  console.error(`[store] ${accion}:`, error);
}

export async function getCategorias() {
  const { data, error } = await insforge.database
    .from("categorias")
    .select("id, nombre, slug, imagen_url")
    .eq("activa", true);

  if (error) logError("getCategorias", error);
  return data || [];
}

export async function getMarcas() {
  const { data, error } = await insforge.database
    .from("marcas")
    .select("id, nombre, logo_url, imagen_url")
    .eq("activa", true);

  if (error) logError("getMarcas", error);
  return data || [];
}

export async function getCategoriaPorSlug(slug: string) {
  const { data, error } = await insforge.database
    .from("categorias")
    .select("nombre, slug")
    .eq("slug", slug)
    .eq("activa", true)
    .maybeSingle();

  if (error) logError("getCategoriaPorSlug", error);
  return data as { nombre: string; slug: string } | null;
}

export async function getMarcaPorNombre(nombre: string) {
  const { data, error } = await insforge.database
    .from("marcas")
    .select("nombre")
    .eq("nombre", nombre)
    .eq("activa", true)
    .maybeSingle();

  if (error) logError("getMarcaPorNombre", error);
  return data as { nombre: string } | null;
}

export async function getNavCategorias() {
  const { data, error } = await insforge.database
    .from("categorias")
    .select("id, nombre, slug")
    .eq("activa", true)
    .limit(3);

  if (error) logError("getNavCategorias", error);
  return data || [];
}

// Resuelve la MISMA fila que edita el dashboard (actions/tienda.ts::getTienda):
// mismas columnas, mismo filtro .eq("activa", true) => mismo tienda_id.
// El id NUNCA viene del cliente; se deriva aquí, en el servidor.
// TODO(multi-tienda): cuando haya varias tiendas activas, filtrar por
// subdominio (Host) en vez de "la activa única".
export async function getConfigDiseno() {
  const { data, error } = await insforge.database
    .from("tiendas")
    .select("id, color_principal, logo_url, diseno")
    .eq("activa", true)
    .single();

  if (error) logError("getConfigDiseno", error);

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
}
