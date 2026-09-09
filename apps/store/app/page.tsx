import Image from "next/image"
import { User, Dumbbell, Heart } from "lucide-react"
import Marcas from "../components/Marcas"
import ProductCard from "../components/ProductCard"

export default function Page(){
  return(
    <>
      <div className="Carrucel">
        <div className="Carrucel-card" style={{ backgroundImage: "url('/carrucel-card.jpg')" }}>
          <h2>Tienda Web</h2>
          <p>Lorem ipsum dolor sit amet consectetur adipisicing elit.<br></br> Eligendi consequuntur aliquam obcaecati ut nemo hic. <br></br>Eius alias totam hic voluptatum.</p>
          <a href="#">
            <button>Comprar a Hora</button>
          </a>
        </div>
      </div >

      <Marcas />

      <div className="categoria">
        <div className="categoria-titulo">
          <h1>CATEGORIAS</h1>
        </div>
        <div className="categoria-cards">
          <div className="categoria-card">
            <Image src="/hombre.jpg" alt="marca img" width={350} height={250}/>
            <h3><User size={18} /> Hombre</h3>

            </div>
            <div className="categoria-card">
              <Image src="/mujer.jpg" alt="marca img" width={350} height={250}/>
              <h3><User size={18} /> Mujer</h3>
            </div>
            <div className="categoria-card">
              <Image src="/deportivo.jpg" alt="marca img" width={350} height={250}/>
              <h3><Dumbbell size={18} /> Deportivo</h3>
            </div>
        </div>
      </div>

      <div className="info">
        <div className="info-detalle">
          <h2>titulo</h2>
          <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Inventore repudiandae natus aspernatur veniam tempore architecto.</p>
          <a href="#">
            <button>Ver Coleccion</button>
          </a>
        </div>
      </div>

      <div className="Productos">
        <div className="Productos-titulo">
          <h1>PRODUCTOS</h1>
        </div>
        <div className="Productos-cards">
          <ProductCard image="/producto.jpg" name="Zapatillas Nike" price="$120" rating={4.5} />
          <ProductCard image="/producto.jpg" name="Adidas Runner" price="$95" rating={4.2} />
          <ProductCard image="/producto.jpg" name="Puma Sport" price="$85" rating={4.0} />
          <ProductCard image="/producto.jpg" name="New Balance" price="$110" rating={4.3} />
          <ProductCard image="/producto.jpg" name="Under Armour" price="$130" rating={4.6} />
          <ProductCard image="/producto.jpg" name="Reebok Classic" price="$75" rating={4.1} />
        </div>

        <div className="Productos-cards">
          <ProductCard image="/producto.jpg" name="Camiseta Deportiva" price="$35" rating={4.0} />
          <ProductCard image="/producto.jpg" name="Shorts Running" price="$28" rating={3.9} />
          <ProductCard image="/producto.jpg" name="Chaqueta Training" price="$65" rating={4.4} />
          <ProductCard image="/producto.jpg" name="Pants Jogger" price="$45" rating={4.2} />
          <ProductCard image="/producto.jpg" name="Sudadera Sport" price="$55" rating={4.1} />
          <ProductCard image="/producto.jpg" name="Jersey Running" price="$40" rating={4.3} />
        </div>

        <div className="informacion">
        <div className="informacion-detalle">
          <h2> MANTENTE INFORMADO</h2>
          <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Inventore repudiandae natus aspernatur veniam tempore architecto.</p>
        </div>
      </div>
      </div>
    </>
  )
}
