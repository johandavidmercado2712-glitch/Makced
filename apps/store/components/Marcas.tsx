import "./marcas.css"
import Image from "next/image"
import type {MarcaSimple} from "../types/database"

interface MarcasProps {
    initialMarcas: MarcaSimple [];
}

export default function Marcas({ initialMarcas }: MarcasProps) {
  return (
    <div className="marcas">
      <div className="marcas-cards">
        {initialMarcas.map((marca) => (
          <div key={marca.id} className="marcas-card">
            <Image
              src={marca.logo_url || "/placeholder-marca.jpg"}
              alt={marca.nombre}
              width={200}
              height={200}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
