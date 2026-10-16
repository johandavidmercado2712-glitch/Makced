import "./marcas.css";
import MarcasSkeleton from "../../components/ui/MarcasSkeleton";

/** Silueta de /marcas mientras se resuelven las marcas. */
export default function Loading() {
  return (
    <div className="marcas-info">
      <h1>MARCAS</h1>
      <MarcasSkeleton count={8} />
    </div>
  );
}