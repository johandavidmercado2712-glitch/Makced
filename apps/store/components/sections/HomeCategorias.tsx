import Image from "next/image"
import Link from "next/link"
import ScrollReveal from "../ui/ScrollReveal"
import { getCategorias } from "../../app/actions/store"
import { rutaTienda } from "../../lib/rutas"

/**
 * Sección de categorías del home: fetch interno para poder ir en
 * <Suspense> con su skeleton (CategoriaSkeleton) sin bloquear la página.
 */
import { requerirTienda } from "../../lib/tenant";

export default async function HomeCategorias({ titulo }: { titulo: string }) {
  const tienda = await requerirTienda();
  const categorias = await getCategorias(tienda.id)

  return (
    <section className="categoria" aria-labelledby="categorias-heading">
      <ScrollReveal>
        <header className="categoria-titulo">
          <div className="categoria-titulo-texto">
            <h2 id="categorias-heading">{titulo}</h2>
          </div>
          <Link href={rutaTienda(tienda.subdominio, "/categoria")}>Ver Todas ({categorias.length})</Link>
        </header>
        <div className="categoria-cards">
          {categorias.slice(0, 4).map((cat, index) => (
            <ScrollReveal key={cat.id} delay={(index + 1) * 100}>
              <Link href={rutaTienda(tienda.subdominio, `/categoriaProductos?slug=${cat.slug}`)}>
                <div className="categoria-card">
                  <Image
                    src={cat.imagen_url || "/placeholder-categoria.jpg"}
                    alt={cat.nombre}
                    fill
                    sizes="(max-width: 768px) 100vw, 350px"
                  />
                  <h3>{cat.nombre}</h3>
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </ScrollReveal>
    </section>
  )
}