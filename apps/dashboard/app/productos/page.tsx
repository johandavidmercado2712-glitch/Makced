import { Suspense } from "react";
import {
  RefreshCw,
  Plus,
  Star,
  Pencil,
  Trash2,
  SlidersHorizontal,
  Tag,
  Box,
} from "lucide-react";
import "./productos.css";
import { getProductos, getProductosCount } from "@/actions/products";
import { getCategorias, getMarcas } from "@/actions/categoria";
import SearchInput from "@/components/SearchInput";
import FilterSelect from "@/components/FilterSelect";

export default async function ProductosPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; marca?: string; categoria?: string }>;
}) {
  const { search, marca, categoria } = await searchParams;

  const [products, total, marcas, categorias] = await Promise.all([
    getProductos(search, marca, categoria),
    getProductosCount(),
    getMarcas(),
    getCategorias(),
  ]);

  return (
    <div className="dashboard">
      <div className="db-panel db-header">
        <div>
          <h1 className="db-title">Productos</h1>
          <p className="db-subtitle">{total} productos en el catálogo</p>
        </div>
        <div className="db-header-actions">
          <button className="db-icon-btn"><RefreshCw size={18} /></button>
          <button className="db-btn-primary"><Plus size={18} /> Nuevo producto</button>
        </div>
      </div>

      <div className="db-filters">
        <div className="db-filters-header">
          <SlidersHorizontal size={16} />
          Filtros
        </div>
        <div className="db-filters-row">
          <Suspense>
            <SearchInput defaultValue={search} />
          </Suspense>
          <Suspense>
            <FilterSelect
              icon="Tag"
              label="marcas"
              options={marcas}
              paramKey="marca"
              defaultValue={marca}
            />
          </Suspense>
          <Suspense>
            <FilterSelect
              icon="Box"
              label="categorías"
              options={categorias}
              paramKey="categoria"
              defaultValue={categoria}
            />
          </Suspense>
        </div>
        <span className="db-filters-count">
          {products.length} de {total} productos
          {search && ` (buscando: "${search}")`}
          {marca && ` (marca: ${marcas.find((m) => m.id === marca)?.nombre})`}
          {categoria && ` (categoría: ${categorias.find((c) => c.id === categoria)?.nombre})`}
        </span>
      </div>

      <div className="db-panel db-table-panel">
        <table className="db-table">
          <thead>
            <tr>
              <th>PRODUCTO</th>
              <th>CATEGORÍA</th>
              <th>PRECIO</th>
              <th>ESTADO</th>
              <th>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: "40px 0", color: "var(--db-text-muted)" }}>
                  No se encontraron productos
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="db-product-cell">
                      <div
                        className="db-product-avatar"
                        style={{ background: "rgba(148, 163, 184, 0.2)", color: "#94A3B8" }}
                      >
                        {p.marca?.[0]?.nombre?.[0] || "?"}
                      </div>
                      <div>
                        <p className="db-product-name">{p.nombre}</p>
                        <p className="db-product-brand">{p.marca?.[0]?.nombre}</p>
                      </div>
                    </div>
                  </td>
                  <td><span className="db-category">{p.categoria?.[0]?.nombre}</span></td>
                  <td>
                    <div className="db-price-cell">
                      <span className="db-price">${p.precio.toLocaleString("es-CO")}</span>
                      {p.precio_descuento && (
                        <span className="db-price-original">${p.precio_descuento.toLocaleString("es-CO")}</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="db-tags">
                      {p.es_destacado && (
                        <span className="db-tag db-tag-green">
                          <Star size={10} /> destacado
                        </span>
                      )}
                      {p.es_nuevo && (
                        <span className="db-tag db-tag-purple">nuevo</span>
                      )}
                      {!p.es_destacado && !p.es_nuevo && (
                        <span className="db-tag-dash">—</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="db-actions">
                      <button className="db-action-btn"><Pencil size={16} /></button>
                      <button className="db-action-btn db-action-delete"><Trash2 size={16} /></button>
                    </div>
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
