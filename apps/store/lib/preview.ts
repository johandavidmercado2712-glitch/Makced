import { headers } from "next/headers";
import { verificarPreview, type PayloadPreview } from "@makced/db/preview";

/**
 * Lee y verifica el token de vista previa de esta request.
 *
 * El token llega en `?preview=` (la URL es compartible y se abre en otra
 * pestaña), pero el layout no puede leer `searchParams`: por eso el proxy lo
 * copia al header `x-preview-token` y aquí lo leemos con `headers()`.
 *
 * Un `x-preview-token` que llegue de fuera se descarta en el proxy, así que
 * este header solo puede venir de un `?preview=` firmado por el dashboard.
 *
 * El token solo es válido para el tenant en curso: si el subdominio no
 * coincide, `verificarPreview` devuelve null y se sirve el diseño guardado.
 */
export async function leerPrevia(
  subdominio?: string | null
): Promise<PayloadPreview | null> {
  let token: string | null = null;
  let sub: string | null = subdominio ?? null;
  try {
    const h = await headers();
    token = h.get("x-preview-token");
    sub = sub ?? h.get("x-tienda-subdominio");
  } catch {
    // Sin contexto de request (build/generación estática): no hay preview.
    return null;
  }
  if (!token || !sub) return null;

  const secret = process.env.PREVIEW_SECRET;
  if (!secret) {
    console.error("[preview] Falta PREVIEW_SECRET en el entorno de la store");
    return null;
  }

  return verificarPreview(token, { secret, subdominio: sub });
}
