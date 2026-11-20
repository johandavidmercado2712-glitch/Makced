import "./marcas.css"
import Image from "next/image"
import Link from "next/link"
import type {MarcaSimple} from "../../types/database"
import { rutaTienda } from "../../lib/rutas"

interface MarcasProps {
    initialMarcas: MarcaSimple [];
    subdominio?: string | null;
}

export default function Marcas({ initialMarcas , subdominio}: MarcasProps) {
  const marcasDuplicated = [
    ...initialMarcas.map((m) => ({ ...m, keyId: `${m.id}-a` })),
    ...initialMarcas.map((m) => ({ ...m, keyId: `${m.id}-b` })),
    
  ]

  return (
    <section className="marcas-destacadas" aria-label="Marcas destacadas">
      <div className="marcas-track">
        {marcasDuplicated.map((marca) => (
          <Link
            key={marca.keyId}
            href={rutaTienda(subdominio, `/marcasProductos?slug=${encodeURIComponent(marca.nombre)}`)}
            className="marcas-card"
          >
            <Image
              src={marca.logo_url || "/placeholder-marca.jpg"}
              alt={marca.nombre}
              width={200}
              height={200}
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
