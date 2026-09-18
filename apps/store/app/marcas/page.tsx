import Link from "next/link"
import "./marcas.css";
import ScrollReveal from "../../components/ScrollReveal"
export const revalidate = 300;
import { getMarcas } from "../actions/store";


export default async function Page(){
  const marcas = await getMarcas();
  return(
    <div className="marcas-info">
      <ScrollReveal>
        <h1>MARCAS</h1>
        <p>Descubre las marcas que tenemos para ti. Encuentra tu estilo favorito.</p>
      </ScrollReveal>

      <div className="marcas">
        {marcas.map((marca, index) => (
          <ScrollReveal key={marca.id} delay={index * 100}>
            <Link href={`/marcasProductos?slug=${encodeURIComponent(marca.nombre)}`}>
              <div className="card">
                <div className="card-image">
                  <img
                    src={marca.logo_url || "/placeholder-marca.jpg"}
                    alt={marca.nombre}
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
    </div>
  )
}
