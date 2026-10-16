/**
 * Silueta del detalle de producto (/verProducto).
 * Reutiliza .ver-Producto, .producto-imagen-principal y .producto-miniatura
 * para conservar proporciones (aspect-ratio 1) del producto real.
 */
export default function ProductoDetalleSkeleton() {
  return (
    <div className="ver-Producto" role="status" aria-busy="true" aria-live="polite">
      <span className="sr-only">Cargando producto…</span>

      {/* Galería */}
      <div className="Producto-img" aria-hidden="true">
        <div className="skeleton producto-imagen-principal" />
        <div className="producto-galeria">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="skeleton producto-miniatura" />
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="Producto-espeficacion" aria-hidden="true">
        <div className="Producto-informacion">
          <div className="producto-header">
            <span className="skeleton mb-3 block h-4 w-40" />
            <span className="skeleton block h-8 w-3/4" />
          </div>
          <span className="skeleton mt-6 block h-10 w-40" />
          <span className="skeleton mt-6 block h-24 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}