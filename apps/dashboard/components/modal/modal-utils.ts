import type { GuardadoResultado } from "@/types/components";

export const esFallo = (
  resultado: void | GuardadoResultado,
): resultado is { ok: false; error: string } =>
  typeof resultado === "object" && resultado !== null && !resultado.ok;

/** Mensaje de error de un catch: la causa si es Error, si no el fallback según la operación. */
export const mensajeFallo = (err: unknown, fallback: string): string =>
  err instanceof Error ? err.message : fallback;

/** Etiqueta del botón submit según la fase del modal CRUD y si es alta o edición. */
export const etiquetaSubmit = (
  fase: "idle" | "subiendo" | "guardando" | "eliminando",
  esCrear: boolean,
  entidad: string,
): string => {
  if (fase === "subiendo") return "Subiendo imagen...";
  if (fase === "guardando") return esCrear ? "Creando..." : "Guardando...";
  return esCrear ? `Crear ${entidad}` : "Guardar cambios";
};
