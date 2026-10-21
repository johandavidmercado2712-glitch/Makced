import ProductCard from "../../components/product/ProductCard"
import ScrollReveal from "../../components/ui/ScrollReveal"
import "./verProducto.css"
import type { Metadata } from "next";
import { getProductoPorSlug, getProductosDestacados } from "../actions/products";
import { getConfigDiseno } from "../actions/store";
import ProductoSelector from "../../components/product/ProductoSelector"
import { formatCOP } from "../../lib/format";
import { notFound } from "next/navigation";


export const revalidate = 15;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ slug?: string }>;
}): Promise<Metadata> {
  const { slug } = await searchParams;
  const productoSlug = slug || "zapatillas-nike-air-max-270";
  const producto = await getProductoPorSlug(productoSlug);

  if (!producto) {
    return { title: "Producto no encontrado" };
  }

  const descripcion =
    (producto.descripcion || "").trim().slice(0, 160) ||
    `Comprá ${producto.nombre} en nuestra tienda.`;

  return {
    title: producto.nombre,
    description: descripcion,
    openGraph: {
      title: producto.nombre,
      description: descripcion,
      images: producto.imagen_url
        ? [{ url: producto.imagen_url, alt: producto.nombre }]
        : undefined,
    },
  };
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ slug?: string }>;
}) {
  const { slug } = await searchParams;
  const productoSlug = slug || "zapatillas-nike-air-max-270";

  const [producto, recomendados, { config }] = await Promise.all([
    getProductoPorSlug(productoSlug),
    getProductosDestacados(),
    getConfigDiseno(),
  ]);

  if (!producto) {
    notFound();
  }

  const mostrarPrecios = Boolean(config.mostrar_precios ?? true);

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
                  {[producto?.marca, producto?.categoria]
                    .filter(Boolean)
                    .join(" ")}
                </span>
                <h1 className="producto-titulo">
                  {producto?.nombre || "Producto no encontrado"}
                </h1>
              </div>

              {/* PRECIO: Grande + tachado si descuento (oculto si la tienda oculta precios) */}
              {mostrarPrecios && (
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
              )}

              {/* COLOR + TALLA + CTA (Client Component con estado) */}
              <ProductoSelector producto={producto} />

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
                <ProductCard producto={rec} mostrarPrecios={mostrarPrecios} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </ScrollReveal>
    </>
  );
}