import "./novedades.css";
import ProductGridSkeleton from "../../components/product/ProductGridSkeleton";

/** Silueta de /novedades mientras se resuelven productos y config de diseño. */
export default function Loading() {
  return (
    <div
      className="novedades-parent"
      role="status"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Cargando novedades…</span>
      <div className="novedades-content">
        <ProductGridSkeleton count={8} />
      </div>
    </div>
  );
}