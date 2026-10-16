const COLUMNAS_DEFECTO = ["PRODUCTO", "CATEGORÍA", "PRECIO", "ESTADO", "ACCIONES"];

/**
 * Silueta de tabla mientras el server component resuelve los datos.
 * Se usa desde app/<ruta>/loading.tsx (patrón Suspense de Next.js).
 * Accesibilidad: role="status" + aria-busy para lectores de pantalla;
 * las filas son aria-hidden porque son contenido ficticio.
 */
export default function TablaSkeleton({
  columnas = COLUMNAS_DEFECTO,
  filas = 6,
  avatar = true,
}: {
  columnas?: string[];
  filas?: number;
  /** Muestra el círculo de avatar + líneas en la primera columna (tablas de entidades). */
  avatar?: boolean;
}) {
  return (
    <div
      className="db-panel db-table-panel"
      role="status"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="db-sr-only">Cargando tabla…</span>
      <table className="db-table">
        <thead>
          <tr>
            {columnas.map((columna) => (
              <th key={columna} scope="col">
                {columna}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: filas }).map((_, fila) => (
            <tr key={fila} aria-hidden="true">
              {columnas.map((columna, celda) => (
                <td key={columna}>
                  {avatar && celda === 0 ? (
                    <div className="db-product-cell">
                      <span className="db-skeleton db-skeleton-avatar" />
                      <div>
                        <span className="db-skeleton db-skeleton-line db-skeleton-line--md" />
                        <span
                          className="db-skeleton db-skeleton-line db-skeleton-line--sm"
                          style={{ display: "block", marginTop: 8 }}
                        />
                      </div>
                    </div>
                  ) : celda === columnas.length - 1 ? (
                    <span className="db-skeleton" style={{ display: "inline-block", width: 28, height: 28 }} />
                  ) : (
                    <span className="db-skeleton db-skeleton-line db-skeleton-line--lg db-skeleton-block" />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}