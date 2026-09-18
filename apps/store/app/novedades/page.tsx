import "./novedades.css";
import ProductCard from "../../components/ProductCard"
import ScrollReveal from "../../components/ScrollReveal"
import { getProductosNuevos } from "../actions/products";
import Link from "next/link";

export const revalidate = 30;

export default async function Page() {
  const productos = await getProductosNuevos();

  return(
    <>
    <div className="novedades-parent">
        <div className="novedades-migaja">
            <div className="breadcrumbs text-sm migaja-info">
                <ul>
                    <li>
                    <Link href="/">
                        <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        className="h-4 w-4 stroke-current">
                        <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
                        </svg>
                        Inicio
                    </Link>
                    </li>
                    <li>
                    <span className="inline-flex items-center gap-2">
                        <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        className="h-4 w-4 stroke-current">
                        <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                        Novedades
                    </span>
                    </li>
                </ul>
            </div>
            <ScrollReveal>
              <div className="novedades-info">
                  <div className="novedades-detalle">
                      <h2>Novedades</h2>
                      <p>Descubre lo ultimo que llego a nuestra tienda. Estilo y tendencia para ti.</p>
                  </div>
              </div>
            </ScrollReveal>
        </div>
        <div className="novedades-content">
          <ScrollReveal>
            <div className="Productos-cards">
            {productos.length > 0 ? (
              productos.map((producto) => (
                <ScrollReveal key={producto.id}>
                <ProductCard
                    image={producto.imagen_url || "/producto.jpg"}
                    name={producto.nombre}
                    price={`$${producto.precio.toLocaleString("es-CO")}`}
                    rating={4.5}
                    slug={producto.slug || undefined}
                />
                </ScrollReveal>
              ))
            ) : (
              <p className="novedades-vacio">Proximamente habra novedades.</p>
            )}
            </div>
          </ScrollReveal>
        </div>
    </div>
    </>
  )
}
