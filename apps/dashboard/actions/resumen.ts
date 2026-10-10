"use server";
import { insforge } from "@/lib/insforge";
import { requireTiendaDelUsuario } from "./tienda";

async function contar(tabla: string, filtrarDestacados = false): Promise<number> {
  const { tienda } = await requireTiendaDelUsuario();
  let query = insforge.database
    .from(tabla)
    .select("id", { count: "exact", head: true });
  if (tienda?.id && tabla !== "cupones") {
    query = query.eq("tienda_id", tienda.id);
  }
  if (filtrarDestacados) {
    query = query.eq("es_destacado", true);
  }
  const { count } = await query;
  return count ?? 0;
}

export async function getResumenStats() {
  const [productos, destacados, marcas, categorias, cupones] = await Promise.all([
    contar("productos"),
    contar("productos", true),
    contar("marcas"),
    contar("categorias"),
    contar("cupones"),
  ]);
  return { productos, destacados, marcas, categorias, cupones };
}

interface DestacadoFila {
  id: string;
  nombre: string;
  precio: number;
  imagen_url: string | null;
}

export async function getProductosDestacados(limite = 5): Promise<DestacadoFila[]> {
  const { tienda } = await requireTiendaDelUsuario();
  let query = insforge.database
    .from("productos")
    .select("id, nombre, precio, imagen_url")
    .eq("es_destacado", true)
    .order("created_at", { ascending: false })
    .limit(limite);
  if (tienda?.id) {
    query = query.eq("tienda_id", tienda.id);
  }
  const { data } = await query;
  return (data ?? []) as DestacadoFila[];
}
