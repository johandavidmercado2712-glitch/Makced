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

export async function getProductosPorCategoria(slug: string, maxPrice?: number) {
  const { data: cat } = await insforge.database
    .from("categorias")
    .select("id")
    .eq("slug", slug)
    .single();

  if (!cat) return [];

  let query = insforge.database                    
    .from("productos")
    .select("id, nombre, precio, precio_descuento, imagen_url, slug, estado")
    .eq("estado", true)
    .eq("categoria_id", cat.id);

  if (maxPrice) {                                  
    query = query.lte("precio", maxPrice);         
  }

  const { data } = await query.limit(20);         

  return data || [];
}

export async function getProductosPorMarca(nombre: string, maxPrice?: number) {
  const { data: marca } = await insforge.database
    .from("marcas")
    .select("id")
    .eq("nombre", nombre)
    .single();

  if (!marca) return [];

  let query = insforge.database
    .from("productos")
    .select("id, nombre, precio, precio_descuento, imagen_url, slug, estado")
    .eq("estado", true)
    .eq("marca_id", marca.id);

  if (maxPrice) {
    query = query.lte("precio", maxPrice);
  }

  const { data } = await query.limit(20);
  return data || [];
}

export async function getProductoPorSlug(slug: string) {
  const { data } = await insforge.database
    .from("productos")
    .select(`
      id, nombre, descripcion, precio, precio_descuento, 
      imagen_url, slug, stock, es_nuevo, es_destacado,
      colores, referencia,
      marca:marcas(nombre),
      categoria:categorias(nombre)
    `)
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

export async function getMaxPrice(): Promise<number> {
  const { data } = await insforge.database
    .from("productos")
    .select("precio")
    .eq("estado", true)
    .order("precio", { ascending: false })
    .limit(1)
    .single();
  return data?.precio || 500000;
}