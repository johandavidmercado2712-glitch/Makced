import Image from "next/image"
import { User, Dumbbell, Heart } from "lucide-react"


export default function Page(){
  return(
    <>
    <div className="categoria">
        <div className="categoria-titulo">
            <h1>Categorias</h1>
            <p>Encuentra el estilo que buscas explorando nuestras categorías.</p>
        </div>

        <div className="categoria-cards">
            <div className="categoria-card">
                <Image src="/hombre.jpg" alt="marca img" width={400} height={300}/>
                <h3> Hombre</h3>
                <div className="categoria-card-overlay">
                    <a href="/categoriaProductos">
                    <span>Ver Coleccion</span></a>
                </div>
            </div>
            <div className="categoria-card">
                <Image src="/mujer.jpg" alt="marca img" width={400} height={300}/>
                <h3> Mujer</h3>
                <div className="categoria-card-overlay">
                    <a href="/categoriaProductos">
                    <span>Ver Coleccion</span></a>
                </div>
                </div>
            <div className="categoria-card">
                <Image src="/deportivo.jpg" alt="marca img" width={400} height={300}/>
                <h3> Deportivo</h3>
                <div className="categoria-card-overlay">
                    <a href="/categoriaProductos">
                    <span>Ver Coleccion</span></a>
                </div>
        </div>
    </div>
    </div>

    </>
  )
}