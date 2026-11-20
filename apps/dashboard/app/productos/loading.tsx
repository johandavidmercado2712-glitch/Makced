import "./productos.css";

export default function LoadingProductos() {
  return (
    <div className="dashboard db-loading" role="status" aria-busy="true" aria-live="polite">
      <span className="db-sr-only">Cargando productos…</span>
      <div className="db-loading-header" aria-hidden="true">
        <span className="db-skeleton db-skeleton-line db-skeleton-line--lg" />
        <span className="db-skeleton db-skeleton-line db-skeleton-line--md" />
      </div>
      <div className="db-loading-filter" aria-hidden="true">
        <span className="db-skeleton db-skeleton-line" />
        <span className="db-skeleton db-skeleton-line" />
        <span className="db-skeleton db-skeleton-line" />
      </div>
      <div className="db-product-grid" aria-hidden="true">
        {Array.from({ length: 6 }, (_, index) => (
          <div className="db-product-card" key={index}>
            <span className="db-skeleton db-product-skeleton-image" />
            <div className="db-product-skeleton-copy">
              <span className="db-skeleton db-skeleton-line db-skeleton-line--md" />
              <span className="db-skeleton db-skeleton-line db-skeleton-line--sm" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
