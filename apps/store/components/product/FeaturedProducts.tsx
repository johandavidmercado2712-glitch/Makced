import ProductCard from "./ProductCard"
import ScrollReveal from "../ui/ScrollReveal"
import { getProductosDestacados } from "../../app/actions/products"

export default async function FeaturedProducts() {
  const productos = await getProductosDestacados()

  return (
    <>
      <div className="Productos-cards">
        {productos.map((producto) => (
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
    </>
  )
}
