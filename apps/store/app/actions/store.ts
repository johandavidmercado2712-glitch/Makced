"use server";

import { insforge } from "../../lib/insforge";

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