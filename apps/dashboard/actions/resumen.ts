"use server";
import { cookies } from "next/headers";
import { createServerClient } from "@insforge/sdk/ssr";
import { requireAuth } from "./tienda";

async function contar(tabla: string, filtrarDestacados = false): Promise<number> {
  const { tienda } = await requireAuth();
  const insforge = createServerClient({ cookies: await cookies() });
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

async function getUltimoActivo(): Promise<string | null> {
  const { tienda } = await requireAuth();
  const insforge = createServerClient({ cookies: await cookies() });
  const { data } = await insforge.database
    .from("productos")
    .select("created_at")
    .eq("tienda_id", tienda?.id)
    .order("created_at", { ascending: false })
    .limit(1);
  return (data ?? [])[0]?.created_at ?? null;
}

export async function getResumenStats() {
  const [productos, destacados, marcas, categorias, cupones, ultimoActivo] = await Promise.all([
    contar("productos"),
    contar("productos", true),
    contar("marcas"),
    contar("categorias"),
    contar("cupones"),
    getUltimoActivo(),
  ]);
  return { productos, destacados, marcas, categorias, cupones, ultimoActivo };
}

interface DestacadoFila {
  id: string;
  nombre: string;
  precio: number;
  imagen_url: string | null;
  estado: boolean;
  categoria: { nombre: string } | null;
}

interface DestacadoFilaRespuesta extends Omit<DestacadoFila, "categoria"> {
  categoria: { nombre: string } | { nombre: string }[] | null;
}

export async function getProductosDestacados(limite = 5): Promise<DestacadoFila[]> {
  const { tienda } = await requireAuth();
  const insforge = createServerClient({ cookies: await cookies() });
  let query = insforge.database
    .from("productos")
    .select("id, nombre, precio, imagen_url, estado, categoria:categorias(nombre)")
    .eq("es_destacado", true)
    .order("created_at", { ascending: false })
    .limit(limite);
  if (tienda?.id) {
    query = query.eq("tienda_id", tienda.id);
  }
  const { data } = await query;
  return ((data ?? []) as DestacadoFilaRespuesta[]).map((producto) => ({
    ...producto,
    categoria: Array.isArray(producto.categoria)
      ? producto.categoria[0] ?? null
      : producto.categoria,
  }));
}
