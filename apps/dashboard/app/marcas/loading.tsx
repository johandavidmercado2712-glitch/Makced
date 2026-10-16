import TablaSkeleton from "@/components/skeleton/TablaSkeleton";

const COLUMNAS_MARCAS = ["MARCA", "ESTADO", "ACCIONES"];

/** Silueta de marcas + categorías (dos tablas) mientras se resuelven. */
export default function LoadingMarcas() {
  return (
    <div className="dashboard">
      <div className="db-panel db-header">
        <div>
          <span className="db-skeleton" style={{ display: "block", width: 260, height: 26 }} />
          <span
            className="db-skeleton db-skeleton-line db-skeleton-line--lg"
            style={{ display: "block", marginTop: 12 }}
          />
        </div>
      </div>
      <TablaSkeleton columnas={COLUMNAS_MARCAS} filas={4} />
      <TablaSkeleton columnas={COLUMNAS_MARCAS} filas={4} />
    </div>
  );
}