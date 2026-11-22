"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ConfigDiseno } from "@makced/db/diseno";
import type { ImagenEstado } from "@/types/components";
import { imagenVista } from "./paneles/comunes";

/** Espera a que el usuario deje de escribir antes de firmar un snapshot nuevo. */
const DEBOUNCE_MS = 1200;
const URL_PERMITIDA = /^(https?:\/\/|\/)/i;

export interface PayloadVistaPrevia {
  config: ConfigDiseno;
  colorPrincipal: string;
  logoUrl: string | null;
}

/**
 * Resuelve la imagen que debe ver el preview para un prefijo concreto.
 *
 * - Sin cambios pendientes → la imagen guardada.
 * - "archivo" sin confirmar → la guardada (el blob no carga en el iframe).
 * - "url" → la nueva URL, si es cargable (http/https/ruta relativa).
 * - "quitar" → "" (igual que lo que se persiste: `imagen_url: null` → "").
 */
function imagenPrevia(
  imagenes: Record<string, ImagenEstado>,
  prefijo: string,
  guardada: string | null,
): string {
  if (imagenes[prefijo]?.quitar) return "";
  const valor = imagenVista(imagenes, prefijo, guardada);
  if (!valor) return "";
  return URL_PERMITIDA.test(valor) ? valor : (guardada ?? "");
}

/**
 * Convierte el borrador del editor en el cuerpo de POST /api/preview.
 * Aplica los cambios de imagen pendientes (los que todavía no se subieron)
 * sobre el config para que el iframe muestre lo mismo que mostrará la tienda
 * tras guardar.
 * Función PURA → testeable sin montar el hook.
 */
export function construirPayload(
  borrador: ConfigDiseno,
  colorP: string,
  imagenes: Record<string, ImagenEstado>,
  logoUrl: string | null,
): PayloadVistaPrevia {
  const slides = borrador.banner.slides.map((slide, pos) => ({
    ...slide,
    imagen: imagenPrevia(imagenes, `bn${pos}`, slide.imagen || null),
  }));

  const imagenSeccion = (seccion: "promo" | "newsletter") =>
    imagenPrevia(
      imagenes,
      seccion === "promo" ? "pr" : "nl",
      borrador[seccion].imagen || null,
    );

  return {
    config: {
      ...borrador,
      banner: { ...borrador.banner, slides },
      promo: { ...borrador.promo, imagen: imagenSeccion("promo") },
      newsletter: { ...borrador.newsletter, imagen: imagenSeccion("newsletter") },
    },
    colorPrincipal: colorP,
    // null explícito = sin logo (la ruta distingue "ausente" de "vacío").
    logoUrl: imagenPrevia(imagenes, "lg", logoUrl) || null,
  };
}

type EstadoPrevia = "inactivo" | "cargando" | "ok" | "error";

export interface VistaPrevia {
  url: string | null;
  estado: EstadoPrevia;
  error: string | null;
  /** true cuando venció el TTL del token: el iframe ya muestra lo publicado. */
  expirado: boolean;
  /** Fuerza una firma nueva sin esperar al debounce (botón de refresco). */
  refrescar: () => void;
}

/**
 * Firma el borrador en el servidor y devuelve una URL con token para el
 * iframe. El token vive solo en la URL (TTL 15 min): no toca la base de datos
 * ni invalida la caché de la tienda.
 */
export function useVistaPrevia(
  borrador: ConfigDiseno,
  colorP: string,
  imagenes: Record<string, ImagenEstado>,
  logoUrl: string | null,
): VistaPrevia {
  const [url, setUrl] = useState<string | null>(null);
  const [exp, setExp] = useState<number | null>(null);
  const [estado, setEstado] = useState<EstadoPrevia>("inactivo");
  const [error, setError] = useState<string | null>(null);
  const [intento, setIntento] = useState(0);
  const controlRef = useRef<AbortController | null>(null);

  const payload = useMemo(
    () => construirPayload(borrador, colorP, imagenes, logoUrl),
    [borrador, colorP, imagenes, logoUrl],
  );
  const cuerpo = JSON.stringify(payload);

  useEffect(() => {
    const control = new AbortController();
    // Cancela la firma anterior: solo importa la última versión del borrador.
    controlRef.current?.abort();
    controlRef.current = control;

    const timer = setTimeout(async () => {
      setEstado("cargando");
      try {
        const respuesta = await fetch("/api/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: cuerpo,
          signal: control.signal,
        });
        const datos = (await respuesta.json().catch(() => null)) as {
          ok?: boolean;
          url?: string;
          exp?: number;
          error?: string;
        } | null;
        if (!respuesta.ok || !datos?.ok || typeof datos.url !== "string") {
          throw new Error(datos?.error ?? "No se pudo generar la vista previa.");
        }
        setUrl(datos.url);
        setExp(typeof datos.exp === "number" ? datos.exp : null);
        setError(null);
        setEstado("ok");
      } catch (err) {
        // El aborto no es un error: viene de un cambio posterior del borrador.
        if (control.signal.aborted) return;
        setEstado("error");
        setError(
          err instanceof Error ? err.message : "No se pudo generar la vista previa.",
        );
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      control.abort();
    };
  }, [cuerpo, intento]);

  // Marca `expirado` cuando vence el TTL, para avisar en el pie del panel.
  // Se agenda siempre (nunca setState síncrono en el effect): si ya venció,
  // el temporizador de 0 ms lo detecta en el siguiente tick.
  const [ahora, setAhora] = useState(() => Date.now());
  useEffect(() => {
    if (!exp) return;
    const restante = exp * 1000 - Date.now();
    const timer = setTimeout(() => setAhora(Date.now()), Math.max(restante, 0) + 250);
    return () => clearTimeout(timer);
  }, [exp]);

  const refrescar = useCallback(() => setIntento((valor) => valor + 1), []);

  return {
    url,
    estado,
    error,
    expirado: exp !== null && ahora >= exp * 1000,
    refrescar,
  };
}
