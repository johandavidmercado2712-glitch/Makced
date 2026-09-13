import Image from "next/image"
import { User, Dumbbell, Heart } from "lucide-react"
import Marcas from "../components/Marcas"
import ProductCard from "../components/ProductCard"
import PanelInfo from "../components/PanelInfo"
import ScrollReveal from "../components/ScrollReveal"

export default function Page(){
  return(
    <>
    {/*  SESSION DEL CARRUCEL    */}
      <div className="carousel rounded-box carrucel">
        <div id="slide1" className="carousel-item relative w-full">
          <img
            src="/carrucel-card.jpg"
            className="w-full"
            alt="Slide 1" />
          <div className="carrucel-overlay">
            <h2 className="text-4xl font-bold mb-4">Nueva Coleccion</h2>
            <p className="text-lg mb-6">Descubre las ultimas tendencias en calzado deportivo</p>
            <button className="btn btn-primary">Ver Ahora</button>
          </div>
          <div className="carrucel-nav">
            <a href="#slide7" className="btn btn-circle">&#10094;</a>
            <a href="#slide2" className="btn btn-circle">&#10095;</a>
          </div>
        </div>
        <div id="slide2" className="carousel-item relative w-full">
          <img
            src="https://img.daisyui.com/images/stock/photo-1565098772267-60af42b81ef2.webp"
            className="w-full"
            alt="Slide 2" />
          <div className="carrucel-overlay">
            <h2 className="text-4xl font-bold mb-4">Ofertas de Temporada</h2>
            <p className="text-lg mb-6">Hasta 50% de descuento en productos seleccionados</p>
            <button className="btn btn-primary">Comprar</button>
          </div>
          <div className="carrucel-nav">
            <a href="#slide1" className="btn btn-circle">&#10094;</a>
            <a href="#slide3" className="btn btn-circle">&#10095;</a>
          </div>
        </div>
        <div id="slide3" className="carousel-item relative w-full">
          <img
            src="https://img.daisyui.com/images/stock/photo-1572635148818-ef6fd45eb394.webp"
            className="w-full"
            alt="Slide 3" />
          <div className="carrucel-overlay">
            <h2 className="text-4xl font-bold mb-4">Ropa Deportiva</h2>
            <p className="text-lg mb-6">Material de alta rendimiento para tu entrenamiento</p>
            <button className="btn btn-primary">Explorar</button>
          </div>
          <div className="carrucel-nav">
            <a href="#slide2" className="btn btn-circle">&#10094;</a>
            <a href="#slide4" className="btn btn-circle">&#10095;</a>
          </div>
        </div>
        <div id="slide4" className="carousel-item relative w-full">
          <img
            src="https://img.daisyui.com/images/stock/photo-1494253109108-2e30c049369b.webp"
            className="w-full"
            alt="Slide 4" />
          <div className="carrucel-overlay">
            <h2 className="text-4xl font-bold mb-4">Envio Gratis</h2>
            <p className="text-lg mb-6">En compras mayores a $100</p>
            <button className="btn btn-primary">Comprar Ahora</button>
          </div>
          <div className="carrucel-nav">
            <a href="#slide3" className="btn btn-circle">&#10094;</a>
            <a href="#slide5" className="btn btn-circle">&#10095;</a>
          </div>
        </div>
        <div id="slide5" className="carousel-item relative w-full">
          <img
            src="https://img.daisyui.com/images/stock/photo-1550258987-190a2d41a8ba.webp"
            className="w-full"
            alt="Slide 5" />
          <div className="carrucel-overlay">
            <h2 className="text-4xl font-bold mb-4">Marcas Premium</h2>
            <p className="text-lg mb-6">Nike, Adidas, Puma y mas</p>
            <button className="btn btn-primary">Ver Marcas</button>
          </div>
          <div className="carrucel-nav">
            <a href="#slide4" className="btn btn-circle">&#10094;</a>
            <a href="#slide6" className="btn btn-circle">&#10095;</a>
          </div>
        </div>
        <div id="slide6" className="carousel-item relative w-full">
          <img
            src="https://img.daisyui.com/images/stock/photo-1559181567-c3190ca9959b.webp"
            className="w-full"
            alt="Slide 6" />
          <div className="carrucel-overlay">
            <h2 className="text-4xl font-bold mb-4">Nuevos Lanzamientos</h2>
            <p className="text-lg mb-6">Se el primero en拥有的 ultimas novedades</p>
            <button className="btn btn-primary">Descubrir</button>
          </div>
          <div className="carrucel-nav">
            <a href="#slide5" className="btn btn-circle">&#10094;</a>
            <a href="#slide7" className="btn btn-circle">&#10095;</a>
          </div>
        </div>
        <div id="slide7" className="carousel-item relative w-full">
          <img
            src="https://img.daisyui.com/images/stock/photo-1601004890684-d8cbf643f5f2.webp"
            className="w-full"
            alt="Slide 7" />
          <div className="carrucel-overlay">
            <h2 className="text-4xl font-bold mb-4">Tu Estilo, Tu Deporte</h2>
            <p className="text-lg mb-6">Encuentra tu look perfecto para cada ocasion</p>
            <button className="btn btn-primary">Empezar</button>
          </div>
          <div className="carrucel-nav">
            <a href="#slide6" className="btn btn-circle">&#10094;</a>
            <a href="#slide1" className="btn btn-circle">&#10095;</a>
          </div>
        </div>
      </div>

      {/*SESSION DE MARCAS*/}


      
      <Marcas />

      {/*SESSION DE CATEGORIAS*/}


      <ScrollReveal>
        <div className="categoria">
          <div className="categoria-titulo">
            <div className="categoria-titulo-texto">
              <h1>CATEGORIAS</h1>
            </div>
            <a href="/categoria">Ver Todas</a>
          </div>
          <div className="categoria-cards">
            <ScrollReveal delay={100}>
              <div className="categoria-card">
                <Image src="/hombre.jpg" alt="marca img" width={400} height={300}/>
                <a href="/categoriaProductos"><h3> Hombre</h3></a>
                <div className="categoria-card-overlay">
                  <span>Ver Coleccion</span>
                </div>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={200}>
              <div className="categoria-card">
                <Image src="/mujer.jpg" alt="marca img" width={400} height={300}/>
                <h3> Mujer</h3>
                <div className="categoria-card-overlay">
                  <span>Ver Coleccion</span>
                </div>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={300}>
              <div className="categoria-card">
                <Image src="/deportivo.jpg" alt="marca img" width={400} height={300}/>
                <h3> Deportivo</h3>
                <div className="categoria-card-overlay">
                  <span>Ver Coleccion</span>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </ScrollReveal>



      {/*SESSION DE INFO */}

      <ScrollReveal>
        <PanelInfo
          image="/info-coleccion.jpg"
          titulo="titulo"
          descripcion="Lorem ipsum, dolor sit amet consectetur adipisicing elit. Inventore repudiandae natus aspernatur veniam tempore architecto."
          link="#"
          button="Ver Coleccion"
        />
      </ScrollReveal>

      <ScrollReveal>
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
            <ProductCard image="/producto.jpg" name="Under Armour" price="$130" rating={4.6} />
            <ProductCard image="/producto.jpg" name="Under Armour" price="$130" rating={4.6} />
            <ProductCard image="/producto.jpg" name="Under Armour" price="$130" rating={4.6} />
          </div>

    
          <PanelInfo
            image="/informacion.jpg"
            titulo="MANTENTE INFORMADO"
            descripcion="Lorem ipsum, dolor sit amet consectetur adipisicing elit. Inventore repudiandae natus aspernatur veniam tempore architecto."
            link="#"
            button="Suscribirse"
          />
        </div>
      </ScrollReveal>
    </>
  )
}
