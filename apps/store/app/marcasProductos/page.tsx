import "./marcasProductos.css";
import type { Metadata } from "next";
import { Suspense } from "react"
import ScrollReveal from "../../components/ui/ScrollReveal"
import FiltroPrecio from "../../components/product/FiltroPrecio"
import Breadcrumbs from "../../components/ui/Breadcrumbs"
import ProductGridSkeleton from "../../components/product/ProductGridSkeleton"
import ProductGrid from "../../components/product/ProductGrid"
import { getProductosPorMarca, getMaxPrice } from "../actions/products";
import { getConfigDiseno, getMarcaPorNombre } from "../actions/store";

export const revalidate = 30;

import { requerirTienda } from "../../lib/tenant";

async function ProductosPorMarca({ slug, maxPrice, tiendaId, mostrarPrecios, emptyMessage }: { slug: string; maxPrice?: number; tiendaId?: string | null; mostrarPrecios: boolean; emptyMessage?: string }) {
  const productos = await getProductosPorMarca(slug, maxPrice, tiendaId)
  return <ProductGrid productos={productos} mostrarPrecios={mostrarPrecios} emptyMessage={emptyMessage} />
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ slug?: string }>;
}): Promise<Metadata> {
  const { slug } = await searchParams;
  const tienda = await requerirTienda();
  const marcaSlug = slug || "Nike";
  const marca = await getMarcaPorNombre(marcaSlug, tienda?.id);
  const nombre = marca?.nombre ?? marcaSlug;

  return {
    title: nombre,
    description: `Descubre todos los productos de ${nombre}. Encuentra tu estilo favorito.`,
  };
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ slug?: string; maxPrice?: string }>;
}) {
  const { slug, maxPrice } = await searchParams;
  const tienda = await requerirTienda();
  const marcaSlug = slug || "Nike";
  const marca = await getMarcaPorNombre(marcaSlug, tienda?.id);
  const marcaNombre = marca?.nombre ?? marcaSlug;
  const { config } = await getConfigDiseno(tienda?.subdominio);
  const mostrarPrecios = Boolean(config.mostrar_precios ?? true);
  const maxPriceDB = mostrarPrecios ? await getMaxPrice(tienda?.id) : undefined;

  const parsedMaxPrice = maxPrice ? Number(maxPrice) : NaN;
  const maxPriceNum =
    mostrarPrecios && Number.isFinite(parsedMaxPrice) && parsedMaxPrice >= 0
      ? Math.min(parsedMaxPrice, maxPriceDB ?? parsedMaxPrice)
      : undefined;

  return (
    <>
      <div className="parent">
        <div className="migaja">
          <Breadcrumbs items={[
            { label: "Inicio", href: "/" },
            { label: "Marcas" },
          ]} />
          <ScrollReveal>
            <div className="info-categoria">
              <div className="info-detalle-categoria">
                <h2>{marcaNombre}</h2>
                <p>Descubre todos los productos de {marcaNombre}. Encuentra tu estilo favorito.</p>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {mostrarPrecios && maxPriceDB !== undefined && (
          <FiltroPrecio maxPrice={maxPriceDB} />
        )}
        <Suspense fallback={<ProductGridSkeleton count={4} />}>
          <ProductosPorMarca slug={marcaNombre} mostrarPrecios={mostrarPrecios} maxPrice={maxPriceNum} tiendaId={tienda?.id} emptyMessage={`No hay productos disponibles de ${marcaNombre} por ahora.`} />
        </Suspense>
      </div>
    </>
  )
}
