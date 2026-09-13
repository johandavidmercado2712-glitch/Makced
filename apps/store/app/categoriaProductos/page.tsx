import Image from "next/image"
import { User, Dumbbell, Heart } from "lucide-react"
import "./categoriaProductos.css";
import ProductCard from "../../components/ProductCard"
import ScrollReveal from "../../components/ScrollReveal"

export default function Page(){
  return(
    <>


    <div className="parent">
        <div className="migaja">
            <div className="breadcrumbs text-sm migaja-info">
                <ul>
                    <li>
                    <a href="/">
                        <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        className="h-4 w-4 stroke-current">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
                        </svg>
                        Inicio
                    </a>
                    </li>
                    <li>
                    <a href="categoria">
                        <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        className="h-4 w-4 stroke-current">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
                        </svg>
                        Categoria 
                    </a>
                    </li>
                    <li>
                    <span className="inline-flex items-center gap-2">
                        <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        className="h-4 w-4 stroke-current">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                        Deportivo 
                    </span>
                    </li>
                </ul>
            </div>
            <ScrollReveal>
              <div className="info-categoria">
                  <div className="info-detalle-categoria">
                      <h2>Deportivo</h2>
                      <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Inventore repudiandae natus aspernatur veniam tempore architecto.</p>
                      <a href="/verProducto">
                          <button>Ver Coleccion</button>
                      </a>
                  </div>
              </div>
            </ScrollReveal>
        </div>
        <div className="div2">
          <div className="filtro-precio">
            <span className="filtro-precio-texto">hasta $500,000</span>
            <div className="filtro-precio-slider">
              <div className="filtro-precio-track"></div>
              <div className="filtro-precio-thumb"></div>
            </div>
          </div>
        </div>
        <div className="div3">
          <ScrollReveal>
            <div className="Productos-cards">
                <ProductCard 
                    image='/hombre.jpg'
                    name= 'adidas'
                    price= '50000'
                    rating={5}
                    className = "Productos-card"
                />

                <ProductCard 
                    image='/hombre.jpg'
                    name= 'adidas'
                    price= '50000'
                    rating={5}
                    className = "Productos-card"
                />
                <ProductCard 
                    image='/hombre.jpg'
                    name= 'adidas'
                    price= '50000'
                    rating={5}
                    className = "Productos-card"
                />
                <ProductCard 
                    image='/hombre.jpg'
                    name= 'adidas'
                    price= '50000'
                    rating={5}
                    className = "Productos-card"
                />
                <ProductCard 
                    image='/hombre.jpg'
                    name= 'adidas'
                    price= '50000'
                    rating={5}
                    className = "Productos-card"
                />
                <ProductCard 
                    image='/hombre.jpg'
                    name= 'adidas'
                    price= '50000'
                    rating={5}
                    className = "Productos-card"
                />
                <ProductCard 
                    image='/hombre.jpg'
                    name= 'adidas'
                    price= '50000'
                    rating={5}
                    className = "Productos-card"
                />
                <ProductCard 
                    image='/hombre.jpg'
                    name= 'adidas'
                    price= '50000'
                    rating={5}
                    className = "Productos-card"
                />
            </div>
          </ScrollReveal>
        </div>
    
    </div>
    </>
  )
}