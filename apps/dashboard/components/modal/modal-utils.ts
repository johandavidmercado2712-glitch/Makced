import type { GuardadoResultado } from "@/types/components";

export const esFallo = (
  resultado: void | GuardadoResultado,
): resultado is { ok: false; error: string } =>
  typeof resultado === "object" && resultado !== null && !resultado.ok;
