import Image from "next/image"
import Link from "next/link"
import Marcas from "../components/Marcas"
import ProductCard from "../components/ProductCard"
import PanelInfo from "../components/PanelInfo"
import ScrollReveal from "../components/ScrollReveal"
import CarouselNav from "../components/CarouselNav"
import { getCategorias, getMarcas } from "./actions/store";
import { getProductosDestacados } from "./actions/products";

export const revalidate = 60;

export default async function Page(){

  const [categorias, marcas, productosDestacados] = await Promise.all([
    getCategorias(),
    getMarcas(),
    getProductosDestacados(),
  ]);
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
            <CarouselNav targetId="slide7">&#10094;</CarouselNav>
            <CarouselNav targetId="slide2">&#10095;</CarouselNav>
          </div>
        </div>
        <div id="slide2" className="carousel-item relative w-full">
          <img
            src="informacion.jpg"
            className="w-full"
            alt="Slide 2" />
          <div className="carrucel-overlay">
            <h2 className="text-4xl font-bold mb-4">Ofertas de Temporada</h2>
            <p className="text-lg mb-6">Hasta 50% de descuento en productos seleccionados</p>
            <button className="btn btn-primary">Comprar</button>
          </div>
          <div className="carrucel-nav">
            <CarouselNav targetId="slide1">&#10094;</CarouselNav>
            <CarouselNav targetId="slide3">&#10095;</CarouselNav>
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
            <CarouselNav targetId="slide2">&#10094;</CarouselNav>
            <CarouselNav targetId="slide4">&#10095;</CarouselNav>
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
            <CarouselNav targetId="slide3">&#10094;</CarouselNav>
            <CarouselNav targetId="slide5">&#10095;</CarouselNav>
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
            <CarouselNav targetId="slide4">&#10094;</CarouselNav>
            <CarouselNav targetId="slide6">&#10095;</CarouselNav>
          </div>
        </div>
        <div id="slide6" className="carousel-item relative w-full">
          <img
            src="https://img.daisyui.com/images/stock/photo-1559181567-c3190ca9959b.webp"
            className="w-full"
            alt="Slide 6" />
          <div className="carrucel-overlay">
            <h2 className="text-4xl font-bold mb-4">Nuevos Lanzamientos</h2>
            <p className="text-lg mb-6">Se el primero en conocer las ultimas novedades</p>
            <button className="btn btn-primary">Descubrir</button>
          </div>
          <div className="carrucel-nav">
            <CarouselNav targetId="slide5">&#10094;</CarouselNav>
            <CarouselNav targetId="slide7">&#10095;</CarouselNav>
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
            <CarouselNav targetId="slide6">&#10094;</CarouselNav>
            <CarouselNav targetId="slide1">&#10095;</CarouselNav>
          </div>
        </div>
      </div>

      {/*SESSION DE MARCAS*/}


      
      <Marcas initialMarcas={marcas} />

      {/*SESSION DE CATEGORIAS*/}


      <ScrollReveal>
        <div className="categoria">
          <div className="categoria-titulo">
            <div className="categoria-titulo-texto">
              <h1>CATEGORIAS</h1>
            </div>
            <Link href="/categoria">Ver Todas</Link>
          </div>
          <div className="categoria-cards">
              {categorias.map((cat, index) => (
                <ScrollReveal key={cat.id} delay={(index + 1) * 100}>
                  <Link href={`/categoriaProductos?slug=${cat.slug}`}>
                    <div className="categoria-card">
                      <Image
                        src={cat.imagen_url || "/placeholder-categoria.jpg"}
                        alt={cat.nombre}
                        width={400}
                        height={400}
                      />
                      <h3>{cat.nombre}</h3>
                    </div>
                  </Link>
                </ScrollReveal>
              ))}
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
            {productosDestacados.map((producto) => (
              <ScrollReveal key={producto.id}>
                <ProductCard
                  image={producto.imagen_url || "/producto.jpg"}
                  name={producto.nombre}
                  price={`$${producto.precio.toLocaleString("es-CO")}`}
                  rating={4.5}
                  slug={producto.slug || undefined}
                />
              </ScrollReveal>
            ))}
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
