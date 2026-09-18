import "./marcasProductos.css";
import ScrollReveal from "../../components/ScrollReveal"
import FiltroPrecio from "../../components/FiltroPrecio"
import ProductGrid from "../../components/ProductGrid"
import Breadcrumbs from "../../components/Breadcrumbs"
import { getProductosPorMarca } from "../actions/products";
import Link from "next/link";

export const revalidate = 30;

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ slug?: string }>;
}) {
  const { slug } = await searchParams;
  const marcaNombre = slug || "Nike";
  const productos = await getProductosPorMarca(marcaNombre);

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
                <p>Descubre todas las productos de {marcaNombre}. Encuentra tu estilo favorito.</p>
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
