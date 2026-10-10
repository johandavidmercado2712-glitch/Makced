import Image from "next/image"
import Link from "next/link"
import { Suspense } from "react"
import Marcas from "../components/sections/Marcas"
import PanelInfo from "../components/sections/PanelInfo"
import ScrollReveal from "../components/ui/ScrollReveal"
import CarouselNav from "../components/sections/CarouselNav"
import FeaturedProducts from "../components/product/FeaturedProducts"
import ProductGridSkeleton from "../components/product/ProductGridSkeleton"
import { getCategorias, getConfigDiseno, getMarcas } from "./actions/store";

export const revalidate = 60;

export default async function Page(){

  const [categorias, marcas, { config }] = await Promise.all([
    getCategorias(),
    getMarcas(),
    getConfigDiseno(),
  ]);
  return(
    <>
    <CarouselNav slides={config.banner.slides} />


      {/*SESSION DE MARCAS*/}


      
      <Marcas initialMarcas={marcas} />

      {/*SESSION DE CATEGORIAS*/}


      <ScrollReveal>
        <div className="categoria">
          <div className="categoria-titulo">
            <div className="categoria-titulo-texto">
              <h1>{config.titulos.categorias}</h1>
            </div>
            <Link href="/categoria">Ver Todas</Link>
          </div>
          <div className="categoria-cards">
              {categorias.map((cat, index) => (
                <ScrollReveal key={cat.id} delay={(index + 1) * 100}>
                  <Link href={`/categoriaProductos?slug=${cat.slug}`}>
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
        </div>
      </ScrollReveal>



      {/*SESSION DE INFO */}

      <ScrollReveal>
        <PanelInfo
          image={config.promo.imagen}
          titulo={config.promo.titulo}
          descripcion={config.promo.descripcion}
          link={config.promo.link}
          button={config.promo.boton}
        />
      </ScrollReveal>

      <ScrollReveal>
        <div className="Productos">
          <div className="Productos-titulo">
            <h1>{config.titulos.productos}</h1>
          </div>
          <Suspense fallback={<ProductGridSkeleton count={5} />}>
            <FeaturedProducts />
          </Suspense>

    
          <PanelInfo
            image={config.newsletter.imagen}
            titulo={config.newsletter.titulo}
            descripcion={config.newsletter.descripcion}
            link={config.newsletter.link}
            button={config.newsletter.boton}
          />
        </div>
      </ScrollReveal>
    </>
  )
}
