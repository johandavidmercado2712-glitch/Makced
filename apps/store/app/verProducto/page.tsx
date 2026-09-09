import Image from "next/image"
import { Palette, Ruler, ShoppingBag, Star } from "lucide-react"
import Marcas from "../../components/Marcas"
import ProductCard from "../../components/ProductCard"
import "./verProducto.css"
export default function Page(){
  return(
    <>
    <Marcas />
    <div className="ver-Producto">
        <div className="Producto-img">
            <img src="/hombre.jpg" alt="" />
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
                        <h2>Precio</h2>
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

                <a href=""><button><ShoppingBag size={18} /> Agregar a la bolsa de Compras</button></a>
                    </div>
        </div>
    </div>

    <div className="vp-productos">
                    <div className="vp-productos-titulo">
                      <h1>Recomendados Para Ti</h1>
                    </div>
                    <div className="vp-productos-cards">
                      <ProductCard image="/producto.jpg" name="Zapatillas Pro" price="$150" rating={4.8} className="vp-productos-card" />
                      <ProductCard image="/producto.jpg" name="Running Elite" price="$120" rating={4.5} className="vp-productos-card" />
                      <ProductCard image="/producto.jpg" name="Sport Max" price="$95" rating={4.3} className="vp-productos-card" />
                      <ProductCard image="/producto.jpg" name="Training Pro" price="$110" rating={4.6} className="vp-productos-card" />
                      <ProductCard image="/producto.jpg" name="Air Comfort" price="$85" rating={4.2} className="vp-productos-card" />
                      <ProductCard image="/producto.jpg" name="Speed Runner" price="$130" rating={4.7} className="vp-productos-card" />
                    </div>
            
                    <div className="vp-productos-cards">
                      <ProductCard image="/producto.jpg" name="Classic White" price="$75" rating={4.1} className="vp-productos-card" />
                      <ProductCard image="/producto.jpg" name="Urban Style" price="$88" rating={4.4} className="vp-productos-card" />
                      <ProductCard image="/producto.jpg" name="Trail Master" price="$105" rating={4.5} className="vp-productos-card" />
                      <ProductCard image="/producto.jpg" name="Sprint Ultra" price="$98" rating={4.3} className="vp-productos-card" />
                      <ProductCard image="/producto.jpg" name="Flex Move" price="$72" rating={4.0} className="vp-productos-card" />
                      <ProductCard image="/producto.jpg" name="Power Step" price="$115" rating={4.6} className="vp-productos-card" />
                    </div>
    </div>

      
    </>
  )
}
