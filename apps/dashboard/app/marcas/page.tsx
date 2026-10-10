import { Box, Tag } from "lucide-react";
import {
  eliminarCategoria,
  eliminarMarca,
  guardarCategoria,
  guardarMarca,
  listarCategorias,
  listarMarcas,
} from "@/actions/marcas";
import { ModalCategoria } from "@/components/modal/modalCategoria";
import { ModalMarca } from "@/components/modal/modalMarca";
import MarcasActions from "@/components/MarcasActions";
import "../productos/productos.css";
import "./marcas.css";

const AVATAR_SIN_IMAGEN = {
  background: "rgba(148, 163, 184, 0.2)",
  color: "#94A3B8",
};

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

      <div className="db-panel db-table-panel">
        <div className="db-section-header">
          <Tag size={16} />
          <div className="db-section-titles">
            <h2>Marcas</h2>
            <p>Agrupan tus productos por fabricante.</p>
          </div>
          <span className="db-filters-count">{marcas.length}</span>
        </div>
        <table className="db-table">
          <thead>
            <tr>
              <th>MARCA</th>
              <th>ESTADO</th>
              <th>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {marcas.length === 0 ? (
              <tr>
                <td colSpan={3}>
                  <div className="db-empty">
                    <p className="db-empty-titulo">Aún no hay marcas</p>
                    <p className="db-empty-texto">
                      Crea la primera con el botón “Nueva marca” de arriba.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              marcas.map((m) => (
                <tr key={m.id}>
                  <td>
                    <div className="db-product-cell">
                      <div
                        className="db-product-avatar"
                        style={m.logo_url ? undefined : AVATAR_SIN_IMAGEN}
                      >
                        {m.logo_url ? (
                          <img src={m.logo_url} alt={m.nombre} />
                        ) : (
                          m.nombre[0]
                        )}
                      </div>
                      <div>
                        <p className="db-product-name">{m.nombre}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    {m.activa ? (
                      <span className="db-tag db-tag-green">activa</span>
                    ) : (
                      <span className="db-tag db-tag-muted">inactiva</span>
                    )}
                  </td>
                  <td>
                    <ModalMarca
                      entidad={m}
                      onSave={guardarMarca}
                      onDelete={eliminarMarca}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="db-panel db-table-panel">
        <div className="db-section-header">
          <Box size={16} />
          <div className="db-section-titles">
            <h2>Categorías</h2>
            <p>Las secciones en las que se divide tu catálogo.</p>
          </div>
          <span className="db-filters-count">{categorias.length}</span>
        </div>
        <table className="db-table">
          <thead>
            <tr>
              <th>CATEGORÍA</th>
              <th>ESTADO</th>
              <th>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {categorias.length === 0 ? (
              <tr>
                <td colSpan={3}>
                  <div className="db-empty">
                    <p className="db-empty-titulo">Aún no hay categorías</p>
                    <p className="db-empty-texto">
                      Crea la primera con el botón “Nueva categoría” de arriba.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              categorias.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div className="db-product-cell">
                      <div
                        className="db-product-avatar"
                        style={c.imagen_url ? undefined : AVATAR_SIN_IMAGEN}
                      >
                        {c.imagen_url ? (
                          <img src={c.imagen_url} alt={c.nombre} />
                        ) : (
                          c.nombre[0]
                        )}
                      </div>
                      <div>
                        <p className="db-product-name">{c.nombre}</p>
                        <p className="db-product-brand">{c.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    {c.activa ? (
                      <span className="db-tag db-tag-green">activa</span>
                    ) : (
                      <span className="db-tag db-tag-muted">inactiva</span>
                    )}
                  </td>
                  <td>
                    <ModalCategoria
                      entidad={c}
                      onSave={guardarCategoria}
                      onDelete={eliminarCategoria}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
