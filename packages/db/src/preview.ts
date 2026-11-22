import { createHmac, timingSafeEqual } from "node:crypto";
import { deflateRawSync, inflateRawSync } from "node:zlib";

/**
 * Token de vista previa (solo servidor).
 *
 * Es un snapshot firmado del borrador del editor: el dashboard lo genera y la
 * tienda lo verifica para renderizar el diseño sin guardarlo. No se cifra
 * (el diseño no es secreto), pero la firma impide modificarlo. El TTL va en el
 * propio token, así que no hace falta almacenar nada ni limpiar filas.
 */
const VERSION = 1;
const MAX_TOKEN = 20_000;
const MAX_SALIDA = 200_000;

export interface PayloadPreview {
  v: typeof VERSION;
  exp: number; // epoch en segundos
  sub: string;
  tid: string;
  color: string;
  logo: string | null;
  cfg: unknown;
}

export interface ContenidoPreview {
  sub: string;
  tiendaId: string;
  colorPrincipal: string;
  logoUrl: string | null;
  config: unknown;
}

function hmac(cuerpo: string, secret: string): string {
  return createHmac("sha256", secret).update(cuerpo).digest("base64url");
}

export function firmarPreview(
  contenido: ContenidoPreview,
  opciones: { secret: string; ttlSegundos?: number; ahora?: number },
): { token: string; exp: number } {
  const ttl = opciones.ttlSegundos ?? 900;
  const exp = Math.floor((opciones.ahora ?? Date.now()) / 1000) + ttl;
  const payload: PayloadPreview = {
    v: VERSION,
    exp,
    sub: contenido.sub,
    tid: contenido.tiendaId,
    color: contenido.colorPrincipal,
    logo: contenido.logoUrl,
    cfg: contenido.config,
  };
  const cuerpo = deflateRawSync(
    Buffer.from(JSON.stringify(payload), "utf8"),
  ).toString("base64url");
  return { token: `${cuerpo}.${hmac(cuerpo, opciones.secret)}`, exp };
}

function esPayload(valor: unknown): valor is PayloadPreview {
  if (typeof valor !== "object" || valor === null) return false;
  const p = valor as Record<string, unknown>;
  return (
    p.v === VERSION &&
    typeof p.exp === "number" &&
    typeof p.sub === "string" &&
    typeof p.tid === "string" &&
    typeof p.color === "string" &&
    (p.logo === null || typeof p.logo === "string") &&
    "cfg" in p
  );
}

export function verificarPreview(
  token: string,
  opciones: { secret: string; subdominio: string; ahora?: number },
): PayloadPreview | null {
  try {
    if (!opciones.secret || token.length === 0 || token.length > MAX_TOKEN) {
      return null;
    }
    const separador = token.indexOf(".");
    if (separador <= 0 || separador === token.length - 1) return null;

    const cuerpo = token.slice(0, separador);
    const firma = token.slice(separador + 1);
    const esperada = hmac(cuerpo, opciones.secret);
    const recibida = Buffer.from(firma);
    const calculada = Buffer.from(esperada);
    if (
      recibida.length !== calculada.length ||
      !timingSafeEqual(recibida, calculada)
    ) {
      return null;
    }

    const json = inflateRawSync(Buffer.from(cuerpo, "base64url"), {
      maxOutputLength: MAX_SALIDA,
    }).toString("utf8");
    const payload: unknown = JSON.parse(json);
    if (!esPayload(payload)) return null;
    if (payload.sub !== opciones.subdominio) return null;
    if (payload.exp * 1000 <= (opciones.ahora ?? Date.now())) return null;
    return payload;
  } catch {
    // Token corrupto, base64 inválido, JSON roto o descompresión fallida.
    return null;
  }
}
