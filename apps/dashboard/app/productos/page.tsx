
import { Suspense } from "react";
import Link from "next/link";
import {
  Star,
  SlidersHorizontal,
} from "lucide-react";
import "./productos.css";
import {
  getProductosPaginado,
  getProductosCount,
  guardarProducto,
  eliminarProducto,
} from "@/actions/products";
import { PRODUCTOS_POR_PAGINA } from "@/lib/paginacion";
import { getCategorias, getMarcas } from "@/actions/categoria";
import SearchInput from "@/components/SearchInput";
import FilterSelect from "@/components/FilterSelect";
import Pagination from "@/components/Pagination";
import { ModalProduct } from "@/components/modal/modalProduct";
import ProductosActions from "@/components/ProductosActions";
import ToggleShowPrices from "@/components/ToggleShowPrices";
import { getTienda } from "@/actions/tienda";

export default async function ProductosPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    marca?: string;
    categoria?: string;
    page?: string;
  }>;
}) {
  const { search, marca, categoria, page } = await searchParams;
  const pagina = page && Number.isFinite(Number(page)) && Number(page) >= 1
    ? Math.floor(Number(page))
    : 1;

  const [resultado, totalCatalogo, marcas, categorias] = await Promise.all([
    getProductosPaginado(search, marca, categoria, pagina),
    getProductosCount(),
    getMarcas(),
    getCategorias(),
  ]);

  const tienda = await getTienda();
  const diseno = (tienda?.diseno ?? {}) as { mostrar_precios?: unknown };
  const mostrarPrecios = Boolean(diseno.mostrar_precios ?? true);
  const { productos: products, total, totalPaginas, page: paginaActual } = resultado;
  const hayFiltros = Boolean(search || marca || categoria);

  const desde = total === 0 ? 0 : (paginaActual - 1) * PRODUCTOS_POR_PAGINA + 1;
  const hasta = total === 0 ? 0 : desde + products.length - 1;

  return (
    <div className="dashboard">
      <div className="db-panel db-header">
        <div>
          <h1 className="db-title">Productos</h1>
          <p className="db-subtitle">{totalCatalogo} productos en el catálogo</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <ProductosActions
            marcas={marcas}
            categorias={categorias}
            onSave={guardarProducto}
          />
          <ToggleShowPrices initial={mostrarPrecios} />
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
          {total === 0
            ? "0"
            : `${desde}–${hasta} de ${total}`} productos
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
                <td colSpan={5}>
                  <div className="db-empty">
                    {hayFiltros ? (
                      <>
                        <p className="db-empty-titulo">No hay resultados</p>
                        <p className="db-empty-texto">
                          Ningún producto coincide con
                          {search ? ` “${search}”` : " los filtros aplicados"}.
                        </p>
                        <Link className="db-empty-cta" href="/productos">
                          Limpiar filtros
                        </Link>
                      </>
                    ) : (
                      <>
                        <p className="db-empty-titulo">Tu catálogo está vacío</p>
                        <p className="db-empty-texto">
                          Crea tu primer producto con el botón “Nuevo producto” de arriba.
                        </p>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="db-product-cell">
                      <div
                        className="db-product-avatar"
                        style={
                          p.imagen_url
                            ? undefined
                            : { background: "rgba(148, 163, 184, 0.2)", color: "#94A3B8" }
                        }
                      >
                        {p.imagen_url ? (
                          <img src={p.imagen_url} alt={p.nombre} />
                        ) : (
                          p.marca?.nombre?.[0] || "?"
                        )}
                      </div>
                      <div>
                        <p className="db-product-name">{p.nombre}</p>
                        <p className="db-product-brand">{p.marca?.nombre}</p>
                      </div>
                    </div>
                  </td>
                  <td><span className="db-category">{p.categoria?.nombre}</span></td>
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
                    <ModalProduct
                      producto={p}
                      marcas={marcas}
                      categorias={categorias}
                      onSave={guardarProducto}
                      onDelete={eliminarProducto}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <Suspense>
          <Pagination
            currentPage={paginaActual}
            totalPages={totalPaginas}
          />
        </Suspense>
      </div>
    </div>
  );
}
