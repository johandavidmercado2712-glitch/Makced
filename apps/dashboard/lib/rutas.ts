// URL base de la tienda pública. El dashboard y la tienda son apps/orígenes
// distintos, así que los enlaces deben ser absolutos.
export const URL_TIENDA = (
  process.env.NEXT_PUBLIC_TIENDA_URL ?? "http://localhost:3000"
).replace(/\/+$/, "");

/**
 * URL absoluta a la tienda de un tenant concreto.
 * Hoy la multi-tenancy es por path (/s/<subdominio>); cuando migremos a
 * subdominios reales solo cambia el cuerpo de esta función.
 */
export function urlTienda(
  subdominio: string | null | undefined,
  path = "/",
): string {
  const limpia = path.startsWith("/") ? path : `/${path}`;
  if (!subdominio) return `${URL_TIENDA}${limpia}`;
  return limpia === "/"
    ? `${URL_TIENDA}/s/${subdominio}`
    : `${URL_TIENDA}/s/${subdominio}${limpia}`;
}
