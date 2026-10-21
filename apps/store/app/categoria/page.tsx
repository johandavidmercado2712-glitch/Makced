import Image from "next/image"
import Link from "next/link"
import type { Metadata } from "next";
export const revalidate = 120
import { getCategorias } from "../actions/store";

export const metadata: Metadata = {
  title: "Categorías",
  description: "Encuentra el estilo que buscas explorando nuestras categorías.",
};

export default async function Page(){
    const categorias = await getCategorias();
  return(
    <>
    <div className="categoria">
        <header className="categoria-titulo categoria-listado-titulo">
            <h1>Categorías</h1>
            <p>Encuentra el estilo que buscas explorando nuestras categorías.</p>
        </header>

        <div className="categoria-cards">
        {categorias.map((cat) => (
            <Link key={cat.id} href={`/categoriaProductos?slug=${encodeURIComponent(cat.slug)}`}>
              <div className="categoria-card">
              <Image
                  src={cat.imagen_url || "/placeholder-categoria.jpg"}
                  alt={cat.nombre}
                  width={400}
                  height={400}
              />
              <h3>{cat.nombre}</h3>
              </div>
            </Link>
        ))}
        </div>
    </div>
    </>
  )
}