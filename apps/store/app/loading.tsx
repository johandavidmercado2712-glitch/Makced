import ProductGridSkeleton from "../components/product/ProductGridSkeleton";

/**
 * Fallback global de navegación: se muestra mientras el RootLayout inicial
 * (config de diseño + nav de categorías) resuelve en la primera carga.
 */
export default function Loading() {
  return (
    <div className="Productos" role="status" aria-busy="true" aria-live="polite">
      <span className="sr-only">Cargando…</span>
      <ProductGridSkeleton count={8} />
    </div>
  );
}