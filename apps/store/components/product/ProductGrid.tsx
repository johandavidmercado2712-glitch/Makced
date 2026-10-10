import ScrollReveal from "../ui/ScrollReveal";
import ProductCard from "./ProductCard";
import { getConfigDiseno } from "../../app/actions/store";

interface ProductoCard {
  id: string;
  nombre: string;
  precio: number;
  imagen_url: string | null;
  slug: string | null;
}

interface Props {
  productos: ProductoCard[];
}

export default async function ProductGrid({ productos }: Props) {
  // Leer la configuración de diseño (server) para saber si mostrar precios
  const configResp = await getConfigDiseno();
  const mostrarPrecios = Boolean(configResp?.config?.mostrar_precios ?? true);

  return (
    <div className="div3">
      <ScrollReveal>
        <div className="Productos-cards">
          {productos.map((producto) => (
            <ScrollReveal key={producto.id}>
              <ProductCard
                image={producto.imagen_url || "/producto.jpg"}
                name={producto.nombre}
                price={
                  mostrarPrecios ? `$${producto.precio.toLocaleString("es-CO")}` : undefined
                }
                rating={4.5}
                slug={producto.slug || undefined}
              />
            </ScrollReveal>
          ))}
        </div>
      </ScrollReveal>
    </div>
  );
}
