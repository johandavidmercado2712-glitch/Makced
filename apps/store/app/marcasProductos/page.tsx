import "./marcasProductos.css";
import { Suspense } from "react"
import ScrollReveal from "../../components/ui/ScrollReveal"
import FiltroPrecio from "../../components/product/FiltroPrecio"
import Breadcrumbs from "../../components/ui/Breadcrumbs"
import ProductGridSkeleton from "../../components/product/ProductGridSkeleton"
import ProductGrid from "../../components/product/ProductGrid"
import { getProductosPorMarca, getMaxPrice } from "../actions/products";
import { getConfigDiseno } from "../actions/store";
import Link from "next/link";

export const revalidate = 30;

async function ProductosPorMarca({ slug, maxPrice }: { slug: string; maxPrice?: number }) {
  const productos = await getProductosPorMarca(slug, maxPrice)
  return <ProductGrid productos={productos} />
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ slug?: string; maxPrice?: string }>;
}) {
  const { slug, maxPrice } = await searchParams;
  const marcaNombre = slug || "Nike";
  const maxPriceNum = maxPrice ? Number(maxPrice) : undefined;
  const { config } = await getConfigDiseno();
  const mostrarPrecios = Boolean(config.mostrar_precios ?? true);
  const maxPriceDB = mostrarPrecios ? await getMaxPrice() : undefined;

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
          <ProductosPorMarca slug={marcaNombre} maxPrice={maxPriceNum} />
        </Suspense>
      </div>
    </>
  )
}
