import { unstable_cache } from "next/cache";
import { insforge } from "../../lib/insforge";
import { fetchWithRetry } from "../../lib/fetch-utils";
import type { ProductoCardData } from "../../types/store";

function nombreDeRelacion(ref: unknown): string | null {
  const valor = Array.isArray(ref) ? ref[0] : ref;
  if (!valor || typeof valor !== "object") return null;
  const nombre = (valor as { nombre?: unknown }).nombre;
  return typeof nombre === "string" && nombre.trim() ? nombre : null;
}

function conMarca<T extends { marca?: unknown }>(producto: T): Omit<T, "marca"> & { marca: string | null } {
  return { ...producto, marca: nombreDeRelacion(producto.marca) };
}

function conMarcas<T extends { marca?: unknown }>(productos: T[]) {
  return productos.map(conMarca);
}

function logError(accion: string, error: unknown) {
  if ((error as { code?: string } | null)?.code === "PGRST116") return;
  console.error(`[store] ${accion}:`, error);
}

// Wrapper para manejar errores de forma consistente
async function safeQuery<T>(queryFn: () => Promise<{ data: T | null; error: unknown }>): Promise<T | null> {
  try {
    const { data, error } = await fetchWithRetry(queryFn, { timeout: 10000, retries: 2 });
    if (error) {
      logError("safeQuery", error);
      return null;
    }
    return data;
  } catch (err) {
    logError("safeQuery", err);
    return null;
  }
}

export const getProductosDestacados = unstable_cache(
  async (tiendaId?: string | null): Promise<ProductoCardData[]> => {
    // Fail-closed: sin tienda resuelta no se devuelve NADA. Nunca catálogo global.
    if (!tiendaId) return [];
    const data = await safeQuery(async () => {
      const result = await insforge.database
        .from("productos")
        .select("id, nombre, precio, precio_descuento, imagen_url, slug, marca:marcas(nombre)")
        .eq("es_destacado", true)
        .eq("estado", true)
        .eq("tienda_id", tiendaId)
        .limit(8);
      return result;
    });
    return conMarcas(data || []);
  },
  ["productos-destacados"],
  { revalidate: 300, tags: ["productos"] }
);

export async function getProductosPorCategoria(slug: string, maxPrice?: number, tiendaId?: string | null): Promise<ProductoCardData[]> {
  if (!tiendaId) return [];

  const cat = await safeQuery(async () => {
    const result = await insforge.database
      .from("categorias")
      .select("id")
      .eq("slug", slug)
      .eq("tienda_id", tiendaId)
      .maybeSingle();
    return result;
  });

  if (!cat) return [];

  let query = insforge.database
    .from("productos")
    .select("id, nombre, precio, precio_descuento, imagen_url, slug, marca:marcas(nombre)")
    .eq("estado", true)
    .eq("categoria_id", cat.id)
    .eq("tienda_id", tiendaId);

  if (typeof maxPrice === "number" && maxPrice >= 0) {
    query = query.lte("precio", maxPrice);
  }

  const data = await safeQuery(async () => {
    const result = await query.limit(20);
    return result;
  });

  return conMarcas(data || []);
}

export async function getProductosPorMarca(nombre: string, maxPrice?: number, tiendaId?: string | null): Promise<ProductoCardData[]> {
  if (!tiendaId) return [];

  const marca = await safeQuery(async () => {
    const result = await insforge.database
      .from("marcas")
      .select("id")
      .eq("nombre", nombre)
      .eq("tienda_id", tiendaId)
      .maybeSingle();
    return result;
  });

  if (!marca) return [];

  let query = insforge.database
    .from("productos")
    .select("id, nombre, precio, precio_descuento, imagen_url, slug, marca:marcas(nombre)")
    .eq("estado", true)
    .eq("marca_id", marca.id)
    .eq("tienda_id", tiendaId);

  if (typeof maxPrice === "number" && maxPrice >= 0) {
    query = query.lte("precio", maxPrice);
  }

  const data = await safeQuery(async () => {
    const result = await query.limit(20);
    return result;
  });

  return conMarcas(data || []);
}

export async function getProductoPorSlug(slug: string, tiendaId?: string | null): Promise<ProductoCardData | null> {
  if (!tiendaId) return null;

  const data = await safeQuery(async () => {
    const result = await insforge.database
      .from("productos")
      .select("id, nombre, descripcion, precio, precio_descuento, imagen_url, slug, stock, es_nuevo, es_destacado, colores, referencia, marca:marcas(nombre), categoria:categorias(nombre)")
      .eq("slug", slug)
      .eq("tienda_id", tiendaId)
      .maybeSingle();
    return result;
  });

  if (!data) return null;
  return {
    ...data,
    marca: nombreDeRelacion(data.marca),
    categoria: nombreDeRelacion(data.categoria),
  } as unknown as ProductoCardData;
}

export async function buscarProductos(termino: string, tiendaId?: string | null): Promise<ProductoCardData[]> {
  const limpio = termino?.trim() ?? "";
  if (limpio.length < 2) return [];
  if (!tiendaId) return [];

  const data = await safeQuery(async () => {
    const result = await insforge.database
      .from("productos")
      .select("id, nombre, precio, precio_descuento, imagen_url, slug, marca:marcas(nombre)")
      .ilike("nombre", `%${limpio}%`)
      .eq("estado", true)
      .eq("tienda_id", tiendaId)
      .limit(8);
    return result;
  });

  return conMarcas(data || []);
}

export async function getProductosNuevos(tiendaId?: string | null): Promise<ProductoCardData[]> {
  if (!tiendaId) return [];

  const data = await safeQuery(async () => {
    const result = await insforge.database
      .from("productos")
      .select("id, nombre, precio, precio_descuento, imagen_url, slug, marca:marcas(nombre)")
      .eq("es_nuevo", true)
      .eq("estado", true)
      .eq("tienda_id", tiendaId)
      .limit(20);
    return result;
  });

  return conMarcas(data || []);
}

export async function getMaxPrice(tiendaId?: string | null): Promise<number> {
  // Fail-closed: sin tienda no se consulta el rango de precios.
  if (!tiendaId) return 500000;

  const data = await safeQuery(async () => {
    const result = await insforge.database
      .from("productos")
      .select("precio")
      .eq("estado", true)
      .eq("tienda_id", tiendaId)
      .order("precio", { ascending: false })
      .limit(1)
      .maybeSingle();
    return result;
  });

  return data?.precio ?? 500000;
}
