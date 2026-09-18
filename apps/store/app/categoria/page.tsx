import Image from "next/image"
import Link from "next/link"
export const revalidate = 120
import { getCategorias } from "../actions/store";

export default async function Page(){
    const categorias = await getCategorias();
  return(
    <>
    <div className="categoria">
        <div className="categoria-titulo">
            <h1>Categorias</h1>
            <p>Encuentra el estilo que buscas explorando nuestras categorías.</p>
        </div>

        <div className="categoria-cards">
        {categorias.map((cat) => (
            <Link key={cat.id} href={`/categoriaProductos?slug=${cat.slug}`}>
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