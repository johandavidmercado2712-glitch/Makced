"use server";

import { insforge } from "../../lib/insforge";

function logError(accion: string, error: unknown) {
  // PGRST116 = .single() sin filas: es un caso esperado (404), no un fallo.
  if ((error as { code?: string } | null)?.code === "PGRST116") return;
  console.error(`[store] ${accion}:`, error);
}

function esMaxPriceValido(maxPrice?: number): maxPrice is number {
  return (
    typeof maxPrice === "number" &&
    Number.isFinite(maxPrice) &&
    maxPrice >= 0
  );
}

/**
 * InsForge puede devolver una relación como objeto o como array de un
 * elemento. La normalizamos a un nombre para que las tarjetas no dependan
 * de la forma exacta que devuelva el join.
 */
function nombreDeRelacion(ref: unknown): string | null {
  const valor = Array.isArray(ref) ? ref[0] : ref;
  if (!valor || typeof valor !== "object") return null;
  const nombre = (valor as { nombre?: unknown }).nombre;
  return typeof nombre === "string" && nombre.trim() ? nombre : null;
}

function conMarca<T extends { marca?: unknown }>(
  producto: T
): Omit<T, "marca"> & { marca: string | null } {
  return { ...producto, marca: nombreDeRelacion(producto.marca) };
}

function conMarcas<T extends { marca?: unknown }>(productos: T[]) {
  return productos.map(conMarca);
}

export async function getProductosDestacados() {
  const { data, error } = await insforge.database
    .from("productos")
    .select(
      "id, nombre, precio, precio_descuento, imagen_url, slug, marca:marcas(nombre)"
    )
    .eq("es_destacado", true)
    .eq("estado", true)
    .limit(8);

  if (error) logError("getProductosDestacados", error);
  return conMarcas(data || []);
}

export async function getProductosPorCategoria(slug: string, maxPrice?: number) {
  const { data: cat, error: catError } = await insforge.database
    .from("categorias")
    .select("id")
    .eq("slug", slug)
    .single();

  if (catError) logError("getProductosPorCategoria (categoría)", catError);
  if (!cat) return [];

  let query = insforge.database
    .from("productos")
    .select(
      "id, nombre, precio, precio_descuento, imagen_url, slug, marca:marcas(nombre)"
    )
    .eq("estado", true)
    .eq("categoria_id", cat.id);

  if (esMaxPriceValido(maxPrice)) {
    query = query.lte("precio", maxPrice);
  }

  const { data, error } = await query.limit(20);

  if (error) logError("getProductosPorCategoria (productos)", error);
  return conMarcas(data || []);
}

export async function getProductosPorMarca(nombre: string, maxPrice?: number) {
  const { data: marca, error: marcaError } = await insforge.database
    .from("marcas")
    .select("id")
    .eq("nombre", nombre)
    .single();

  if (marcaError) logError("getProductosPorMarca (marca)", marcaError);
  if (!marca) return [];

  let query = insforge.database
    .from("productos")
    .select(
      "id, nombre, precio, precio_descuento, imagen_url, slug, marca:marcas(nombre)"
    )
    .eq("estado", true)
    .eq("marca_id", marca.id);

  if (esMaxPriceValido(maxPrice)) {
    query = query.lte("precio", maxPrice);
  }

  const { data, error } = await query.limit(20);

  if (error) logError("getProductosPorMarca (productos)", error);
  return conMarcas(data || []);
}

export async function getProductoPorSlug(slug: string) {
  const { data, error } = await insforge.database
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

  if (error) logError("getProductoPorSlug", error);
  if (!data) return data;
  return {
    ...data,
    marca: nombreDeRelacion(data.marca),
    categoria: nombreDeRelacion(data.categoria),
  };
}

export async function buscarProductos(termino: string) {
  const limpio = termino?.trim() ?? "";
  if (limpio.length < 2) return [];
  const { data, error } = await insforge.database
    .from("productos")
    .select("id, nombre, precio, precio_descuento, imagen_url, slug")
    .ilike("nombre", `%${limpio}%`)
    .eq("estado", true)
    .limit(8);

  if (error) logError("buscarProductos", error);
  return data || [];
}

export async function getProductosNuevos() {
  const { data, error } = await insforge.database
    .from("productos")
    .select(
      "id, nombre, precio, precio_descuento, imagen_url, slug, marca:marcas(nombre)"
    )
    .eq("es_nuevo", true)
    .eq("estado", true)
    .limit(20);

  if (error) logError("getProductosNuevos", error);
  return conMarcas(data || []);
}

export async function getMaxPrice(): Promise<number> {
  const { data, error } = await insforge.database
    .from("productos")
    .select("precio")
    .eq("estado", true)
    .order("precio", { ascending: false })
    .limit(1)
    .single();

  if (error) logError("getMaxPrice", error);
  return data?.precio ?? 500000;
}
