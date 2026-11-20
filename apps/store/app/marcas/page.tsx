import Link from "next/link"
import type { Metadata } from "next";
import "./marcas.css";
import ScrollReveal from "../../components/ui/ScrollReveal"
export const revalidate = 300;
import { getMarcas } from "../actions/store";
import { requerirTienda } from "../../lib/tenant";
import { EmptyState } from "../../components/ui/EmptyState";
import { Award } from "lucide-react";
import { rutaTienda } from "../../lib/rutas";

export const metadata: Metadata = {
  title: "Marcas",
  description: "Descubre las marcas que tenemos para ti. Encuentra tu estilo favorito.",
};


export default async function Page(){
  const tienda = await requerirTienda();
  const marcas = await getMarcas(tienda?.id);
  return(
    <div className="marcas-info">
      <ScrollReveal>
        <h1>MARCAS</h1>
        <p>Descubre las marcas que tenemos para ti. Encuentra tu estilo favorito.</p>
      </ScrollReveal>

      {marcas.length === 0 ? (
        <EmptyState
          icon={Award}
          titulo="Próximamente tendremos marcas"
          descripcion="Estamos organizando nuestro catálogo. Vuelve pronto para descubrir las marcas que tenemos para ti."
          cta={{ label: "Explorar productos", href: "/" }}
        />
      ) : (
      <div className="marcas">
        {marcas.map((marca, index) => (
          <ScrollReveal key={marca.id} delay={index * 100}>
            <Link href={rutaTienda(tienda?.subdominio, `/marcasProductos?slug=${encodeURIComponent(marca.nombre)}`)}>
              <div className="card">
                <div className="card-image">
                  <img
                    src={marca.logo_url || "/placeholder-marca.jpg"}
                    alt={marca.nombre}
                    loading="lazy"
                  />
                </div>
                <div className="card-info">
                  <div className="card-info-text">
                    <h2>{marca.nombre}</h2>
                  </div>
                  <span>Ver todos</span>
                </div>
              </div>
            </Link>
          </ScrollReveal>
        ))}
      </div>
      )}
    </div>
  )
}
