import {
  COLOR_PRINCIPAL_DEFECTO,
  combinarDiseno,
  type ConfigDiseno,
} from "@makced/db/diseno";
import type { PayloadPreview } from "@makced/db/preview";

const HEX = /^#[0-9a-fA-F]{6}$/;

export interface ConfigPreview {
  id: string | null;
  colorPrincipal: string;
  logoUrl: string | null;
  config: ConfigDiseno;
  /** true: la config viene de un token de vista previa, no de la base de datos. */
  esPreview: boolean;
}

/**
 * Convierte el payload verificado de un token de vista previa en la misma
 * forma que devuelve `getConfigDiseno`, para que los componentes no distingan
 * entre "diseño guardado" y "diseño en preview".
 *
 * Función PURA (sin next/headers) → testeable en jsdom.
 *
 * El config ya viene saneado por `combinarDiseno` al firmarlo en el dashboard,
 * pero se vuelve a pasar por aquí: el token viaja por la URL y queremos que un
 * payload con campos ausentes o de tipos raros caiga a defaults en lugar de
 * reventar el render.
 */
export function configDesdeToken(payload: PayloadPreview): ConfigPreview {
  return {
    id: payload.tid ?? null,
    // El token ya se firmó con un color saneado, pero se re-valida: la URL
    // es manipulable y un color no hex acabaría inyectado en un style.
    colorPrincipal:
      typeof payload.color === "string" && HEX.test(payload.color)
        ? payload.color
        : COLOR_PRINCIPAL_DEFECTO,
    logoUrl: typeof payload.logo === "string" ? payload.logo : null,
    config: combinarDiseno(payload.cfg),
    esPreview: true,
  };
}
