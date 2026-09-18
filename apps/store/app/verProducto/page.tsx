import { Palette, Ruler, ShoppingBag, Star } from "lucide-react"
import ProductCard from "../../components/ProductCard"
import ScrollReveal from "../../components/ScrollReveal"
import "./verProducto.css"
import { getProductoPorSlug, getProductosDestacados } from "../actions/products";

export const revalidate = 15;

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ slug?: string }>;
}) {

    const { slug } = await searchParams;
    const productoSlug = slug || "zapatillas-nike-air-max-270";

    const [producto, recomendados] = await Promise.all([
        getProductoPorSlug(productoSlug),
        getProductosDestacados(),
    ])
 

  return(
    <>
    <ScrollReveal>
      <div className="ver-Producto">
          <div className="Producto-img">
              <img src={producto?.imagen_url || "/producto.jpg"} alt={producto?.nombre || ""} />
              <div className="Producto-referencia">
                  <img src="/producto.jpg" alt="" />
                  <img src="/producto.jpg" alt="" />
                  <img src="/producto.jpg" alt="" />
                  <img src="/producto.jpg" alt="" />
                  <div className="ver-mas">
                      <span>ver mas</span>
                  </div>
              </div>
              <div className="Producto-detalle">
                  <h2><Star size={14} /> Valores</h2>
                  <h2>Descripcion</h2>
                  <h2>Detalle</h2>
              </div>
          </div>
          <div className="Producto-espeficacion">
              <div className="Producto-informacion">
                  <div className="info-row">
                      <div className="info-col">
                          <h1>Nombre</h1>
                      </div>
                      <div className="info-col">
                          <h2>{producto?.nombre || "Producto no encontrado"}</h2>
                            <span>${(producto?.precio ?? 0).toLocaleString("es-CO")}</span>
                      </div>
                  </div>

                  <div className="info-row">
                      <div className="info-col">
                          <p><Palette size={16} /> color</p>
                          <p>multicolor</p>
                      </div>
                      <div className="info-col info-opciones">
                          <img src="/producto.jpg" alt="" />
                          <img src="/producto.jpg" alt="" />
                          <img src="/producto.jpg" alt="" />
                          <img src="/producto.jpg" alt="" />
                      </div>
                  </div>

                  <div className="info-row">
                      <div className="info-col">
                          <p><Ruler size={16} /> Tallas</p>
                          <p>Guia De Tallas</p>
                      </div>
                      <div className="info-col info-opciones">
                          <img src="/producto.jpg" alt="" />
                          <img src="/producto.jpg" alt="" />
                          <img src="/producto.jpg" alt="" />
                          <img src="/producto.jpg" alt="" />
                      </div>
                  </div>

                  <button type="button"><ShoppingBag size={18} /> Agregar a la bolsa de Compras</button>
              </div>
          </div>
      </div>
    </ScrollReveal>

    <ScrollReveal>
      <div className="vp-productos">
        <div className="vp-productos-titulo">
          <h1>Recomendados Para Ti</h1>
        </div>
        <div className="vp-productos-cards">
          {recomendados.map((rec) => (
              <ScrollReveal key={rec.id}>
              <ProductCard
                  image={rec.imagen_url || "/producto.jpg"}
                  name={rec.nombre}
                  price={`$${rec.precio.toLocaleString("es-CO")}`}
                  rating={4.5}
                  slug={rec.slug || undefined}
              />
              </ScrollReveal>
          ))}
        </div>
      </div>
    </ScrollReveal>
    </>
  )
}
