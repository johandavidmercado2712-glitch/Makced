"use server";

import { resolverTienda } from "../../lib/tenant";
import { buscarProductos } from "./products";
import type { ProductoCardData } from "../../types/store";

/**
 * La tienda se resuelve AQU�, en el servidor, desde el header del proxy
 * (x-tienda-subdominio) o la cookie. El navegador no manda: no importa
 * lo que env�e por la red, siempre se busca solo en la tienda que pidi�.
 */
export async function buscarEnTienda(termino: string): Promise<ProductoCardData[]> {
  const tienda = await resolverTienda();
  if (!tienda) return [];                       // sin tienda, sin resultados
  return buscarProductos(termino, tienda.id);
}