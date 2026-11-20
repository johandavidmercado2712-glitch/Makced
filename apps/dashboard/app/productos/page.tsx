
import { Suspense } from "react";
import { SlidersHorizontal } from "lucide-react";
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
import ProductosActions from "@/components/ProductosActions";
import ToggleShowPrices from "@/components/ToggleShowPrices";
import { ProductTableWithUndo } from "@/components/ProductTableWithUndo";
import { getTienda } from "@/actions/tienda";
import type { RefSimple } from "@/types/database";

const paginaDesdeParam = (page?: string): number =>
  page && Number.isFinite(Number(page)) && Number(page) >= 1
    ? Math.floor(Number(page))
    : 1;

function ResumenFiltros({
  total,
  desde,
  hasta,
  search,
  marca,
  categoria,
  marcas,
  categorias,
}: {
  total: number;
  desde: number;
  hasta: number;
  search?: string;
  marca?: string;
  categoria?: string;
  marcas: RefSimple[];
  categorias: RefSimple[];
}) {
  return (
    <span className="db-filters-count">
      {total === 0
        ? "0"
        : `${desde}–${hasta} de ${total}`} productos
      {search && ` (buscando: "${search}")`}
      {marca && ` (marca: ${marcas.find((m) => m.id === marca)?.nombre})`}
      {categoria && ` (categoría: ${categorias.find((c) => c.id === categoria)?.nombre})`}
    </span>
  );
}

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
  const pagina = paginaDesdeParam(page);

  const [resultado, totalCatalogo, marcas, categorias, tienda] = await Promise.all([
    getProductosPaginado(search, marca, categoria, pagina),
    getProductosCount(),
    getMarcas(),
    getCategorias(),
    getTienda(),
  ]);

  const diseno = (tienda?.diseno ?? {}) as { mostrar_precios?: unknown };
  const mostrarPrecios = Boolean(diseno.mostrar_precios ?? true);
  const { productos, total, totalPaginas, page: paginaActual } = resultado;

  const desde = total === 0 ? 0 : (paginaActual - 1) * PRODUCTOS_POR_PAGINA + 1;
  const hasta = total === 0 ? 0 : desde + productos.length - 1;

  return (
    <div className="dashboard">
      <div className="db-panel db-header">
        <div>
          <h1 className="db-title">Productos</h1>
          <p className="db-subtitle">{totalCatalogo} productos en el catálogo</p>
        </div>
        <div className="db-header-actions">
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
        <ResumenFiltros
          total={total}
          desde={desde}
          hasta={hasta}
          search={search}
          marca={marca}
          categoria={categoria}
          marcas={marcas}
          categorias={categorias}
        />
      </div>

      <ProductTableWithUndo
        productos={productos}
        marcas={marcas}
        categorias={categorias}
        onSave={guardarProducto}
        onDelete={eliminarProducto}
        esPrimerProducto={totalCatalogo === 1}
      />

      <Suspense>
        <Pagination
          currentPage={paginaActual}
          totalPages={totalPaginas}
        />
      </Suspense>
    </div>
  );
}
