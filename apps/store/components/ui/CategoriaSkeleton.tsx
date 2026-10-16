/**
 * Silueta de la rejilla de categorías (/categoria y home).
 * Usa la clase .categoria-cards de la página para que la retícula
 * sea idéntica a la carga real (sin salto de layout).
 */
export default function CategoriaSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="categoria-cards" role="status" aria-busy="true" aria-live="polite">
      <span className="sr-only">Cargando categorías…</span>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="categoria-card" aria-hidden="true">
          <span className="skeleton absolute inset-0 h-full w-full rounded-none" />
        </div>
      ))}
    </div>
  );
}