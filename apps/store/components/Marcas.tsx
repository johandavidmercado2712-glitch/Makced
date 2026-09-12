import "./marcas.css"
import Image from "next/image"

const marcas = [
  { nombre: "Nike", imagen: "/marca-1.jpg" },
  { nombre: "Adidas", imagen: "/marca-2.jpg" },
  { nombre: "Puma", imagen: "/marca-3.jpg" },
  { nombre: "Reebok", imagen: "/marca-4.jpg" },
  { nombre: "New Balance", imagen: "/marca-5.jpg" },
  { nombre: "Under Armour", imagen: "/marca-6.jpg" },
];

export default function Marcas(){
    return(
        <div className="marcas-cards">
            {marcas.map((marca) => (
                <div key={marca.nombre} className="marcas-card">
                    <Image src={marca.imagen} alt={marca.nombre} width={200} height={200}/>
                </div>
            ))}
        </div>
    )
}
