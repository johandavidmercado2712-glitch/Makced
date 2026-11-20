export default function ResumenSkeleton() {
  return (
    <div className="dashboard db-loading" role="status" aria-busy="true" aria-live="polite">
      <span className="db-sr-only">Cargando catálogo…</span>
      <div className="db-loading-header" aria-hidden="true">
        <span className="db-skeleton db-skeleton-line db-skeleton-line--sm" />
        <span className="db-skeleton db-skeleton-line db-skeleton-line--lg" />
        <span className="db-skeleton db-skeleton-line db-skeleton-line--md" />
      </div>
      <div className="db-loading-section-title" aria-hidden="true">
        <span className="db-skeleton db-skeleton-line db-skeleton-line--md" />
      </div>
      <div className="db-featured-spotlight" aria-hidden="true">
        <span className="db-skeleton db-featured-spotlight-image" />
        <div className="db-featured-spotlight-copy">
          <span className="db-skeleton db-skeleton-line db-skeleton-line--sm" />
          <span className="db-skeleton db-skeleton-line db-skeleton-line--lg" />
          <span className="db-skeleton db-skeleton-line db-skeleton-line--md" />
        </div>
      </div>
      <div className="db-featured-grid" aria-hidden="true">
        {Array.from({ length: 3 }, (_, index) => (
          <div className="db-featured-card" key={index}>
            <span className="db-skeleton db-featured-skeleton-image" />
            <div className="db-featured-skeleton-copy">
              <span className="db-skeleton db-skeleton-line db-skeleton-line--md" />
              <span className="db-skeleton db-skeleton-line db-skeleton-line--sm" />
            </div>
          </div>
        ))}
      </div>
      <div className="db-loading-summary" aria-hidden="true">
        {Array.from({ length: 4 }, (_, index) => (
          <span className="db-skeleton db-skeleton-line" key={index} />
        ))}
      </div>
    </div>
  );
}
