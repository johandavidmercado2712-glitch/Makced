"use server";
import { insforge } from "@/lib/insforge";
import { requireAuth } from "./tienda";

async function tiendaIdActual(): Promise<string | null> {
  const { tienda } = await requireAuth();
  return tienda?.id ?? null;
}

export async function getCategorias() {
  const tiendaId = await tiendaIdActual();
  let query = insforge.database.from("categorias").select("id, nombre, slug").eq("activa", true);
  if (tiendaId) {
    query = query.eq("tienda_id", tiendaId);
  }
  const { data } = await query;
  return data || [];
}

export async function getMarcas() {
  const tiendaId = await tiendaIdActual();
  let query = insforge.database.from("marcas").select("id, nombre").eq("activa", true);
  if (tiendaId) {
    query = query.eq("tienda_id", tiendaId);
  }
  const { data } = await query;
  return data || [];
}