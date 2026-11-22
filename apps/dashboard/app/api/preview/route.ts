import { NextResponse } from "next/server";
import { requireAuth } from "@/actions/tienda";
import { COLOR_PRINCIPAL_DEFECTO, combinarDiseno } from "@makced/db/diseno";
import { firmarPreview } from "@makced/db/preview";
import { urlTienda } from "@/lib/rutas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_CUERPO = 24_000;
const HEX = /^#[0-9a-fA-F]{6}$/;
const URL_PERMITIDA = /^(https?:\/\/|\/)/i;

function esObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}

/**
 * Genera una URL firmada con el borrador actual del editor.
 * El snapshot vive solo en el token (TTL corto): no se guarda en la base de
 * datos ni se invalida la caché de la tienda.
 */
export async function POST(request: Request) {
  const { tienda, error } = await requireAuth();
  if (!tienda) {
    const status = error === "No autorizado. Inicia sesión." ? 401 : 403;
    return NextResponse.json(
      { ok: false, error: error ?? "No autorizado" },
      { status },
    );
  }

  const secret = process.env.PREVIEW_SECRET;
  if (!secret) {
    console.error("[preview] Falta PREVIEW_SECRET en el entorno del dashboard");
    return NextResponse.json(
      { ok: false, error: "La vista previa no está configurada." },
      { status: 500 },
    );
  }

  let cuerpo: unknown;
  try {
    cuerpo = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Petición inválida." },
      { status: 400 },
    );
  }

  if (!esObjeto(cuerpo) || !esObjeto(cuerpo.config)) {
    return NextResponse.json(
      { ok: false, error: "Falta el diseño a previsualizar." },
      { status: 400 },
    );
  }

  if (JSON.stringify(cuerpo).length > MAX_CUERPO) {
    return NextResponse.json(
      { ok: false, error: "El diseño es demasiado grande para la vista previa." },
      { status: 413 },
    );
  }

  const config = combinarDiseno(cuerpo.config);
  const colorPrincipal =
    typeof cuerpo.colorPrincipal === "string" && HEX.test(cuerpo.colorPrincipal)
      ? cuerpo.colorPrincipal
      : (tienda.color_principal ?? COLOR_PRINCIPAL_DEFECTO);
  // Logo: "ausente" (cliente viejo) conserva el guardado; null o "" significa
  // "sin logo" (el usuario lo quitó). Las blob: URLs del dashboard no cargan
  // en el iframe, así que se descartan y se queda el guardado.
  const logoUrl = !("logoUrl" in cuerpo)
    ? tienda.logo_url
    : typeof cuerpo.logoUrl === "string" && URL_PERMITIDA.test(cuerpo.logoUrl)
      ? cuerpo.logoUrl
      : cuerpo.logoUrl === null
        ? null
        : tienda.logo_url;

  const ttl = Number(process.env.PREVIEW_TTL_SECONDS ?? 900);
  const ttlSegundos = Number.isFinite(ttl) && ttl > 0 ? Math.min(ttl, 3600) : 900;

  const { token, exp } = firmarPreview(
    {
      sub: tienda.subdominio,
      tiendaId: tienda.id,
      colorPrincipal,
      logoUrl,
      config,
    },
    { secret, ttlSegundos },
  );

  return NextResponse.json(
    {
      ok: true,
      url: `${urlTienda(tienda.subdominio)}?preview=${encodeURIComponent(token)}`,
      exp,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
