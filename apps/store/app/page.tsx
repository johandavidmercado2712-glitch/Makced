import { Suspense } from "react"
import PanelInfo from "../components/sections/PanelInfo"
import ScrollReveal from "../components/ui/ScrollReveal"
import CarouselNav from "../components/sections/CarouselNav"
import FeaturedProducts from "../components/product/FeaturedProducts"
import ProductGridSkeleton from "../components/product/ProductGridSkeleton"
import HomeMarcas from "../components/sections/HomeMarcas"
import HomeCategorias from "../components/sections/HomeCategorias"
import CategoriaSkeleton from "../components/ui/CategoriaSkeleton"
import { getConfigDiseno } from "./actions/store";
import { resolverTienda, listarTiendasActivas, subdominioSolicitado } from "@/lib/tenant";
import { redirect, notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Page(){
  const tienda = await resolverTienda();
  const requestedSub = await subdominioSolicitado();
  if (requestedSub && !tienda) {
    notFound();
  }
  if (!tienda) {
    const tiendas = await listarTiendasActivas();
    if (tiendas.length > 0) {
      redirect(`/s/${tiendas[0].subdominio}`);
    }
  }

  const { config } = await getConfigDiseno(tienda?.subdominio);
  return(
    <>
      <CarouselNav slides={config.banner.slides} />
      <Suspense
        fallback={
          <div className="marcas-destacadas" role="status" aria-busy="true">
            <span className="sr-only">Cargando marcas…</span>
            <div className="skeleton h-28 w-full" />
          </div>
        }
      >
        <HomeMarcas />
      </Suspense>

      <Suspense fallback={<CategoriaSkeleton count={4} />}>
        <HomeCategorias titulo={config.titulos.categorias} />
      </Suspense>

      <ScrollReveal>
        <PanelInfo
          image={config.promo.imagen}
          titulo={config.promo.titulo}
          descripcion={config.promo.descripcion}
          link={config.promo.link}
          button={config.promo.boton}
        />
      </ScrollReveal>

      <section className="Productos" aria-labelledby="productos-heading">
        <ScrollReveal>
          <header className="Productos-titulo">
            <h2 id="productos-heading">{config.titulos.productos}</h2>
          </header>
          <Suspense fallback={<ProductGridSkeleton count={5} />}>
            <FeaturedProducts mostrarPrecios={Boolean(config.mostrar_precios ?? true)} />
          </Suspense>

          <PanelInfo
            image={config.newsletter.imagen}
            titulo={config.newsletter.titulo}
            descripcion={config.newsletter.descripcion}
            link={config.newsletter.link}
            button={config.newsletter.boton}
          />
        </ScrollReveal>
      </section>
    </>
  )
}