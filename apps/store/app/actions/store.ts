"use server";

import { insforge } from "../../lib/insforge";
import { COLOR_PRINCIPAL_DEFECTO, combinarDiseno } from "@makced/db/diseno";

export async function getCategorias() {
  const { data } = await insforge.database
    .from("categorias")
    .select("id, nombre, slug, imagen_url")
    .eq("activa", true);

  return data || [];
}

export async function getMarcas() {
  const { data } = await insforge.database
    .from("marcas")
    .select("id, nombre, logo_url, imagen_url")
    .eq("activa", true);

  return data || [];
}

export async function getNavCategorias() {
  const { data } = await insforge.database
    .from("categorias")
    .select("id, nombre, slug")
    .eq("activa", true)
    .limit(3);
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