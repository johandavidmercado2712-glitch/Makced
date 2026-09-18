import "./categoriaProductos.css";
import ScrollReveal from "../../components/ScrollReveal"
import FiltroPrecio from "../../components/FiltroPrecio"
import ProductGrid from "../../components/ProductGrid"
import Breadcrumbs from "../../components/Breadcrumbs"
import { getProductosPorCategoria } from "../actions/products";
import Link from "next/link";

export const revalidate = 30;

export default async function Page({
    searchParams,
}: {
    searchParams: Promise<{ slug?: string }>;
}) {
  const { slug } = await searchParams;
  const categoriaSlug = slug || "deportivo";
  const productos = await getProductosPorCategoria(categoriaSlug);

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
                      <Link href="/verProducto">
                          <button>Ver Coleccion</button>
                      </Link>
                  </div>
              </div>
            </ScrollReveal>
        </div>
        <FiltroPrecio />
        <ProductGrid productos={productos} />
    </div>
    </>
  )
}
