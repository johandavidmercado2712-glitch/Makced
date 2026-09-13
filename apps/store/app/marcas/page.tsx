import Image from "next/image"
import "./marcas.css";
import ScrollReveal from "../../components/ScrollReveal"

const marcas = [
  { nombre: "Nike", imagen: "/marca-1.jpg", cantidad: 120, slug: "nike" },
  { nombre: "Adidas", imagen: "/marca-2.jpg", cantidad: 95, slug: "adidas" },
  { nombre: "Puma", imagen: "/marca-3.jpg", cantidad: 78, slug: "puma" },
  { nombre: "Reebok", imagen: "/marca-4.jpg", cantidad: 64, slug: "reebok" },
  { nombre: "New Balance", imagen: "/marca-5.jpg", cantidad: 52, slug: "new-balance" },
  { nombre: "Under Armour", imagen: "/marca-6.jpg", cantidad: 43, slug: "under-armour" },
];

export default function Page(){
  return(
    <div className="marcas-info">
      <ScrollReveal>
        <h1>MARCAS</h1>
        <p>Descubre las marcas que tenemos para ti. Encuentra tu estilo favorito.</p>
      </ScrollReveal>

      <div className="marcas">
        {marcas.map((marca, index) => (
          <ScrollReveal key={marca.nombre} delay={index * 100}>
            <div className="card">
              <div className="card-image">
                <img src={marca.imagen} alt={marca.nombre} />
              </div>
              <div className="card-info">
                <div className="card-info-text">
                  <h2>{marca.nombre}</h2>
                  <span>{marca.cantidad} productos</span>
                </div>
                <a href="/marcasProductos">Ver todos</a>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </div>
  )
}
