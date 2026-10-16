import TablaSkeleton from "./TablaSkeleton";

const TARJETAS = 4;
const DESTACADOS = 3;

/**
 * Silueta del Panel de Resumen: cabecera + tarjetas de métricas +
 * lista de destacados. Se usa desde app/loading.tsx.
 */
export default function ResumenSkeleton() {
  return (
    <div className="dashboard" role="status" aria-busy="true" aria-live="polite">
      <span className="db-sr-only">Cargando panel…</span>

      {/* Cabecera */}
      <div className="db-panel db-header">
        <div>
          <span
            className="db-skeleton"
            style={{ display: "block", width: 180, height: 12, marginBottom: 14 }}
          />
          <span className="db-skeleton" style={{ display: "block", width: 260, height: 26 }} />
          <span
            className="db-skeleton"
            style={{ display: "block", width: 320, height: 12, marginTop: 12 }}
          />
        </div>
        <span
          className="db-skeleton"
          style={{ display: "block", width: 140, height: 38, borderRadius: "var(--db-radius-md)" }}
        />
      </div>

      {/* Tarjetas de métricas */}
      <div className="db-cards">
        {Array.from({ length: TARJETAS }).map((_, i) => (
          <div key={i} className="db-summary-card" aria-hidden="true">
            <div className="db-card-top">
              <span className="db-skeleton db-skeleton-line db-skeleton-line--sm" />
              <span className="db-skeleton" style={{ display: "block", width: 34, height: 34 }} />
            </div>
            <div className="db-card-main">
              <span className="db-skeleton" style={{ display: "block", width: 72, height: 30 }} />
              <span
                className="db-skeleton db-skeleton-line db-skeleton-line--md"
                style={{ marginTop: 10 }}
              />
            </div>
            <div className="db-card-footer">
              <span className="db-skeleton db-skeleton-line" style={{ width: 130 }} />
            </div>
          </div>
        ))}
      </div>

      {/* Productos destacados (misma estructura de tabla que el resto del panel) */}
      <TablaSkeleton columnas={["", "", ""]} filas={DESTACADOS} avatar={false} />
    </div>
  );
}