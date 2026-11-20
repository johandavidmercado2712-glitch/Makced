import ProductCard from "../../components/product/ProductCard"
import ScrollReveal from "../../components/ui/ScrollReveal"
import ProductoGaleria from "../../components/product/ProductoGaleria"
import "./verProducto.css"
import type { Metadata } from "next";
import { getProductoPorSlug, getProductosDestacados } from "../actions/products";
import { getConfigDiseno } from "../actions/store";
import ProductoSelector from "../../components/product/ProductoSelector"
import { formatCOP } from "../../lib/format";
import { notFound } from "next/navigation";


import { requerirTienda } from "../../lib/tenant";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ slug?: string }>;
}): Promise<Metadata> {
  const { slug } = await searchParams;
  const tienda = await requerirTienda();
  const productoSlug = slug || "zapatillas-nike-air-max-270";
  const producto = await getProductoPorSlug(productoSlug, tienda?.id);

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
  const tienda = await requerirTienda();
  const productoSlug = slug || "zapatillas-nike-air-max-270";

  const [producto, recomendados, { config }] = await Promise.all([
    getProductoPorSlug(productoSlug, tienda?.id),
    getProductosDestacados(tienda?.id),
    getConfigDiseno(tienda?.subdominio),
  ]);

  if (!producto) {
    notFound();
  }

  const mostrarPrecios = Boolean(config.mostrar_precios ?? true);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: producto?.nombre,
            image: producto?.imagen_url,
            offers: {
              "@type": "Offer",
              priceCurrency: "COP",
              price: producto?.precio_descuento || producto?.precio,
            },
          }).replace(/</g, "\u003c"),
        }}
      />
      {/* ===== PRODUCTO PRINCIPAL ===== */}
      <ScrollReveal>
        <div className="ver-Producto">
          {/* --- GALERÍA IZQUIERDA --- */}
          <ProductoGaleria
            principal={producto?.imagen_url || "/producto.jpg"}
            referencias={(producto?.referencia as string[]) || []}
            nombre={producto?.nombre || ""}
          />

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
              <ProductoSelector producto={producto as unknown as import("@/types/cart").ProductoCart & { colores?: { nombre: string; hex: string }[] }} />

            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* ===== RECOMENDADOS (sin cambios) ===== */}
      <ScrollReveal>
        <div className="vp-productos">
          <div className="vp-productos-titulo">
            <h2>Recomendados Para Ti</h2>
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