import "./marcas.css"
import Image from "next/image"
import Link from "next/link"
import type {MarcaSimple} from "../../types/database"

interface MarcasProps {
    initialMarcas: MarcaSimple [];
}

export default function Marcas({ initialMarcas }: MarcasProps) {
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
            href={`/marcasProductos?slug=${marca.nombre}`}
            className="marcas-card"
          >
            <Image
              src={marca.logo_url || "/placeholder-marca.jpg"}
              alt={marca.nombre}
              width={200}
              height={200}
              unoptimized
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
