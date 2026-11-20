import {
  listarCategorias,
  listarMarcas,
} from "@/actions/marcas";
import MarcasActions from "@/components/MarcasActions";
import { MarcasWithUndo } from "@/components/MarcasWithUndo";
import { guardarMarca, guardarCategoria } from "@/actions/marcas";

export default async function MarcasPage() {
  const [marcas, categorias] = await Promise.all([
    listarMarcas(),
    listarCategorias(),
  ]);

  return (
    <div className="dashboard">
      <div className="db-panel db-header">
        <div>
          <h1 className="db-title">Marcas y categorías</h1>
          <p className="db-subtitle">
            Organizan tu catálogo y aparecen en los filtros, la navegación y el
            pie de tu tienda. Ahora mismo hay {marcas.length} marcas y{" "}
            {categorias.length} categorías.
          </p>
        </div>
        <MarcasActions
          onGuardarMarca={guardarMarca}
          onGuardarCategoria={guardarCategoria}
        />
      </div>

      <MarcasWithUndo marcas={marcas} categorias={categorias} />
    </div>
  );
}
