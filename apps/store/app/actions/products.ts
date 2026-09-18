"use server";

import { insforge } from "../../lib/insforge";

export async function getProductosDestacados() {
  const { data } = await insforge.database
    .from("productos")
    .select(
      "id, nombre, precio, precio_descuento, imagen_url, slug, es_destacado, es_nuevo"
    )
    .eq("es_destacado", true)
    .eq("estado", true)
    .limit(8);

  return data || [];
}

export async function getProductosPorCategoria(slug: string) {
  const { data: cat } = await insforge.database
    .from("categorias")
    .select("id")
    .eq("slug", slug)
    .single();

  if (!cat) return [];

  const { data } = await insforge.database
    .from("productos")
    .select(
      "id, nombre, precio, precio_descuento, imagen_url, slug, estado"
    )
    .eq("estado", true)
    .eq("categoria_id", cat.id)
    .limit(20);

  return data || [];
}

export async function getProductosPorMarca(nombre: string) {
  const { data: marca } = await insforge.database
    .from("marcas")
    .select("id")
    .eq("nombre", nombre)
    .single();

  if (!marca) return [];

  const { data } = await insforge.database
    .from("productos")
    .select(
      "id, nombre, precio, precio_descuento, imagen_url, slug, estado"
    )
    .eq("estado", true)
    .eq("marca_id", marca.id)
    .limit(20);

  return data || [];
}

export async function getProductoPorSlug(slug: string) {
  const { data } = await insforge.database
    .from("productos")
    .select(
      "id, nombre, descripcion, precio, precio_descuento, imagen_url, slug, stock, es_nuevo, es_destacado"
    )
    .eq("slug", slug)
    .single();

  return data;
}

export async function buscarProductos(termino: string) {
  if (!termino || termino.length < 2) return [];
  const { data } = await insforge.database
    .from("productos")
    .select("id, nombre, precio, precio_descuento, imagen_url, slug")
    .ilike("nombre", `%${termino}%`)
    .eq("estado", true)
    .limit(8);
  return data || [];
}

export async function getProductosNuevos() {
  const { data } = await insforge.database
    .from("productos")
    .select(
      "id, nombre, precio, precio_descuento, imagen_url, slug, es_nuevo"
    )
    .eq("es_nuevo", true)
    .eq("estado", true)
    .limit(20);

  return data || [];
}