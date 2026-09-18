"use server";
import { insforge } from "@/lib/insforge";

export async function getProductos(search?: string, marca?: string, categoria?: string) {
  let query = insforge.database
    .from("productos")
    .select(`
      id, nombre, precio, precio_descuento, imagen_url, slug,
      estado, es_nuevo, es_destacado,
      marca:marcas(id, nombre),
      categoria:categorias(id, nombre)
    `);

  if (search) {
    query = query.ilike("nombre", `%${search}%`);
  }
  if (marca) {
    query = query.eq("marca_id", marca);
  }
  if (categoria) {
    query = query.eq("categoria_id", categoria);
  }

  const { data } = await query.order("created_at", { ascending: false });
  return data || [];
}

export async function getProductosCount() {
  const { count } = await insforge.database
    .from("productos")
    .select("*", { count: "exact", head: true });
  return count || 0;
}
