import TablaSkeleton from "@/components/skeleton/TablaSkeleton";

/** Silueta de la tabla de productos mientras se pagina/filtra en el servidor. */
export default function LoadingProductos() {
  return (
    <div className="dashboard">
      <div className="db-panel db-header">
        <div>
          <span className="db-skeleton" style={{ display: "block", width: 180, height: 26 }} />
          <span
            className="db-skeleton db-skeleton-line db-skeleton-line--md"
            style={{ display: "block", marginTop: 12 }}
          />
        </div>
      </div>
      <TablaSkeleton filas={8} />
    </div>
  );
}