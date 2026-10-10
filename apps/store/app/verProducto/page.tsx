import ProductCard from "../../components/product/ProductCard"
import ScrollReveal from "../../components/ui/ScrollReveal"
import "./verProducto.css"
import { getProductoPorSlug, getProductosDestacados } from "../actions/products";
import ProductoSelector from "../../components/product/ProductoSelector"


export const revalidate = 15;

// Helper para formato COP (pesos colombianos) — formatter a module scope (1 sola vez)
const copFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
  currencyDisplay: "symbol",
});

const formatCOP = (value: number) => copFormatter.format(value);

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
  ]);

  return (
    <>
      {/* ===== PRODUCTO PRINCIPAL ===== */}
      <ScrollReveal>
        <div className="ver-Producto">
          {/* --- GALERÍA IZQUIERDA --- */}
          <div className="Producto-img">
            {/* Imagen principal */}
            <img
              src={producto?.imagen_url || "/producto.jpg"}
              alt={producto?.nombre || ""}
              className="producto-imagen-principal"
            />

            {/* Miniaturas (4) desde producto.referencia [JSONB array] */}
            <div className="producto-galeria">
              {producto?.referencia?.map((url: string, i: number) => (
                <img
                  key={url}
                  src={url}
                  alt={`Vista ${i + 1}`}
                  className="producto-miniatura"
                />
              ))}
            </div>
          </div>

          {/* --- INFO DERECHA --- */}
          <div className="Producto-espeficacion">
            <div className="Producto-informacion">

              {/* TÍTULO: Marca + Categoría + Modelo */}
              <div className="producto-header">
                <span className="producto-marca-categoria">
                  {producto?.marca?.[0]?.nombre} {producto?.categoria?.[0]?.nombre}
                </span>
                <h1 className="producto-titulo">
                  {producto?.nombre || "Producto no encontrado"}
                </h1>
              </div>

              {/* PRECIO: Grande + tachado si descuento */}
              <div className="producto-precio">
                {producto?.precio_descuento && producto.precio_descuento < producto.precio ? (
                  <>
                    <span className="precio-original">
                      {formatCOP(producto.precio)}
                    </span>
                    <span className="precio-descuento">
                      {formatCOP(producto.precio_descuento)}
                    </span>
                  </>
                ) : (
                  <span className="precio-actual">
                    {formatCOP(producto?.precio ?? 0)}
                  </span>
                )}
              </div>

              {/* COLOR + TALLA + CTA (Client Component con estado) */}
              <ProductoSelector producto={producto!} />

            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* ===== RECOMENDADOS (sin cambios) ===== */}
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
                  price={formatCOP(rec.precio)}
                  rating={4.5}
                  slug={rec.slug || undefined}
                />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </ScrollReveal>
    </>
  );
}