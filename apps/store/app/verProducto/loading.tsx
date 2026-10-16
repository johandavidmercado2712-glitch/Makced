import "./verProducto.css";
import ProductoDetalleSkeleton from "../../components/ui/ProductoDetalleSkeleton";

/** Silueta de /verProducto mientras se resuelven producto y recomendados. */
export default function Loading() {
  return <ProductoDetalleSkeleton />;
}