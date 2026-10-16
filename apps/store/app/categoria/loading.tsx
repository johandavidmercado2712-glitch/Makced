import CategoriaSkeleton from "../../components/ui/CategoriaSkeleton";

/** Silueta de /categoria mientras se resuelven las categorías. */
export default function Loading() {
  return (
    <div className="categoria">
      <header className="categoria-titulo categoria-listado-titulo">
        <h1>Categorias</h1>
      </header>
      <CategoriaSkeleton count={6} />
    </div>
  );
}