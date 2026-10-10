import "./categoriaProductos.css";
import { Suspense } from "react"
import ScrollReveal from "../../components/ui/ScrollReveal"
import FiltroPrecio from "../../components/product/FiltroPrecio"
import Breadcrumbs from "../../components/ui/Breadcrumbs"
import ProductGridSkeleton from "../../components/product/ProductGridSkeleton"
import ProductGrid from "../../components/product/ProductGrid"
import { getProductosPorCategoria, getMaxPrice } from "../actions/products";

export const revalidate = 30;

async function ProductosPorCategoria({ slug, maxPrice }: { slug: string; maxPrice?: number }) {
  const productos = await getProductosPorCategoria(slug, maxPrice)
  return <ProductGrid productos={productos} />
}

export default async function Page({
    searchParams,
}: {
    searchParams: Promise<{ slug?: string; maxPrice?: string }>;
}) {
  const { slug, maxPrice } = await searchParams;
  const categoriaSlug = slug || "deportivo";
  const maxPriceNum = maxPrice ? Number(maxPrice) : undefined;
  const maxPriceDB = await getMaxPrice();

  return(
    <>
    <div className="parent">
        <div className="migaja">
            <Breadcrumbs items={[
              { label: "Inicio", href: "/" },
              { label: "Categoria", href: "/categoria" },
              { label: categoriaSlug.charAt(0).toUpperCase() + categoriaSlug.slice(1) },
            ]} />
            <ScrollReveal>
              <div className="info-categoria">
                  <div className="info-detalle-categoria">
                      <h2>{categoriaSlug.charAt(0).toUpperCase() + categoriaSlug.slice(1)}</h2>
                      <p>Explora nuestra coleccion de {categoriaSlug}. Encuentra el estilo que buscas.</p>
                  </div>
              </div>
            </ScrollReveal>
        </div>
        <FiltroPrecio maxPrice={maxPriceDB} />
        <Suspense fallback={<ProductGridSkeleton count={4} />}>
          <ProductosPorCategoria slug={categoriaSlug} maxPrice={maxPriceNum} />
        </Suspense>
    </div>
    </>
  )
}
