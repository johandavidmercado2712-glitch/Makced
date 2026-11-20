import ProductCard from "./ProductCard"
import ScrollReveal from "../ui/ScrollReveal"
import { getProductosDestacados } from "../../app/actions/products"

import { requerirTienda } from "../../lib/tenant";

export default async function FeaturedProducts({
  mostrarPrecios = true,
}: {
  mostrarPrecios?: boolean
}) {
  const tienda = await requerirTienda();
  const productos = await getProductosDestacados(tienda?.id)

  return (
    <>
      <div className="Productos-cards">
        {productos.map((producto) => (
          <ScrollReveal key={producto.id}>
            <ProductCard
              producto={producto}
              mostrarPrecios={mostrarPrecios}
            />
          </ScrollReveal>
        ))}
      </div>
    </>
  )
}
