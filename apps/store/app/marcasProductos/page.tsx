import "./marcasProductos.css";
import ProductCard from "../../components/ProductCard"
import ScrollReveal from "../../components/ScrollReveal"


export default function Page(){
  return (
    <>
      <div className="parent">
        <div className="migaja">
          <div className="breadcrumbs text-sm migaja-info">
            <ul>
              <li>
                <a href="/">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="h-4 w-4 stroke-current">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
                  </svg>
                  Inicio
                </a>
              </li>
              <li>
                <span className="inline-flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="h-4 w-4 stroke-current">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  Marcas
                </span>
              </li>
            </ul>
          </div>
          <ScrollReveal>
            <div className="info-categoria">
              <div className="info-detalle-categoria">
                <h2>Marcas</h2>
                <p>Descubre todas las marcas que tenemos para ti. Encuentra tu estilo favorito.</p>
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
              <ProductCard image="/hombre.jpg" name="Zapatillas Nike Air" price="$120,000" rating={4.8} />
              <ProductCard image="/hombre.jpg" name="Adidas Runner Pro" price="$95,000" rating={4.5} />
              <ProductCard image="/hombre.jpg" name="Puma Sport Max" price="$85,000" rating={4.3} />
              <ProductCard image="/hombre.jpg" name="Reebok Classic" price="$75,000" rating={4.6} />
              <ProductCard image="/hombre.jpg" name="New Balance 574" price="$110,000" rating={4.2} />
              <ProductCard image="/hombre.jpg" name="Under Armour Hovr" price="$130,000" rating={4.7} />
              <ProductCard image="/hombre.jpg" name="Nike Training Pro" price="$65,000" rating={4.1} />
              <ProductCard image="/hombre.jpg" name="Adidas Ultraboost" price="$88,000" rating={4.4} />
            </div>
          </ScrollReveal>
        </div>
      </div>
    </>
  )
}
