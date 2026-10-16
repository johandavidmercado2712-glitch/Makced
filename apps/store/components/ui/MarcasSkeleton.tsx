/**
 * Silueta de la rejilla de marcas (/marcas).
 * Reproduce la estructura .card > .card-image + .card-info de la página.
 */
export default function MarcasSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="marcas" role="status" aria-busy="true" aria-live="polite">
      <span className="sr-only">Cargando marcas…</span>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card" aria-hidden="true">
          <div className="card-image">
            <span className="skeleton block h-[200px] w-full rounded-none" />
          </div>
          <div className="card-info">
            <div className="card-info-text">
              <span className="skeleton block h-5 w-24" />
            </div>
            <span className="skeleton block h-3 w-14" />
          </div>
        </div>
      ))}
    </div>
  );
}