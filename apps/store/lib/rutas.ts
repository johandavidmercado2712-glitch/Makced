/**
 * Prefija una ruta con el subdominio de la tienda: "/marcas" → "/s/makced/marcas".
 * Función PURA (sin hooks, sin next/headers) → usable desde server Y client.
 */
export function rutaTienda(
  subdominio: string | null | undefined,
  path: string,
): string {
  if (!subdominio) return path;                 // sin tenant → ruta tal cual
  const limpia = path.startsWith("/") ? path : `/${path}`;
  return `/s/${subdominio}${limpia}`;
}