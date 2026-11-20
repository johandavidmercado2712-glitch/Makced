import Image from "next/image"
import Link from "next/link"
import type { Metadata } from "next";
export const revalidate = 120
import { getCategorias } from "../actions/store";
import { requerirTienda } from "../../lib/tenant";
import { EmptyState } from "../../components/ui/EmptyState";
import { Grid } from "lucide-react";
import { rutaTienda } from "../../lib/rutas";


export const metadata: Metadata = {
  title: "Categorías",
  description: "Encuentra el estilo que buscas explorando nuestras categorías.",
};


export default async function Page(){
  const tienda = await requerirTienda();
  const categorias = await getCategorias(tienda?.id);
  return(
    <>
    <div className="categoria">
        <header className="categoria-titulo categoria-listado-titulo">
            <h1>Categorías</h1>
            <p>Encuentra el estilo que buscas explorando nuestras categorías.</p>
        </header>

        {categorias.length === 0 ? (
          <EmptyState
            icon={Grid}
            titulo="Próximamente tendremos categorías"
            descripcion="Estamos organizando nuestro catálogo. Vuelve pronto para explorar nuestras categorías."
            cta={{ label: "Explorar productos", href: rutaTienda(tienda?.subdominio, "/") }}
          />
        ) : (
        <div className="categoria-cards">
        {categorias.map((cat, i) => (
            <Link key={cat.id} href={rutaTienda(tienda?.subdominio, `/categoriaProductos?slug=${encodeURIComponent(cat.slug)}`)}>
              <div className="categoria-card">
              <Image
                  src={cat.imagen_url || "/placeholder-categoria.jpg"}
                  alt={cat.nombre}
                  width={400}
                  height={400}
                  sizes="(max-width: 768px) 50vw, 25vw"
                  priority={i < 4}
              />
              <h3>{cat.nombre}</h3>
              </div>
            </Link>
        ))}
        </div>
        )}
    </div>
    </>
  )
}
