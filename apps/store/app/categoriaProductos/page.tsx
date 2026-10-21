import "./categoriaProductos.css";
import type { Metadata } from "next";
import { Suspense } from "react"
import ScrollReveal from "../../components/ui/ScrollReveal"
import FiltroPrecio from "../../components/product/FiltroPrecio"
import Breadcrumbs from "../../components/ui/Breadcrumbs"
import ProductGridSkeleton from "../../components/product/ProductGridSkeleton"
import ProductGrid from "../../components/product/ProductGrid"
import { getProductosPorCategoria, getMaxPrice } from "../actions/products";
import { getCategoriaPorSlug, getConfigDiseno } from "../actions/store";

export const revalidate = 30;

function humanizar(slug: string) {
  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letra) => letra.toUpperCase());
}

async function ProductosPorCategoria({ slug, maxPrice }: { slug: string; maxPrice?: number }) {
  const productos = await getProductosPorCategoria(slug, maxPrice)
  return <ProductGrid productos={productos} />
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ slug?: string }>;
}): Promise<Metadata> {
  const { slug } = await searchParams;
  const categoriaSlug = slug || "deportivo";
  const categoria = await getCategoriaPorSlug(categoriaSlug);
  const nombre = categoria?.nombre ?? humanizar(categoriaSlug);

  return {
    title: nombre,
    description: `Explora nuestra colección de ${nombre}. Encuentra el estilo que buscas.`,
  };
}

export default async function Page({
    searchParams,
}: {
    searchParams: Promise<{ slug?: string; maxPrice?: string }>;
}) {
  const { slug, maxPrice } = await searchParams;
  const categoriaSlug = slug || "deportivo";
  const categoria = await getCategoriaPorSlug(categoriaSlug);
  const categoriaNombre = categoria?.nombre ?? humanizar(categoriaSlug);
  const { config } = await getConfigDiseno();
  const mostrarPrecios = Boolean(config.mostrar_precios ?? true);
  const maxPriceDB = mostrarPrecios ? await getMaxPrice() : undefined;

  const parsedMaxPrice = maxPrice ? Number(maxPrice) : NaN;
  const maxPriceNum =
    mostrarPrecios && Number.isFinite(parsedMaxPrice) && parsedMaxPrice >= 0
      ? Math.min(parsedMaxPrice, maxPriceDB ?? parsedMaxPrice)
      : undefined;

  return(
    <>
    <div className="parent">
        <div className="migaja">
            <Breadcrumbs items={[
              { label: "Inicio", href: "/" },
              { label: "Categoría", href: "/categoria" },
              { label: categoriaNombre },
            ]} />
            <ScrollReveal>
              <div className="info-categoria">
                  <div className="info-detalle-categoria">
                      <h2>{categoriaNombre}</h2>
                      <p>Explora nuestra colección de {categoriaNombre}. Encuentra el estilo que buscas.</p>
                  </div>
              </div>
            </ScrollReveal>
        </div>
        {mostrarPrecios && maxPriceDB !== undefined && (
          <FiltroPrecio maxPrice={maxPriceDB} />
        )}
        <Suspense fallback={<ProductGridSkeleton count={4} />}>
          <ProductosPorCategoria slug={categoriaSlug} maxPrice={maxPriceNum} />
        </Suspense>
    </div>
    </>
  )
}
