const copFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export function formatCOP(value: number): string {
  return copFormatter.format(Number.isFinite(value) ? value : 0);
}

/**
 * Precio que se cobra: usa el descuento solo si es un número válido y menor
 * al precio original. Evita descuentos en 0 o mayores al precio.
 */
export function precioEfectivo(
  precio: number,
  precioDescuento: number | null | undefined,
): number {
  if (
    typeof precioDescuento === "number" &&
    Number.isFinite(precioDescuento) &&
    precioDescuento >= 0 &&
    precioDescuento < precio
  ) {
    return precioDescuento;
  }
  return Number.isFinite(precio) ? precio : 0;
}

export function tieneDescuento(
  precio: number,
  precioDescuento: number | null | undefined,
): boolean {
  return precioEfectivo(precio, precioDescuento) < precio;
}
